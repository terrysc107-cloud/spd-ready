import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/dal/auth'
import { getMindsetProfile } from '@/lib/dal/mindset'
import { selectBalancedSet } from '@/lib/dal/mindset-logic'
import { getStudyQuestionsForDomain } from '@/lib/dal/questions'
import { TRACK_QUESTIONS } from '@/lib/local-db/track-questions'
import { JudgmentBaseline } from '@/components/student/JudgmentBaseline'

// The judgment baseline / mindset assessment (co-equal with the readiness
// score). Draws a balanced set of the active, judgment_type-tagged
// SPD_JUDGMENT scenarios from the DB bank (now incl. the promoted generated
// batch) so every mindset dimension is covered; falls back to the static
// bank if the DB read is empty.
export default async function BaselinePage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const dbJudgment = (await getStudyQuestionsForDomain('SPD_JUDGMENT')).filter(q => q.judgment_type)
  const judgmentQuestions = dbJudgment.length > 0
    ? dbJudgment
    : TRACK_QUESTIONS.filter(q => q.domain === 'SPD_JUDGMENT')
  const set = selectBalancedSet(judgmentQuestions, 2)

  const existing = await getMindsetProfile(user.id)

  return (
    <div className="px-4">
      <JudgmentBaseline questions={set} isCheckin={!!existing} />
    </div>
  )
}
