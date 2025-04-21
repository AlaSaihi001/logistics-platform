import { PrismaClient } from "@prisma/client"
import { hash } from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  // Create a test client
  const hashedPassword = await hash("password123", 10)

  const client = await prisma.client.create({
    data: {
      nom: "Dupont",
      prenom: "Jean",
      email: "jean.dupont@example.com",
      indicatifPaysTelephone: "+33",
      telephone: 612345678,
      motDePasse: hashedPassword,
      image: null,
    },
  })

  console.log(`Created client: ${client.prenom} ${client.nom}`)

  // Create a test order
  const commande = await prisma.commande.create({
    data: {
      nom: "Commande Test",
      pays: "France",
      adresse: "123 Rue de Paris, 75001 Paris",
      dateDePickup: new Date("2025-03-15"),
      valeurMarchandise: 1500.0,
      typeCommande: "Standard",
      typeTransport: "Maritime",
      ecoterme: "CIF",
      modePaiement: "Virement bancaire",
      nomDestinataire: "Martin Entreprises",
      paysDestinataire: "Tunisie",
      adresseDestinataire: "456 Avenue Habib Bourguiba, Tunis",
      indicatifTelephoneDestinataire: "+216",
      telephoneDestinataire: 71123456,
      emailDestinataire: "contact@martinentreprises.com",
      statut: "En attente",
      adresseActuel: "123 Rue de Paris, 75001 Paris",
      clientId: client.id,
    },
  })

  console.log(`Created order: ${commande.nom}`)

  // Add products to the order
  const produit = await prisma.produit.create({
    data: {
      nom: "Smartphone XYZ",
      categorie: "Électronique",
      tarifUnitaire: 500.0,
      poids: 0.2,
      largeur: 7.0,
      longueur: 15.0,
      hauteur: 1.0,
      quantite: 20,
      typeConditionnement: "Carton",
      fragile: true,
      description: "Smartphones haut de gamme pour revente",
      idCommande: commande.id,
    },
  })

  console.log(`Created product: ${produit.nom}`)

  // Create an invoice for the order
  const facture = await prisma.facture.create({
    data: {
      idCommande: commande.id,
      numeroFacture: 1001,
      montant: 10000.0,
      dateEmission: new Date(),
      status: "En attente",
      idClient: client.id,
    },
  })

  console.log(`Created invoice: #${facture.numeroFacture}`)

  // Create a notification
  const notification = await prisma.notification.create({
    data: {
      type: "commande",
      correspond: `Nouvelle commande ${commande.id} créée`,
      clientId: client.id,
    },
  })

  console.log(`Created notification: ${notification.correspond}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
