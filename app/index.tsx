/**
 * App Entry Route
 * Redirects users based on authentication and onboarding status
 * Feature: 002-app-screens
 */

import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAppSelector, useAppDispatch } from '../src/store/hooks';
import { selectIsAuthenticated, selectUser } from '../src/store/auth/authSelectors';
import { selectOnboardingProgress } from '../src/store/onboarding/onboardingSelectors';
import { fetchOnboardingProgress } from '../src/store/onboarding/onboardingThunks';

export default function Index() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const onboardingProgress = useAppSelector(selectOnboardingProgress);

  // Fetch onboarding progress when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id && !onboardingProgress) {
      dispatch(fetchOnboardingProgress(user.id));
    }
  }, [isAuthenticated, user?.id, onboardingProgress, dispatch]);

  // Redirect to appropriate screen based on auth state
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Wait for onboarding progress to load
  if (!onboardingProgress && user?.id) {
    // Loading state - could show a splash screen here
    return null;
  }

  // Check if user needs to complete onboarding
  if (onboardingProgress && !onboardingProgress.onboarding_completed) {
    // Determine which step to redirect to
    if (!onboardingProgress.welcome_completed) {
      return <Redirect href="/(onboarding)/welcome" />;
    }
    if (!onboardingProgress.role_selected) {
      return <Redirect href="/(onboarding)/role-selection" />;
    }
    if (!onboardingProgress.profile_form_completed) {
      // Check user role from profile to determine which form
      // For MVP, default to welcome if role not set
      return <Redirect href="/(onboarding)/welcome" />;
    }
  }

  // User is authenticated and onboarded, go to main app (Sobriety tab - P1 MVP)
  return <Redirect href="/(tabs)/sobriety" />;
}