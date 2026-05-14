import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { QuizEngine } from '@/components/trainee/QuizEngine'
import Link from 'next/link'

export default async function QuizPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: course } = await supabase
    .from('courses')
    .select('title, required_level')
    .eq('id', courseId)
    .single()

  if (!course) notFound()

  const { data: profile } = await supabase
    .from('users')
    .select('level')
    .eq('id', user.id)
    .single()

  if ((profile?.level ?? 1) < course.required_level) redirect('/courses')

  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('id, question, options, order')
    .eq('course_id', courseId)
    .order('order')

  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="max-w-2xl">
        <p className="text-slate-400">このコースのクイズはまだ準備中です。</p>
      </div>
    )
  }

  const formattedQuizzes = quizzes.map((q) => ({
    id: q.id,
    question: q.question,
    options: q.options as string[],
    order: q.order,
  }))

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-2">
        <Link href={`/courses/${courseId}`} className="text-sm text-slate-400 hover:text-slate-600">
          ← コース詳細に戻る
        </Link>
      </div>
      <h2 className="text-xl font-bold text-slate-900">{course.title} — 理解度チェック</h2>
      <QuizEngine courseId={courseId} quizzes={formattedQuizzes} />
    </div>
  )
}
