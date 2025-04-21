import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  change?: number
  changeLabel?: string
  progress?: number
  colorScheme?: "blue" | "green" | "amber" | "red" | "purple" | "slate" | "primary"
  className?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  change,
  changeLabel,
  progress,
  colorScheme = "blue",
  className,
}: StatCardProps) {
  const colorMap = {
    blue: {
      border: "border-l-blue-500",
      bg: "bg-blue-50/50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-700",
    },
    green: {
      border: "border-l-green-500",
      bg: "bg-green-50/50",
      iconBg: "bg-green-100",
      iconColor: "text-green-700",
    },
    amber: {
      border: "border-l-amber-500",
      bg: "bg-amber-50/50",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-700",
    },
    red: {
      border: "border-l-red-500",
      bg: "bg-red-50/50",
      iconBg: "bg-red-100",
      iconColor: "text-red-700",
    },
    purple: {
      border: "border-l-purple-500",
      bg: "bg-purple-50/50",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-700",
    },
    slate: {
      border: "border-l-slate-500",
      bg: "bg-slate-50/50",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-700",
    },
    primary: {
      border: "border-l-[#a22e2e]",
      bg: "bg-[#a22e2e]/5",
      iconBg: "bg-[#a22e2e]/10",
      iconColor: "text-[#a22e2e]",
    },
  }

  const colors = colorMap[colorScheme]

  return (
    <Card className={cn("overflow-hidden border-l-4", colors.border, className)}>
      <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2", colors.bg)}>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn("p-2 rounded-full", colors.iconBg)}>
          <Icon className={cn("h-4 w-4", colors.iconColor)} />
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="text-2xl font-bold">{value}</div>
        {typeof change !== "undefined" && (
          <div className="flex items-center mt-1">
            {change >= 0 ? (
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-green-500 mr-1" />
            )}
            <p className="text-xs text-green-500 font-medium">
              {change >= 0 ? "+" : ""}
              {change}%
            </p>
            {changeLabel && <p className="text-xs text-muted-foreground ml-1">{changeLabel}</p>}
          </div>
        )}
        {typeof progress !== "undefined" && <Progress value={progress} className="h-1 mt-3" />}
      </CardContent>
    </Card>
  )
}
