import { Badge } from "@/components/ui/badge"
import { Clock, Truck, CheckCircle, XCircle, Archive, AlertTriangle } from "lucide-react"

interface StatusBadgeProps {
  status: string
  showIcon?: boolean
  size?: "sm" | "md" | "lg"
}

export function StatusBadge({ status, showIcon = true, size = "md" }: StatusBadgeProps) {
  const iconSize = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
  const iconMargin = showIcon ? "mr-1" : ""

  switch (status) {
    case "Livrée":
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
          {showIcon && <CheckCircle className={`${iconMargin} ${iconSize}`} />} Livrée
        </Badge>
      )
    case "Expédiée":
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">
          {showIcon && <Truck className={`${iconMargin} ${iconSize}`} />} Expédiée
        </Badge>
      )
    case "En attente":
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100">
          {showIcon && <Clock className={`${iconMargin} ${iconSize}`} />} En attente
        </Badge>
      )
    case "Annulée":
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
          {showIcon && <XCircle className={`${iconMargin} ${iconSize}`} />} Annulée
        </Badge>
      )
    case "Archivée":
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100">
          {showIcon && <Archive className={`${iconMargin} ${iconSize}`} />} Archivée
        </Badge>
      )
    case "Payée":
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
          {showIcon && <CheckCircle className={`${iconMargin} ${iconSize}`} />} Payée
        </Badge>
      )
    case "En retard":
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
          {showIcon && <AlertTriangle className={`${iconMargin} ${iconSize}`} />} En retard
        </Badge>
      )
    case "En cours de paiement":
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">
          {showIcon && <Clock className={`${iconMargin} ${iconSize}`} />} En cours
        </Badge>
      )
    default:
      return <Badge>{status}</Badge>
  }
}
