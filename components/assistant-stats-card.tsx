import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function AssistantStatsCard({ title, value, description, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <Card className={cn("overflow-hidden border border-[#3f1f5d]/20 transition-all", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-[#3f1f5d]">{value}</p>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          <div className="h-10 w-10 rounded-full bg-[#3f1f5d]/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-[#3f1f5d]" />
          </div>
        </div>
        {trend && (
          <div className={`flex items-center text-xs mt-4 ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
            {trend.isPositive ? "↑" : "↓"} {trend.value}%
            <span className="text-muted-foreground ml-1">depuis le mois dernier</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

