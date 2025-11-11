/**
 * useTabNavigation Hook
 * Custom hook for tab navigation and route guards
 * Feature: 002-app-screens
 */

import { useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'expo-router';
import { useAppSelector } from './useAppDispatch';
import { selectUser, selectIsAuthenticated } from '@/features/auth';
import { selectOnboardingCompleted } from '../../features/onboarding/store/onboardingSelectors';
import { selectHasProfile } from '../store/profile/profileSelectors';
import type { TabName } from '../types';

/**
 * Hook for managing tab navigation with route guards
 */
export const useTabNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();

  // Auth & Onboarding state
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const onboardingCompleted = useAppSelector(selectOnboardingCompleted);
  const hasProfile = useAppSelector(selectHasProfile);

  // Check if user can access app tabs
  const canAccessTabs = isAuthenticated && onboardingCompleted && hasProfile;

  /**
   * Navigate to a specific tab
   */
  const navigateToTab = useCallback(
    (tabName: TabName) => {
      if (!canAccessTabs) {
        console.warn('Cannot navigate to tabs: User must complete auth and onboarding');
        return;
      }

      const tabRoutes: Record<TabName, string> = {
        sobriety: '/(tabs)/sobriety',
        matches: '/(tabs)/matches',
        connections: '/(tabs)/connections',
        messages: '/(tabs)/messages',
        profile: '/(tabs)/profile',
      };

      const route = tabRoutes[tabName];
      if (route) {
        router.push(route as any); // Type workaround for Expo Router dynamic routes
      }
    },
    [router, canAccessTabs],
  );

  /**
   * Navigate to sobriety tab
   */
  const navigateToSobriety = useCallback(() => {
    navigateToTab('sobriety');
  }, [navigateToTab]);

  /**
   * Navigate to matches tab
   */
  const navigateToMatches = useCallback(() => {
    navigateToTab('matches');
  }, [navigateToTab]);

  /**
   * Navigate to connections tab
   */
  const navigateToConnections = useCallback(() => {
    navigateToTab('connections');
  }, [navigateToTab]);

  /**
   * Navigate to messages tab
   */
  const navigateToMessages = useCallback(() => {
    navigateToTab('messages');
  }, [navigateToTab]);

  /**
   * Navigate to profile tab
   */
  const navigateToProfile = useCallback(() => {
    navigateToTab('profile');
  }, [navigateToTab]);

  /**
   * Navigate to onboarding if not completed
   */
  const navigateToOnboarding = useCallback(() => {
    router.replace('/(onboarding)/welcome');
  }, [router]);

  /**
   * Navigate to auth login
   */
  const navigateToLogin = useCallback(() => {
    router.replace('/(auth)/login');
  }, [router]);

  /**
   * Get current active tab from pathname
   */
  const getCurrentTab = useCallback((): TabName | null => {
    if (!pathname) return null;

    if (pathname.includes('/sobriety')) return 'sobriety';
    if (pathname.includes('/matches')) return 'matches';
    if (pathname.includes('/connections')) return 'connections';
    if (pathname.includes('/messages')) return 'messages';
    if (pathname.includes('/profile')) return 'profile';

    return null;
  }, [pathname]);

  /**
   * Check if currently on a specific tab
   */
  const isOnTab = useCallback(
    (tabName: TabName): boolean => {
      return getCurrentTab() === tabName;
    },
    [getCurrentTab],
  );

  /**
   * Route guard: Redirect to onboarding/auth if necessary
   */
  useEffect(() => {
    // Skip if not on a tab route
    if (!pathname?.includes('/(tabs)/')) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigateToLogin();
      return;
    }

    // Redirect to onboarding if not completed
    if (!onboardingCompleted || !hasProfile) {
      navigateToOnboarding();
      return;
    }
  }, [
    pathname,
    isAuthenticated,
    onboardingCompleted,
    hasProfile,
    navigateToLogin,
    navigateToOnboarding,
  ]);

  return {
    // State
    canAccessTabs,
    currentTab: getCurrentTab(),
    user,

    // Navigation
    navigateToTab,
    navigateToSobriety,
    navigateToMatches,
    navigateToConnections,
    navigateToMessages,
    navigateToProfile,
    navigateToOnboarding,
    navigateToLogin,

    // Utilities
    getCurrentTab,
    isOnTab,
  };
};
