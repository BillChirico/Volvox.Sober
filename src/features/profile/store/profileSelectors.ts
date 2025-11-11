/**
 * Profile Redux Selectors
 * Memoized selectors for profile state
 * Feature: 002-app-screens
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../store/index';

/**
 * Base selector for profile state
 */
export const selectProfileState = (state: RootState) => state.profile;

/**
 * Select current user profile
 */
export const selectProfile = createSelector(
  [selectProfileState],
  profileState => profileState.profile,
);

/**
 * Select profile loading state
 */
export const selectProfileLoading = createSelector(
  [selectProfileState],
  profileState => profileState.isLoading,
);

/**
 * Select profile saving state
 */
export const selectProfileSaving = createSelector(
  [selectProfileState],
  profileState => profileState.isSaving,
);

/**
 * Select profile error
 */
export const selectProfileError = createSelector(
  [selectProfileState],
  profileState => profileState.error,
);

/**
 * Select if profile exists
 */
export const selectHasProfile = createSelector(
  [selectProfile],
  (profile): boolean => profile !== null,
);

/**
 * Select user role
 */
export const selectUserRole = createSelector(
  [selectProfile],
  (profile): 'sponsor' | 'sponsee' | 'both' | null => profile?.role || null,
);

/**
 * Select if user is a sponsor
 */
export const selectIsSponsor = createSelector(
  [selectUserRole],
  (role): boolean => role === 'sponsor' || role === 'both',
);

/**
 * Select if user is a sponsee
 */
export const selectIsSponsee = createSelector(
  [selectUserRole],
  (role): boolean => role === 'sponsee' || role === 'both',
);

/**
 * Select profile completion percentage
 */
export const selectProfileCompletionPercentage = createSelector(
  [selectProfile],
  (profile): number => profile?.profile_completion_percentage || 0,
);

/**
 * Select if profile is complete (>= 80%)
 */
export const selectIsProfileComplete = createSelector(
  [selectProfileCompletionPercentage],
  (percentage): boolean => percentage >= 80,
);

/**
 * Select recovery program
 */
export const selectRecoveryProgram = createSelector(
  [selectProfile],
  (profile): string | null => profile?.recovery_program || null,
);

/**
 * Select user location
 */
export const selectUserLocation = createSelector(
  [selectProfile],
  (profile): { city?: string; state?: string; country: string } | null => {
    if (!profile) return null;
    return {
      city: profile.city,
      state: profile.state,
      country: profile.country,
    };
  },
);

/**
 * Select availability schedule
 */
export const selectAvailability = createSelector(
  [selectProfile],
  (profile): string[] => profile?.availability || [],
);

/**
 * Select profile photo URL
 */
export const selectProfilePhotoUrl = createSelector(
  [selectProfile],
  (profile): string | null => profile?.profile_photo_url || null,
);

/**
 * Select user preferences
 */
export const selectUserPreferences = createSelector(
  [selectProfile],
  (profile): Record<string, unknown> => profile?.preferences || {},
);

/**
 * Select sobriety start date
 */
export const selectSobrietyStartDate = createSelector(
  [selectProfile],
  (profile): string | null => profile?.sobriety_start_date || null,
);

/**
 * Select profile display name
 */
export const selectDisplayName = createSelector(
  [selectProfile],
  (profile): string => profile?.name || 'User',
);

/**
 * Select profile bio
 */
export const selectBio = createSelector(
  [selectProfile],
  (profile): string | null => profile?.bio || null,
);

/**
 * Select if any operation is in progress
 */
export const selectIsProfileOperationInProgress = createSelector(
  [selectProfileLoading, selectProfileSaving],
  (isLoading, isSaving): boolean => isLoading || isSaving,
);

/**
 * Select profile summary for display
 */
export const selectProfileSummary = createSelector(
  [selectProfile],
  (
    profile,
  ): {
    name: string;
    role: string;
    recoveryProgram: string;
    location: string;
    photoUrl: string | null;
  } | null => {
    if (!profile) return null;

    const locationParts = [profile.city, profile.state, profile.country].filter(Boolean);
    const location = locationParts.join(', ');

    return {
      name: profile.name,
      role: profile.role,
      recoveryProgram: profile.recovery_program,
      location,
      photoUrl: profile.profile_photo_url || null,
    };
  },
);
