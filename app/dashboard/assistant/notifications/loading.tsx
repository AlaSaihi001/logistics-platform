import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function NotificationsLoading() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-4 w-[350px]" />
        </div>

        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Skeleton className="h-10 w-[300px]" />
            <div className="flex gap-2 w-full sm:w-auto">
              <Skeleton className="h-10 w-[250px]" />
              <Skeleton className="h-10 w-[180px]" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>

          <div className="grid gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 w-full">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-[150px]" />
                          <Skeleton className="h-5 w-[80px]" />
                        </div>
                        <Skeleton className="h-4 w-[120px]" />
                        <Skeleton className="h-4 w-full max-w-[500px]" />
                        <Skeleton className="h-4 w-[100px]" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
