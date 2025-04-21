import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatsCard({ title, value, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <Card className={cn("overflow-hidden border-none shadow-md", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="rounded-full p-2 bg-[#074e6e]/10">
            <Icon className="h-5 w-5 text-[#074e6e]" />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center text-xs">
            <div
              className={cn(
                "flex items-center rounded-full px-2 py-1",
                trend.isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700",
              )}
            >
              {trend.isPositive ? <ArrowUp className="mr-1 h-3 w-3" /> : <ArrowDown className="mr-1 h-3 w-3" />}
              <span>{trend.value}%</span>
            </div>
            <span className="ml-2 text-muted-foreground">
              {trend.isPositive ? "depuis le mois dernier" : "depuis le mois dernier"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
