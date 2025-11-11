/**
 * useProfile Hook
 * Custom hook for profile operations
 * Feature: 002-app-screens
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/useAppDispatch';
import {
  fetchProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  updateProfilePhoto,
} from '../store/profileThunks';
import {
  selectProfile,
  selectProfileLoading,
  selectProfileSaving,
  selectProfileError,
  selectHasProfile,
  selectUserRole,
  selectIsSponsor,
  selectIsSponsee,
  selectProfileCompletionPercentage,
  selectIsProfileComplete,
  selectRecoveryProgram,
  selectUserLocation,
  selectAvailability,
  selectDisplayName,
  selectIsProfileOperationInProgress,
  selectProfileSummary,
} from '../store/profileSelectors';
import { clearError } from '../store/profileSlice';
import type { ProfileFormData } from '../types';

/**
 * Hook for managing user profile
 */
export const useProfile = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const profile = useAppSelector(selectProfile);
  const isLoading = useAppSelector(selectProfileLoading);
  const isSaving = useAppSelector(selectProfileSaving);
  const error = useAppSelector(selectProfileError);
  const hasProfile = useAppSelector(selectHasProfile);
  const userRole = useAppSelector(selectUserRole);
  const isSponsor = useAppSelector(selectIsSponsor);
  const isSponsee = useAppSelector(selectIsSponsee);
  const completionPercentage = useAppSelector(selectProfileCompletionPercentage);
  const isComplete = useAppSelector(selectIsProfileComplete);
  const recoveryProgram = useAppSelector(selectRecoveryProgram);
  const location = useAppSelector(selectUserLocation);
  const availability = useAppSelector(selectAvailability);
  const displayName = useAppSelector(selectDisplayName);
  const isOperationInProgress = useAppSelector(selectIsProfileOperationInProgress);
  const summary = useAppSelector(selectProfileSummary);

  // Actions
  const fetch = useCallback(
    (userId: string) => {
      return dispatch(fetchProfile(userId));
    },
    [dispatch],
  );

  const create = useCallback(
    (userId: string, profileData: ProfileFormData) => {
      return dispatch(createProfile({ userId, profileData }));
    },
    [dispatch],
  );

  const update = useCallback(
    (userId: string, updates: Partial<ProfileFormData>) => {
      return dispatch(updateProfile({ userId, updates }));
    },
    [dispatch],
  );

  const remove = useCallback(
    (userId: string) => {
      return dispatch(deleteProfile(userId));
    },
    [dispatch],
  );

  const updatePhoto = useCallback(
    (userId: string, photoUrl: string) => {
      return dispatch(updateProfilePhoto({ userId, photoUrl }));
    },
    [dispatch],
  );

  const dismissError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // State
    profile,
    isLoading,
    isSaving,
    error,
    hasProfile,
    userRole,
    isSponsor,
    isSponsee,
    completionPercentage,
    isComplete,
    recoveryProgram,
    location,
    availability,
    displayName,
    isOperationInProgress,
    summary,

    // Actions
    fetch,
    create,
    update,
    remove,
    updatePhoto,
    dismissError,
  };
};
