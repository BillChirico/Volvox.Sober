/**
 * Availability Constants
 * Standardized availability time slots
 * Feature: 002-app-screens
 */

export const AVAILABILITY_OPTIONS = [
  'Weekday Mornings',
  'Weekday Afternoons',
  'Weekday Evenings',
  'Weekend Mornings',
  'Weekend Afternoons',
  'Weekend Evenings',
  'Flexible',
] as const

export type AvailabilityOption = (typeof AVAILABILITY_OPTIONS)[number]

/**
 * Map availability to time ranges
 */
export const AVAILABILITY_TIME_RANGES: Record<
  AvailabilityOption,
  { startHour: number; endHour: number; days: string[] }
> = {
  'Weekday Mornings': {
    startHour: 6,
    endHour: 12,
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  'Weekday Afternoons': {
    startHour: 12,
    endHour: 17,
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  'Weekday Evenings': {
    startHour: 17,
    endHour: 22,
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  'Weekend Mornings': {
    startHour: 6,
    endHour: 12,
    days: ['Saturday', 'Sunday'],
  },
  'Weekend Afternoons': {
    startHour: 12,
    endHour: 17,
    days: ['Saturday', 'Sunday'],
  },
  'Weekend Evenings': {
    startHour: 17,
    endHour: 22,
    days: ['Saturday', 'Sunday'],
  },
  Flexible: {
    startHour: 0,
    endHour: 24,
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
}

/**
 * Calculate overlap percentage between two availability sets
 */
export const calculateAvailabilityOverlap = (
  availability1: string[],
  availability2: string[]
): number => {
  if (availability1.length === 0 || availability2.length === 0) {
    return 0
  }

  const overlap = availability1.filter((slot) => availability2.includes(slot))
  const totalSlots = new Set([...availability1, ...availability2]).size

  return Math.round((overlap.length / totalSlots) * 100)
}

/**
 * Check if availability includes weekdays
 */
export const includesWeekdays = (availability: string[]): boolean => {
  const weekdaySlots = availability.filter((slot) => slot.startsWith('Weekday'))
  return weekdaySlots.length > 0
}

/**
 * Check if availability includes weekends
 */
export const includesWeekends = (availability: string[]): boolean => {
  const weekendSlots = availability.filter((slot) => slot.startsWith('Weekend'))
  return weekendSlots.length > 0
}

/**
 * Check if user has flexible availability
 */
export const isFlexible = (availability: string[]): boolean => {
  return availability.includes('Flexible')
}

/**
 * Get display text for availability
 */
export const getAvailabilityDisplayText = (availability: string[]): string => {
  if (availability.length === 0) return 'No availability set'
  if (isFlexible(availability)) return 'Flexible schedule'
  if (availability.length === AVAILABILITY_OPTIONS.length - 1)
    return 'Available anytime'

  return availability.join(', ')
}

/**
 * Group availability by day type
 */
export const groupAvailabilityByDayType = (
  availability: string[]
): {
  weekdays: string[]
  weekends: string[]
  flexible: boolean
} => {
  return {
    weekdays: availability.filter((slot) => slot.startsWith('Weekday')),
    weekends: availability.filter((slot) => slot.startsWith('Weekend')),
    flexible: isFlexible(availability),
  }
}
