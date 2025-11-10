/**
 * Profile domain types
 * Feature: 002-app-screens
 */

import { Tables } from './database.types';

// ============================================================
// Base Profile Types
// ============================================================

export type UserRole = 'sponsor' | 'sponsee' | 'both';

export interface Profile extends Tables<'profiles'> {}

export interface ProfileWithCalculations extends Profile {
  daysSober?: number; // Calculated from sobriety_start_date
}

// ============================================================
// Availability Types
// ============================================================

export type AvailabilityOption =
  | 'weekdays'
  | 'weekends'
  | 'mornings'
  | 'afternoons'
  | 'evenings'
  | 'anytime';

// ============================================================
// Matching Preferences
// ============================================================

export interface MatchingPreferences {
  preferredGender?: 'male' | 'female' | 'non-binary' | 'any';
  ageRangeMin?: number;
  ageRangeMax?: number;
  maxDistance?: number; // miles
  recoveryProgramMatch?: boolean; // Must match recovery program
  availabilityMatch?: boolean; // Must have overlapping availability
}

// ============================================================
// Profile Form Types
// ============================================================

export interface ProfileFormData {
  name: string;
  bio?: string;
  role: UserRole;
  recovery_program: string;
  sobriety_start_date?: string;
  city?: string;
  state?: string;
  country?: string;
  availability: AvailabilityOption[];
  preferences?: MatchingPreferences;
}

// ============================================================
// Profile Validation
// ============================================================

export interface ProfileValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  completionPercentage: number;
}

// ============================================================
// UI State Types
// ============================================================

export interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

export interface ProfileEditState {
  formData: Partial<ProfileFormData>;
  isDirty: boolean;
  validationErrors: Record<string, string>;
}
