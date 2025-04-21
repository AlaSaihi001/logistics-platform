import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CommandesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-60 mt-2" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-40" />
          </CardTitle>
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <div className="flex gap-2 w-full md:w-auto">
              <Skeleton className="h-10 w-[300px]" />
              <Skeleton className="h-10 w-10" />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Skeleton className="h-10 w-[180px]" />
              <Skeleton className="h-10 w-[180px]" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <div className="bg-muted/50 p-3">
              <div className="grid grid-cols-7 gap-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            </div>
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4">
                  <div className="grid grid-cols-7 gap-4">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <Skeleton key={j} className="h-6 w-full" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
