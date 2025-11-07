/**
 * Date Calculation Utilities
 * Common date operations for sobriety tracking
 * Feature: 002-app-screens
 */

/**
 * Calculate days between two dates
 */
export const calculateDaysBetween = (startDate: Date, endDate: Date): number => {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calculate days sober from start date to today
 */
export const calculateDaysSober = (startDate: string | Date): number => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const today = new Date();
  return calculateDaysBetween(start, today);
};

/**
 * Format date to YYYY-MM-DD string
 */
export const formatDateToISO = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Parse ISO date string to Date object
 */
export const parseISODate = (dateString: string): Date => {
  return new Date(dateString);
};

/**
 * Check if date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if date is within last N days
 */
export const isWithinLastNDays = (date: Date, days: number): boolean => {
  const today = new Date();
  const nDaysAgo = new Date(today);
  nDaysAgo.setDate(today.getDate() - days);
  return date >= nDaysAgo && date <= today;
};

/**
 * Format date to relative string (e.g., "2 days ago", "1 month ago")
 */
export const formatRelativeDate = (date: Date): string => {
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }

  const years = Math.floor(diffDays / 365);
  return years === 1 ? '1 year ago' : `${years} years ago`;
};

/**
 * Format date to friendly string (e.g., "Jan 15, 2024")
 */
export const formatFriendlyDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format date with time (e.g., "Jan 15, 2024 at 2:30 PM")
 */
export const formatFriendlyDateTime = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Get start of day (midnight)
 */
export const getStartOfDay = (date: Date): Date => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
};

/**
 * Get end of day (23:59:59.999)
 */
export const getEndOfDay = (date: Date): Date => {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
};

/**
 * Add days to date
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Subtract days from date
 */
export const subtractDays = (date: Date, days: number): Date => {
  return addDays(date, -days);
};

/**
 * Get days in month
 */
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Check if date is valid
 */
export const isValidDate = (date: unknown): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Convert days to years, months, days
 */
export const convertDaysToYMD = (
  totalDays: number,
): { years: number; months: number; days: number } => {
  const years = Math.floor(totalDays / 365);
  const remainingDaysAfterYears = totalDays % 365;
  const months = Math.floor(remainingDaysAfterYears / 30);
  const days = remainingDaysAfterYears % 30;

  return { years, months, days };
};

/**
 * Format sobriety duration (e.g., "2 years, 3 months, 15 days")
 */
export const formatSobrietyDuration = (days: number): string => {
  if (days === 0) return '0 days';
  if (days === 1) return '1 day';

  const { years, months, days: remainingDays } = convertDaysToYMD(days);

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
  if (remainingDays > 0 || parts.length === 0)
    parts.push(`${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}`);

  return parts.join(', ');
};

/**
 * Milestone definitions for sobriety tracking
 * T080: Milestone detection logic
 */
export const MILESTONE_DAYS = [
  1,
  7,
  14,
  30,
  60,
  90,
  120,
  180,
  270,
  365,
  2 * 365,
  3 * 365,
  4 * 365,
  5 * 365,
  10 * 365,
  15 * 365,
  20 * 365,
] as const;

export type MilestoneDays = (typeof MILESTONE_DAYS)[number];

export interface Milestone {
  days: number;
  name: string;
  description: string;
}

/**
 * Get milestone information for a specific day count
 */
export const getMilestoneForDays = (days: number): Milestone | null => {
  if (!MILESTONE_DAYS.includes(days as MilestoneDays)) {
    return null;
  }

  const names: Record<number, string> = {
    1: '1 Day',
    7: '1 Week',
    14: '2 Weeks',
    30: '1 Month',
    60: '2 Months',
    90: '3 Months',
    120: '4 Months',
    180: '6 Months',
    270: '9 Months',
    365: '1 Year',
    730: '2 Years',
    1095: '3 Years',
    1460: '4 Years',
    1825: '5 Years',
    3650: '10 Years',
    5475: '15 Years',
    7300: '20 Years',
  };

  const descriptions: Record<number, string> = {
    1: 'Your journey begins! One day at a time.',
    7: 'One full week of sobriety!',
    14: 'Two weeks strong!',
    30: 'One month milestone achieved!',
    60: 'Two months of dedication!',
    90: 'Three months! A major achievement!',
    120: 'Four months of growth!',
    180: 'Six months! Halfway to a year!',
    270: 'Nine months of transformation!',
    365: 'One full year! An incredible accomplishment!',
    730: 'Two years! Your commitment is inspiring!',
    1095: 'Three years of sobriety!',
    1460: 'Four years strong!',
    1825: 'Five years! A remarkable journey!',
    3650: '10 years! A decade of sobriety!',
    5475: '15 years of strength and recovery!',
    7300: '20 years! An extraordinary achievement!',
  };

  return {
    days,
    name: names[days] || `${days} Days`,
    description: descriptions[days] || `${days} days of sobriety!`,
  };
};

/**
 * Check if current days sober represents a milestone
 */
export const isMilestone = (days: number): boolean => {
  return MILESTONE_DAYS.includes(days as MilestoneDays);
};

/**
 * Get next upcoming milestone
 */
export const getNextMilestone = (currentDays: number): Milestone | null => {
  const nextMilestoneDay = MILESTONE_DAYS.find(m => m > currentDays);

  if (!nextMilestoneDay) {
    return null;
  }

  return getMilestoneForDays(nextMilestoneDay);
};

/**
 * Get days until next milestone
 */
export const getDaysUntilNextMilestone = (currentDays: number): number | null => {
  const nextMilestone = getNextMilestone(currentDays);

  if (!nextMilestone) {
    return null;
  }

  return nextMilestone.days - currentDays;
};

/**
 * Get all achieved milestones
 */
export const getAchievedMilestones = (currentDays: number): Milestone[] => {
  return MILESTONE_DAYS.filter(m => m <= currentDays)
    .map(days => getMilestoneForDays(days))
    .filter((m): m is Milestone => m !== null);
};

/**
 * Get upcoming milestones (next 3)
 */
export const getUpcomingMilestones = (currentDays: number): Milestone[] => {
  return MILESTONE_DAYS.filter(m => m > currentDays)
    .slice(0, 3)
    .map(days => getMilestoneForDays(days))
    .filter((m): m is Milestone => m !== null);
};
