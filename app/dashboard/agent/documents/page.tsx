"use client"

import type React from "react"

import { useState } from "react"
import { Search, Filter, Download, Upload, File, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

// Données fictives pour les documents
const documents = [
  {
    id: "DOC-2023-001",
    nom: "Certificat d'origine",
    type: "pdf",
    size: "1.2 MB",
    dateCreation: "15/03/2023",
  },
  {
    id: "DOC-2023-002",
    nom: "Facture commerciale",
    type: "pdf",
    size: "0.8 MB",
    dateCreation: "14/03/2023",
  },
  {
    id: "DOC-2023-003",
    nom: "Liste de colisage",
    type: "xlsx",
    size: "0.5 MB",
    dateCreation: "12/03/2023",
  },
  {
    id: "DOC-2023-004",
    nom: "Certificat sanitaire",
    type: "pdf",
    size: "1.5 MB",
    dateCreation: "10/03/2023",
  },
  {
    id: "DOC-2023-005",
    nom: "Bon de livraison",
    type: "docx",
    size: "0.7 MB",
    dateCreation: "08/03/2023",
  },
]

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isAddDocumentDialogOpen, setIsAddDocumentDialogOpen] = useState(false)
  const [newDocument, setNewDocument] = useState({
    nom: "",
    type: "pdf",
    file: null as File | null,
  })

  // Filtrer les documents en fonction des critères
  const filteredDocuments = documents.filter((document) => {
    const matchesSearch =
      document.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || document.type === typeFilter

    return matchesSearch && matchesType
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewDocument({
        ...newDocument,
        file: e.target.files[0],
      })
    }
  }

  const handleAddDocument = () => {
    // Ici, vous implémenteriez la logique pour ajouter le document
    console.log("Document ajouté:", newDocument)

    // Réinitialiser le formulaire et fermer la boîte de dialogue
    setNewDocument({
      nom: "",
      type: "pdf",
      file: null,
    })
    setIsAddDocumentDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">Gérez vos documents et fichiers</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddDocumentDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Ajouter un document
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des documents</CardTitle>
          <CardDescription>Consultez et gérez tous vos documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <div className="flex gap-2 w-full md:w-auto">
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-[300px]"
              />
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
                <span className="sr-only">Rechercher</span>
              </Button>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filtrer par type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="docx">DOCX</SelectItem>
                  <SelectItem value="xlsx">XLSX</SelectItem>
                  <SelectItem value="jpg">JPG</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filtrer</span>
              </Button>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">ID</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Taille</TableHead>
                  <TableHead className="hidden lg:table-cell">Date de création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      Aucun document trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocuments.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell className="font-medium">{document.id}</TableCell>
                      <TableCell>{document.nom}</TableCell>
                      <TableCell className="hidden md:table-cell uppercase">{document.type}</TableCell>
                      <TableCell className="hidden md:table-cell">{document.size}</TableCell>
                      <TableCell className="hidden lg:table-cell">{document.dateCreation}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Download className="h-4 w-4" />
                          <span className="hidden sm:inline">Télécharger</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddDocumentDialogOpen} onOpenChange={setIsAddDocumentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter un document</DialogTitle>
            <DialogDescription>Ajoutez un nouveau document à votre bibliothèque.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom du document</Label>
              <Input
                id="nom"
                value={newDocument.nom}
                onChange={(e) => setNewDocument({ ...newDocument, nom: e.target.value })}
                placeholder="Ex: Certificat d'origine, Facture commerciale..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type de document</Label>
              <Select
                value={newDocument.type}
                onValueChange={(value) => setNewDocument({ ...newDocument, type: value })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="docx">DOCX</SelectItem>
                  <SelectItem value="xlsx">XLSX</SelectItem>
                  <SelectItem value="jpg">JPG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Fichier</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Glissez-déposez un fichier ici ou cliquez pour parcourir
                </p>
                <Input id="file" type="file" className="hidden" onChange={handleFileChange} />
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => document.getElementById("file")?.click()}
                >
                  Parcourir les fichiers
                </Button>
                {newDocument.file && (
                  <div className="mt-4 flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4" />
                      <span className="text-sm font-medium">{newDocument.file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setNewDocument({ ...newDocument, file: null })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDocumentDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddDocument} disabled={!newDocument.nom || !newDocument.file} className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter le document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
