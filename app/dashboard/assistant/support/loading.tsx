import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-4 w-[300px] mt-2" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-[200px]" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-[300px]" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <Skeleton className="h-10 w-full md:w-[300px]" />
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <Skeleton className="h-10 w-[180px]" />
              <Skeleton className="h-10 w-[180px]" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>

          <div className="rounded-md border">
            <div className="p-4">
              <div className="flex items-center space-x-4 py-4">
                <Skeleton className="h-6 w-[120px]" />
                <Skeleton className="h-6 w-[100px]" />
                <Skeleton className="h-6 w-[150px]" />
                <Skeleton className="h-6 w-[100px]" />
                <Skeleton className="h-6 w-[100px]" />
                <Skeleton className="h-6 w-[120px]" />
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 py-4 border-t">
                  <Skeleton className="h-5 w-[120px]" />
                  <Skeleton className="h-5 w-[100px]" />
                  <Skeleton className="h-5 w-[150px]" />
                  <Skeleton className="h-5 w-[100px]" />
                  <Skeleton className="h-5 w-[100px]" />
                  <Skeleton className="h-8 w-[120px]" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
