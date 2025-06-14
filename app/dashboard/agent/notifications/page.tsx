"use client";

import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Check, Filter, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface Notification {
  id: string;
  title: string;
  correspond: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  date: string;
  category: "commande" | "facture" | "support" | "système";
  link?: string;
}

// Fonction pour formater la date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === now.toDateString()) {
    return `Aujourd'hui à ${date.getHours()}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `Hier à ${date.getHours()}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  } else {
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }
  }
}

// Fonction pour obtenir la couleur du badge en fonction du type
function getBadgeVariant(type: Notification["type"]) {
  switch (type) {
    case "info":
      return "default";
    case "warning":
      return "warning";
    case "success":
      return "success";
    case "error":
      return "destructive";
    default:
      return "default";
  }
}

// Fonction pour obtenir la couleur du badge en fonction de la catégorie
function getCategoryBadgeVariant(category: Notification["category"]) {
  switch (category) {
    case "commande":
      return "outline";
    case "facture":
      return "secondary";
    case "support":
      return "outline";
    case "système":
      return "secondary";
    default:
      return "outline";
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/agent/notifications");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: Notification[] = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const commandeCount = notifications.filter(
    (n) => n.category === "commande"
  ).length;
  const systemeCount = notifications.filter(
    (n) => n.category === "système"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">
            Gérez vos notifications et restez informé des mises à jour
            importantes.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Non lues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{commandeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Système</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemeCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        
      </div>

      <Tabs defaultValue="all">
        

        <TabsContent value="all" className="space-y-4 mt-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={notification.read ? "opacity-70" : ""}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`mt-1 rounded-full p-1 ${
                        notification.type === "info"
                          ? "bg-blue-100 text-blue-600"
                          : notification.type === "warning"
                          ? "bg-yellow-100 text-yellow-600"
                          : notification.type === "success"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium leading-none">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <Badge variant="secondary" className="text-xs">
                            Nouveau
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.correspond}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <Badge variant={getBadgeVariant(notification.type)}>
                          {notification.type === "info"
                            ? "Information"
                            : notification.type === "warning"
                            ? "Avertissement"
                            : notification.type === "success"
                            ? "Succès"
                            : "Erreur"}
                        </Badge>
                        <Badge
                          variant={getCategoryBadgeVariant(
                            notification.category
                          )}
                        >
                          {notification.category === "commande"
                            ? "Commande"
                            : notification.category === "facture"
                            ? "Facture"
                            : notification.category === "support"
                            ? "Support"
                            : "Système"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Check className="h-4 w-4" />
                        <span className="sr-only">Marquer comme lu</span>
                      </Button>
                    )}
                    {notification.link && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={notification.link}>Voir</a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4 mt-4">
          {notifications
            .filter((n) => !n.read)
            .map((notification) => (
              <Card key={notification.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-1 rounded-full p-1 ${
                          notification.type === "info"
                            ? "bg-blue-100 text-blue-600"
                            : notification.type === "warning"
                            ? "bg-yellow-100 text-yellow-600"
                            : notification.type === "success"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        <Bell className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium leading-none">
                            {notification.title}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            Nouveau
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.correspond}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <Badge variant={getBadgeVariant(notification.type)}>
                            {notification.type === "info"
                              ? "Information"
                              : notification.type === "warning"
                              ? "Avertissement"
                              : notification.type === "success"
                              ? "Succès"
                              : "Erreur"}
                          </Badge>
                          <Badge
                            variant={getCategoryBadgeVariant(
                              notification.category
                            )}
                          >
                            {notification.category === "commande"
                              ? "Commande"
                              : notification.category === "facture"
                              ? "Facture"
                              : notification.category === "support"
                              ? "Support"
                              : "Système"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Check className="h-4 w-4" />
                        <span className="sr-only">Marquer comme lu</span>
                      </Button>
                      {notification.link && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={notification.link}>Voir</a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

          {notifications.filter((n) => !n.read).length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <Check className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Tout est à jour</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Vous n'avez aucune notification non lue.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="commandes" className="space-y-4 mt-4">
          {notifications
            .filter((n) => n.category === "commande")
            .map((notification) => (
              <Card
                key={notification.id}
                className={notification.read ? "opacity-70" : ""}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-1 rounded-full p-1 ${
                          notification.type === "info"
                            ? "bg-blue-100 text-blue-600"
                            : notification.type === "warning"
                            ? "bg-yellow-100 text-yellow-600"
                            : notification.type === "success"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        <Bell className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium leading-none">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <Badge variant="secondary" className="text-xs">
                              Nouveau
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.correspond}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <Badge variant={getBadgeVariant(notification.type)}>
                            {notification.type === "info"
                              ? "Information"
                              : notification.type === "warning"
                              ? "Avertissement"
                              : notification.type === "success"
                              ? "Succès"
                              : "Erreur"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(notification.dreatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Check className="h-4 w-4" />
                          <span className="sr-only">Marquer comme lu</span>
                        </Button>
                      )}
                      {notification.link && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={notification.link}>Voir</a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="system" className="space-y-4 mt-4">
          {notifications
            .filter((n) => n.category === "système")
            .map((notification) => (
              <Card
                key={notification.id}
                className={notification.read ? "opacity-70" : ""}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-1 rounded-full p-1 ${
                          notification.type === "info"
                            ? "bg-blue-100 text-blue-600"
                            : notification.type === "warning"
                            ? "bg-yellow-100 text-yellow-600"
                            : notification.type === "success"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        <Bell className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium leading-none">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <Badge variant="secondary" className="text-xs">
                              Nouveau
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.correspond}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <Badge variant={getBadgeVariant(notification.type)}>
                            {notification.type === "info"
                              ? "Information"
                              : notification.type === "warning"
                              ? "Avertissement"
                              : notification.type === "success"
                              ? "Succès"
                              : "Erreur"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Check className="h-4 w-4" />
                          <span className="sr-only">Marquer comme lu</span>
                        </Button>
                      )}
                      {notification.link && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={notification.link}>Voir</a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
