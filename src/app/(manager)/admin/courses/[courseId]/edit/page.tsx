import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { CourseForm } from '@/components/manager/CourseForm'
import { updateCourse } from '@/actions/courses'
import Link from 'next/link'

export default async function EditCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: course }, { data: skills }] = await Promise.all([
    supabase.from('courses').select('*').eq('id', courseId).single(),
    supabase.from('skills').select('*').order('name'),
  ])

  if (!course) notFound()

  const action = updateCourse.bind(null, courseId)

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link href="/admin/courses" className="text-sm text-slate-400 hover:text-slate-600">
          ← コース管理
        </Link>
        <h2 className="text-2xl font-bold text-slate-900 mt-2">コース編集</h2>
      </div>
      <CourseForm
        action={action}
        skills={skills ?? []}
        defaultValues={{
          title: course.title,
          description: course.description ?? '',
          youtube_url: course.youtube_url,
          skill_id: course.skill_id,
          required_level: course.required_level,
          order: course.order,
        }}
        submitLabel="変更を保存する"
      />
    </div>
  )
}
