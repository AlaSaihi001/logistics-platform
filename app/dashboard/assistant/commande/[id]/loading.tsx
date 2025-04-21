import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-6 w-[80px] ml-2" />
          </div>
          <Skeleton className="h-4 w-[300px] mt-2" />
        </div>
      </div>

      <Tabs defaultValue="informations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="informations">Informations générales</TabsTrigger>
          <TabsTrigger value="produits">Produits</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
        </TabsList>

        <TabsContent value="informations" className="space-y-4">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <Card className="md:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle>
                  <Skeleton className="h-6 w-[200px]" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-[150px] w-full" />
              </CardContent>
            </Card>

            <Card className="md:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle>
                  <Skeleton className="h-6 w-[200px]" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-[60px] w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <Card className="md:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle>
                  <Skeleton className="h-6 w-[200px]" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-[60px] w-full" />
                ))}
              </CardContent>
            </Card>

            <Card className="md:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle>
                  <Skeleton className="h-6 w-[200px]" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-[60px] w-full" />
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
