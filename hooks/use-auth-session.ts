"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

type UserRole = "CLIENT" | "AGENT" | "ASSISTANT" | "ADMIN"

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  image?: string
}

interface UseAuthSessionReturn {
  user: User | null
  isLoading: boolean
  error: string | null
  requireAuth: (allowedRoles?: UserRole[]) => Promise<boolean>
  refreshSession: () => Promise<void>
}

export function useAuthSession(): UseAuthSessionReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Fetch session data
  const fetchSession = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/auth/session", {
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération de la session")
      }

      const data = await response.json()

      if (data.user) {
        setUser(data.user)
      } else {
        setUser(null)
      }

      return data.user
    } catch (err) {
      console.error("Error fetching session:", err)
      setError(err instanceof Error ? err.message : "Erreur lors de la récupération de la session")
      setUser(null)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial session check
  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  // Refresh session
  const refreshSession = async () => {
    await fetchSession()
  }

  // Require authentication and optionally check roles
  const requireAuth = useCallback(
    async (allowedRoles?: UserRole[]): Promise<boolean> => {
      try {
        setIsLoading(true)

        // Fetch fresh session data
        const userData = await fetchSession()

        // Check if user is authenticated
        if (!userData) {
          router.push("/auth/login")
          toast({
            variant: "destructive",
            title: "Authentification requise",
            description: "Veuillez vous connecter pour accéder à cette page",
          })
          return false
        }

        // Check if user has required role
        if (allowedRoles && allowedRoles.length > 0) {
          if (!allowedRoles.includes(userData.role)) {
            router.push("/auth/unauthorized")
            toast({
              variant: "destructive",
              title: "Accès non autorisé",
              description: "Vous n'avez pas les permissions nécessaires pour accéder à cette page",
            })
            return false
          }
        }

        return true
      } catch (err) {
        console.error("Error in requireAuth:", err)
        setError(err instanceof Error ? err.message : "Erreur d'authentification")
        router.push("/auth/login")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [fetchSession, router, toast],
  )

  return {
    user,
    isLoading,
    error,
    requireAuth,
    refreshSession,
  }
}
