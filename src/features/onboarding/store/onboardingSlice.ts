/**
 * Onboarding Redux Slice (Updated for 002-app-screens)
 * Manages onboarding progress state
 * Feature: 002-app-screens
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OnboardingState, OnboardingProgress, OnboardingStep } from '../types';

const initialState: OnboardingState = {
  progress: null,
  currentStep: 'welcome',
  isLoading: false,
  isSaving: false,
  error: null,
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setProgress: (state, action: PayloadAction<OnboardingProgress | null>) => {
      state.progress = action.payload;
      state.error = null;
    },
    setCurrentStep: (state, action: PayloadAction<OnboardingStep>) => {
      state.currentStep = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSaving: (state, action: PayloadAction<boolean>) => {
      state.isSaving = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
      state.isSaving = false;
    },
    clearError: state => {
      state.error = null;
    },
    completeStep: (state, action: PayloadAction<OnboardingStep>) => {
      if (state.progress) {
        const stepMap: Partial<Record<OnboardingStep, keyof OnboardingProgress>> = {
          welcome: 'welcome_completed',
          role_selection: 'role_selected',
          sponsor_profile: 'profile_form_completed',
          sponsee_profile: 'profile_form_completed',
          complete: 'onboarding_completed',
        };

        const field = stepMap[action.payload];
        if (field) {
          // Type assertion needed for dynamic field access
          (state.progress as any)[field] = true;
        }
      }
    },
    markOnboardingComplete: state => {
      if (state.progress) {
        state.progress.onboarding_completed = true;
      }
    },
    resetOnboarding: state => {
      state.progress = null;
      state.currentStep = 'welcome';
      state.isLoading = false;
      state.isSaving = false;
      state.error = null;
    },
  },
});

export const {
  setProgress,
  setCurrentStep,
  setLoading,
  setSaving,
  setError,
  clearError,
  completeStep,
  markOnboardingComplete,
  resetOnboarding,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
