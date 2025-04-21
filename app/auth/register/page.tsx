"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"

export default function RegisterPage() {
  const { register, isLoading, error, clearError } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    indicatifTelephone: "+216",
    telephone: "",
    password: "",
    confirmPassword: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Clear error when inputs change
  useEffect(() => {
    if (error) {
      clearError()
    }
  }, [formData, clearError, error])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    let isValid = true

    // Validate first name
    if (!formData.prenom.trim()) {
      errors.prenom = "Le prénom est requis"
      isValid = false
    }

    // Validate last name
    if (!formData.nom.trim()) {
      errors.nom = "Le nom est requis"
      isValid = false
    }

    // Validate email
    if (!formData.email) {
      errors.email = "L'email est requis"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "L'email n'est pas valide"
      isValid = false
    }

    // Validate phone
    if (!formData.telephone) {
      errors.telephone = "Le numéro de téléphone est requis"
      isValid = false
    } else if (!/^\d+$/.test(formData.telephone)) {
      errors.telephone = "Le numéro de téléphone doit contenir uniquement des chiffres"
      isValid = false
    }

    // Validate password
    if (!formData.password) {
      errors.password = "Le mot de passe est requis"
      isValid = false
    } else if (formData.password.length < 8) {
      errors.password = "Le mot de passe doit contenir au moins 8 caractères"
      isValid = false
    }

    // Validate password confirmation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "La confirmation du mot de passe est requise"
      isValid = false
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas"
      isValid = false
    }

    setValidationErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      return
    }

    // Attempt registration
    const success = await register(formData)
    if (success) {
      router.push(
        "/dashboard/client?message=" + encodeURIComponent("Inscription réussie! Bienvenue sur Cargo Express."),
      )
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Cargo Express</h1>
          <p className="mt-2 text-sm text-gray-600">Créez votre compte client</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inscription</CardTitle>
            <CardDescription>Créez un compte pour accéder à nos services</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input
                    id="prenom"
                    name="prenom"
                    placeholder="Prénom"
                    value={formData.prenom}
                    onChange={handleChange}
                    className={validationErrors.prenom ? "border-red-500" : ""}
                    disabled={isLoading}
                  />
                  {validationErrors.prenom && <p className="text-sm text-red-500">{validationErrors.prenom}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input
                    id="nom"
                    name="nom"
                    placeholder="Nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className={validationErrors.nom ? "border-red-500" : ""}
                    disabled={isLoading}
                  />
                  {validationErrors.nom && <p className="text-sm text-red-500">{validationErrors.nom}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={validationErrors.email ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {validationErrors.email && <p className="text-sm text-red-500">{validationErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <div className="flex">
                  <Input
                    id="indicatifTelephone"
                    name="indicatifTelephone"
                    value={formData.indicatifTelephone}
                    onChange={handleChange}
                    className="w-20 rounded-r-none"
                    disabled={isLoading}
                  />
                  <Input
                    id="telephone"
                    name="telephone"
                    placeholder="Numéro de téléphone"
                    value={formData.telephone}
                    onChange={handleChange}
                    className={`flex-1 rounded-l-none ${validationErrors.telephone ? "border-red-500" : ""}`}
                    disabled={isLoading}
                  />
                </div>
                {validationErrors.telephone && <p className="text-sm text-red-500">{validationErrors.telephone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
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
                {validationErrors.password ? (
                  <p className="text-sm text-red-500">{validationErrors.password}</p>
                ) : (
                  <p className="text-xs text-gray-500">Le mot de passe doit contenir au moins 8 caractères</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={validationErrors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="text-sm text-red-500">{validationErrors.confirmPassword}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Inscription en cours...
                  </>
                ) : (
                  "S'inscrire"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center">
            <div className="text-sm">
              <span className="text-gray-500">Vous avez déjà un compte?</span>{" "}
              <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                Se connecter
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
