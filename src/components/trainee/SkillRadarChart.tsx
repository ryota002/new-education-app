'use client'

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface SkillData {
  skill: string
  score: number
}

interface SkillRadarChartProps {
  data: SkillData[]
}

export function SkillRadarChart({ data }: SkillRadarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        まだスキルデータがありません。クイズに挑戦してみましょう！
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
        <Tooltip formatter={(value) => [`${value}`, 'スコア']} />
        <Radar
          name="スキル"
          dataKey="score"
          stroke="#6366f1"
          fill="#6366f1"
          fillOpacity={0.3}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
