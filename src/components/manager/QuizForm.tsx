'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface QuizFormProps {
  action: (formData: FormData) => Promise<{ error?: string } | void>
  defaultValues?: {
    question?: string
    options?: string[]
    correct_answer_index?: number
    xp_reward?: number
    order?: number
  }
  submitLabel?: string
}

export function QuizForm({ action, defaultValues, submitLabel = '保存する' }: QuizFormProps) {
  const [options, setOptions] = useState<string[]>(
    defaultValues?.options ?? ['', '', '', '']
  )
  const [correctIdx, setCorrectIdx] = useState(defaultValues?.correct_answer_index ?? 0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function addOption() {
    if (options.length < 6) setOptions([...options, ''])
  }

  function removeOption(idx: number) {
    if (options.length <= 2) return
    const next = options.filter((_, i) => i !== idx)
    setOptions(next)
    if (correctIdx >= next.length) setCorrectIdx(next.length - 1)
  }

  function updateOption(idx: number, value: string) {
    setOptions(options.map((o, i) => (i === idx ? value : o)))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    options.forEach((opt, i) => formData.set(`option_${i}`, opt))
    formData.set('correct_answer_index', String(correctIdx))
    const result = await action(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="question">問題文</Label>
        <Textarea id="question" name="question" required rows={3} defaultValue={defaultValues?.question} />
      </div>

      <div className="space-y-3">
        <Label>選択肢（正解をラジオボタンで選択）</Label>
        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="radio"
              name="correct_radio"
              checked={correctIdx === idx}
              onChange={() => setCorrectIdx(idx)}
              className="shrink-0"
            />
            <span className="text-sm font-medium text-slate-500 w-5">
              {String.fromCharCode(65 + idx)}.
            </span>
            <Input
              value={opt}
              onChange={(e) => updateOption(idx, e.target.value)}
              placeholder={`選択肢 ${String.fromCharCode(65 + idx)}`}
              required
              className="flex-1"
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(idx)}
                className="text-slate-400 hover:text-red-500 text-sm px-1"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        {options.length < 6 && (
          <Button type="button" variant="outline" size="sm" onClick={addOption}>
            + 選択肢を追加
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="xp_reward">XP報酬</Label>
          <Input id="xp_reward" name="xp_reward" type="number" min="1" defaultValue={defaultValues?.xp_reward ?? 10} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="order">表示順</Label>
          <Input id="order" name="order" type="number" min="0" defaultValue={defaultValues?.order ?? 0} />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? '保存中...' : submitLabel}
      </Button>
    </form>
  )
}
