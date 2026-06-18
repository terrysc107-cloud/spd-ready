import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/dal/auth'
import { getMindsetProfile } from '@/lib/dal/mindset'
import { selectBalancedSet } from '@/lib/dal/mindset-logic'
import { TRACK_QUESTIONS } from '@/lib/local-db/track-questions'
import { JudgmentBaseline } from '@/components/student/JudgmentBaseline'

// The judgment baseline / mindset assessment (co-equal with the readiness
// score). Draws a balanced set of the authored, judgment_type-tagged
// SPD_JUDGMENT scenarios so every mindset dimension is covered.
export default async function BaselinePage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const judgmentQuestions = TRACK_QUESTIONS.filter(q => q.domain === 'SPD_JUDGMENT')
  const set = selectBalancedSet(judgmentQuestions, 2)

  const existing = await getMindsetProfile(user.id)

  return (
    <div className="px-4">
      <JudgmentBaseline questions={set} isCheckin={!!existing} />
    </div>
  )
}
