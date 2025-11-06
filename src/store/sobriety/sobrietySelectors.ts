/**
 * Sobriety Redux Selectors
 * Memoized selectors for sobriety state with day calculations
 * Feature: 002-app-screens
 */

import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../index'
import type { MilestoneStatus } from '../../types'

/**
 * Base selector for sobriety state
 */
export const selectSobrietyState = (state: RootState) => state.sobriety

/**
 * Select sobriety record
 */
export const selectSobrietyRecord = createSelector(
  [selectSobrietyState],
  (sobrietyState) => sobrietyState.record
)

/**
 * Select milestone statuses
 */
export const selectMilestones = createSelector(
  [selectSobrietyState],
  (sobrietyState) => sobrietyState.milestones
)

/**
 * Select sobriety loading state
 */
export const selectSobrietyLoading = createSelector(
  [selectSobrietyState],
  (sobrietyState) => sobrietyState.isLoading
)

/**
 * Select sobriety saving state
 */
export const selectSobrietySaving = createSelector(
  [selectSobrietyState],
  (sobrietyState) => sobrietyState.isSaving
)

/**
 * Select sobriety error
 */
export const selectSobrietyError = createSelector(
  [selectSobrietyState],
  (sobrietyState) => sobrietyState.error
)

/**
 * Select current sobriety start date
 */
export const selectSobrietyStartDate = createSelector(
  [selectSobrietyRecord],
  (record): string | null => record?.current_sobriety_start_date || null
)

/**
 * Select days sober (calculated)
 */
export const selectDaysSober = createSelector(
  [selectSobrietyRecord],
  (record): number => record?.daysSober || 0
)

/**
 * Select total relapses
 */
export const selectTotalRelapses = createSelector(
  [selectSobrietyRecord],
  (record): number => record?.total_relapses || 0
)

/**
 * Select longest sobriety streak
 */
export const selectLongestStreak = createSelector(
  [selectSobrietyRecord],
  (record): number | null => record?.longest_streak_days || null
)

/**
 * Select is currently sober (has start date)
 */
export const selectIsCurrentlySober = createSelector(
  [selectSobrietyStartDate],
  (startDate): boolean => startDate !== null
)

/**
 * Select achieved milestones
 */
export const selectAchievedMilestones = createSelector(
  [selectMilestones],
  (milestones): MilestoneStatus[] => milestones.filter((m) => m.isAchieved)
)

/**
 * Select upcoming milestones (next 3)
 */
export const selectUpcomingMilestones = createSelector(
  [selectMilestones],
  (milestones): MilestoneStatus[] =>
    milestones.filter((m) => !m.isAchieved).slice(0, 3)
)

/**
 * Select next milestone
 */
export const selectNextMilestone = createSelector(
  [selectMilestones],
  (milestones): MilestoneStatus | null => {
    const upcoming = milestones.filter((m) => !m.isAchieved)
    return upcoming.length > 0 ? upcoming[0] : null
  }
)

/**
 * Select milestone achievement count
 */
export const selectMilestoneCount = createSelector(
  [selectAchievedMilestones],
  (achieved): number => achieved.length
)

/**
 * Select if milestone was recently achieved (within 24 hours)
 */
export const selectRecentMilestoneAchievement = createSelector(
  [selectAchievedMilestones],
  (achieved): MilestoneStatus | null => {
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const recent = achieved.find((m) => {
      if (!m.achievedAt) return false
      const achievedDate = new Date(m.achievedAt)
      return achievedDate >= oneDayAgo
    })

    return recent || null
  }
)

/**
 * Select sobriety progress summary
 */
export const selectSobrietyProgressSummary = createSelector(
  [
    selectDaysSober,
    selectTotalRelapses,
    selectLongestStreak,
    selectMilestoneCount,
    selectNextMilestone,
  ],
  (daysSober, totalRelapses, longestStreak, milestoneCount, nextMilestone) => ({
    daysSober,
    totalRelapses,
    longestStreak: longestStreak || daysSober,
    milestonesAchieved: milestoneCount,
    nextMilestone: nextMilestone
      ? {
          title: nextMilestone.milestone.title,
          daysRemaining: nextMilestone.daysUntilAchievement || 0,
        }
      : null,
  })
)

/**
 * Select if user is on longest streak
 */
export const selectIsOnLongestStreak = createSelector(
  [selectDaysSober, selectLongestStreak],
  (daysSober, longestStreak): boolean => {
    if (!longestStreak) return true
    return daysSober >= longestStreak
  }
)

/**
 * Select relapse history
 */
export const selectRelapseHistory = createSelector(
  [selectSobrietyRecord],
  (record): Array<{ date: string; notes?: string }> =>
    record?.relapse_history || []
)

/**
 * Select last relapse date
 */
export const selectLastRelapseDate = createSelector(
  [selectRelapseHistory],
  (history): string | null => {
    if (history.length === 0) return null
    const sorted = [...history].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    return sorted[0].date
  }
)

/**
 * Select if any operation is in progress
 */
export const selectIsSobrietyOperationInProgress = createSelector(
  [selectSobrietyLoading, selectSobrietySaving],
  (isLoading, isSaving): boolean => isLoading || isSaving
)

/**
 * Select days until next milestone
 */
export const selectDaysUntilNextMilestone = createSelector(
  [selectNextMilestone],
  (nextMilestone): number | null => nextMilestone?.daysUntilAchievement || null
)

/**
 * Select milestone progress percentage (to next milestone)
 */
export const selectMilestoneProgressPercentage = createSelector(
  [selectDaysSober, selectNextMilestone],
  (daysSober, nextMilestone): number => {
    if (!nextMilestone) return 100 // No next milestone, 100% complete

    const milestoneDays = nextMilestone.milestone.days
    const percentage = (daysSober / milestoneDays) * 100

    return Math.min(Math.round(percentage), 100)
  }
)
