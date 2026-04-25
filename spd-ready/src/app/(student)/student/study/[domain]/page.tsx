import { redirect, notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/dal/auth'
import { DOMAIN_META, TRACK_QUESTIONS, type TrackDomain, getLearningDomain } from '@/lib/local-db/track-questions'
import { HLD_QUESTIONS } from '@/lib/local-db/hld-questions'
import { StudyQuiz } from '@/components/student/StudyQuiz'

const VALID_DOMAINS = [...Object.keys(DOMAIN_META), 'HIGH_LEVEL_DISINFECTION'] as string[]

export default async function StudyDomainPage({
  params,
}: {
  params: Promise<{ domain: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const { domain } = await params
  const domainKey = domain.toUpperCase()
  if (!VALID_DOMAINS.includes(domainKey)) notFound()

  const allQuestions = domainKey === 'HIGH_LEVEL_DISINFECTION'
    ? HLD_QUESTIONS
    : [
        ...TRACK_QUESTIONS.filter(q => q.domain === domainKey),
        ...TRACK_QUESTIONS.filter(q => getLearningDomain(q) === 'high_level_disinfection' && q.domain !== domainKey),
      ]

  // Suppress unused import warning — getLearningDomain used in allQuestions filter above
  void getLearningDomain

  // Shuffle for variety (server-side, consistent per render)
  const sessionSize = domainKey === 'SPD_JUDGMENT' ? 15 : 10
  const questions = [...allQuestions].sort(() => Math.random() - 0.5).slice(0, sessionSize)

  const domainLabel = DOMAIN_META[domainKey as TrackDomain]?.label ?? 'High-Level Disinfection'

  return (
    <StudyQuiz
      domain={domainKey as TrackDomain}
      domainLabel={domainLabel}
      questions={questions}
    />
  )
}
