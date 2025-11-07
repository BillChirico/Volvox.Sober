/**
 * Onboarding Redux Selectors
 * Memoized selectors for onboarding state
 * Feature: 002-app-screens
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type { OnboardingStep } from '../../types';

/**
 * Base selector for onboarding state
 */
export const selectOnboardingState = (state: RootState) => state.onboarding;

/**
 * Select onboarding progress
 */
export const selectOnboardingProgress = createSelector(
  [selectOnboardingState],
  onboardingState => onboardingState.progress,
);

/**
 * Select current onboarding step
 */
export const selectCurrentStep = createSelector(
  [selectOnboardingState],
  (onboardingState): OnboardingStep => onboardingState.currentStep,
);

/**
 * Select onboarding loading state
 */
export const selectOnboardingLoading = createSelector(
  [selectOnboardingState],
  onboardingState => onboardingState.isLoading,
);

/**
 * Select onboarding saving state
 */
export const selectOnboardingSaving = createSelector(
  [selectOnboardingState],
  onboardingState => onboardingState.isSaving,
);

/**
 * Select onboarding error
 */
export const selectOnboardingError = createSelector(
  [selectOnboardingState],
  onboardingState => onboardingState.error,
);

/**
 * Select if welcome step is completed
 */
export const selectWelcomeCompleted = createSelector(
  [selectOnboardingProgress],
  (progress): boolean => progress?.welcome_completed || false,
);

/**
 * Select if role is selected
 */
export const selectRoleSelected = createSelector(
  [selectOnboardingProgress],
  (progress): boolean => progress?.role_selected || false,
);

/**
 * Select if profile form is completed
 */
export const selectProfileFormCompleted = createSelector(
  [selectOnboardingProgress],
  (progress): boolean => progress?.profile_form_completed || false,
);

/**
 * Select if onboarding is completed
 */
export const selectOnboardingCompleted = createSelector(
  [selectOnboardingProgress],
  (progress): boolean => progress?.onboarding_completed || false,
);

/**
 * Select last completed step
 */
export const selectLastStep = createSelector(
  [selectOnboardingProgress],
  (progress): OnboardingStep | null => progress?.last_step || null,
);

/**
 * Select overall onboarding completion percentage
 */
export const selectOnboardingCompletionPercentage = createSelector(
  [selectOnboardingProgress],
  (progress): number => {
    if (!progress) return 0;

    const steps = {
      welcome_completed: progress.welcome_completed,
      role_selected: progress.role_selected,
      profile_form_completed: progress.profile_form_completed,
      onboarding_completed: progress.onboarding_completed,
    };

    const completedSteps = Object.values(steps).filter(Boolean).length;
    const totalSteps = Object.keys(steps).length;

    return Math.round((completedSteps / totalSteps) * 100);
  },
);

/**
 * Select if current step can be skipped
 */
export const selectCanSkipCurrentStep = createSelector(
  [selectCurrentStep],
  (currentStep): boolean => {
    // Only email_verification can be skipped (handled on backend)
    return currentStep === 'email_verification';
  },
);

/**
 * Select if user can proceed to next step
 */
export const selectCanProceedToNext = createSelector(
  [selectCurrentStep, selectOnboardingProgress],
  (currentStep, progress): boolean => {
    if (!progress) return false;

    switch (currentStep) {
      case 'welcome':
        return progress.welcome_completed;
      case 'email_verification':
        return true; // Can always proceed (backend handles email verification)
      case 'role_selection':
        return progress.role_selected;
      case 'sponsor_profile':
      case 'sponsee_profile':
        return progress.profile_form_completed;
      case 'complete':
        return progress.onboarding_completed;
      default:
        return false;
    }
  },
);

/**
 * Select if any operation is in progress
 */
export const selectIsOnboardingOperationInProgress = createSelector(
  [selectOnboardingLoading, selectOnboardingSaving],
  (isLoading, isSaving): boolean => isLoading || isSaving,
);

/**
 * Select onboarding progress summary
 */
export const selectOnboardingProgressSummary = createSelector(
  [selectOnboardingProgress, selectCurrentStep, selectOnboardingCompletionPercentage],
  (progress, currentStep, completionPercentage) => {
    if (!progress) {
      return {
        currentStep: 'welcome' as OnboardingStep,
        completionPercentage: 0,
        stepsCompleted: [],
        stepsRemaining: ['welcome', 'role_selection', 'sponsor_profile', 'complete'],
      };
    }

    const stepsCompleted: OnboardingStep[] = [];
    const stepsRemaining: OnboardingStep[] = [];

    if (progress.welcome_completed) stepsCompleted.push('welcome');
    else stepsRemaining.push('welcome');

    if (progress.role_selected) stepsCompleted.push('role_selection');
    else stepsRemaining.push('role_selection');

    if (progress.profile_form_completed)
      stepsCompleted.push('sponsor_profile'); // or sponsee_profile
    else stepsRemaining.push('sponsor_profile');

    if (progress.onboarding_completed) stepsCompleted.push('complete');
    else stepsRemaining.push('complete');

    return {
      currentStep,
      completionPercentage,
      stepsCompleted,
      stepsRemaining,
    };
  },
);
