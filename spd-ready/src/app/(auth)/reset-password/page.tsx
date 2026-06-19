import Link from 'next/link'
import { CheckCircle2Icon } from 'lucide-react'
import { CardFooter } from '@/components/ui/card'
import { FormCard } from '@/components/ui/form-card'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { resetPasswordAction } from '@/actions/auth'

// Next.js 16: searchParams is a Promise — must be awaited
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const params = await searchParams

  if (params.success) {
    return (
      <FormCard eyebrow="Reset password" title="Check your inbox">
        <div className="flex items-start gap-3 rounded-lg bg-[oklch(0.96_0.04_150)] p-4 text-sm text-[oklch(0.4_0.16_150)] ring-1 ring-inset ring-[oklch(0.75_0.12_150)]/40">
          <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" />
          {params.success}
        </div>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:text-accent">
            Return to sign in
          </Link>
        </p>
      </FormCard>
    )
  }

  return (
    <form action={resetPasswordAction}>
      <FormCard
        eyebrow="Reset password"
        title="Forgot your password?"
        description="Enter your email address and we'll send you a reset link."
        error={params.error ?? null}
        footer={
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">
              Send reset link
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Remembered your password?{' '}
              <Link href="/login" className="font-medium text-primary hover:text-accent">
                Sign in
              </Link>
            </p>
          </CardFooter>
        }
      >
        <FormField label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </FormField>
      </FormCard>
    </form>
  )
}
