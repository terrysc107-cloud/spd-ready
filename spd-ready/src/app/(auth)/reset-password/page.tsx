import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { resetPasswordAction } from '@/actions/auth'

// Next.js 16: searchParams is a Promise — must be awaited
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const params = await searchParams

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Reset Password</CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a reset link.
        </CardDescription>
      </CardHeader>

      {params.success ? (
        <CardContent>
          <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">
            {params.success}
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">
              Return to sign in
            </Link>
          </p>
        </CardContent>
      ) : (
        <form action={resetPasswordAction}>
          <CardContent className="space-y-4">
            {params.error && (
              <p className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
                {params.error}
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">
              Send Reset Link
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Remembered your password?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      )}
    </Card>
  )
}
