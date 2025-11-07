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
 * 2. Authenticated users → allow access to main app (email verification is non-blocking per FR-005)
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
  const _inOnboardingGroup = segments[0] === '(onboarding)';

  useEffect(() => {
    if (!isAuthenticated) {
      // Not authenticated → redirect to login if not already in auth screens
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      // Authenticated → allow access to main app (email verification is non-blocking)
      if (inAuthGroup) {
        // User is authenticated, redirect to main app
        router.replace('/(tabs)/sobriety');
      }
    }
  }, [isAuthenticated, user, inAuthGroup, inTabsGroup, router]);
};
