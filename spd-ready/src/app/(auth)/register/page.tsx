import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Request access</CardTitle>
        <CardDescription>
          SPD Ready is set up per department. Tell us about your team and we&apos;ll get you started.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground leading-relaxed">
          We onboard your department, load your competency templates, and create accounts for your
          managers and technicians. Reach out and we&apos;ll have your team standardized and survey-ready.
        </div>

        <a href="mailto:hello@spdready.com?subject=SPD%20Ready%20demo%20request" className="block">
          <Button className="w-full">Email us to get started</Button>
        </a>
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
