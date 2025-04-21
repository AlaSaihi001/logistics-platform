import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
        <Skeleton className="h-10 w-[180px]" />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-[200px]" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-3 w-[80px]" />
                    </div>
                    <Skeleton className="h-[100px] w-full" />
                  </div>
                </div>
              ))}
            </CardContent>
            <div className="p-6 pt-0">
              <Skeleton className="h-[120px] w-full mb-4" />
              <div className="flex justify-end gap-2 w-full">
                <Skeleton className="h-10 w-[150px]" />
                <Skeleton className="h-10 w-[100px]" />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-[200px]" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-[200px]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-[60px] w-full" />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-[200px]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
