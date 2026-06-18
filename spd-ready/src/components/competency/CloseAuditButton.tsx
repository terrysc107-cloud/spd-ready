'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { closeAuditAction } from '@/actions/audits'

export function CloseAuditButton({ auditId }: { auditId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await closeAuditAction(auditId)
          router.refresh()
        })
      }
    >
      {isPending ? 'Signing off…' : 'Sign off'}
    </Button>
  )
}
