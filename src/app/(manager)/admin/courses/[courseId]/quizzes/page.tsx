import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { deleteQuiz } from '@/actions/courses'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default async function QuizzesPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: course }, { data: quizzes }] = await Promise.all([
    supabase.from('courses').select('title').eq('id', courseId).single(),
    supabase.from('quizzes').select('*').eq('course_id', courseId).order('order'),
  ])

  if (!course) notFound()

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link href="/admin/courses" className="text-sm text-slate-400 hover:text-slate-600">
          ← コース管理
        </Link>
        <div className="flex items-center justify-between mt-2">
          <h2 className="text-2xl font-bold text-slate-900">{course.title} — クイズ管理</h2>
          <Link href={`/admin/courses/${courseId}/quizzes/new`}>
            <Button>+ クイズ追加</Button>
          </Link>
        </div>
      </div>

      {quizzes && quizzes.length > 0 ? (
        <div className="space-y-3">
          {quizzes.map((quiz, i) => (
            <Card key={quiz.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">
                      Q{i + 1}. {quiz.question}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {(quiz.options as string[]).length}択
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        +{quiz.xp_reward} XP
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/admin/courses/${courseId}/quizzes/${quiz.id}/edit`}>
                      <Button variant="outline" size="sm">編集</Button>
                    </Link>
                    <form action={deleteQuiz.bind(null, quiz.id, courseId)}>
                      <Button variant="destructive" size="sm" type="submit">削除</Button>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-slate-400 mb-4">クイズがまだありません</p>
            <Link href={`/admin/courses/${courseId}/quizzes/new`}>
              <Button>最初のクイズを追加する</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
