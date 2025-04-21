"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ReclamationStatusUpdateProps {
  reclamationId: number
  currentStatus: string
  onSuccess: () => void
}

export function ReclamationStatusUpdate({ reclamationId, currentStatus, onSuccess }: ReclamationStatusUpdateProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(currentStatus)

  const statusOptions = [
    { value: "Ouverte", label: "Ouverte" },
    { value: "En cours", label: "En cours" },
    { value: "En attente", label: "En attente de réponse client" },
    { value: "Résolue", label: "Résolue" },
    { value: "Fermée", label: "Fermée" },
  ]

  const handleUpdateStatus = async () => {
    if (status === currentStatus) {
      toast({
        title: "Information",
        description: "Le statut est déjà défini sur cette valeur.",
      })
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/assistant/reclamations/${reclamationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du statut")
      }

      toast({
        title: "Statut mis à jour",
        description: `Le statut de la réclamation a été mis à jour vers "${status}".`,
      })
      onSuccess()
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de la réclamation",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
      <div className="flex-1">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un statut" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleUpdateStatus} disabled={loading || status === currentStatus} className="flex items-center">
        <Check className="mr-2 h-4 w-4" />
        Mettre à jour
      </Button>
    </div>
  )
}
