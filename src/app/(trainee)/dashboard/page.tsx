import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { XPBar } from '@/components/trainee/XPBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/login')

  // Recent quiz attempts with quiz and course info
  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('*, quizzes(question, course_id, courses(title))')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false })
    .limit(5)

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">おかえりなさい、{profile.name}さん</h2>
        <p className="text-slate-500 mt-1">今日も学習を続けましょう！</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">現在のレベル</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 mb-4">
            <p className="text-4xl font-bold text-indigo-600">Lv.{profile.level}</p>
            <p className="text-sm text-slate-500">累計 {profile.xp} XP</p>
          </div>
          <XPBar level={profile.level} xp={profile.xp} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">最近の学習履歴</CardTitle>
        </CardHeader>
        <CardContent>
          {attempts && attempts.length > 0 ? (
            <ul className="space-y-3">
              {attempts.map((attempt) => {
                const quiz = attempt.quizzes as { question: string; course_id: string; courses: { title: string } | null } | null
                return (
                  <li key={attempt.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-slate-800 line-clamp-1">
                        {quiz?.courses?.title ?? 'コース'}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {new Date(attempt.completed_at).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      スコア {attempt.score}
                    </Badge>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-slate-400 text-sm">まだクイズに挑戦していません。コースを始めてみましょう！</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
