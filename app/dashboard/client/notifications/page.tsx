"use client"

import { useState, useEffect, useCallback } from "react"
import { Bell, Check, CheckCheck, Clock, Package, CreditCard, AlertTriangle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"

interface Notification {
  id: string
  dateEmission: string
  type: string
  correspond: string
  lu: boolean
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null)
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/notifications")
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || `Erreur lors du chargement des notifications (${response.status})`)
      }

      const data = await response.json()

      // Format dates
      const formattedNotifications = data.map((notification: any) => ({
        ...notification,
        id: notification.id.toString(),
        dateEmission: new Date(notification.dateEmission).toLocaleString("fr-FR"),
      }))

      setNotifications(formattedNotifications)
    } catch (error) {
      console.error("Error fetching notifications:", error)
      setError(
        error instanceof Error ? error.message : "Une erreur s'est produite lors du chargement des notifications",
      )
      toast({
        title: "Erreur",
        description: "Impossible de charger vos notifications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Current implementation waits for API response before updating UI
  const markAsRead = async (id: string) => {
    setMarkingAsRead(id)

    // Optimistically update the UI
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, lu: true } : notification)),
    )

    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || `Erreur lors de la mise à jour de la notification (${response.status})`)
      }
    } catch (error) {
      // Revert the optimistic update on error
      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, lu: false } : notification)),
      )

      console.error("Error marking notification as read:", error)
      toast({
        title: "Erreur",
        description: "Impossible de marquer la notification comme lue",
        variant: "destructive",
      })
    } finally {
      setMarkingAsRead(null)
    }
  }

  const markAllAsRead = async () => {
    setMarkingAllAsRead(true)

    // Optimistically update the UI
    setNotifications((prev) => prev.map((notification) => ({ ...notification, lu: true })))

    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ markAllAsRead: true }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || `Erreur lors de la mise à jour des notifications (${response.status})`)
      }

      toast({
        title: "Notifications mises à jour",
        description: "Toutes les notifications ont été marquées comme lues",
      })
    } catch (error) {
      // Revert the optimistic update on error
      await fetchNotifications()

      console.error("Error marking all notifications as read:", error)
      toast({
        title: "Erreur",
        description: "Impossible de marquer toutes les notifications comme lues",
        variant: "destructive",
      })
    } finally {
      setMarkingAllAsRead(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "commande":
        return <Package className="h-5 w-5 text-blue-500" />
      case "statut":
        return <Clock className="h-5 w-5 text-orange-500" />
      case "paiement":
        return <CreditCard className="h-5 w-5 text-green-500" />
      case "reclamation":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notification.lu
    return notification.type === activeTab
  })

  const unreadCount = notifications.filter((n) => !n.lu).length

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={fetchNotifications}>
              <RefreshCw className="mr-2 h-4 w-4" /> Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Consultez vos notifications et restez informé</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead} disabled={markingAllAsRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            {markingAllAsRead ? "Traitement..." : "Tout marquer comme lu"}
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            Toutes
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-white">{unreadCount}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread">Non lues</TabsTrigger>
          <TabsTrigger value="commande">Commandes</TabsTrigger>
          <TabsTrigger value="statut">Statuts</TabsTrigger>
          <TabsTrigger value="paiement">Paiements</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <Card key={notification.id} className={notification.lu ? "bg-white" : "bg-blue-50"}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                      <div>
                        <p className="font-medium">{notification.correspond}</p>
                        <p className="text-sm text-muted-foreground">{notification.dateEmission}</p>
                      </div>
                    </div>
                    {!notification.lu && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        disabled={markingAsRead === notification.id}
                      >
                        <Check className="h-4 w-4" />
                        <span className="sr-only">Marquer comme lu</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Aucune notification</h3>
                <p className="mt-2 text-sm text-muted-foreground">Vous n'avez pas de notifications pour le moment.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
