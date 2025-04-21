import type React from "react"
// This is a simplified version just to make the toast work in the example
import { toast as sonnerToast } from "sonner"

export function toast({
  title,
  description,
  action,
  variant,
}: { title: string; description?: string; action?: React.ReactNode; variant?: "default" | "destructive" }) {
  return sonnerToast(title, {
    description,
    action,
    style:
      variant === "destructive"
        ? { background: "hsl(var(--destructive))", color: "hsl(var(--destructive-foreground))" }
        : {},
  })
}

// Add useToast hook
export const useToast = () => {
  return {
    toast,
    dismiss: (toastId?: string) => {
      // If sonner has a dismiss function, use it
      if (typeof sonnerToast.dismiss === "function") {
        sonnerToast.dismiss(toastId)
      }
    },
  }
}
