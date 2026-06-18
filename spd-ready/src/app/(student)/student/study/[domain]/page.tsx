import { redirect, notFound } from 'next/navigation'
import { getAuthUser } from '@/lib/dal/auth'
import { DOMAIN_META, type TrackDomain } from '@/lib/local-db/track-questions'
import { getStudyQuestionsForDomain, HLD_PSEUDO_DOMAIN } from '@/lib/dal/questions'
import { StudyQuiz } from '@/components/student/StudyQuiz'

const VALID_DOMAINS = [...Object.keys(DOMAIN_META), HLD_PSEUDO_DOMAIN] as string[]

export default async function StudyDomainPage({
  params,
}: {
  params: Promise<{ domain: string }>
}) {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const { domain } = await params
  const domainKey = domain.toUpperCase()
  if (!VALID_DOMAINS.includes(domainKey)) notFound()

  const allQuestions = await getStudyQuestionsForDomain(domainKey)

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
