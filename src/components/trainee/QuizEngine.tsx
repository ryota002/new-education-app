'use client'

import { useState } from 'react'
import { submitQuiz } from '@/actions/quiz'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import confetti from 'canvas-confetti'

interface Quiz {
  id: string
  question: string
  options: string[]
  order: number
}

interface QuizEngineProps {
  courseId: string
  quizzes: Quiz[]
}

type Phase = 'question' | 'submitting' | 'result'

interface Result {
  score: number
  totalQuestions: number
  xpEarned: number
  newLevel: number
  leveledUp: boolean
}

export function QuizEngine({ courseId, quizzes }: QuizEngineProps) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [phase, setPhase] = useState<Phase>('question')
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<string | null>(null)

  const quiz = quizzes[current]
  const progress = ((current) / quizzes.length) * 100

  function handleSelect(idx: number) {
    if (phase !== 'question') return
    setSelected(idx)
  }

  function handleNext() {
    if (selected === null) return
    const newAnswers = [...answers, selected]
    setAnswers(newAnswers)
    setSelected(null)

    if (current + 1 < quizzes.length) {
      setCurrent(current + 1)
    } else {
      handleSubmit(newAnswers)
    }
  }

  async function handleSubmit(finalAnswers: number[]) {
    setPhase('submitting')
    const res = await submitQuiz(courseId, finalAnswers)
    if (res.error) {
      setError(res.error)
      setPhase('question')
      return
    }
    setResult({
      score: res.score!,
      totalQuestions: res.totalQuestions!,
      xpEarned: res.xpEarned!,
      newLevel: res.newLevel!,
      leveledUp: res.leveledUp!,
    })
    setPhase('result')
    if (res.leveledUp) {
      setTimeout(() => {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
      }, 300)
    }
  }

  if (phase === 'submitting') {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500">採点中...</p>
      </div>
    )
  }

  if (phase === 'result' && result) {
    const percent = Math.round((result.score / result.totalQuestions) * 100)
    return (
      <div className="space-y-6 text-center py-8">
        <div>
          <p className="text-5xl font-bold text-indigo-600">{percent}%</p>
          <p className="text-slate-500 mt-2">
            {result.totalQuestions}問中 {result.score}問正解
          </p>
        </div>
        <div className="bg-indigo-50 rounded-xl p-4 inline-block">
          <p className="text-indigo-700 font-semibold">+{result.xpEarned} XP 獲得！</p>
        </div>
        {result.leveledUp && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-yellow-700 font-bold text-lg">🎉 レベルアップ！</p>
            <p className="text-yellow-600">Lv.{result.newLevel} になりました</p>
          </div>
        )}
        <Button onClick={() => window.location.href = '/courses'}>
          コース一覧に戻る
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-slate-500">
          <span>問題 {current + 1} / {quizzes.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-6">
        <p className="text-lg font-semibold text-slate-900 leading-relaxed">{quiz.question}</p>

        <div className="space-y-3">
          {quiz.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={cn(
                'w-full text-left px-4 py-3 rounded-lg border-2 transition-colors text-sm',
                selected === idx
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              )}
            >
              <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span>
              {option}
            </button>
          ))}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button
          onClick={handleNext}
          disabled={selected === null}
          className="w-full"
        >
          {current + 1 === quizzes.length ? '回答を送信する' : '次の問題へ'}
        </Button>
      </div>
    </div>
  )
}
