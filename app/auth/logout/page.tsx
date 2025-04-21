"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"

export default function LogoutPage() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Redirect to login if already logged out
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login?message=" + encodeURIComponent("Vous avez été déconnecté avec succès"))
    }
  }, [user, isLoading, router])

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      setError(null)
      await logout()
      // The useEffect above will handle the redirect
    } catch (err) {
      console.error("Logout error:", err)
      setError("Une erreur est survenue lors de la déconnexion. Veuillez réessayer.")
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleCancel = () => {
    // Determine where to redirect based on user role
    if (user) {
      switch (user.role) {
        case "CLIENT":
          router.push("/dashboard/client")
          break
        case "AGENT":
          router.push("/dashboard/agent")
          break
        case "ASSISTANT":
          router.push("/dashboard/assistant")
          break
        case "ADMIN":
          router.push("/dashboard/admin")
          break
        default:
          router.push("/")
      }
    } else {
      router.push("/")
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <LogOut className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Déconnexion</CardTitle>
          <CardDescription>Êtes-vous sûr de vouloir vous déconnecter de votre compte?</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-center mb-4">
            <p>
              Vous êtes actuellement connecté en tant que <span className="font-semibold">{user.name}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleCancel} disabled={isLoggingOut}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Déconnexion en cours...
              </>
            ) : (
              "Se déconnecter"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
