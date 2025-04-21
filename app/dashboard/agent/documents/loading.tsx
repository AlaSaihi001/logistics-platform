import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function DocumentsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">Gérez vos documents et fichiers</p>
        </div>
        <Button className="gap-2" disabled>
          <Plus className="h-4 w-4" />
          Ajouter un document
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des documents</CardTitle>
          <CardDescription>Consultez et gérez tous vos documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <Skeleton className="h-10 w-full md:w-[300px]" />
            <Skeleton className="h-10 w-full md:w-[180px]" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-40" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-40" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-40" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
