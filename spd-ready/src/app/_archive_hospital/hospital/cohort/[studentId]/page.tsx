import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/dal/auth'
import { getHospitalProfile } from '@/lib/dal/hospital'
import { getCohortMemberDetail } from '@/lib/dal/cohort'
import { Badge } from '@/components/ui/badge'
import { KnowledgeConfidenceDelta } from '@/components/student/KnowledgeConfidenceDelta'
import { AssignModuleForm } from '@/components/hospital/AssignModuleForm'
import { LEARNING_DOMAIN_META } from '@/lib/local-db/types'

export default async function CohortMemberPage({
  params,
}: {
  params: Promise<{ studentId: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const profile = await getHospitalProfile()
  if (!profile?.profile_complete) redirect('/hospital/onboarding')

  const { studentId } = await params
  const detail = await getCohortMemberDetail(studentId)
  if (!detail) notFound()

  return (
    <div className="py-8 max-w-4xl mx-auto space-y-6">
      <Link href="/hospital/cohort" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <span>←</span><span>Cohort</span>
      </Link>

      <div className="rounded-2xl border-2 border-border bg-card p-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{detail.first_name} {detail.last_name}</h1>
          <p className="text-sm text-muted-foreground">{detail.email}</p>
        </div>
        {detail.tier ? (
          <Badge className="text-base px-3 py-1">Tier {detail.tier}</Badge>
        ) : (
          <Badge variant="secondary">No assessment</Badge>
        )}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Domain breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {detail.domain_breakdown.map(d => (
            <div key={d.domain} className="rounded-xl border-2 border-border bg-card p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{d.icon}</span>
                  <p className="font-semibold text-sm">{d.label}</p>
                </div>
                <span className="text-sm font-bold tabular-nums">{d.avg_mastery}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${d.avg_mastery}%` }} />
              </div>
              <KnowledgeConfidenceDelta knowledgeDelta={d.knowledge_delta_pp} confidenceDelta={d.confidence_delta_pp} />
              {d.knowledge_t0_pct !== null && (
                <p className="text-xs text-muted-foreground">
                  Knowledge {d.knowledge_t0_pct}% → {d.knowledge_current_pct}% · Confidence {d.confidence_t0_pct}% → {d.confidence_current_pct}%
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AssignModuleForm studentUserId={detail.student_user_id} />

        <div className="rounded-xl border-2 border-border bg-card p-5 space-y-3">
          <h3 className="font-semibold">Assignment history ({detail.assignments.length})</h3>
          {detail.assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No modules assigned yet.</p>
          ) : (
            <ul className="divide-y">
              {detail.assignments.map(a => (
                <li key={a.id} className="py-2">
                  <p className="text-sm font-medium">{LEARNING_DOMAIN_META[a.domain].label}</p>
                  {a.note && <p className="text-xs text-muted-foreground italic">&quot;{a.note}&quot;</p>}
                  <p className="text-xs text-muted-foreground">
                    Assigned {new Date(a.assigned_at).toLocaleDateString()}
                    {a.completed_at
                      ? ` · Completed ${new Date(a.completed_at).toLocaleDateString()}`
                      : a.due_date
                      ? ` · Due ${new Date(a.due_date).toLocaleDateString()}`
                      : ''}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
