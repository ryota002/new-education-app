'use server'

import { createClient } from '@/lib/supabase/server'
import { levelFromXP } from '@/lib/xp'

interface SubmitQuizResult {
  error?: string
  score?: number
  totalQuestions?: number
  xpEarned?: number
  newLevel?: number
  leveledUp?: boolean
}

export async function submitQuiz(
  courseId: string,
  selectedAnswers: number[]
): Promise<SubmitQuizResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  // Fetch quizzes with correct answers (server-side only)
  const { data: quizzes, error: quizError } = await supabase
    .from('quizzes')
    .select('id, correct_answer_index, xp_reward, course_id, courses(skill_id)')
    .eq('course_id', courseId)
    .order('order')

  if (quizError || !quizzes || quizzes.length === 0) {
    return { error: 'クイズが見つかりません' }
  }

  // Validate answers length
  if (selectedAnswers.length !== quizzes.length) {
    return { error: '回答数が一致しません' }
  }

  const quizIds = quizzes.map((quiz) => quiz.id)
  const { data: existingAttempts, error: attemptsError } = await supabase
    .from('quiz_attempts')
    .select('quiz_id, score')
    .eq('user_id', user.id)
    .in('quiz_id', quizIds)

  if (attemptsError) {
    return { error: attemptsError.message }
  }

  const previousScores = new Map(
    (existingAttempts ?? []).map((attempt) => [attempt.quiz_id, attempt.score])
  )

  // Calculate score. XP is awarded only for newly correct answers so retakes
  // are useful for practice without becoming an infinite XP source.
  let score = 0
  let xpEarned = 0
  for (let i = 0; i < quizzes.length; i++) {
    if (selectedAnswers[i] === quizzes[i].correct_answer_index) {
      score++
      if ((previousScores.get(quizzes[i].id) ?? 0) < 1) {
        xpEarned += quizzes[i].xp_reward
      }
    }
  }

  // Fetch current user XP/level
  const { data: profile } = await supabase
    .from('users')
    .select('xp, level')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'プロフィールが見つかりません' }

  const oldLevel = profile.level
  const newXP = profile.xp + xpEarned
  const newLevel = levelFromXP(newXP)
  const leveledUp = newLevel > oldLevel

  // Insert quiz attempts (one per quiz, ignore conflicts for retakes)
  const attemptInserts = quizzes.map((quiz, i) => ({
    user_id: user.id,
    quiz_id: quiz.id,
    score: selectedAnswers[i] === quiz.correct_answer_index ? 1 : 0,
    answers: [selectedAnswers[i]],
    completed_at: new Date().toISOString(),
  }))

  // Use upsert to allow retakes
  const { error: upsertError } = await supabase
    .from('quiz_attempts')
    .upsert(attemptInserts, { onConflict: 'user_id,quiz_id' })

  if (upsertError) {
    return { error: upsertError.message }
  }

  // Update user XP and level
  const { error: profileUpdateError } = await supabase
    .from('users')
    .update({ xp: newXP, level: newLevel })
    .eq('id', user.id)

  if (profileUpdateError) {
    return { error: profileUpdateError.message }
  }

  // Update skill score if course has a skill
  const firstQuiz = quizzes[0] as { courses: { skill_id: string | null } | null }
  const skillId = firstQuiz?.courses?.skill_id
  if (skillId && xpEarned > 0) {
    const newlyCorrectCount = quizzes.filter((quiz, i) => (
      selectedAnswers[i] === quiz.correct_answer_index &&
      (previousScores.get(quiz.id) ?? 0) < 1
    )).length
    const skillIncrement = Math.round((newlyCorrectCount / quizzes.length) * 10)
    const { data: existing } = await supabase
      .from('user_skills')
      .select('score')
      .eq('user_id', user.id)
      .eq('skill_id', skillId)
      .single()

    if (existing) {
      await supabase
        .from('user_skills')
        .update({ score: Math.min(existing.score + skillIncrement, 100) })
        .eq('user_id', user.id)
        .eq('skill_id', skillId)
    } else {
      await supabase
        .from('user_skills')
        .insert({ user_id: user.id, skill_id: skillId, score: Math.min(skillIncrement, 100) })
    }
  }

  return {
    score,
    totalQuestions: quizzes.length,
    xpEarned,
    newLevel,
    leveledUp,
  }
}
