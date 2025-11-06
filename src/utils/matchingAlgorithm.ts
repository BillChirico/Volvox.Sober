/**
 * Matching Algorithm Utilities
 * Compatibility scoring helpers
 * Feature: 002-app-screens
 */

import type { CompatibilityFactors } from '../types'

/**
 * Calculate weighted compatibility score
 */
export const calculateWeightedScore = (
  factors: CompatibilityFactors,
  weights?: Partial<Record<keyof CompatibilityFactors, number>>
): number => {
  const defaultWeights: Record<keyof CompatibilityFactors, number> = {
    recoveryProgramMatch: 0.3,
    locationProximity: 0.2,
    availabilityOverlap: 0.2,
    preferenceAlignment: 0.15,
    experienceLevel: 0.15,
  }

  const finalWeights = { ...defaultWeights, ...weights }

  const totalScore = Math.round(
    factors.recoveryProgramMatch * finalWeights.recoveryProgramMatch +
      factors.locationProximity * finalWeights.locationProximity +
      factors.availabilityOverlap * finalWeights.availabilityOverlap +
      factors.preferenceAlignment * finalWeights.preferenceAlignment +
      factors.experienceLevel * finalWeights.experienceLevel
  )

  return Math.min(Math.max(totalScore, 0), 100) // Clamp between 0-100
}

/**
 * Get compatibility level from score
 */
export const getCompatibilityLevel = (
  score: number
): 'excellent' | 'very-good' | 'good' | 'fair' | 'poor' => {
  if (score >= 90) return 'excellent'
  if (score >= 75) return 'very-good'
  if (score >= 60) return 'good'
  if (score >= 40) return 'fair'
  return 'poor'
}

/**
 * Get compatibility color (for UI)
 */
export const getCompatibilityColor = (score: number): string => {
  const level = getCompatibilityLevel(score)
  const colors = {
    excellent: '#10B981', // green-500
    'very-good': '#84CC16', // lime-500
    good: '#F59E0B', // amber-500
    fair: '#F97316', // orange-500
    poor: '#EF4444', // red-500
  }
  return colors[level]
}

/**
 * Generate match explanation text
 */
export const generateMatchExplanation = (factors: CompatibilityFactors): string => {
  const explanations: string[] = []

  // Recovery program
  if (factors.recoveryProgramMatch >= 80) {
    explanations.push('Same recovery program')
  } else if (factors.recoveryProgramMatch >= 50) {
    explanations.push('Similar recovery approach')
  } else {
    explanations.push('Different recovery programs')
  }

  // Location
  if (factors.locationProximity >= 80) {
    explanations.push('nearby location')
  } else if (factors.locationProximity >= 50) {
    explanations.push('same region')
  } else {
    explanations.push('different locations')
  }

  // Availability
  if (factors.availabilityOverlap >= 70) {
    explanations.push('great schedule overlap')
  } else if (factors.availabilityOverlap >= 40) {
    explanations.push('some schedule overlap')
  } else {
    explanations.push('limited schedule overlap')
  }

  // Experience
  if (factors.experienceLevel >= 70) {
    explanations.push('similar recovery experience')
  }

  return explanations.join(' • ')
}

/**
 * Get top compatibility factors
 */
export const getTopCompatibilityFactors = (
  factors: CompatibilityFactors,
  limit: number = 3
): Array<{ factor: keyof CompatibilityFactors; score: number; label: string }> => {
  const factorLabels: Record<keyof CompatibilityFactors, string> = {
    recoveryProgramMatch: 'Recovery Program',
    locationProximity: 'Location',
    availabilityOverlap: 'Availability',
    preferenceAlignment: 'Preferences',
    experienceLevel: 'Experience Level',
  }

  const factorArray = (Object.keys(factors) as Array<keyof CompatibilityFactors>).map(
    (key) => ({
      factor: key,
      score: factors[key],
      label: factorLabels[key],
    })
  )

  return factorArray.sort((a, b) => b.score - a.score).slice(0, limit)
}

/**
 * Calculate distance score from km distance
 * Converts distance to 0-100 score (closer = higher score)
 */
export const calculateDistanceScore = (distanceKm: number): number => {
  if (distanceKm <= 10) return 100 // Within 10km = perfect
  if (distanceKm <= 25) return 90 // Within 25km = excellent
  if (distanceKm <= 50) return 75 // Within 50km = very good
  if (distanceKm <= 100) return 60 // Within 100km = good
  if (distanceKm <= 250) return 40 // Within 250km = fair
  if (distanceKm <= 500) return 20 // Within 500km = poor
  return 10 // > 500km = very poor
}

/**
 * Normalize score to 0-100 range
 */
export const normalizeScore = (value: number, min: number, max: number): number => {
  if (max === min) return 100
  const normalized = ((value - min) / (max - min)) * 100
  return Math.min(Math.max(Math.round(normalized), 0), 100)
}

/**
 * Check if compatibility score is acceptable
 */
export const isAcceptableMatch = (score: number, threshold: number = 50): boolean => {
  return score >= threshold
}

/**
 * Calculate program compatibility percentage
 */
export const calculateProgramCompatibility = (
  program1: string,
  program2: string
): number => {
  // Exact match
  if (program1.toLowerCase() === program2.toLowerCase()) return 100

  // Same category (12-step, secular, etc.) = high compatibility
  const categories: Record<string, string[]> = {
    '12-step': ['Alcoholics Anonymous (AA)', 'Narcotics Anonymous (NA)'],
    secular: [
      'SMART Recovery',
      'LifeRing Secular Recovery',
      'Secular Organizations for Sobriety (SOS)',
    ],
    spiritual: ['Refuge Recovery', 'Dharma Recovery'],
  }

  for (const [_, programs] of Object.entries(categories)) {
    if (programs.includes(program1) && programs.includes(program2)) {
      return 80 // Same category = 80%
    }
  }

  // Different categories = moderate compatibility
  return 40
}
