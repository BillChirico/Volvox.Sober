/**
 * Matches Redux Slice
 * Manages matching state with filtering
 * Feature: 002-app-screens
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { MatchesState, MatchWithProfile } from '../../types'

const initialState: MatchesState = {
  suggestedMatches: [],
  requestedMatches: [],
  declinedMatches: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
}

const matchesSlice = createSlice({
  name: 'matches',
  initialState,
  reducers: {
    setSuggestedMatches: (state, action: PayloadAction<MatchWithProfile[]>) => {
      state.suggestedMatches = action.payload
      state.error = null
    },
    setRequestedMatches: (state, action: PayloadAction<MatchWithProfile[]>) => {
      state.requestedMatches = action.payload
      state.error = null
    },
    setDeclinedMatches: (state, action: PayloadAction<MatchWithProfile[]>) => {
      state.declinedMatches = action.payload
      state.error = null
    },
    addSuggestedMatch: (state, action: PayloadAction<MatchWithProfile>) => {
      state.suggestedMatches.push(action.payload)
    },
    removeSuggestedMatch: (state, action: PayloadAction<string>) => {
      state.suggestedMatches = state.suggestedMatches.filter(
        (match) => match.id !== action.payload
      )
    },
    moveToRequested: (state, action: PayloadAction<string>) => {
      const match = state.suggestedMatches.find((m) => m.id === action.payload)
      if (match) {
        state.suggestedMatches = state.suggestedMatches.filter(
          (m) => m.id !== action.payload
        )
        state.requestedMatches.unshift({ ...match, status: 'requested' })
      }
    },
    moveToDeclined: (state, action: PayloadAction<string>) => {
      const match = state.suggestedMatches.find((m) => m.id === action.payload)
      if (match) {
        state.suggestedMatches = state.suggestedMatches.filter(
          (m) => m.id !== action.payload
        )
        state.declinedMatches.unshift({ ...match, status: 'declined' })
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.isRefreshing = action.payload
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isLoading = false
      state.isRefreshing = false
    },
    clearError: (state) => {
      state.error = null
    },
    clearMatches: (state) => {
      state.suggestedMatches = []
      state.requestedMatches = []
      state.declinedMatches = []
      state.isLoading = false
      state.isRefreshing = false
      state.error = null
    },
  },
})

export const {
  setSuggestedMatches,
  setRequestedMatches,
  setDeclinedMatches,
  addSuggestedMatch,
  removeSuggestedMatch,
  moveToRequested,
  moveToDeclined,
  setLoading,
  setRefreshing,
  setError,
  clearError,
  clearMatches,
} = matchesSlice.actions

export default matchesSlice.reducer
