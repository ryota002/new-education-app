import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { QuizForm } from '@/components/manager/QuizForm'
import { createQuiz } from '@/actions/courses'
import Link from 'next/link'

export default async function NewQuizPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: course } = await supabase.from('courses').select('title').eq('id', courseId).single()
  if (!course) notFound()

  const action = createQuiz.bind(null, courseId)

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link href={`/admin/courses/${courseId}/quizzes`} className="text-sm text-slate-400 hover:text-slate-600">
          ← クイズ管理
        </Link>
        <h2 className="text-2xl font-bold text-slate-900 mt-2">クイズ追加</h2>
        <p className="text-slate-500 text-sm">{course.title}</p>
      </div>
      <QuizForm action={action} submitLabel="クイズを追加する" />
    </div>
  )
}
