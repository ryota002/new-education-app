import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { XPBar } from '@/components/trainee/XPBar'
import { SkillRadarChart } from '@/components/trainee/SkillRadarChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'

export default async function UserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: userSkills }, { data: attempts }] = await Promise.all([
    supabase.from('users').select('*').eq('id', userId).single(),
    supabase.from('user_skills').select('score, skills(name)').eq('user_id', userId),
    supabase
      .from('quiz_attempts')
      .select('*, quizzes(question, xp_reward, courses(title))')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false }),
  ])

  if (!profile || profile.role !== 'trainee') notFound()

  const allSkills = ['ヒアリング力', '提案力', 'クロージング力', 'コミュニケーション力', '課題発見力']
  const skillScoreMap = new Map(
    (userSkills ?? []).map((us) => {
      const s = us.skills as { name: string } | null
      return [s?.name ?? '', us.score]
    })
  )
  const radarData = allSkills.map((name) => ({ skill: name, score: skillScoreMap.get(name) ?? 0 }))

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin" className="text-sm text-slate-400 hover:text-slate-600">
        ← 管理ダッシュボード
      </Link>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-indigo-100 text-indigo-700 text-lg font-bold">
                {profile.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-semibold">{profile.name}</p>
              <p className="text-sm text-slate-400">{profile.email}</p>
            </div>
          </div>
          <XPBar level={profile.level} xp={profile.xp} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">スキルレーダー</CardTitle></CardHeader>
        <CardContent>
          <SkillRadarChart data={radarData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">クイズ履歴</CardTitle></CardHeader>
        <CardContent>
          {attempts && attempts.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-slate-500 text-left">
                  <th className="pb-2 font-medium">コース</th>
                  <th className="pb-2 font-medium">スコア</th>
                  <th className="pb-2 font-medium">日時</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {attempts.map((a) => {
                  const q = a.quizzes as { question: string; xp_reward: number; courses: { title: string } | null } | null
                  return (
                    <tr key={a.id}>
                      <td className="py-2 text-slate-700">{q?.courses?.title ?? '-'}</td>
                      <td className="py-2">
                        <Badge variant="secondary">{a.score}点</Badge>
                      </td>
                      <td className="py-2 text-slate-400 text-xs">
                        {new Date(a.completed_at).toLocaleDateString('ja-JP')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-slate-400 text-sm">まだクイズ履歴がありません。</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
