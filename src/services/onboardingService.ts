/**
 * Onboarding Service
 * Manage user onboarding progress and navigation
 * Feature: 002-app-screens
 */

import supabaseClient from './supabase'
import {
  OnboardingProgress,
  OnboardingStep,
  OnboardingStepInfo,
  TablesInsert,
  TablesUpdate,
} from '../types'

class OnboardingService {
  /**
   * Get user's onboarding progress
   */
  async getProgress(
    userId: string
  ): Promise<{ data: OnboardingProgress | null; error: Error | null }> {
    try {
      const { data, error } = await supabaseClient
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        // If no record exists, create one
        if (error.code === 'PGRST116') {
          return await this.createProgress(userId)
        }
        throw error
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  /**
   * Create initial onboarding progress record
   */
  async createProgress(
    userId: string
  ): Promise<{ data: OnboardingProgress | null; error: Error | null }> {
    try {
      const insertData: TablesInsert<'onboarding_progress'> = {
        user_id: userId,
        welcome_completed: false,
        role_selected: false,
        profile_form_completed: false,
        onboarding_completed: false,
        last_step: 'welcome',
      }

      const { data, error } = await supabaseClient
        .from('onboarding_progress')
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
   * Update onboarding progress
   */
  async updateProgress(
    userId: string,
    updates: Partial<OnboardingProgress>
  ): Promise<{ data: OnboardingProgress | null; error: Error | null }> {
    try {
      const updateData: TablesUpdate<'onboarding_progress'> = updates

      const { data, error } = await supabaseClient
        .from('onboarding_progress')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  /**
   * Mark a step as completed and update progress
   */
  async completeStep(
    userId: string,
    step: OnboardingStep
  ): Promise<{ data: OnboardingProgress | null; error: Error | null }> {
    try {
      const stepMap: Record<
        OnboardingStep,
        Partial<TablesUpdate<'onboarding_progress'>>
      > = {
        welcome: {
          welcome_completed: true,
          last_step: 'welcome',
        },
        email_verification: {
          last_step: 'email_verification',
        },
        role_selection: {
          role_selected: true,
          last_step: 'role_selection',
        },
        sponsor_profile: {
          profile_form_completed: true,
          last_step: 'sponsor_profile',
        },
        sponsee_profile: {
          profile_form_completed: true,
          last_step: 'sponsee_profile',
        },
        complete: {
          onboarding_completed: true,
          last_step: 'complete',
        },
      }

      const updates = stepMap[step]

      // Check if onboarding is being marked complete
      if (updates.onboarding_completed) {
        const updateData: TablesUpdate<'onboarding_progress'> = {
          ...updates,
        }

        const { data, error } = await supabaseClient
          .from('onboarding_progress')
          .update(updateData)
          .eq('user_id', userId)
          .select()
          .single()

        if (error) throw error

        return { data, error: null }
      }

      return await this.updateProgress(userId, updates)
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  /**
   * Get onboarding step information with accessibility
   */
  getStepInfo(progress: OnboardingProgress | null): OnboardingStepInfo[] {
    const steps: OnboardingStepInfo[] = [
      {
        step: 'welcome',
        title: 'Welcome',
        description: 'Welcome to Volvox.Sober',
        isCompleted: progress?.welcome_completed || false,
        isAccessible: true,
      },
      {
        step: 'email_verification',
        title: 'Verify Email',
        description: 'Confirm your email address',
        isCompleted: false, // Determined by auth.users.email_confirmed_at
        isAccessible: progress?.welcome_completed || false,
      },
      {
        step: 'role_selection',
        title: 'Select Role',
        description: 'Choose your role in recovery',
        isCompleted: progress?.role_selected || false,
        isAccessible: progress?.welcome_completed || false,
      },
      {
        step: 'sponsor_profile',
        title: 'Sponsor Profile',
        description: 'Complete your sponsor profile',
        isCompleted: progress?.profile_form_completed || false,
        isAccessible: progress?.role_selected || false,
      },
      {
        step: 'sponsee_profile',
        title: 'Sponsee Profile',
        description: 'Complete your sponsee profile',
        isCompleted: progress?.profile_form_completed || false,
        isAccessible: progress?.role_selected || false,
      },
      {
        step: 'complete',
        title: 'Complete',
        description: 'Onboarding complete',
        isCompleted: progress?.onboarding_completed || false,
        isAccessible: progress?.profile_form_completed || false,
      },
    ]

    return steps
  }

  /**
   * Determine next onboarding step
   */
  getNextStep(progress: OnboardingProgress | null, role?: string): OnboardingStep {
    if (!progress || !progress.welcome_completed) {
      return 'welcome'
    }

    // Email verification is handled by auth, check in component
    if (!progress.role_selected) {
      return 'role_selection'
    }

    if (!progress.profile_form_completed) {
      return role === 'sponsor' ? 'sponsor_profile' : 'sponsee_profile'
    }

    if (!progress.onboarding_completed) {
      return 'complete'
    }

    return 'complete' // Already complete
  }

  /**
   * Check if onboarding is complete
   */
  isOnboardingComplete(progress: OnboardingProgress | null): boolean {
    return progress?.onboarding_completed || false
  }
}

export default new OnboardingService()
