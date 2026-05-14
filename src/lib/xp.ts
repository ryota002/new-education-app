// XP required to reach each level (index = level number)
export const XP_THRESHOLDS = [0, 0, 100, 250, 500, 900, 1400, 2000, 2700, 3500, 4500]

export function levelFromXP(xp: number): number {
  let level = 1
  for (let lv = 10; lv >= 1; lv--) {
    if (xp >= XP_THRESHOLDS[lv]) {
      level = lv
      break
    }
  }
  return level
}

export function xpForNextLevel(currentLevel: number): number {
  if (currentLevel >= 10) return XP_THRESHOLDS[10]
  return XP_THRESHOLDS[currentLevel + 1]
}

export function xpProgressPercent(xp: number, level: number): number {
  const floor = XP_THRESHOLDS[level]
  const ceil = XP_THRESHOLDS[Math.min(level + 1, 10)]
  if (ceil === floor) return 100
  return Math.round(((xp - floor) / (ceil - floor)) * 100)
}
