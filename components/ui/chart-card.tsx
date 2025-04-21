import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface ChartCardProps {
  title: string
  description?: string
  icon: LucideIcon
  iconColorScheme?: "blue" | "green" | "amber" | "red" | "purple" | "primary"
  children: React.ReactNode
  className?: string
}

export function ChartCard({
  title,
  description,
  icon: Icon,
  iconColorScheme = "blue",
  children,
  className,
}: ChartCardProps) {
  const colorMap = {
    blue: "text-blue-600",
    green: "text-green-600",
    amber: "text-amber-600",
    red: "text-red-600",
    purple: "text-purple-600",
    primary: "text-[#a22e2e]",
  }

  const iconColor = colorMap[iconColorScheme] || colorMap.blue

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-[#a22e2e]/10">
        <div>
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <Icon className={cn("h-5 w-5", iconColor)} />
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  )
}
