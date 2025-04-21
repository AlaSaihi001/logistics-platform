"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { AssistantSidebar, getAssistantSidebarItems } from "@/components/assistant-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useAuthSession } from "@/hooks/use-auth-session"
import { ThemeProvider } from "@/lib/theme-provider"
import { useMobile } from "@/hooks/use-mobile"

interface AssistantLayoutProps {
  children: React.ReactNode
}

export default function AssistantLayout({ children }: AssistantLayoutProps) {
  const { requireAuth } = useAuthSession()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const isMobile = useMobile()

  // Check authentication and role
  useEffect(() => {
    setIsAuthorized(requireAuth(["ASSISTANT"]))
  }, [requireAuth])

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [pathname, isMobile])

  // If not authorized, don't render the layout
  if (!isAuthorized) {
    return null
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1">
          {/* Mobile sidebar toggle */}
          <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b bg-background px-4 sm:px-6 lg:hidden">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Sidebar for desktop */}
          <div
            className={`fixed inset-y-0 z-50 flex w-72 flex-col border-r bg-background transition-transform duration-300 lg:relative lg:translate-x-0 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex h-16 items-center border-b px-6">
              <h2 className="text-lg font-semibold">Assistant Dashboard</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <AssistantSidebar items={getAssistantSidebarItems()} />
            </div>
          </div>

          {/* Backdrop for mobile sidebar */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main content */}
          <div className="flex-1 overflow-y-auto">
            <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </div>
      <Toaster />
    </ThemeProvider>
  )
}
