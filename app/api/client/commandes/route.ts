import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { ClientService } from "@/lib/client-service"
import { getUserFromToken } from "@/lib/jwt-utils"

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "CLIENT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const clientId = parseInt(user.id)
    const commandes = await ClientService.gererCommandes(clientId)

    return NextResponse.json(commandes)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "CLIENT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const clientId = parseInt(user.id)
    const body = await req.json()

    const requiredFields = [
      "nom", "pays", "adresse", "dateDePickup", "valeurMarchandise",
      "typeCommande", "typeTransport", "ecoterme", "modePaiement",
      "nomDestinataire", "paysDestinataire", "adresseDestinataire",
      "indicatifTelephoneDestinataire", "telephoneDestinataire", "emailDestinataire"
    ]

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: "Données manquantes", field },
          { status: 400 }
        )
      }
    }

    const newOrder = await prisma.commande.create({
      data: {
        ...body,
        dateDePickup: new Date(body.dateDePickup),
        valeurMarchandise: parseFloat(body.valeurMarchandise),
        telephoneDestinataire: parseInt(body.telephoneDestinataire),
        statut: "En attente",
        adresseActuel: body.adresse,
        clientId: clientId,
        produits: {
          create: body.produits.map((produit: any) => ({
            ...produit,
            tarifUnitaire: parseFloat(produit.tarifUnitaire),
            poids: parseFloat(produit.poids),
            largeur: parseFloat(produit.largeur),
            longueur: parseFloat(produit.longueur),
            hauteur: parseFloat(produit.hauteur),
            quantite: parseInt(produit.quantite),
            fragile: produit.fragile === "true" || produit.fragile === true,
          })),
        },
      },
      include: { produits: true },
    })

    await prisma.notification.create({
      data: {
        type: "commande",
        correspond: `Votre commande ${newOrder.nom} a été créée avec succès.`,
        lu: false,
        clientId,
      },
    })

    return NextResponse.json(newOrder, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromToken(req)

    if (!user || user.role !== "CLIENT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const clientId = parseInt(user.id)
    const body = await req.json()
    
    // Vérifier que l'ID de la commande est fourni
    if (!body.id) {
      return NextResponse.json(
        { error: "ID de commande manquant" },
        { status: 400 }
      )
    }

    // Vérifier que la commande existe et appartient au client
    const existingCommande = await prisma.commande.findFirst({
      where: {
        id: parseInt(body.id),
        clientId: clientId
      },
      include: { produits: true }
    })

    if (!existingCommande) {
      return NextResponse.json(
        { error: "Commande non trouvée ou vous n'êtes pas autorisé à la modifier" },
        { status: 404 }
      )
    }

    // Vérifier que la commande est modifiable (statut "En attente")
    if (existingCommande.statut !== "En attente") {
      return NextResponse.json(
        { error: "Cette commande ne peut plus être modifiée car elle est déjà en traitement" },
        { status: 400 }
      )
    }

    // Préparer les données à mettre à jour
    const updateData: any = {}
    
    // Champs modifiables de la commande
    const modifiableFields = [
      "nom", "pays", "adresse", "dateDePickup", "valeurMarchandise",
      "typeCommande", "typeTransport", "ecoterme", "modePaiement",
      "nomDestinataire", "paysDestinataire", "adresseDestinataire",
      "indicatifTelephoneDestinataire", "telephoneDestinataire", "emailDestinataire"
    ]

    // Ajouter uniquement les champs fournis
    modifiableFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    // Conversions spécifiques pour certains champs
    if (updateData.dateDePickup) {
      updateData.dateDePickup = new Date(updateData.dateDePickup)
    }
    if (updateData.valeurMarchandise) {
      updateData.valeurMarchandise = parseFloat(updateData.valeurMarchandise)
    }
    if (updateData.telephoneDestinataire) {
      updateData.telephoneDestinataire = parseInt(updateData.telephoneDestinataire)
    }
    if (updateData.adresse) {
      updateData.adresseActuel = updateData.adresse
    }

    // Mettre à jour la commande
    let updatedOrder
    await prisma.$transaction(async (tx) => {
      // Mettre à jour la commande principale
      updatedOrder = await tx.commande.update({
        where: { id: parseInt(body.id) },
        data: updateData,
        include: { produits: true },
      })

      // Si des produits sont fournis pour mise à jour
      if (body.produits && Array.isArray(body.produits)) {
        // Supprimer les produits existants
        await tx.produit.deleteMany({
          where: { idCommande: parseInt(body.id) }
        })

        // Créer les nouveaux produits
        await tx.produit.createMany({
          data: body.produits.map((produit: any) => ({
            idCommande: parseInt(body.id),
            nom: produit.nom,
            categorie: produit.categorie || null,
            description: produit.description || null,
            tarifUnitaire: parseFloat(produit.tarifUnitaire),
            poids: parseFloat(produit.poids),
            largeur: parseFloat(produit.largeur),
            longueur: parseFloat(produit.longueur),
            hauteur: parseFloat(produit.hauteur),
            quantite: parseInt(produit.quantite),
            typeConditionnement: produit.typeConditionnement,
            fragile: produit.fragile === "true" || produit.fragile === true
          }))
        })

        // Récupérer la commande mise à jour avec les nouveaux produits
        updatedOrder = await tx.commande.findUnique({
          where: { id: parseInt(body.id) },
          include: { produits: true }
        })
      }
    })

    // Créer une notification pour informer le client
    await prisma.notification.create({
      data: {
        type: "commande",
        correspond: `Votre commande ${updatedOrder?.nom} a été modifiée avec succès.`,
        lu: false,
        clientId,
      },
    })

    return NextResponse.json(updatedOrder, { status: 200 })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Vérifier l'authentification de l'utilisateur
    const user = await getUserFromToken(req)

    if (!user || user.role !== "CLIENT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const clientId = parseInt(user.id)
    
    // Obtenir l'ID de la commande à partir de l'URL
    // Format attendu: /api/client/commandes/123
    const url = new URL(req.url)
    const paths = url.pathname.split("/")
    const commandeId = paths[paths.length - 1]
    
    if (!commandeId || isNaN(parseInt(commandeId))) {
      return NextResponse.json(
        { error: "ID de commande non valide" },
        { status: 400 }
      )
    }

    // Vérifier que la commande existe et appartient au client
    const existingCommande = await prisma.commande.findFirst({
      where: {
        id: parseInt(commandeId),
        clientId: clientId
      }
    })

    if (!existingCommande) {
      return NextResponse.json(
        { error: "Commande non trouvée ou vous n'êtes pas autorisé à la supprimer" },
        { status: 404 }
      )
    }

    // Vérifier que la commande est supprimable (statut "En attente")
    if (existingCommande.statut !== "En attente") {
      return NextResponse.json(
        { error: "Cette commande ne peut plus être supprimée car elle est déjà en traitement" },
        { status: 400 }
      )
    }

    // Supprimer en utilisant une transaction pour assurer l'intégrité
    await prisma.$transaction(async (tx) => {
      // Supprimer d'abord les produits associés
      await tx.produit.deleteMany({
        where: { idCommande: parseInt(commandeId) }
      })
      
      // Puis supprimer la commande
      await tx.commande.delete({
        where: { id: parseInt(commandeId) }
      })
    })

    // Créer une notification pour informer le client
    await prisma.notification.create({
      data: {
        type: "commande",
        correspond: `Votre commande ${existingCommande.nom} a été supprimée avec succès.`,
        lu: false,
        clientId,
      },
    })

    return NextResponse.json({ 
      success: true, 
      message: "Commande supprimée avec succès" 
    })
  } catch (error) {
    console.error("Error deleting order:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}