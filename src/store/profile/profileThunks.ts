/**
 * Profile Redux Thunks
 * Async operations for profile management
 * Feature: 002-app-screens
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import profileService from '../../services/profileService';
import { setProfile, setLoading, setSaving, setError, clearError } from './profileSlice';
import type { ProfileFormData } from '../../types';

/**
 * Fetch user profile by ID
 */
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());

      const { data, error } = await profileService.getProfile(userId);

      if (error) {
        dispatch(setError(error.message));
        return rejectWithValue(error.message);
      }

      dispatch(setProfile(data));
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch profile';
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setLoading(false));
    }
  },
);

/**
 * Create new user profile
 */
export const createProfile = createAsyncThunk(
  'profile/createProfile',
  async (
    { userId, profileData }: { userId: string; profileData: ProfileFormData },
    { dispatch, rejectWithValue },
  ) => {
    try {
      dispatch(setSaving(true));
      dispatch(clearError());

      const { data, error } = await profileService.createProfile(userId, profileData);

      if (error) {
        dispatch(setError(error.message));
        return rejectWithValue(error.message);
      }

      dispatch(setProfile(data));
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create profile';
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setSaving(false));
    }
  },
);

/**
 * Update existing user profile
 */
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (
    { userId, updates }: { userId: string; updates: Partial<ProfileFormData> },
    { dispatch, rejectWithValue },
  ) => {
    try {
      dispatch(setSaving(true));
      dispatch(clearError());

      const { data, error } = await profileService.updateProfile(userId, updates);

      if (error) {
        dispatch(setError(error.message));
        return rejectWithValue(error.message);
      }

      dispatch(setProfile(data));
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setSaving(false));
    }
  },
);

/**
 * Soft delete user profile
 */
export const deleteProfile = createAsyncThunk(
  'profile/deleteProfile',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setSaving(true));
      dispatch(clearError());

      const { error } = await profileService.deleteProfile(userId);

      if (error) {
        dispatch(setError(error.message));
        return rejectWithValue(error.message);
      }

      dispatch(setProfile(null));
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete profile';
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setSaving(false));
    }
  },
);

/**
 * Update profile photo URL
 */
export const updateProfilePhoto = createAsyncThunk(
  'profile/updateProfilePhoto',
  async (
    { userId, photoUrl }: { userId: string; photoUrl: string },
    { dispatch, rejectWithValue },
  ) => {
    try {
      dispatch(setSaving(true));
      dispatch(clearError());

      const { data, error } = await profileService.updateProfile(userId, {
        profile_photo_url: photoUrl,
      });

      if (error) {
        dispatch(setError(error.message));
        return rejectWithValue(error.message);
      }

      dispatch(setProfile(data));
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update photo';
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setSaving(false));
    }
  },
);
