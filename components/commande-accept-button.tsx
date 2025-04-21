"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface CommandeAcceptButtonProps {
  commandeId: number
  onSuccess?: () => void
}

export function CommandeAcceptButton({ commandeId, onSuccess }: CommandeAcceptButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleAccept = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/agent/commandes/${commandeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "accepter" }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue")
      }

      toast({
        title: "Commande acceptée",
        description: "La commande a été acceptée avec succès",
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error accepting order:", error)
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
    <Button className="gap-2 bg-green-500 hover:bg-green-600" onClick={handleAccept} disabled={isLoading}>
      <Check className="h-4 w-4" />
      {isLoading ? "En cours..." : "Accepter"}
    </Button>
  )
}
