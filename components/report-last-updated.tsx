"use client"

import { Clock, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

interface ReportLastUpdatedProps {
  lastUpdated: Date | null
  isLoading: boolean
  onRefresh: () => void
}

export function ReportLastUpdated({ lastUpdated, isLoading, onRefresh }: ReportLastUpdatedProps) {
  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md">
      <div className="flex items-center">
        <Clock className="h-3.5 w-3.5 mr-1.5" />
        {lastUpdated ? (
          <span>Dernière mise à jour: {format(lastUpdated, "dd/MM/yyyy HH:mm:ss")}</span>
        ) : (
          <span>Chargement des données...</span>
        )}
      </div>
      <Button variant="ghost" size="sm" className="h-7 px-2" onClick={onRefresh} disabled={isLoading}>
        <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isLoading ? "animate-spin" : ""}`} />
        Actualiser
      </Button>
    </div>
  )
}
