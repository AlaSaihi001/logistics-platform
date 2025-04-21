import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"

export default function AdminUsersLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Skeleton className="h-10 w-[300px]" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-[150px]" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-[300px]" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="client">Clients</TabsTrigger>
                <TabsTrigger value="agent">Agents</TabsTrigger>
                <TabsTrigger value="assistant">Assistants</TabsTrigger>
                <TabsTrigger value="admin">Administrateurs</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
