/**
 * Onboarding Redux Thunks
 * Async operations for onboarding flow
 * Feature: 002-app-screens
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import onboardingService from '../services/onboardingService';
import {
  setProgress,
  setCurrentStep,
  setLoading,
  setSaving,
  setError,
  clearError,
  completeStep,
  markOnboardingComplete,
} from './onboardingSlice';
import type { OnboardingStep } from '../types';

/**
 * Fetch onboarding progress for user
 */
export const fetchOnboardingProgress = createAsyncThunk(
  'onboarding/fetchProgress',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());

      const { data, error } = await onboardingService.getProgress(userId);

      if (error) {
        dispatch(setError(error.message));
        return rejectWithValue(error.message);
      }

      dispatch(setProgress(data));

      // Determine current step based on progress
      const role = data?.role_selected ? 'sponsor' : undefined;
      const nextStep = onboardingService.getNextStep(data, role);
      dispatch(setCurrentStep(nextStep));

      return data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch onboarding progress';
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setLoading(false));
    }
  },
);

/**
 * Initialize onboarding progress for new user
 */
export const initializeOnboarding = createAsyncThunk(
  'onboarding/initialize',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setSaving(true));
      dispatch(clearError());

      const { data, error } = await onboardingService.initializeProgress(userId);

      if (error) {
        dispatch(setError(error.message));
        return rejectWithValue(error.message);
      }

      dispatch(setProgress(data));
      dispatch(setCurrentStep('welcome'));

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initialize onboarding';
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setSaving(false));
    }
  },
);

/**
 * Complete an onboarding step
 */
export const completeOnboardingStep = createAsyncThunk(
  'onboarding/completeStep',
  async (
    { userId, step }: { userId: string; step: OnboardingStep },
    { dispatch, rejectWithValue },
  ) => {
    try {
      dispatch(setSaving(true));
      dispatch(clearError());

      const { data, error } = await onboardingService.completeStep(userId, step);

      if (error) {
        dispatch(setError(error.message));
        return rejectWithValue(error.message);
      }

      dispatch(setProgress(data));
      dispatch(completeStep(step));

      // Determine next step
      const role = data?.role_selected ? 'sponsor' : undefined;
      const nextStep = onboardingService.getNextStep(data, role);
      dispatch(setCurrentStep(nextStep));

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to complete step';
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setSaving(false));
    }
  },
);

/**
 * Mark entire onboarding as complete
 */
export const completeOnboarding = createAsyncThunk(
  'onboarding/complete',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setSaving(true));
      dispatch(clearError());

      const { data, error } = await onboardingService.markComplete(userId);

      if (error) {
        dispatch(setError(error.message));
        return rejectWithValue(error.message);
      }

      dispatch(setProgress(data));
      dispatch(markOnboardingComplete());
      dispatch(setCurrentStep('complete'));

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to complete onboarding';
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setSaving(false));
    }
  },
);

/**
 * Navigate to specific onboarding step
 */
export const navigateToStep = createAsyncThunk(
  'onboarding/navigateToStep',
  async (step: OnboardingStep, { dispatch }) => {
    dispatch(setCurrentStep(step));
    return step;
  },
);
