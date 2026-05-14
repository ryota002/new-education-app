'use client'

import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { xpProgressPercent, xpForNextLevel, XP_THRESHOLDS } from '@/lib/xp'

interface XPBarProps {
  level: number
  xp: number
  showDetails?: boolean
}

export function XPBar({ level, xp, showDetails = true }: XPBarProps) {
  const percent = xpProgressPercent(xp, level)
  const nextLevelXP = xpForNextLevel(level)
  const currentLevelXP = XP_THRESHOLDS[level]
  const isMaxLevel = level >= 10

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Badge className="text-sm px-3 py-1 bg-indigo-600 hover:bg-indigo-600">
          Lv.{level}
        </Badge>
        {showDetails && (
          <span className="text-xs text-slate-500">
            {isMaxLevel ? 'MAX' : `${xp - currentLevelXP} / ${nextLevelXP - currentLevelXP} XP`}
          </span>
        )}
      </div>
      <Progress value={isMaxLevel ? 100 : percent} className="h-3" />
      {showDetails && !isMaxLevel && (
        <p className="text-xs text-slate-400">次のレベルまで {nextLevelXP - xp} XP</p>
      )}
    </div>
  )
}
