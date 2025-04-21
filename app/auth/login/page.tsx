"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const { login, isLoading, error, clearError } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") || "/dashboard/client"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{
    email?: string
    password?: string
  }>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Check for success message in URL
  useEffect(() => {
    const message = searchParams.get("message")
    if (message) {
      setSuccessMessage(decodeURIComponent(message))
    }
  }, [searchParams])

  // Clear error when inputs change
  useEffect(() => {
    if (error) {
      clearError()
    }
  }, [email, password, clearError, error])

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {}
    let isValid = true

    // Validate email
    if (!email) {
      errors.email = "L'email est requis"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "L'email n'est pas valide"
      isValid = false
    }

    // Validate password
    if (!password) {
      errors.password = "Le mot de passe est requis"
      isValid = false
    }

    setValidationErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous messages
    setSuccessMessage(null)

    // Validate form
    if (!validateForm()) {
      return
    }

    // Attempt login
    const success = await login(email, password)
    if (success) {
      router.push(redirectTo)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Cargo Express</h1>
          <p className="mt-2 text-sm text-gray-600">Votre partenaire logistique de confiance</p>
        </div>

        <Card>
          <CardHeader className="flex justify-center items-center">
            <CardTitle>Connexion</CardTitle>
            <CardDescription>Connectez-vous à votre compte client</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
                <AlertTitle>Succès</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={validationErrors.email ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {validationErrors.email && <p className="text-sm text-red-500">{validationErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link href="/auth/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    Mot de passe oublié?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={validationErrors.password ? "border-red-500 pr-10" : "pr-10"}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {validationErrors.password && <p className="text-sm text-red-500">{validationErrors.password}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              <span className="text-gray-500">Vous n'avez pas de compte?</span>{" "}
              <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
                Créer un compte
              </Link>
            </div>
            <div className="flex flex-col space-y-2">
              <Button variant="outline" asChild>
                <Link href="/auth/agent/login">Connexion Agent</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/auth/assistant/login">Connexion Assistant</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/auth/admin/login">Connexion Admin</Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
