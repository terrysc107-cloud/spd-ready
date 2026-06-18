import { redirect } from 'next/navigation'
import Link from 'next/link'
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
    <div className="py-8 max-w-4xl mx-auto space-y-8">
      <Link href="/student/learning" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <span>←</span><span>Learning</span>
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Learning Modules</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Best-practice lessons that establish the one standard for every tech — read, watch, and answer the check.
        </p>
      </div>

      {modules.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border p-10 text-center text-muted-foreground">
          No modules published yet.
        </div>
      ) : (
        LEARNING_DOMAINS.map((domain) => {
          const inDomain = modules.filter((m) => m.domain === domain)
          if (inDomain.length === 0) return null
          const meta = LEARNING_DOMAIN_META[domain]
          return (
            <section key={domain} className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <span>{meta.icon}</span> {meta.label}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {inDomain.map((m) => {
                  const done = completedIds.has(m.id)
                  return (
                    <Link
                      key={m.id}
                      href={`/student/learning/module/${m.slug}`}
                      className="rounded-xl border-2 border-border bg-card p-4 hover:shadow-md hover:border-primary/40 transition-all block"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm leading-snug">{m.title}</p>
                        {done && <span className="shrink-0 text-xs text-[oklch(0.45_0.18_150)]">✓ Done</span>}
                      </div>
                      {m.summary && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{m.summary}</p>}
                      <p className="text-[11px] text-muted-foreground mt-2 capitalize">
                        {m.difficulty}{m.estimated_minutes != null ? ` · ~${m.estimated_minutes} min` : ''}
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
