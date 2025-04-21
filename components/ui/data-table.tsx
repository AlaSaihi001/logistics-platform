import type React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface DataTableProps<T> {
  data: T[]
  columns: {
    header: string
    accessorKey: keyof T
    cell?: (item: T) => React.ReactNode
    className?: string
  }[]
  className?: string
  emptyMessage?: string
}

export function DataTable<T>({
  data,
  columns,
  className,
  emptyMessage = "Aucune donnée disponible",
}: DataTableProps<T>) {
  return (
    <div className={cn("rounded-md border overflow-hidden", className)}>
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center h-24">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex} className={column.className}>
                    {column.cell ? column.cell(item) : String(item[column.accessorKey] || "")}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
