/**
 * useOnboarding Hook
 * Custom hook for onboarding operations
 * Feature: 002-app-screens
 */

import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from './useAppDispatch'
import {
  fetchOnboardingProgress,
  initializeOnboarding,
  completeOnboardingStep,
  completeOnboarding,
  navigateToStep,
} from '../store/onboarding/onboardingThunks'
import {
  selectOnboardingProgress,
  selectCurrentStep,
  selectOnboardingLoading,
  selectOnboardingSaving,
  selectOnboardingError,
  selectOnboardingCompletionPercentage,
  selectCanProceedToNext,
  selectIsOnboardingOperationInProgress,
  selectOnboardingProgressSummary,
} from '../store/onboarding/onboardingSelectors'
import { clearError } from '../store/onboarding/onboardingSlice'
import type { OnboardingStep } from '../types'

/**
 * Hook for managing onboarding flow
 */
export const useOnboarding = () => {
  const dispatch = useAppDispatch()

  // Selectors
  const progress = useAppSelector(selectOnboardingProgress)
  const currentStep = useAppSelector(selectCurrentStep)
  const isLoading = useAppSelector(selectOnboardingLoading)
  const isSaving = useAppSelector(selectOnboardingSaving)
  const error = useAppSelector(selectOnboardingError)
  const completionPercentage = useAppSelector(selectOnboardingCompletionPercentage)
  const canProceedToNext = useAppSelector(selectCanProceedToNext)
  const isOperationInProgress = useAppSelector(selectIsOnboardingOperationInProgress)
  const progressSummary = useAppSelector(selectOnboardingProgressSummary)

  // Actions
  const fetchProgress = useCallback(
    (userId: string) => {
      return dispatch(fetchOnboardingProgress(userId))
    },
    [dispatch]
  )

  const initialize = useCallback(
    (userId: string) => {
      return dispatch(initializeOnboarding(userId))
    },
    [dispatch]
  )

  const completeStep = useCallback(
    (userId: string, step: OnboardingStep) => {
      return dispatch(completeOnboardingStep({ userId, step }))
    },
    [dispatch]
  )

  const complete = useCallback(
    (userId: string) => {
      return dispatch(completeOnboarding(userId))
    },
    [dispatch]
  )

  const goToStep = useCallback(
    (step: OnboardingStep) => {
      return dispatch(navigateToStep(step))
    },
    [dispatch]
  )

  const dismissError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  return {
    // State
    progress,
    currentStep,
    isLoading,
    isSaving,
    error,
    completionPercentage,
    canProceedToNext,
    isOperationInProgress,
    progressSummary,

    // Actions
    fetchProgress,
    initialize,
    completeStep,
    complete,
    goToStep,
    dismissError,
  }
}
