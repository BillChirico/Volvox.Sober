import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAppSelector } from '../store/hooks';
import { selectIsAuthenticated, selectUser } from '../store/auth/authSelectors';
import authService from '../services/authService';

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
  const inOnboardingGroup = segments[0] === '(onboarding)';

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

  /**
   * Resend verification email to the current user
   */
  const resendVerificationEmail = async () => {
    if (!user?.email) {
      throw new Error('No user email available');
    }
    return await authService.resendVerification(user.email);
  };

  return {
    isAuthenticated,
    user,
    loading,
    error,
    isEmailVerified,
    resendVerificationEmail,
  };
};
