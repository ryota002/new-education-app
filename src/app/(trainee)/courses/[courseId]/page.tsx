import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { YouTubeEmbed } from '@/components/trainee/YouTubeEmbed'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: course }] = await Promise.all([
    supabase.from('users').select('level').eq('id', user.id).single(),
    supabase.from('courses').select('*, skills(name)').eq('id', courseId).single(),
  ])

  if (!course) notFound()
  if ((profile?.level ?? 1) < course.required_level) redirect('/courses')

  // Check if user has attempted any quiz for this course
  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('id')
    .eq('course_id', courseId)

  const quizIds = (quizzes ?? []).map((q) => q.id)
  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('id')
    .eq('user_id', user.id)
    .in('quiz_id', quizIds.length > 0 ? quizIds : ['none'])
    .limit(1)

  const hasCompleted = (attempts ?? []).length > 0
  const hasQuizzes = quizIds.length > 0

  const skill = course.skills as { name: string } | null

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/courses" className="text-sm text-slate-400 hover:text-slate-600">
          ← コース一覧
        </Link>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-2xl font-bold text-slate-900">{course.title}</h2>
          {skill && <Badge variant="outline">{skill.name}</Badge>}
          {hasCompleted && <Badge className="bg-green-500 hover:bg-green-500">完了済み</Badge>}
        </div>
        {course.description && (
          <p className="text-slate-500">{course.description}</p>
        )}
      </div>

      <YouTubeEmbed url={course.youtube_url} title={course.title} />

      {hasQuizzes ? (
        <div className="bg-white rounded-xl border p-6 flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-800">理解度チェック</p>
            <p className="text-sm text-slate-500">
              {hasCompleted ? 'クイズに再挑戦して復習しましょう' : '動画を見終わったらクイズに挑戦しよう'}
            </p>
          </div>
          <Link href={`/courses/${courseId}/quiz`}>
            <Button variant={hasCompleted ? 'outline' : 'default'}>
              {hasCompleted ? 'もう一度挑戦' : 'クイズに挑戦する'}
            </Button>
          </Link>
        </div>
      ) : (
        <p className="text-slate-400 text-sm">このコースのクイズはまだ準備中です。</p>
      )}
    </div>
  )
}
