import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CourseForm } from '@/components/manager/CourseForm'
import { createCourse } from '@/actions/courses'
import Link from 'next/link'

export default async function NewCoursePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: skills } = await supabase.from('skills').select('*').order('name')

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link href="/admin/courses" className="text-sm text-slate-400 hover:text-slate-600">
          ← コース管理
        </Link>
        <h2 className="text-2xl font-bold text-slate-900 mt-2">新規コース作成</h2>
      </div>
      <CourseForm action={createCourse} skills={skills ?? []} submitLabel="コースを作成する" />
    </div>
  )
}
