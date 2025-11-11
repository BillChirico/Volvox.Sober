/**
 * Navigation domain types
 * Feature: 002-app-screens
 */

import { OnboardingStep } from '../features/onboarding/types/onboarding';

// ============================================================
// Route Definitions
// ============================================================

export type AuthRoute =
  | '/login'
  | '/signup'
  | '/forgot-password'
  | '/reset-password'
  | '/verify-email';

export type OnboardingRoute =
  | '/onboarding/welcome'
  | '/onboarding/email-verification'
  | '/onboarding/role-selection'
  | '/onboarding/sponsor-profile'
  | '/onboarding/sponsee-profile';

export type TabRoute =
  | '/tabs/sobriety'
  | '/tabs/matches'
  | '/tabs/connections'
  | '/tabs/messages'
  | '/tabs/profile';

export type AppRoute = AuthRoute | OnboardingRoute | TabRoute;

// ============================================================
// Tab Navigation
// ============================================================

export type TabName = 'sobriety' | 'matches' | 'connections' | 'messages' | 'profile';

export interface TabDefinition {
  name: TabName;
  route: TabRoute;
  icon: string;
  label: string;
  badge?: number; // Unread count
}

// ============================================================
// Navigation State
// ============================================================

export interface NavigationState {
  currentRoute: AppRoute;
  previousRoute?: AppRoute;
  isNavigating: boolean;
}

export interface TabNavigationState {
  activeTab: TabName;
  tabBadges: Record<TabName, number>;
}

// ============================================================
// Onboarding Navigation
// ============================================================

export interface OnboardingNavigationMap {
  [key in OnboardingStep]: {
    route: OnboardingRoute;
    nextStep?: OnboardingStep;
    previousStep?: OnboardingStep;
  };
}

export const ONBOARDING_ROUTES: OnboardingNavigationMap = {
  welcome: {
    route: '/onboarding/welcome',
    nextStep: 'email_verification',
  },
  email_verification: {
    route: '/onboarding/email-verification',
    nextStep: 'role_selection',
    previousStep: 'welcome',
  },
  role_selection: {
    route: '/onboarding/role-selection',
    nextStep: 'sponsor_profile', // Dynamic based on role selected
    previousStep: 'email_verification',
  },
  sponsor_profile: {
    route: '/onboarding/sponsor-profile',
    nextStep: 'complete',
    previousStep: 'role_selection',
  },
  sponsee_profile: {
    route: '/onboarding/sponsee-profile',
    nextStep: 'complete',
    previousStep: 'role_selection',
  },
  complete: {
    route: '/tabs/sobriety' as OnboardingRoute, // Redirect to app
    previousStep: 'sponsor_profile', // or sponsee_profile
  },
};

// ============================================================
// Navigation Guards
// ============================================================

export interface NavigationGuard {
  canAccess: boolean;
  redirectTo?: AppRoute;
  reason?: string;
}

export interface RouteGuardContext {
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  isEmailVerified: boolean;
  currentRoute: AppRoute;
}

// ============================================================
// Deep Linking
// ============================================================

export interface DeepLinkParams {
  route: AppRoute;
  params?: Record<string, string>;
}

export type DeepLinkHandler = (params: DeepLinkParams) => void;

// ============================================================
// Navigation Actions
// ============================================================

export interface NavigateAction {
  type: 'navigate';
  payload: {
    route: AppRoute;
    params?: Record<string, unknown>;
  };
}

export interface GoBackAction {
  type: 'go_back';
}

export interface ResetNavigationAction {
  type: 'reset';
  payload: {
    route: AppRoute;
  };
}

export type NavigationAction = NavigateAction | GoBackAction | ResetNavigationAction;
