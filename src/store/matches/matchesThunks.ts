/**
 * Matches Redux Thunks
 * Async operations for matching system
 * Feature: 002-app-screens
 */

import { createAsyncThunk } from '@reduxjs/toolkit'
import { matchingService } from '../../services/matchingService'
import {
  setSuggestedMatches,
  setRequestedMatches,
  setDeclinedMatches,
  moveToRequested,
  moveToDeclined,
  setLoading,
  setRefreshing,
  setError,
  clearError,
} from './matchesSlice'

/**
 * Fetch suggested matches for user
 */
export const fetchSuggestedMatches = createAsyncThunk(
  'matches/fetchSuggested',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true))
      dispatch(clearError())

      const { data, error } = await matchingService.getSuggestedMatches(userId)

      if (error) {
        dispatch(setError(error.message))
        return rejectWithValue(error.message)
      }

      dispatch(setSuggestedMatches(data))
      return data
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch suggested matches'
      dispatch(setError(message))
      return rejectWithValue(message)
    } finally {
      dispatch(setLoading(false))
    }
  }
)

/**
 * Fetch all matches grouped by status
 */
export const fetchAllMatches = createAsyncThunk(
  'matches/fetchAll',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true))
      dispatch(clearError())

      const { data, error } = await matchingService.getAllMatches(userId)

      if (error) {
        dispatch(setError(error.message))
        return rejectWithValue(error.message)
      }

      // Group by status
      const suggested = data.filter((m) => m.status === 'suggested')
      const requested = data.filter((m) => m.status === 'requested')
      const declined = data.filter((m) => m.status === 'declined')

      dispatch(setSuggestedMatches(suggested))
      dispatch(setRequestedMatches(requested))
      dispatch(setDeclinedMatches(declined))

      return data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch matches'
      dispatch(setError(message))
      return rejectWithValue(message)
    } finally {
      dispatch(setLoading(false))
    }
  }
)

/**
 * Refresh suggested matches (pull-to-refresh)
 */
export const refreshSuggestedMatches = createAsyncThunk(
  'matches/refreshSuggested',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setRefreshing(true))
      dispatch(clearError())

      const { data, error } = await matchingService.getSuggestedMatches(userId)

      if (error) {
        dispatch(setError(error.message))
        return rejectWithValue(error.message)
      }

      dispatch(setSuggestedMatches(data))
      return data
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to refresh matches'
      dispatch(setError(message))
      return rejectWithValue(message)
    } finally {
      dispatch(setRefreshing(false))
    }
  }
)

/**
 * Send connection request (move to requested)
 * Rate limited to 5 requests per day
 */
export const sendConnectionRequest = createAsyncThunk(
  'matches/sendRequest',
  async (
    { userId, matchId }: { userId: string; matchId: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(clearError())

      const { data, error } = await matchingService.updateMatchStatus(
        matchId,
        'requested',
        userId
      )

      if (error) {
        dispatch(setError(error.message))
        return rejectWithValue(error.message)
      }

      dispatch(moveToRequested(matchId))
      return data
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to send connection request'
      dispatch(setError(message))
      return rejectWithValue(message)
    }
  }
)

/**
 * Decline match (move to declined with 30-day cooldown)
 */
export const declineMatch = createAsyncThunk(
  'matches/declineMatch',
  async (
    { userId, matchId }: { userId: string; matchId: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(clearError())

      const { data, error } = await matchingService.updateMatchStatus(
        matchId,
        'declined',
        userId
      )

      if (error) {
        dispatch(setError(error.message))
        return rejectWithValue(error.message)
      }

      dispatch(moveToDeclined(matchId))
      return data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to decline match'
      dispatch(setError(message))
      return rejectWithValue(message)
    }
  }
)

/**
 * Calculate compatibility score for potential match
 */
export const calculateCompatibility = createAsyncThunk(
  'matches/calculateCompatibility',
  async (
    {
      userId,
      candidateId,
    }: {
      userId: string
      candidateId: string
    },
    { rejectWithValue }
  ) => {
    try {
      const { data, error } = await matchingService.calculateCompatibility(
        userId,
        candidateId
      )

      if (error) {
        return rejectWithValue(error.message)
      }

      return data
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to calculate compatibility'
      return rejectWithValue(message)
    }
  }
)
