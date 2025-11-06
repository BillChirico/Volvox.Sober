/**
 * Matching domain types
 * Feature: 002-app-screens
 */

import { Tables } from './database.types'
import { Profile } from './profile'

// ============================================================
// Base Match Types
// ============================================================

export type MatchStatus = 'suggested' | 'requested' | 'declined' | 'connected'

export interface Match extends Tables<'matches'> {}

export interface MatchWithProfile extends Match {
  candidate: Profile
  declineCooldownExpiresAt?: string // Calculated from declined_at + 30 days
}

// ============================================================
// Matching Algorithm Types
// ============================================================

export interface MatchCriteria {
  userId: string
  userRole: 'sponsor' | 'sponsee' | 'both'
  recoveryProgram: string
  location: {
    city?: string
    state?: string
    country: string
  }
  availability: string[]
  preferences: Record<string, unknown>
}

export interface CompatibilityFactors {
  recoveryProgramMatch: number // 0-100
  locationProximity: number // 0-100
  availabilityOverlap: number // 0-100
  preferenceAlignment: number // 0-100
  experienceLevel: number // 0-100
}

export interface MatchScore {
  totalScore: number // 0-100
  factors: CompatibilityFactors
  explanation: string
}

// ============================================================
// Match Actions
// ============================================================

export interface MatchActionPayload {
  matchId: string
  userId: string
}

export interface DeclineMatchPayload extends MatchActionPayload {
  declinedAt: string
}

export interface RequestConnectionPayload extends MatchActionPayload {
  requestedAt: string
}

// ============================================================
// UI State Types
// ============================================================

export interface MatchesState {
  suggestedMatches: MatchWithProfile[]
  requestedMatches: MatchWithProfile[]
  declinedMatches: MatchWithProfile[]
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
}

export interface MatchCardData extends MatchWithProfile {
  isLoading?: boolean // For action button states
}

export interface MatchSwipeResult {
  matchId: string
  direction: 'left' | 'right' // left = decline, right = request
}
