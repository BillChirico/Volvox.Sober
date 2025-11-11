/**
 * Onboarding domain types
 * Feature: 002-app-screens
 */

import { Tables } from '../../../types/database.types';
import { UserRole, ProfileFormData } from '../../../types/profile';

// ============================================================
// Base Onboarding Types
// ============================================================

export interface OnboardingProgress extends Tables<'onboarding_progress'> {}

// ============================================================
// Onboarding Steps
// ============================================================

export type OnboardingStep =
  | 'welcome'
  | 'email_verification'
  | 'role_selection'
  | 'sponsor_profile'
  | 'sponsee_profile'
  | 'complete';

export interface OnboardingStepInfo {
  step: OnboardingStep;
  title: string;
  description: string;
  isCompleted: boolean;
  isAccessible: boolean;
}

// ============================================================
// Onboarding Form Data
// ============================================================

export interface RoleSelectionData {
  role: UserRole;
}

export interface SponsorProfileData extends ProfileFormData {
  yearsOfSobriety?: number;
  sponseeCapacity?: number;
  specializations?: string[]; // e.g., ["step work", "newcomer support"]
}

export interface SponseeProfileData extends ProfileFormData {
  isNewcomer?: boolean;
  seekingSpecializations?: string[];
}

// ============================================================
// Onboarding Navigation
// ============================================================

export interface OnboardingNavigationState {
  currentStep: OnboardingStep;
  canGoBack: boolean;
  canGoForward: boolean;
  progress: number; // 0-100 percentage
}

// ============================================================
// UI State Types
// ============================================================

export interface OnboardingState {
  progress: OnboardingProgress | null;
  currentStep: OnboardingStep;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

export interface OnboardingFormState {
  roleData: RoleSelectionData | null;
  sponsorProfileData: Partial<SponsorProfileData> | null;
  sponseeProfileData: Partial<SponseeProfileData> | null;
  validationErrors: Record<string, string>;
}
