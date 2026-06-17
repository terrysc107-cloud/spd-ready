import * as React from "react"
import { cn } from "@/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="w-full overflow-x-auto">
      <table data-slot="table" className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  )
}
function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={cn("[&_tr]:border-b", className)} {...props} />
}
function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={cn("[&_tr:last-child]:border-0", className)} {...props} />
}
function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn("border-b transition-colors hover:bg-muted/40", className)}
      {...props}
    />
  )
}
function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn("h-9 px-4 text-left align-middle text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  )
}
function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td data-slot="table-cell" className={cn("px-4 py-3 align-middle", className)} {...props} />
}

// Generic, mobile-aware data table. Desktop = a real table; below `sm` it
// collapses each row into a stacked label:value card.
export type Column<T> = {
  key: string
  header: string
  cell: (row: T) => React.ReactNode
  className?: string
  hideOnMobile?: boolean
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  empty,
  className,
}: {
  columns: Column<T>[]
  rows: T[]
  getRowKey: (row: T) => string
  empty?: React.ReactNode
  className?: string
}) {
  if (rows.length === 0 && empty) return <>{empty}</>
  return (
    <>
      {/* Desktop */}
      <div className={cn("hidden rounded-xl bg-card shadow-sm ring-1 ring-foreground/10 sm:block", className)}>
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              {columns.map((c) => (
                <TableHead key={c.key} className={c.className}>{c.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={getRowKey(row)}>
                {columns.map((c) => (
                  <TableCell key={c.key} className={c.className}>{c.cell(row)}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Mobile stacked cards */}
      <div className="space-y-3 sm:hidden">
        {rows.map((row) => (
          <div
            key={getRowKey(row)}
            className="space-y-2 rounded-xl bg-card p-4 shadow-sm ring-1 ring-foreground/10"
          >
            {columns
              .filter((c) => !c.hideOnMobile)
              .map((c) => (
                <div key={c.key} className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-muted-foreground">{c.header}</span>
                  <span className="text-right text-sm">{c.cell(row)}</span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </>
  )
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }
