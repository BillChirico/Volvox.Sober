/**
 * Sobriety Tracking Types
 * WP06: Sobriety Tracking & Milestones
 */

export type MilestoneType = '30_days' | '60_days' | '90_days' | '180_days' | '1_year';

export type TriggerContext = 'stress' | 'social_pressure' | 'emotional' | 'physical_pain' | 'other';

export interface SobrietyDate {
  id: string;
  user_id: string;
  substance_type: string;
  start_date: string; // ISO date string
  current_streak_days: number; // GENERATED column
  milestones_achieved: MilestoneType[]; // GENERATED column
  next_milestone_days: number | null; // GENERATED column
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Relapse {
  id: string;
  sobriety_date_id: string;
  relapse_date: string; // ISO timestamp
  private_note?: string; // Only visible to user
  trigger_context?: TriggerContext;
  sponsor_notified: boolean;
  created_at: string;
}

export interface SobrietyStats {
  id: string;
  user_id: string;
  substance_type: string;
  start_date: string;
  current_streak_days: number;
  milestones_achieved: MilestoneType[];
  next_milestone_days: number | null;
  days_until_next_milestone: number | null;
  is_active: boolean;
  total_relapses: number;
  last_relapse_date: string | null;
}

export interface SetSobrietyDatePayload {
  substance_type: string;
  start_date: string; // ISO date string
}

export interface LogRelapsePayload {
  sobriety_date_id: string;
  relapse_date: string; // ISO timestamp
  private_note?: string;
  trigger_context?: TriggerContext;
}

export interface MilestoneDisplay {
  type: MilestoneType;
  days: number;
  displayText: string;
  achieved: boolean;
}

export const MILESTONE_THRESHOLDS: Record<MilestoneType, number> = {
  '30_days': 30,
  '60_days': 60,
  '90_days': 90,
  '180_days': 180,
  '1_year': 365,
};

export const MILESTONE_DISPLAY_TEXT: Record<MilestoneType, string> = {
  '30_days': '30 Days - One Month Sober! 🎉',
  '60_days': '60 Days - Two Months Strong! 💪',
  '90_days': '90 Days - Three Month Milestone! ⭐',
  '180_days': '180 Days - Half a Year! 🎊',
  '1_year': '1 Year - Anniversary! 🏆',
};

export const TRIGGER_CONTEXT_OPTIONS = [
  { value: 'stress', label: 'Stress' },
  { value: 'social_pressure', label: 'Social Pressure' },
  { value: 'emotional', label: 'Emotional' },
  { value: 'physical_pain', label: 'Physical Pain' },
  { value: 'other', label: 'Other' },
] as const;
