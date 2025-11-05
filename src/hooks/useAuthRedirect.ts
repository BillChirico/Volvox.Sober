import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAppSelector } from '../store/hooks';
import { selectIsAuthenticated, selectUser } from '../store/auth/authSelectors';

/**
 * useAuthRedirect Hook
 *
 * Manages authentication-based navigation logic throughout the app.
 * Ensures users are redirected to appropriate screens based on their auth state.
 *
 * Rules:
 * 1. Unauthenticated users → redirect to login screen
 * 2. Authenticated but unverified users → blocked from main app (FR-005)
 * 3. Authenticated and verified users → allow access to main app
 *
 * @returns void
 */
export const useAuthRedirect = () => {
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  const inAuthGroup = segments[0] === '(auth)';
  const inTabsGroup = segments[0] === '(tabs)';
  const inOnboardingGroup = segments[0] === '(onboarding)';

  useEffect(() => {
    if (!isAuthenticated) {
      // Not authenticated → redirect to login if not already in auth screens
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      // Authenticated → check email verification status
      const isEmailVerified = user?.email_confirmed_at !== null;

      if (!isEmailVerified) {
        // Email not verified → block access to main app (FR-005)
        if (inTabsGroup) {
          // Redirect to login and show verification message
          router.replace('/(auth)/login');
        }
      } else {
        // Email verified → allow access to main app
        if (inAuthGroup) {
          // User is authenticated and verified, redirect to main app
          router.replace('/(tabs)/sobriety');
        }
      }
    }
  }, [isAuthenticated, user, inAuthGroup, inTabsGroup, router]);
};

/**
 * useAuth Hook
 *
 * Provides convenient access to authentication state and operations.
 * Use this hook in components that need to check auth status or perform auth actions.
 *
 * @returns Object containing auth state and helper functions
 */
export const useAuth = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const loading = useAppSelector((state) => state.auth.loading);
  const error = useAppSelector((state) => state.auth.error);

  const isEmailVerified = user?.email_confirmed_at !== null;

  return {
    isAuthenticated,
    user,
    loading,
    error,
    isEmailVerified,
  };
};
