import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Package, CreditCard, FileText } from "lucide-react"

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-10 w-[250px]" />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[100px]" />
                <Skeleton className="h-4 w-[150px] mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Commandes</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[100px]" />
                <Skeleton className="h-4 w-[150px] mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenus</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[100px]" />
                <Skeleton className="h-4 w-[150px] mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Réclamations</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[100px]" />
                <Skeleton className="h-4 w-[150px] mt-2" />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-6 w-[200px]" />
                </CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-[300px]" />
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Skeleton className="h-[200px] w-full" />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-6 w-[200px]" />
                </CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-[300px]" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
