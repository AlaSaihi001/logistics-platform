"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface CommandeRefuseButtonProps {
  commandeId: number
  onSuccess?: () => void
}

export function CommandeRefuseButton({ commandeId, onSuccess }: CommandeRefuseButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [refuseReason, setRefuseReason] = useState("")
  const [refuseComment, setRefuseComment] = useState("")
  const { toast } = useToast()

  const handleRefuse = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/agent/commandes/${commandeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "refuser",
          raison: refuseReason,
          commentaire: refuseComment,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue")
      }

      toast({
        title: "Commande refusée",
        description: "La commande a été refusée avec succès",
      })

      setIsDialogOpen(false)

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error refusing order:", error)
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
    <>
      <Button
        variant="outline"
        className="gap-2 bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
        onClick={() => setIsDialogOpen(true)}
      >
        <X className="h-4 w-4" />
        Refuser
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Refuser la commande</DialogTitle>
            <DialogDescription>Veuillez indiquer la raison du refus de cette commande.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <RadioGroup value={refuseReason} onValueChange={setRefuseReason}>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="documents_incomplets" id="documents_incomplets" />
                <Label htmlFor="documents_incomplets" className="font-normal">
                  Documents incomplets ou incorrects
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="produits_non_conformes" id="produits_non_conformes" />
                <Label htmlFor="produits_non_conformes" className="font-normal">
                  Produits non conformes aux réglementations
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="transport_impossible" id="transport_impossible" />
                <Label htmlFor="transport_impossible" className="font-normal">
                  Transport impossible vers la destination
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="autre" id="autre" />
                <Label htmlFor="autre" className="font-normal">
                  Autre raison
                </Label>
              </div>
            </RadioGroup>
            <div className="space-y-2">
              <Label htmlFor="commentaire">Commentaire (optionnel)</Label>
              <Textarea
                id="commentaire"
                placeholder="Ajoutez des détails supplémentaires..."
                value={refuseComment}
                onChange={(e) => setRefuseComment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleRefuse} disabled={!refuseReason || isLoading}>
              {isLoading ? "En cours..." : "Refuser la commande"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
