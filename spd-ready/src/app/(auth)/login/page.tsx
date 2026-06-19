import Link from 'next/link'
import { CardFooter } from '@/components/ui/card'
import { FormCard } from '@/components/ui/form-card'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { signInAction } from '@/actions/auth'

// Next.js 16: searchParams is a Promise — must be awaited
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const error = params.error
    ? params.error === 'auth_callback_failed'
      ? 'Authentication failed. Please try again.'
      : 'Sign-in failed. Check your email and password.'
    : null

  return (
    <form action={signInAction}>
      <FormCard
        eyebrow="Welcome back"
        title="Sign in"
        description="Access your SPD Ready account."
        error={error}
        footer={
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">
              Sign in
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-medium text-primary hover:text-accent">
                Request access
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

        <FormField
          label="Password"
          htmlFor="password"
          hint={
            <Link
              href="/reset-password"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Forgot password?
            </Link>
          }
        >
          <Input id="password" name="password" type="password" required autoComplete="current-password" />
        </FormField>
      </FormCard>
    </form>
  )
}
