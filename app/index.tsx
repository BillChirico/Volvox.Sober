/**
 * App Entry Route
 * Redirects users based on authentication and onboarding status
 * Feature: 002-app-screens
 */

import { useEffect, useCallback } from 'react';
import { Redirect } from 'expo-router';
import { useAppSelector, useAppDispatch } from '../src/store/hooks';
import { selectIsAuthenticated, selectUser } from '@/features/auth';
import { selectOnboardingProgress } from '@/features/onboarding';
import { fetchOnboardingProgress } from '@/features/onboarding';

export default function Index() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const onboardingProgress = useAppSelector(selectOnboardingProgress);

  // DEBUG: Log state for troubleshooting
  useEffect(() => {
    console.log('[Index] State:', { isAuthenticated, user: user?.id, onboardingProgress });
  }, [isAuthenticated, user?.id, onboardingProgress]);

  // Memoized onboarding progress fetch
  const loadOnboardingProgress = useCallback(() => {
    if (isAuthenticated && user?.id && !onboardingProgress) {
      console.log('[Index] Fetching onboarding progress for user:', user.id);
      dispatch(fetchOnboardingProgress(user.id));
    }
  }, [isAuthenticated, user?.id, onboardingProgress, dispatch]);

  // Fetch onboarding progress when user is authenticated
  useEffect(() => {
    loadOnboardingProgress();
  }, [loadOnboardingProgress]);

  // Redirect to appropriate screen based on auth state
  if (!isAuthenticated) {
    console.log('[Index] Not authenticated, redirecting to login');
    return <Redirect href="/(auth)/login" />;
  }

  // If no onboarding progress after authenticated, start onboarding
  // Note: The fetchOnboardingProgress will try to create a record if none exists
  // If it fails to create or load, we should still redirect to onboarding to start fresh
  if (!onboardingProgress && user?.id) {
    console.log('[Index] No onboarding progress found, redirecting to onboarding start');
    return <Redirect href="/(onboarding)/welcome" />;
  }

  // Check if user needs to complete onboarding
  if (onboardingProgress && !onboardingProgress.onboarding_completed) {
    console.log('[Index] Onboarding not completed:', onboardingProgress);
    // Determine which step to redirect to
    if (!onboardingProgress.welcome_completed) {
      console.log('[Index] Redirecting to welcome');
      return <Redirect href="/(onboarding)/welcome" />;
    }
    if (!onboardingProgress.role_selected) {
      console.log('[Index] Redirecting to role-selection');
      return <Redirect href="/(onboarding)/role-selection" />;
    }
    if (!onboardingProgress.profile_form_completed) {
      console.log('[Index] Redirecting to profile form (welcome)');
      // Check user role from profile to determine which form
      // For MVP, default to welcome if role not set
      return <Redirect href="/(onboarding)/welcome" />;
    }
  }

  // User is authenticated and onboarded, go to main app (Sobriety tab - P1 MVP)
  console.log('[Index] User authenticated and onboarded, redirecting to main app');
  return <Redirect href="/(tabs)/sobriety" />;
}
