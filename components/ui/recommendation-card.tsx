import type React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface RecommendationCardProps {
  title: string
  description: string
  icon: LucideIcon
  colorScheme?: "blue" | "green" | "amber" | "red" | "purple" | "slate"
  children?: React.ReactNode
  className?: string
}

export function RecommendationCard({
  title,
  description,
  icon: Icon,
  colorScheme = "blue",
  children,
  className,
}: RecommendationCardProps) {
  const colorMap = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      description: "text-blue-700",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      description: "text-green-700",
    },
    amber: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-800",
      description: "text-amber-700",
    },
    red: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      description: "text-red-700",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-800",
      description: "text-purple-700",
    },
    slate: {
      bg: "bg-slate-50",
      border: "border-slate-200",
      text: "text-slate-800",
      description: "text-slate-700",
    },
  }

  const colors = colorMap[colorScheme]

  return (
    <div className={cn("p-4 border rounded-lg", colors.bg, colors.border, className)}>
      <h3 className={cn("text-sm font-medium flex items-center", colors.text)}>
        <Icon className="h-4 w-4 mr-2" />
        {title}
      </h3>
      <p className={cn("mt-1 text-sm", colors.description)}>{description}</p>
      {children && <div className="mt-2">{children}</div>}
    </div>
  )
}
