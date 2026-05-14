import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { deleteCourse } from '@/actions/courses'
import Link from 'next/link'

export default async function AdminCoursesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: courses } = await supabase
    .from('courses')
    .select('*, skills(name)')
    .order('order')

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">コース管理</h2>
        <Link href="/admin/courses/new">
          <Button>+ 新規コース作成</Button>
        </Link>
      </div>

      {courses && courses.length > 0 ? (
        <div className="space-y-3">
          {courses.map((course) => {
            const skill = course.skills as { name: string } | null
            return (
              <Card key={course.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-slate-800">{course.title}</span>
                        <Badge variant="outline" className="text-xs">Lv.{course.required_level}〜</Badge>
                        {skill && <Badge variant="secondary" className="text-xs">{skill.name}</Badge>}
                      </div>
                      {course.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{course.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/admin/courses/${course.id}/quizzes`}>
                        <Button variant="outline" size="sm">クイズ管理</Button>
                      </Link>
                      <Link href={`/admin/courses/${course.id}/edit`}>
                        <Button variant="outline" size="sm">編集</Button>
                      </Link>
                      <form action={deleteCourse.bind(null, course.id)}>
                        <Button variant="destructive" size="sm" type="submit">削除</Button>
                      </form>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-slate-400 mb-4">コースがまだありません</p>
            <Link href="/admin/courses/new">
              <Button>最初のコースを作成する</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
