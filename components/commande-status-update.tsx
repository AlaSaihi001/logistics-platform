"use client"

import { useState } from "react"
import { Check, Truck, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CommandeStatusUpdateProps {
  commandeId: number
  currentStatus: string
  onSuccess?: () => void
}

export function CommandeStatusUpdate({ commandeId, currentStatus, onSuccess }: CommandeStatusUpdateProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined)
  const { toast } = useToast()

  const statusOptions = [
    { value: "En cours", label: "En cours", icon: Package },
    { value: "Expédiée", label: "Expédiée", icon: Truck },
    { value: "Livrée", label: "Livrée", icon: Check },
  ]

  // Filter out current status and previous statuses based on order
  const filteredOptions = statusOptions.filter((option) => {
    if (currentStatus === "En attente") return true
    if (currentStatus === "Acceptée" && option.value !== "En attente") return true
    if (currentStatus === "En cours" && (option.value === "Expédiée" || option.value === "Livrée")) return true
    if (currentStatus === "Expédiée" && option.value === "Livrée") return true
    return false
  })

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/agent/commandes/${commandeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "changerStatut",
          nouveauStatut: selectedStatus,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue")
      }

      toast({
        title: "Statut mis à jour",
        description: `La commande est maintenant ${selectedStatus.toLowerCase()}`,
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (filteredOptions.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Changer le statut" />
        </SelectTrigger>
        <SelectContent>
          {filteredOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <option.icon className="h-4 w-4" />
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleStatusUpdate} disabled={!selectedStatus || isLoading}>
        {isLoading ? "En cours..." : "Mettre à jour"}
      </Button>
    </div>
  )
}
