/**
 * Profile Service
 * CRUD operations for user profiles
 * Feature: 002-app-screens
 */

import supabaseClient from '../../../services/supabase';
import sobrietyService from '../../../services/sobrietyService';
import {
  Profile,
  ProfileFormData,
  ProfileValidationResult,
  MatchingPreferences,
  TablesInsert,
  TablesUpdate,
} from '../types';

class ProfileService {
  /**
   * Get the current user's profile
   */
  async getProfile(userId: string): Promise<{ data: Profile | null; error: Error | null }> {
    try {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .is('deleted_at', null)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Create a new profile for a user
   */
  async createProfile(
    userId: string,
    profileData: ProfileFormData,
  ): Promise<{ data: Profile | null; error: Error | null }> {
    try {
      console.log('[ProfileService] Creating profile for userId:', userId);
      console.log('[ProfileService] Profile data received:', JSON.stringify(profileData, null, 2));

      // CRITICAL: Verify auth session before attempting RLS-protected operation
      // Try multiple times with delays to handle session persistence timing
      let session = null;
      let sessionError = null;
      const maxRetries = 3;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        const result = await supabaseClient.auth.getSession();
        session = result.data.session;
        sessionError = result.error;

        console.log(`[ProfileService] Auth session check (attempt ${attempt + 1}/${maxRetries}):`, {
          hasSession: !!session,
          sessionUserId: session?.user?.id,
          matchesUserId: session?.user?.id === userId,
          error: sessionError,
        });

        if (session && session.user.id === userId) {
          break; // Session found and valid
        }

        if (attempt < maxRetries - 1) {
          // Wait before retrying (session might be persisting to SecureStore)
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      if (!session || session.user.id !== userId) {
        const errorMsg = !session
          ? 'No active auth session after ' +
            maxRetries +
            ' attempts - user must be logged in to create profile'
          : `Session user ID (${session.user.id}) does not match profile user ID (${userId})`;
        console.error('[ProfileService] Session validation failed:', errorMsg);
        throw new Error(errorMsg);
      }

      const completionPercentage = this.calculateCompletionPercentage(profileData);

      const insertData: TablesInsert<'profiles'> = {
        id: userId,
        name: profileData.name,
        bio: profileData.bio,
        role: profileData.role,
        recovery_program: profileData.recovery_program,
        // Convert empty string to undefined for date field (PostgreSQL treats undefined as NULL)
        sobriety_start_date: profileData.sobriety_start_date || undefined,
        city: profileData.city,
        state: profileData.state,
        country: profileData.country || 'United States',
        availability: profileData.availability,
        preferences: (profileData.preferences as Record<string, unknown>) || {},
        profile_completion_percentage: completionPercentage,
      };

      console.log('[ProfileService] Insert data:', JSON.stringify(insertData, null, 2));

      const { data, error } = await supabaseClient
        .from('profiles')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('[ProfileService] Supabase insert error:', error);
        throw error;
      }

      console.log('[ProfileService] Profile created successfully:', data);

      // Create sobriety record if sobriety_start_date is provided
      // REQUIRED: sobriety_start_date is mandatory for all roles, so fail if record creation fails
      if (profileData.sobriety_start_date) {
        console.log(
          '[ProfileService] Creating sobriety record with start date:',
          profileData.sobriety_start_date,
        );

        const { error: sobrietyError } = await sobrietyService.createSobrietyRecord(
          userId,
          profileData.sobriety_start_date,
        );

        if (sobrietyError) {
          console.error('[ProfileService] Failed to create sobriety record:', sobrietyError);
          // CRITICAL: Since sobriety_start_date is required, fail profile creation if sobriety record fails
          throw new Error(
            `Failed to create sobriety record: ${sobrietyError.message}. Profile creation aborted.`,
          );
        }

        console.log('[ProfileService] Sobriety record created successfully');
      }

      return { data, error: null };
    } catch (error) {
      console.error('[ProfileService] Caught error:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Update an existing profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<ProfileFormData>,
  ): Promise<{ data: Profile | null; error: Error | null }> {
    try {
      // First get current profile to merge updates
      const { data: currentProfile, error: getError } = await this.getProfile(userId);

      if (getError || !currentProfile) {
        throw getError || new Error('Profile not found');
      }

      // Merge current profile with updates for completion calculation
      const mergedProfile: ProfileFormData = {
        name: updates.name || currentProfile.name,
        bio: updates.bio !== undefined ? updates.bio : currentProfile.bio,
        role: updates.role || currentProfile.role,
        recovery_program: updates.recovery_program || currentProfile.recovery_program,
        sobriety_start_date:
          updates.sobriety_start_date !== undefined
            ? updates.sobriety_start_date
            : currentProfile.sobriety_start_date,
        city: updates.city !== undefined ? updates.city : currentProfile.city,
        state: updates.state !== undefined ? updates.state : currentProfile.state,
        country: updates.country || currentProfile.country,
        availability: updates.availability || currentProfile.availability,
        preferences: updates.preferences || (currentProfile.preferences as MatchingPreferences),
      };

      const completionPercentage = this.calculateCompletionPercentage(mergedProfile);

      // Sanitize date field: convert empty string to undefined (PostgreSQL treats undefined as NULL)
      const sanitizedUpdates = { ...updates };
      if (sanitizedUpdates.sobriety_start_date === '') {
        sanitizedUpdates.sobriety_start_date = undefined;
      }

      const updateData: TablesUpdate<'profiles'> = {
        ...sanitizedUpdates,
        profile_completion_percentage: completionPercentage,
      };

      const { data, error } = await supabaseClient
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Soft delete a profile
   */
  async deleteProfile(userId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabaseClient
        .from('profiles')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Get profiles by IDs (for matches and connections)
   */
  async getProfilesByIds(userIds: string[]): Promise<{ data: Profile[]; error: Error | null }> {
    try {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .in('id', userIds)
        .is('deleted_at', null);

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: error as Error };
    }
  }

  /**
   * Calculate profile completion percentage
   */
  calculateCompletionPercentage(profile: ProfileFormData): number {
    const fields = {
      name: profile.name,
      bio: profile.bio,
      role: profile.role,
      recovery_program: profile.recovery_program,
      sobriety_start_date: profile.sobriety_start_date,
      city: profile.city,
      state: profile.state,
      availability: profile.availability?.length > 0,
    };

    const completedFields = Object.values(fields).filter(
      value => value !== undefined && value !== null && value !== '',
    ).length;

    return Math.round((completedFields / Object.keys(fields).length) * 100);
  }

  /**
   * Validate profile data
   */
  validateProfile(profile: Partial<ProfileFormData>): ProfileValidationResult {
    const errors: Record<string, string> = {};

    if (profile.name !== undefined && (!profile.name || profile.name.trim().length < 2)) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (profile.bio && profile.bio.length > 500) {
      errors.bio = 'Bio must be less than 500 characters';
    }

    if (profile.role !== undefined && !['sponsor', 'sponsee', 'both'].includes(profile.role)) {
      errors.role = 'Invalid role selected';
    }

    if (profile.recovery_program !== undefined && !profile.recovery_program) {
      errors.recovery_program = 'Recovery program is required';
    }

    if (profile.sobriety_start_date) {
      const date = new Date(profile.sobriety_start_date);
      const today = new Date();
      if (date > today) {
        errors.sobriety_start_date = 'Sobriety date cannot be in the future';
      }
    }

    const isValid = Object.keys(errors).length === 0;
    const completionPercentage = profile.name
      ? this.calculateCompletionPercentage(profile as ProfileFormData)
      : 0;

    return {
      isValid,
      errors,
      completionPercentage,
    };
  }
}

export default new ProfileService();
