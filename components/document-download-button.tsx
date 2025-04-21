"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface DocumentDownloadButtonProps {
  documentId: number
  variant?: "default" | "outline" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
}

export function DocumentDownloadButton({ documentId, variant = "outline", size = "sm" }: DocumentDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleDownload = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/agent/documents/${documentId}`)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue")
      }

      // In a real application, this would trigger a file download
      // For now, we'll just show a success message
      toast({
        title: "Téléchargement réussi",
        description: "Le document a été téléchargé avec succès",
      })

      // Simulate download by opening the URL in a new tab
      if (data.documentUrl) {
        window.open(data.documentUrl, "_blank")
      }
    } catch (error) {
      console.error("Error downloading document:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant={variant} size={size} className="gap-1" onClick={handleDownload} disabled={isLoading}>
      <Download className="h-4 w-4" />
      <span className="hidden sm:inline">{isLoading ? "En cours..." : "Télécharger"}</span>
    </Button>
  )
}
