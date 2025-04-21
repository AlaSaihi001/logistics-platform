import type React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface ActionCardProps {
  title: string
  description?: string
  icon: LucideIcon
  colorScheme?: "blue" | "green" | "amber" | "red" | "primary"
  children: React.ReactNode
  className?: string
}

export function ActionCard({
  title,
  description,
  icon: Icon,
  colorScheme = "blue",
  children,
  className,
}: ActionCardProps) {
  const colorMap = {
    blue: {
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    green: {
      bg: "bg-green-50",
      iconColor: "text-green-600",
    },
    amber: {
      bg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    red: {
      bg: "bg-red-50",
      iconColor: "text-red-600",
    },
    primary: {
      bg: "bg-[#a22e2e]/5",
      iconColor: "text-[#a22e2e]",
    },
  }

  const colors = colorMap[colorScheme] || colorMap.blue

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className={cn("flex flex-row items-center gap-3", colors.bg)}>
        <div className="rounded-full p-2 bg-white">
          <Icon className={cn("h-5 w-5", colors.iconColor)} />
        </div>
        <div>
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          {description && <CardDescription className="text-xs">{description}</CardDescription>}
        </div>
      </CardHeader>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  )
}
