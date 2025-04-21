"use client"

import { useState } from "react"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface FacturePrintButtonProps {
  factureId: number
  variant?: "default" | "outline" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
}

export function FacturePrintButton({ factureId, variant = "outline", size = "sm" }: FacturePrintButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handlePrint = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/agent/factures/${factureId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "imprimer" }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue")
      }

      // In a real application, this would trigger the print dialog
      // For now, we'll just show a success message
      toast({
        title: "Impression réussie",
        description: "La facture a été envoyée à l'imprimante",
      })

      // Simulate printing by opening the print dialog
      window.print()
    } catch (error) {
      console.error("Error printing invoice:", error)
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
    <Button variant={variant} size={size} className="gap-1" onClick={handlePrint} disabled={isLoading}>
      <Printer className="h-4 w-4" />
      <span className="hidden sm:inline">{isLoading ? "En cours..." : "Imprimer"}</span>
    </Button>
  )
}
