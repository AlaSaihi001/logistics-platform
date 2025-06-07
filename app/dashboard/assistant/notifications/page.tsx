"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  ChevronDown,
  FileText,
  Filter,
  Package,
  Search,
  Trash2,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

// Types pour les notifications
type NotificationType = "commande" | "support" | "facture" | "système";
type NotificationStatus = "lue" | "non-lue";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: Date;
  status: NotificationStatus;
  link?: string;
  linkText?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/assistant/notifications");
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
  // Filtrer les notifications
  const filteredNotifications = notifications.filter((notification) => {
    // Filtre par onglet
    if (activeTab === "unread" && notification.status === "lue") return false;
    if (activeTab === "read" && notification.status === "non-lue") return false;

    // Filtre par type
    if (typeFilter !== "all" && notification.type !== typeFilter) return false;

    // Filtre par recherche
    if (
      searchQuery &&
      !notification.message.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !notification.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  // Marquer comme lue
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, status: "lue" } : notif
      )
    );
    toast({
      title: "Notification marquée comme lue",
      description: "La notification a été marquée comme lue avec succès.",
    });
  };

  // Marquer toutes comme lues
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, status: "lue" }))
    );
    toast({
      title: "Toutes les notifications marquées comme lues",
      description:
        "Toutes les notifications ont été marquées comme lues avec succès.",
    });
  };

  // Supprimer une notification
  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    toast({
      title: "Notification supprimée",
      description: "La notification a été supprimée avec succès.",
    });
  };

  // Supprimer toutes les notifications
  const deleteAllNotifications = () => {
    setNotifications([]);
    toast({
      title: "Toutes les notifications supprimées",
      description: "Toutes les notifications ont été supprimées avec succès.",
    });
  };

  // Obtenir l'icône en fonction du type de notification
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "commande":
        return <Package className="h-5 w-5 text-blue-500" />;
      case "support":
        return <User className="h-5 w-5 text-green-500" />;
      case "facture":
        return <FileText className="h-5 w-5 text-amber-500" />;
      case "système":
        return <Bell className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  // Obtenir la couleur du badge en fonction du type de notification
  const getNotificationBadgeColor = (type: NotificationType) => {
    switch (type) {
      case "commande":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "support":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "facture":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      case "système":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Formater le type de notification pour l'affichage
  const formatNotificationType = (type: NotificationType) => {
    switch (type) {
      case "commande":
        return "Commande";
      case "support":
        return "Support";
      case "facture":
        return "Facture";
      case "système":
        return "Système";
      default:
        return type;
    }
  };

  const unreadCount = notifications.filter(
    (n) => n.status === "non-lue"
  ).length;

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Gérez vos notifications et restez informé des dernières activités.
          </p>
        </div>

        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Tabs
              defaultValue="all"
              className="w-full sm:w-auto"
              onValueChange={setActiveTab}
            >
              <TabsList>
                <TabsTrigger value="all">Toutes</TabsTrigger>
                <TabsTrigger value="unread">
                  Non lues{" "}
                  {unreadCount > 0 && (
                    <Badge className="ml-2 bg-primary">{unreadCount}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="read">Lues</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher..."
                  className="w-full sm:w-[250px] pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filtrer par type" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="commande">Commandes</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="facture">Factures</SelectItem>
                    <SelectItem value="système">Système</SelectItem>
                  </SelectContent>
                </Select>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={markAllAsRead}>
                      <CheckCheck className="mr-2 h-4 w-4" />
                      <span>Marquer tout comme lu</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={deleteAllNotifications}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Supprimer toutes les notifications</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Aucune notification</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery || typeFilter !== "all"
                    ? "Aucune notification ne correspond à vos critères de recherche."
                    : "Vous n'avez aucune notification pour le moment."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`transition-all ${
                    notification.status === "non-lue"
                      ? "border-l-4 border-l-primary"
                      : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-medium">
                              {notification.title}
                            </h4>
                            <Badge
                              variant="secondary"
                              className={getNotificationBadgeColor(
                                notification.type
                              )}
                            >
                              {formatNotificationType(notification.type)}
                            </Badge>
                            {notification.status === "non-lue" && (
                              <Badge variant="default" className="bg-primary">
                                Nouvelle
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(
                              notification.createdAt,
                              "d MMMM yyyy 'à' HH:mm",
                              { locale: fr }
                            )}
                          </p>
                          <p className="text-sm mt-2">
                            {notification.correspond}
                          </p>
                          {notification.link && (
                            <Button
                              variant="link"
                              className="p-0 h-auto text-sm font-medium"
                              asChild
                            >
                              <a href={notification.link}>
                                {notification.linkText}
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {notification.status === "non-lue" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => markAsRead(notification.id)}
                            title="Marquer comme lu"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteNotification(notification.id)}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
