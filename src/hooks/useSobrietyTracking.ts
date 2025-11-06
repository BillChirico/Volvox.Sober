/**
 * useSobrietyTracking Hook
 * Custom hook for sobriety tracking operations
 * Feature: 002-app-screens
 */

import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from './useAppDispatch'
import {
  fetchSobrietyRecord,
  createSobrietyRecord,
  updateSobrietyRecord,
  recordRelapse,
  refreshDaysSober,
  checkNewMilestones,
} from '../store/sobriety/sobrietyThunks'
import {
  selectSobrietyRecord,
  selectMilestones,
  selectSobrietyLoading,
  selectSobrietySaving,
  selectSobrietyError,
  selectDaysSober,
  selectIsCurrentlySober,
  selectAchievedMilestones,
  selectUpcomingMilestones,
  selectNextMilestone,
  selectSobrietyProgressSummary,
  selectRecentMilestoneAchievement,
  selectIsOnLongestStreak,
  selectIsSobrietyOperationInProgress,
} from '../store/sobriety/sobrietySelectors'
import { clearError } from '../store/sobriety/sobrietySlice'
import type { SobrietyRecordFormData } from '../types'

/**
 * Hook for managing sobriety tracking
 */
export const useSobrietyTracking = () => {
  const dispatch = useAppDispatch()

  // Selectors
  const record = useAppSelector(selectSobrietyRecord)
  const milestones = useAppSelector(selectMilestones)
  const isLoading = useAppSelector(selectSobrietyLoading)
  const isSaving = useAppSelector(selectSobrietySaving)
  const error = useAppSelector(selectSobrietyError)
  const daysSober = useAppSelector(selectDaysSober)
  const isCurrentlySober = useAppSelector(selectIsCurrentlySober)
  const achievedMilestones = useAppSelector(selectAchievedMilestones)
  const upcomingMilestones = useAppSelector(selectUpcomingMilestones)
  const nextMilestone = useAppSelector(selectNextMilestone)
  const progressSummary = useAppSelector(selectSobrietyProgressSummary)
  const recentMilestone = useAppSelector(selectRecentMilestoneAchievement)
  const isOnLongestStreak = useAppSelector(selectIsOnLongestStreak)
  const isOperationInProgress = useAppSelector(selectIsSobrietyOperationInProgress)

  // Actions
  const fetchRecord = useCallback(
    (userId: string) => {
      return dispatch(fetchSobrietyRecord(userId))
    },
    [dispatch]
  )

  const createRecord = useCallback(
    (userId: string, recordData: SobrietyRecordFormData) => {
      return dispatch(createSobrietyRecord({ userId, recordData }))
    },
    [dispatch]
  )

  const updateRecord = useCallback(
    (userId: string, updates: Partial<SobrietyRecordFormData>) => {
      return dispatch(updateSobrietyRecord({ userId, updates }))
    },
    [dispatch]
  )

  const logRelapse = useCallback(
    (userId: string, relapseDate: string, notes?: string) => {
      return dispatch(recordRelapse({ userId, relapseDate, notes }))
    },
    [dispatch]
  )

  const refresh = useCallback(
    (userId: string) => {
      return dispatch(refreshDaysSober(userId))
    },
    [dispatch]
  )

  const checkMilestones = useCallback(
    (userId: string) => {
      return dispatch(checkNewMilestones(userId))
    },
    [dispatch]
  )

  const dismissError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  return {
    // State
    record,
    milestones,
    isLoading,
    isSaving,
    error,
    daysSober,
    isCurrentlySober,
    achievedMilestones,
    upcomingMilestones,
    nextMilestone,
    progressSummary,
    recentMilestone,
    isOnLongestStreak,
    isOperationInProgress,

    // Actions
    fetchRecord,
    createRecord,
    updateRecord,
    logRelapse,
    refresh,
    checkMilestones,
    dismissError,
  }
}
