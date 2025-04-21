"use client"

import { useState } from "react"
import { Check, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface CommandeValidationFormProps {
  commandeId: number
  onSuccess: () => void
}

export function CommandeValidationForm({ commandeId, onSuccess }: CommandeValidationFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  const handleValidate = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/assistant/commandes/${commandeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "valider",
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la validation de la commande")
      }

      toast({
        title: "Commande validée",
        description: "La commande a été validée avec succès.",
      })
      onSuccess()
    } catch (error) {
      console.error("Error validating order:", error)
      toast({
        title: "Erreur",
        description: "Impossible de valider la commande",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez fournir une raison pour le rejet",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/assistant/commandes/${commandeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "rejeter",
          raison: rejectReason,
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors du rejet de la commande")
      }

      setShowRejectDialog(false)
      toast({
        title: "Commande rejetée",
        description: "La commande a été rejetée avec succès.",
      })
      onSuccess()
    } catch (error) {
      console.error("Error rejecting order:", error)
      toast({
        title: "Erreur",
        description: "Impossible de rejeter la commande",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
      <Button onClick={handleValidate} disabled={loading} className="flex items-center">
        <Check className="mr-2 h-4 w-4" />
        Valider la commande
      </Button>
      <Button
        variant="destructive"
        onClick={() => setShowRejectDialog(true)}
        disabled={loading}
        className="flex items-center"
      >
        <X className="mr-2 h-4 w-4" />
        Rejeter la commande
      </Button>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeter la commande</AlertDialogTitle>
            <AlertDialogDescription>
              Veuillez fournir une raison pour le rejet de cette commande. Cette information sera communiquée au client.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Raison du rejet..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[100px]"
            />
            {!rejectReason.trim() && (
              <p className="mt-2 flex items-center text-sm text-destructive">
                <AlertCircle className="mr-1 h-4 w-4" />
                Ce champ est obligatoire
              </p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleReject()
              }}
              disabled={loading || !rejectReason.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Traitement..." : "Confirmer le rejet"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
