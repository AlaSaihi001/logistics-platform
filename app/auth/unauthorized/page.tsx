"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"

export default function UnauthorizedPage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
    }
  }, [user, router])

  // Handle back button
  const handleBack = () => {
    router.back()
  }

  // Handle logout
  const handleLogout = async () => {
    await logout()
  }

  // Determine dashboard link based on user role
  const getDashboardLink = () => {
    if (!user) return "/auth/login"

    switch (user.role) {
      case "CLIENT":
        return "/dashboard/client"
      case "AGENT":
        return "/dashboard/agent"
      case "ASSISTANT":
        return "/dashboard/assistant"
      case "ADMIN":
        return "/dashboard/admin"
      default:
        return "/auth/login"
    }
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <ShieldAlert className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Accès non autorisé</CardTitle>
          <CardDescription>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Votre compte ({user.email}) est connecté en tant que{" "}
            <span className="font-semibold">
              {user.role === "CLIENT" && "Client"}
              {user.role === "AGENT" && "Agent Logistique"}
              {user.role === "ASSISTANT" && "Assistant Client"}
              {user.role === "ADMIN" && "Administrateur"}
            </span>
            , mais vous n'avez pas accès à cette ressource.
          </p>
          <p className="text-sm text-muted-foreground">
            Si vous pensez qu'il s'agit d'une erreur, veuillez contacter l'administrateur du système.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <Button asChild className="flex-1">
              <Link href={getDashboardLink()}>Tableau de bord</Link>
            </Button>
          </div>
          <Button
            variant="ghost"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
