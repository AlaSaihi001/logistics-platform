import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter, Search } from "lucide-react"

export default function NotificationsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">
            Gérez vos notifications et restez informé des mises à jour importantes.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Non lues</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Système</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Rechercher des notifications..." className="w-full pl-8" disabled />
        </div>
        <Button variant="outline" size="sm" className="h-9 gap-1" disabled>
          <Filter className="h-4 w-4" />
          Filtrer
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all" disabled>
            Toutes
          </TabsTrigger>
          <TabsTrigger value="unread" disabled>
            Non lues
          </TabsTrigger>
          <TabsTrigger value="commandes" disabled>
            Commandes
          </TabsTrigger>
          <TabsTrigger value="system" disabled>
            Système
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-2 pt-1">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
