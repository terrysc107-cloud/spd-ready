"use client"

import * as React from "react"
import { CircleCheckIcon, CircleXIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type Variant = "success" | "error"
type ToastItem = { id: number; message: string; variant: Variant }
type ToastCtx = { toast: (message: string, variant?: Variant) => void }

const ToastContext = React.createContext<ToastCtx | null>(null)

export function useToast(): ToastCtx {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>")
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([])
  const seq = React.useRef(0)

  const toast = React.useCallback((message: string, variant: Variant = "success") => {
    const id = ++seq.current
    setItems((prev) => [...prev, { id, message, variant }])
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-20 z-[100] flex flex-col gap-2 lg:bottom-4">
        {items.map((t) => (
          <div
            key={t.id}
            className="animate-in slide-in-from-bottom-2 fade-in-0 pointer-events-auto flex items-center gap-2 rounded-xl bg-card px-4 py-3 text-sm shadow-lg ring-1 ring-foreground/10"
          >
            {t.variant === "error" ? (
              <CircleXIcon className="size-4 text-destructive" />
            ) : (
              <CircleCheckIcon className="size-4 text-[oklch(0.55_0.18_150)]" />
            )}
            <span className={cn(t.variant === "error" && "text-destructive")}>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
