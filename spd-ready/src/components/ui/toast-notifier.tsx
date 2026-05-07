'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'

interface ToastNotifierProps {
  messages: {
    param: string
    message: string
    type?: 'success' | 'error' | 'info'
  }[]
}

export function ToastNotifier({ messages }: ToastNotifierProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const matched = messages.filter(m => searchParams.has(m.param))
    if (matched.length === 0) return

    matched.forEach(m => {
      if (m.type === 'error') toast.error(m.message)
      else if (m.type === 'info') toast.info(m.message)
      else toast.success(m.message)
    })

    // Strip toast params from URL without a page reload
    const next = new URLSearchParams(searchParams.toString())
    matched.forEach(m => next.delete(m.param))
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
