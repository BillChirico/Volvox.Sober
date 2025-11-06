/**
 * Matching Service
 * Sponsor/Sponsee matching algorithm and operations
 * Feature: 002-app-screens
 */

import supabaseClient from './supabase'
import {
  Match,
  MatchWithProfile,
  MatchCriteria,
  MatchScore,
  CompatibilityFactors,
  Profile,
  TablesInsert,
  TablesUpdate,
} from '../types'

class MatchingService {
  /**
   * Get suggested matches for a user
   */
  async getSuggestedMatches(
    userId: string
  ): Promise<{ data: MatchWithProfile[]; error: Error | null }> {
    try {
      const { data: matches, error } = await supabaseClient
        .from('matches')
        .select(
          `
          *,
          candidate:profiles!matches_candidate_id_fkey(*)
        `
        )
        .eq('user_id', userId)
        .eq('status', 'suggested')
        .order('compatibility_score', { ascending: false })
        .limit(20)

      if (error) throw error

      const matchesWithProfiles = (matches || []).map(match => ({
        ...match,
        candidate: match.candidate as unknown as Profile,
        declineCooldownExpiresAt: match.declined_at
          ? this.calculateCooldownExpiry(match.declined_at)
          : undefined,
      }))

      return { data: matchesWithProfiles, error: null }
    } catch (error) {
      return { data: [], error: error as Error }
    }
  }

  /**
   * Get requested matches (connection requests sent)
   */
  async getRequestedMatches(
    userId: string
  ): Promise<{ data: MatchWithProfile[]; error: Error | null }> {
    try {
      const { data: matches, error } = await supabaseClient
        .from('matches')
        .select(
          `
          *,
          candidate:profiles!matches_candidate_id_fkey(*)
        `
        )
        .eq('user_id', userId)
        .eq('status', 'requested')
        .order('requested_at', { ascending: false })

      if (error) throw error

      const matchesWithProfiles = (matches || []).map(match => ({
        ...match,
        candidate: match.candidate as unknown as Profile,
      }))

      return { data: matchesWithProfiles, error: null }
    } catch (error) {
      return { data: [], error: error as Error }
    }
  }

