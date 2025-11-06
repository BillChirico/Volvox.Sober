/**
 * Recovery Programs Constants
 * Standardized list of recovery programs
 * Feature: 002-app-screens
 */

export const RECOVERY_PROGRAMS = [
  'Alcoholics Anonymous (AA)',
  'Narcotics Anonymous (NA)',
  'SMART Recovery',
  'Celebrate Recovery',
  'Refuge Recovery',
  'LifeRing Secular Recovery',
  'Women for Sobriety',
  'Secular Organizations for Sobriety (SOS)',
  'Moderation Management',
  'Dharma Recovery',
  'Other',
  'None',
] as const

export type RecoveryProgram = (typeof RECOVERY_PROGRAMS)[number]

/**
 * Get display name for recovery program
 */
export const getRecoveryProgramDisplayName = (program: string): string => {
  return program
}

/**
 * Check if program is 12-step based
 */
export const isTwelveStepProgram = (program: string): boolean => {
  const twelveStepPrograms = [
    'Alcoholics Anonymous (AA)',
    'Narcotics Anonymous (NA)',
    'Celebrate Recovery',
  ]
  return twelveStepPrograms.includes(program)
}

/**
 * Check if program is secular/non-religious
 */
export const isSecularProgram = (program: string): boolean => {
  const secularPrograms = [
    'SMART Recovery',
    'LifeRing Secular Recovery',
    'Secular Organizations for Sobriety (SOS)',
    'Moderation Management',
  ]
  return secularPrograms.includes(program)
}

/**
 * Check if program is faith-based
 */
export const isFaithBasedProgram = (program: string): boolean => {
  const faithBasedPrograms = ['Celebrate Recovery', 'Alcoholics Anonymous (AA)']
  return faithBasedPrograms.includes(program)
}

/**
 * Get program category
 */
export const getProgramCategory = (
  program: string
): '12-step' | 'secular' | 'faith-based' | 'other' => {
  if (isTwelveStepProgram(program)) return '12-step'
  if (isSecularProgram(program)) return 'secular'
  if (isFaithBasedProgram(program)) return 'faith-based'
  return 'other'
}

/**
 * Recovery program groups for filtering/display
 */
export const RECOVERY_PROGRAM_GROUPS = {
  '12-step': [
    'Alcoholics Anonymous (AA)',
    'Narcotics Anonymous (NA)',
    'Celebrate Recovery',
  ],
  secular: [
    'SMART Recovery',
    'LifeRing Secular Recovery',
    'Secular Organizations for Sobriety (SOS)',
    'Moderation Management',
  ],
  'faith-based': ['Celebrate Recovery'],
  spiritual: ['Refuge Recovery', 'Dharma Recovery'],
  other: ['Women for Sobriety', 'Other', 'None'],
} as const
