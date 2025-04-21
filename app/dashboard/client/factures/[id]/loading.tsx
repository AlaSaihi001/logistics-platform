import { Skeleton } from "@/components/ui/skeleton"

export default function FactureDetailsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-64" />
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <Skeleton className="h-[200px] w-full" />

      <Skeleton className="h-[400px] w-full" />

      <Skeleton className="h-[300px] w-full" />
    </div>
  )
}
