'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Skill {
  id: string
  name: string
}

interface CourseFormProps {
  action: (formData: FormData) => Promise<{ error?: string } | void>
  skills: Skill[]
  defaultValues?: {
    title?: string
    description?: string
    youtube_url?: string
    skill_id?: string | null
    required_level?: number
    order?: number
  }
  submitLabel?: string
}

export function CourseForm({ action, skills, defaultValues, submitLabel = '保存する' }: CourseFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<string>(defaultValues?.skill_id ?? '')
  const [selectedLevel, setSelectedLevel] = useState<string>(String(defaultValues?.required_level ?? 1))

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('skill_id', selectedSkill)
    formData.set('required_level', selectedLevel)
    const result = await action(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="title">コースタイトル</Label>
        <Input id="title" name="title" required defaultValue={defaultValues?.title} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">説明（任意）</Label>
        <Textarea id="description" name="description" rows={3} defaultValue={defaultValues?.description ?? ''} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="youtube_url">YouTube URL</Label>
        <Input id="youtube_url" name="youtube_url" type="url" required placeholder="https://www.youtube.com/watch?v=..." defaultValue={defaultValues?.youtube_url} />
      </div>

      <div className="space-y-2">
        <Label>関連スキル（任意）</Label>
        <Select value={selectedSkill} onValueChange={(v) => setSelectedSkill(v ?? '')}>
          <SelectTrigger>
            <SelectValue placeholder="スキルを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">なし</SelectItem>
            {skills.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>必要レベル</Label>
        <Select value={selectedLevel} onValueChange={(v) => setSelectedLevel(v ?? '1')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((lv) => (
              <SelectItem key={lv} value={String(lv)}>Lv.{lv}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="order">表示順</Label>
        <Input id="order" name="order" type="number" min="0" defaultValue={defaultValues?.order ?? 0} />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? '保存中...' : submitLabel}
      </Button>
    </form>
  )
}
