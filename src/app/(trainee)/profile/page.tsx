import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SkillRadarChart } from '@/components/trainee/SkillRadarChart'
import { XPBar } from '@/components/trainee/XPBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: userSkills }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase
      .from('user_skills')
      .select('score, skills(name)')
      .eq('user_id', user.id),
  ])

  if (!profile) redirect('/auth/login')

  const allSkills = ['ヒアリング力', '提案力', 'クロージング力', 'コミュニケーション力', '課題発見力']
  const skillScoreMap = new Map(
    (userSkills ?? []).map((us) => {
      const s = us.skills as { name: string } | null
      return [s?.name ?? '', us.score]
    })
  )

  const radarData = allSkills.map((name) => ({
    skill: name,
    score: skillScoreMap.get(name) ?? 0,
  }))

  const initials = profile.name.slice(0, 2).toUpperCase()

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">プロフィール</h2>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-indigo-100 text-indigo-700 text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-semibold text-slate-900">{profile.name}</p>
              <p className="text-sm text-slate-400">{profile.email}</p>
            </div>
          </div>
          <XPBar level={profile.level} xp={profile.xp} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">スキルレーダー</CardTitle>
        </CardHeader>
        <CardContent>
          <SkillRadarChart data={radarData} />
          <div className="mt-4 grid grid-cols-2 gap-2">
            {radarData.map((d) => (
              <div key={d.skill} className="flex items-center justify-between text-sm bg-slate-50 rounded-lg px-3 py-2">
                <span className="text-slate-600">{d.skill}</span>
                <span className="font-semibold text-indigo-600">{d.score}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-indigo-600">{profile.level}</p>
              <p className="text-xs text-slate-400 mt-1">レベル</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-600">{profile.xp}</p>
              <p className="text-xs text-slate-400 mt-1">累計XP</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-600">
                {new Date(profile.created_at).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
              </p>
              <p className="text-xs text-slate-400 mt-1">参加日</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
