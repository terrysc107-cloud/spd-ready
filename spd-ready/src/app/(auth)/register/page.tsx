import Link from 'next/link'
import { MailIcon, CheckCircle2Icon } from 'lucide-react'
import { CardFooter } from '@/components/ui/card'
import { FormCard } from '@/components/ui/form-card'
import { Button } from '@/components/ui/button'

export default function RegisterPage() {
  return (
    <FormCard
      eyebrow="Get started"
      title="Request access"
      description="SPD Ready is set up per department. Tell us about your team and we'll get you started."
      footer={
        <CardFooter className="flex flex-col gap-4">
          <a
            href="mailto:hello@spdready.com?subject=SPD%20Ready%20demo%20request"
            className="block w-full"
          >
            <Button className="w-full gap-2">
              <MailIcon className="size-4" />
              Email us to get started
            </Button>
          </a>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:text-accent">
              Sign in
            </Link>
          </p>
        </CardFooter>
      }
    >
      <div className="rounded-lg bg-muted/40 p-4 text-sm leading-relaxed text-muted-foreground ring-1 ring-inset ring-foreground/5">
        We onboard your department, load your competency templates, and create accounts for your
        managers and technicians — your team, standardized and survey-ready.
      </div>
      <ul className="space-y-2">
        {[
          'Department onboarding + competency templates loaded',
          'Accounts for every manager and technician',
          'One verifiable record, survey-ready',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
            <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-accent" />
            {item}
          </li>
        ))}
      </ul>
    </FormCard>
  )
}
