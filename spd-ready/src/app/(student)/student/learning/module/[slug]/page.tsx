import { redirect, notFound } from 'next/navigation'
import { getAuthUser } from '@/lib/dal/auth'
import { getModuleBySlug } from '@/lib/dal/learning-modules'
import { getStudyQuestionsByIds } from '@/lib/dal/questions'
import { isModuleRequiredForStaff } from '@/lib/dal/audits'
import { ModuleViewer } from '@/components/student/ModuleViewer'

export default async function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await getAuthUser()
  if (!user) redirect('/login')
  const { slug } = await params

  const module = await getModuleBySlug(slug)
  if (!module || module.status !== 'active') notFound()

  const [questions, isRequired] = await Promise.all([
    getStudyQuestionsByIds(module.check_question_ids),
    isModuleRequiredForStaff(user.id, module.id),
  ])

  return (
    <div className="px-4">
      <ModuleViewer module={module} questions={questions} isRequired={isRequired} />
    </div>
  )
}