  /**
   * Create a new match
   */
  async createMatch(
    userId: string,
    candidateId: string,
    compatibilityScore: number
  ): Promise<{ data: Match | null; error: Error | null }> {
    try {
      const insertData: TablesInsert<'matches'> = {
        user_id: userId,
        candidate_id: candidateId,
        compatibility_score: compatibilityScore,
        status: 'suggested',
        last_shown_at: new Date().toISOString(),
      }

      const { data, error } = await supabaseClient
        .from('matches')
        .insert(insertData)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  /**
   * Check daily connection request limit (5 per day)
   */
  async checkDailyRequestLimit(
    userId: string
  ): Promise<{ withinLimit: boolean; count: number; error: Error | null }> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayISO = today.toISOString()

      const { count, error } = await supabaseClient
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'requested')
        .gte('requested_at', todayISO)

      if (error) throw error

      const requestCount = count || 0
      const withinLimit = requestCount < 5

      return { withinLimit, count: requestCount, error: null }
    } catch (error) {
      return { withinLimit: false, count: 0, error: error as Error }
    }
  }

  /**
   * Update match status (request, decline, connect)
   */
  async updateMatchStatus(
    matchId: string,
    status: 'requested' | 'declined' | 'connected',
    userId: string
  ): Promise<{ data: Match | null; error: Error | null }> {
    try {
      // Check rate limit for connection requests
      if (status === 'requested') {
        const { withinLimit, count } = await this.checkDailyRequestLimit(userId)
        if (!withinLimit) {
          throw new Error(
            `Daily connection request limit reached (${count}/5). Please try again tomorrow.`
          )
        }
      }

      const updateData: TablesUpdate<'matches'> = {
        status,
      }

      const timestamp = new Date().toISOString()

      if (status === 'requested') {
        updateData.requested_at = timestamp
      } else if (status === 'declined') {
        updateData.declined_at = timestamp
      } else if (status === 'connected') {
        updateData.connected_at = timestamp
      }

      const { data, error } = await supabaseClient
        .from('matches')
        .update(updateData)
        .eq('id', matchId)
        .eq('user_id', userId) // Ensure user owns this match
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  /**
   * Calculate compatibility score between user and candidate
   */
  calculateCompatibilityScore(
    userCriteria: MatchCriteria,
    candidate: Profile
  ): MatchScore {
    const factors: CompatibilityFactors = {
      recoveryProgramMatch: this.calculateRecoveryProgramMatch(
        userCriteria.recoveryProgram,
        candidate.recovery_program
      ),
      locationProximity: this.calculateLocationProximity(
        userCriteria.location,
        {
          city: candidate.city,
          state: candidate.state,
          country: candidate.country,
        }
      ),
      availabilityOverlap: this.calculateAvailabilityOverlap(
        userCriteria.availability,
        candidate.availability
      ),
      preferenceAlignment: this.calculatePreferenceAlignment(
        userCriteria.preferences,
        candidate.preferences
      ),
      experienceLevel: this.calculateExperienceLevel(
        candidate.sobriety_start_date
      ),
    }

    // Weighted average
    const weights = {
      recoveryProgramMatch: 0.3,
      locationProximity: 0.2,
      availabilityOverlap: 0.2,
      preferenceAlignment: 0.15,
      experienceLevel: 0.15,
    }

    const totalScore = Math.round(
      factors.recoveryProgramMatch * weights.recoveryProgramMatch +
        factors.locationProximity * weights.locationProximity +
        factors.availabilityOverlap * weights.availabilityOverlap +
        factors.preferenceAlignment * weights.preferenceAlignment +
        factors.experienceLevel * weights.experienceLevel
    )

    return {
      totalScore,
      factors,
      explanation: this.generateExplanation(factors),
    }
  }

  private calculateRecoveryProgramMatch(
    userProgram: string,
    candidateProgram: string
  ): number {
    return userProgram.toLowerCase() === candidateProgram.toLowerCase() ? 100 : 50
  }

  private calculateLocationProximity(
    userLocation: { city?: string; state?: string; country: string },
    candidateLocation: { city?: string; state?: string; country: string }
  ): number {
    if (userLocation.country !== candidateLocation.country) return 0
    if (userLocation.state !== candidateLocation.state) return 50
    if (userLocation.city === candidateLocation.city) return 100
    return 75 // Same state, different city
  }

  private calculateAvailabilityOverlap(
    userAvailability: string[],
    candidateAvailability: string[]
  ): number {
    if (
      userAvailability.includes('anytime') ||
      candidateAvailability.includes('anytime')
    ) {
      return 100
    }

    const overlap = userAvailability.filter(slot =>
      candidateAvailability.includes(slot)
    )

    if (overlap.length === 0) return 0
    return Math.min(100, (overlap.length / userAvailability.length) * 100)
  }

  private calculatePreferenceAlignment(
    userPreferences: Record<string, unknown>,
    candidatePreferences: Record<string, unknown>
  ): number {
    // Simplified preference matching
    // In production, this would check specific preference fields
    return 75 // Default moderate alignment
  }

  private calculateExperienceLevel(sobrietyStartDate?: string): number {
    if (!sobrietyStartDate) return 50

    const startDate = new Date(sobrietyStartDate)
    const today = new Date()
    const daysSober = Math.floor(
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSober >= 365) return 100 // 1+ years
    if (daysSober >= 180) return 85 // 6+ months
    if (daysSober >= 90) return 70 // 3+ months
    if (daysSober >= 30) return 55 // 1+ month
    return 40 // Less than 1 month
  }

  private generateExplanation(factors: CompatibilityFactors): string {
    const strengths: string[] = []

    if (factors.recoveryProgramMatch === 100) {
      strengths.push('Same recovery program')
    }
    if (factors.locationProximity >= 75) {
      strengths.push('Nearby location')
    }
    if (factors.availabilityOverlap >= 75) {
      strengths.push('Compatible schedules')
    }
    if (factors.experienceLevel >= 85) {
      strengths.push('Experienced in recovery')
    }

    if (strengths.length === 0) {
      return 'Moderate compatibility based on profile'
    }

    return strengths.join(', ')
  }

  /**
   * Calculate decline cooldown expiry (30 days from decline)
   */
  private calculateCooldownExpiry(declinedAt: string): string {
    const declined = new Date(declinedAt)
    const expiry = new Date(declined)
    expiry.setDate(expiry.getDate() + 30)
    return expiry.toISOString()
  }
}

export default new MatchingService()
