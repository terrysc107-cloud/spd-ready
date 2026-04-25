import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { signUpAction } from '@/actions/auth'

// Next.js 16: searchParams is a Promise — must be awaited
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; error?: string }>
}) {
  const params = await searchParams

  // Pre-select role from query param (set by landing page CTAs: ?role=student or ?role=hospital)
  const preselectedRole = params.role === 'hospital' ? 'hospital' : 'student'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>
          Join SPD Ready as a student or hospital site.
        </CardDescription>
      </CardHeader>

      <form action={signUpAction}>
        <CardContent className="space-y-4">
          {params.error && (
            <p className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
              Registration failed: {params.error}
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

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
            />
            <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
          </div>

          <div className="space-y-2">
            <Label>I am a</Label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex cursor-pointer items-center justify-center rounded-md border-2 px-4 py-3 text-sm font-medium transition-colors ${
                  preselectedRole === 'student'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="student"
                  defaultChecked={preselectedRole === 'student'}
                  className="sr-only"
                  required
                />
                Student
              </label>
              <label
                className={`flex cursor-pointer items-center justify-center rounded-md border-2 px-4 py-3 text-sm font-medium transition-colors ${
                  preselectedRole === 'hospital'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="hospital"
                  defaultChecked={preselectedRole === 'hospital'}
                  className="sr-only"
                  required
                />
                Hospital / Site
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              Choose carefully — your role determines what you can access.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full">
            Create Account
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
