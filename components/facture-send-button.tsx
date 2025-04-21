"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface FactureSendButtonProps {
  factureId: number
  variant?: "default" | "outline" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
}

export function FactureSendButton({ factureId, variant = "default", size = "sm" }: FactureSendButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSend = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/agent/factures/${factureId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "envoyer" }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue")
      }

      toast({
        title: "Facture envoyée",
        description: "La facture a été envoyée au client avec succès",
      })
    } catch (error) {
      console.error("Error sending invoice:", error)
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
    <Button
      variant={variant}
      size={size}
      className={`gap-1 ${variant === "default" ? "bg-blue-500 hover:bg-blue-600" : "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700"}`}
      onClick={handleSend}
      disabled={isLoading}
    >
      <Send className="h-4 w-4" />
      <span className="hidden sm:inline">{isLoading ? "En cours..." : "Envoyer"}</span>
    </Button>
  )
}
