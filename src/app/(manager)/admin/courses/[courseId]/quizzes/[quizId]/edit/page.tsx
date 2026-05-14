import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { QuizForm } from '@/components/manager/QuizForm'
import { updateQuiz } from '@/actions/courses'
import Link from 'next/link'

export default async function EditQuizPage({
  params,
}: {
  params: Promise<{ courseId: string; quizId: string }>
}) {
  const { courseId, quizId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: quiz } = await supabase.from('quizzes').select('*').eq('id', quizId).single()
  if (!quiz) notFound()

  const action = updateQuiz.bind(null, quizId, courseId)

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link href={`/admin/courses/${courseId}/quizzes`} className="text-sm text-slate-400 hover:text-slate-600">
          ← クイズ管理
        </Link>
        <h2 className="text-2xl font-bold text-slate-900 mt-2">クイズ編集</h2>
      </div>
      <QuizForm
        action={action}
        defaultValues={{
          question: quiz.question,
          options: quiz.options as string[],
          correct_answer_index: quiz.correct_answer_index,
          xp_reward: quiz.xp_reward,
          order: quiz.order,
        }}
        submitLabel="変更を保存する"
      />
    </div>
  )
}
