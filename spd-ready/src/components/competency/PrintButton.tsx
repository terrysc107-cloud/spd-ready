'use client'

import { PrinterIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PrintButton({ label = 'Export / print' }: { label?: string }) {
  return (
    <Button variant="outline" size="sm" onClick={() => window.print()}>
      <PrinterIcon className="size-4" />
      {label}
    </Button>
  )
}
