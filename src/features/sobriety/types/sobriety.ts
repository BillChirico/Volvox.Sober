/**
 * Sobriety tracking domain types
 * Feature: 002-app-screens
 */

import { Tables, SobrietyMilestone, SobrietyReflection } from '../../../types/database.types';

// ============================================================
// Base Sobriety Types
// ============================================================

export interface SobrietyRecord extends Tables<'sobriety_records'> {}

export interface SobrietyRecordWithCalculations extends SobrietyRecord {
  daysSober: number; // Calculated from current_sobriety_start_date
}

// Re-export JSONB types for convenience
export type { SobrietyMilestone, SobrietyReflection };

// ============================================================
// Milestone Types
// ============================================================

export type MilestoneDay = 1 | 7 | 30 | 60 | 90 | 180 | 365 | 730 | 1825 | 3650;

export interface MilestoneDefinition {
  days: MilestoneDay;
  title: string;
  description: string;
  icon?: string;
}

export interface MilestoneStatus {
  milestone: MilestoneDefinition;
  isAchieved: boolean;
  achievedAt?: string;
  daysUntilAchievement?: number;
}

// ============================================================
// Reflection Types
// ============================================================

export interface ReflectionFormData {
  text: string;
  date?: string; // Defaults to today
}

// ============================================================
// Sobriety Journey Types
// ============================================================

export interface SobrietyJourneyData {
  currentStreak: {
    startDate: string;
    daysSober: number;
  };
  totalDaysSober: number; // Across all periods
  longestStreak: {
    days: number;
    startDate: string;
    endDate?: string;
  };
  relapseHistory: {
    date: string;
    daysBeforeRelapse: number;
  }[];
}

// ============================================================
// Relapse Tracking
// ============================================================

export interface RelapseData {
  date: string;
  previousStartDate: string;
  daysSober: number;
  notes?: string;
}

// ============================================================
// Form Data Types
// ============================================================

export interface SobrietyRecordFormData {
  current_sobriety_start_date: string;
  notes?: string;
}

// ============================================================
// UI State Types
// ============================================================

export interface SobrietyState {
  record: SobrietyRecordWithCalculations | null;
  milestones: MilestoneStatus[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

export interface SobrietyDashboardData {
  daysSober: number;
  nextMilestone: MilestoneStatus | null;
  recentReflections: SobrietyReflection[];
  achievedMilestonesCount: number;
}

export interface ReflectionFormState {
  formData: ReflectionFormData;
  isSaving: boolean;
  validationErrors: Record<string, string>;
}
