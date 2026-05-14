import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CourseCard } from '@/components/trainee/CourseCard'

export default async function CoursesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: courses }, { data: attempts }] = await Promise.all([
    supabase.from('users').select('level').eq('id', user.id).single(),
    supabase.from('courses').select('*').order('order'),
    supabase.from('quiz_attempts').select('quiz_id, quizzes(course_id)').eq('user_id', user.id),
  ])

  const completedCourseIds = new Set(
    (attempts ?? []).map((a) => {
      const q = a.quizzes as { course_id: string } | null
      return q?.course_id
    }).filter(Boolean)
  )

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">コース一覧</h2>
        <p className="text-slate-500 mt-1">動画を視聴してクイズに挑戦しましょう</p>
      </div>
      {courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              userLevel={profile?.level ?? 1}
              completed={completedCourseIds.has(course.id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-slate-400">コースがまだ登録されていません。管理者にお問い合わせください。</p>
      )}
    </div>
  )
}
