'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createCourse(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const { error } = await supabase.from('courses').insert({
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    youtube_url: formData.get('youtube_url') as string,
    skill_id: (formData.get('skill_id') as string) || null,
    required_level: parseInt(formData.get('required_level') as string) || 1,
    order: parseInt(formData.get('order') as string) || 0,
  })

  if (error) return { error: error.message }
  redirect('/admin/courses')
}

export async function updateCourse(courseId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const { error } = await supabase.from('courses').update({
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    youtube_url: formData.get('youtube_url') as string,
    skill_id: (formData.get('skill_id') as string) || null,
    required_level: parseInt(formData.get('required_level') as string) || 1,
    order: parseInt(formData.get('order') as string) || 0,
  }).eq('id', courseId)

  if (error) return { error: error.message }
  redirect('/admin/courses')
}

export async function deleteCourse(courseId: string) {
  const supabase = await createClient()
  await supabase.from('courses').delete().eq('id', courseId)
  redirect('/admin/courses')
}

export async function createQuiz(courseId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const options: string[] = []
  let i = 0
  while (formData.get(`option_${i}`) !== null) {
    options.push(formData.get(`option_${i}`) as string)
    i++
  }

  const { error } = await supabase.from('quizzes').insert({
    course_id: courseId,
    question: formData.get('question') as string,
    options,
    correct_answer_index: parseInt(formData.get('correct_answer_index') as string),
    xp_reward: parseInt(formData.get('xp_reward') as string) || 10,
    order: parseInt(formData.get('order') as string) || 0,
  })

  if (error) return { error: error.message }
  redirect(`/admin/courses/${courseId}/quizzes`)
}

export async function updateQuiz(quizId: string, courseId: string, formData: FormData) {
  const supabase = await createClient()

  const options: string[] = []
  let i = 0
  while (formData.get(`option_${i}`) !== null) {
    options.push(formData.get(`option_${i}`) as string)
    i++
  }

  const { error } = await supabase.from('quizzes').update({
    question: formData.get('question') as string,
    options,
    correct_answer_index: parseInt(formData.get('correct_answer_index') as string),
    xp_reward: parseInt(formData.get('xp_reward') as string) || 10,
    order: parseInt(formData.get('order') as string) || 0,
  }).eq('id', quizId)

  if (error) return { error: error.message }
  redirect(`/admin/courses/${courseId}/quizzes`)
}

export async function deleteQuiz(quizId: string, courseId: string) {
  const supabase = await createClient()
  await supabase.from('quizzes').delete().eq('id', quizId)
  redirect(`/admin/courses/${courseId}/quizzes`)
}
