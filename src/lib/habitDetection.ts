import { CarbonProfile, FootprintBreakdown } from './types'

export interface HabitChangeInsight {
  category: string
  changePercent: number
  insight: string
}

/**
 * Compares the user's most recent footprint against their previous footprint to detect significant habit changes.
 * Employs pure deterministic logic without AI intervention.
 *
 * @param history An array of historical profiles, assumed to be ordered newest first.
 * @returns An array of habit change insights, sorted by absolute magnitude of change.
 */
export function detectHabitChanges(
  history: {
    profile: CarbonProfile
    breakdown: FootprintBreakdown
    timestamp: Date
  }[]
): HabitChangeInsight[] {
  if (history.length < 2) {
    return [] // Not enough history to detect changes
  }

  // Ensure history is sorted by timestamp descending
  const sortedHistory = [...history].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  )

  const current = sortedHistory[0].breakdown
  const previous = sortedHistory[1].breakdown

  const insights: HabitChangeInsight[] = []
  const categories: Array<{ key: keyof FootprintBreakdown; label: string }> = [
    { key: 'transport', label: 'transport' },
    { key: 'diet', label: 'diet' },
    { key: 'shopping', label: 'shopping' },
    { key: 'energy', label: 'energy' },
    { key: 'digital', label: 'digital' },
  ]

  for (const { key, label } of categories) {
    const currVal = Number(current[key])
    const prevVal = Number(previous[key])

    if (prevVal === 0 && currVal === 0) continue

    let changePercent = 0
    if (prevVal === 0) {
      changePercent = 100 // Cap arbitrary spikes from absolute zero
    } else {
      changePercent = ((currVal - prevVal) / prevVal) * 100
    }

    if (Math.abs(changePercent) > 10) {
      const roundedPercent = Math.round(Math.abs(changePercent))
      const direction = changePercent > 0 ? 'rose' : 'dropped'
      let reason = ''

      // Simple heuristic reasoning
      if (label === 'shopping' && changePercent > 0) {
        reason =
          'likely due to increased online orders or fast fashion purchases'
      } else if (label === 'shopping' && changePercent < 0) {
        reason = 'great job cutting back on deliveries'
      } else if (label === 'transport' && changePercent > 0) {
        reason = 'perhaps from more solo driving or flights'
      } else if (label === 'transport' && changePercent < 0) {
        reason = 'thanks to your greener commuting choices'
      } else if (label === 'diet' && changePercent > 0) {
        reason = 'which often happens with more meat-heavy meals'
      } else if (label === 'diet' && changePercent < 0) {
        reason = 'showing the impact of a more plant-based approach'
      } else if (label === 'energy') {
        reason = 'reflecting changes in your home electricity usage'
      } else if (label === 'digital') {
        reason = 'tied to your screen time and food delivery habits'
      }

      insights.push({
        category: label,
        changePercent: Math.round(changePercent),
        insight: `Your ${label} emissions ${direction} ${roundedPercent}% — ${reason}.`,
      })
    }
  }

  // Sort by the absolute magnitude of the change, highest first
  return insights.sort(
    (a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)
  )
}
