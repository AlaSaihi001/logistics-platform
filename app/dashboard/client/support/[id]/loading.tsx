import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-64" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <Skeleton className="h-6 w-64 mb-2" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-6 w-24" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-32 w-full" />

                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>

              <Skeleton className="h-px w-full" />

              <div className="space-y-4">
                <Skeleton className="h-5 w-32" />
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>

              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-64" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-8 w-full" />
              </div>

              <div>
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-4 w-32" />
              </div>

              <div>
                <Skeleton className="h-4 w-40 mb-1" />
                <Skeleton className="h-4 w-48" />
              </div>

              <div>
                <Skeleton className="h-4 w-48 mb-1" />
                <Skeleton className="h-4 w-32" />
              </div>

              <Skeleton className="h-px w-full" />

              <div>
                <Skeleton className="h-4 w-40 mb-2" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
