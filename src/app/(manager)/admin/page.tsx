import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: trainees } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'trainee')
    .order('level', { ascending: false })

  const avgLevel = trainees && trainees.length > 0
    ? Math.round(trainees.reduce((sum, t) => sum + t.level, 0) / trainees.length * 10) / 10
    : 0

  const highLevel = (trainees ?? []).filter((t) => t.level >= 5).length

  return (
    <div className="max-w-5xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">管理ダッシュボード</h2>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-indigo-600">{trainees?.length ?? 0}</p>
            <p className="text-sm text-slate-400 mt-1">登録新人数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-indigo-600">{avgLevel}</p>
            <p className="text-sm text-slate-400 mt-1">平均レベル</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-indigo-600">{highLevel}</p>
            <p className="text-sm text-slate-400 mt-1">Lv.5以上の人数</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">新人一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {trainees && trainees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-slate-500 text-left">
                    <th className="pb-3 font-medium">名前</th>
                    <th className="pb-3 font-medium">レベル</th>
                    <th className="pb-3 font-medium">累計XP</th>
                    <th className="pb-3 font-medium">登録日</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {trainees.map((trainee) => (
                    <tr key={trainee.id} className="hover:bg-slate-50">
                      <td className="py-3">
                        <div>
                          <p className="font-medium text-slate-800">{trainee.name}</p>
                          <p className="text-xs text-slate-400">{trainee.email}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge className="bg-indigo-600 hover:bg-indigo-600">Lv.{trainee.level}</Badge>
                      </td>
                      <td className="py-3 text-slate-600">{trainee.xp} XP</td>
                      <td className="py-3 text-slate-400 text-xs">
                        {new Date(trainee.created_at).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="py-3">
                        <Link
                          href={`/admin/users/${trainee.id}`}
                          className="text-indigo-600 hover:underline text-xs"
                        >
                          詳細 →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-400 text-sm">まだ新人が登録されていません。</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
