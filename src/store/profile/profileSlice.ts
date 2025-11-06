/**
 * Profile Redux Slice
 * Manages user profile state
 * Feature: 002-app-screens
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Profile, ProfileState } from '../../types'

const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  isSaving: false,
  error: null,
}

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<Profile | null>) => {
      state.profile = action.payload
      state.error = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setSaving: (state, action: PayloadAction<boolean>) => {
      state.isSaving = action.payload
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isLoading = false
      state.isSaving = false
    },
    clearError: (state) => {
      state.error = null
    },
    updateProfileField: (
      state,
      action: PayloadAction<{ field: keyof Profile; value: unknown }>
    ) => {
      if (state.profile) {
        state.profile = {
          ...state.profile,
          [action.payload.field]: action.payload.value,
        }
      }
    },
    clearProfile: (state) => {
      state.profile = null
      state.isLoading = false
      state.isSaving = false
      state.error = null
    },
  },
})

export const {
  setProfile,
  setLoading,
  setSaving,
  setError,
  clearError,
  updateProfileField,
  clearProfile,
} = profileSlice.actions

export default profileSlice.reducer
