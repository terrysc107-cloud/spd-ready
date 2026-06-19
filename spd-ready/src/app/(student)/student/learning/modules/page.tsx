import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon, CheckCircle2Icon } from 'lucide-react'
import { getAuthUser } from '@/lib/dal/auth'
import { getActiveModules, getModuleCompletions } from '@/lib/dal/learning-modules'
import { LEARNING_DOMAIN_META, LEARNING_DOMAINS } from '@/lib/local-db/types'

export default async function ModulesIndexPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const [modules, completions] = await Promise.all([
    getActiveModules(),
    getModuleCompletions(user.id),
  ])
  const completedIds = new Set(completions.filter((c) => c.completed_at !== null).map((c) => c.module_id))

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div className="space-y-4">
        <Link
          href="/student/learning"
          className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Learning</span>
        </Link>

        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Learning modules</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Best-practice lessons that establish the one standard for every tech — read, watch, and
            answer the check.
          </p>
        </div>
      </div>

      {modules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/60 px-6 py-12 text-center text-sm text-muted-foreground">
          No modules published yet.
        </div>
      ) : (
        LEARNING_DOMAINS.map((domain) => {
          const inDomain = modules.filter((m) => m.domain === domain)
          if (inDomain.length === 0) return null
          const meta = LEARNING_DOMAIN_META[domain]
          return (
            <section key={domain} className="space-y-3">
              <h2 className="flex items-center gap-2 font-heading text-sm font-semibold tracking-tight">
                <span className="flex size-7 items-center justify-center rounded-lg bg-muted text-base">
                  {meta.icon}
                </span>
                {meta.label}
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {inDomain.map((m) => {
                  const done = completedIds.has(m.id)
                  return (
                    <Link
                      key={m.id}
                      href={`/student/learning/module/${m.slug}`}
                      className="group block rounded-xl bg-card p-4 shadow-card ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:shadow-card-hover hover:ring-accent/30"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold leading-snug">{m.title}</p>
                        {done && (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[oklch(0.96_0.04_150)] px-2 py-0.5 text-[11px] font-medium text-[oklch(0.45_0.18_150)]">
                            <CheckCircle2Icon className="size-3" /> Done
                          </span>
                        )}
                      </div>
                      {m.summary && (
                        <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{m.summary}</p>
                      )}
                      <p className="mt-3 text-[11px] font-medium capitalize text-muted-foreground">
                        {m.difficulty}
                        {m.estimated_minutes != null ? ` · ~${m.estimated_minutes} min` : ''}
                      </p>
                    </Link>
                  )
                })}
              </div>
            </section>
          )
        })
      )}
    </div>
  )
}
