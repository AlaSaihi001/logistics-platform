"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertTriangle, Home, ArrowLeft, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string>("Une erreur est survenue")
  const [errorCode, setErrorCode] = useState<string | null>(null)

  useEffect(() => {
    // Get error details from URL
    const error = searchParams.get("error")
    const code = searchParams.get("code")

    if (error) {
      setErrorMessage(decodeURIComponent(error))
    }

    if (code) {
      setErrorCode(code)
    }
  }, [searchParams])

  const getErrorDescription = () => {
    switch (errorCode) {
      case "401":
        return "Vous n'êtes pas autorisé à accéder à cette ressource. Veuillez vous connecter."
      case "403":
        return "Vous n'avez pas les permissions nécessaires pour accéder à cette ressource."
      case "404":
        return "La page que vous recherchez n'existe pas ou a été déplacée."
      case "500":
        return "Une erreur interne du serveur s'est produite. Veuillez réessayer ultérieurement."
      case "timeout":
        return "La requête a pris trop de temps à s'exécuter. Veuillez réessayer."
      case "network":
        return "Problème de connexion réseau. Veuillez vérifier votre connexion internet."
      default:
        return "Une erreur inattendue s'est produite. Veuillez réessayer ou contacter le support."
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Erreur</CardTitle>
          <CardDescription>{errorCode && `Code d'erreur: ${errorCode}`}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Message d'erreur</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>

          <p className="text-center text-sm text-muted-foreground mt-4">{getErrorDescription()}</p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Réessayer
            </Button>
          </div>
          <Button asChild className="w-full">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Accueil
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
