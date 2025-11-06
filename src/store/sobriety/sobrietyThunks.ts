/**
 * Sobriety Redux Thunks
 * Async operations for sobriety tracking
 * Feature: 002-app-screens
 */

import { createAsyncThunk } from '@reduxjs/toolkit'
import { sobrietyService } from '../../services/sobrietyService'
import {
  setRecord,
  setMilestones,
  setLoading,
  setSaving,
  setError,
  clearError,
  updateDaysSober,
} from './sobrietySlice'
import type { SobrietyRecordFormData } from '../../types'

/**
 * Fetch sobriety record for user
 */
export const fetchSobrietyRecord = createAsyncThunk(
  'sobriety/fetchRecord',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true))
      dispatch(clearError())

      const { data, error } = await sobrietyService.getRecord(userId)

      if (error) {
        dispatch(setError(error.message))
        return rejectWithValue(error.message)
      }

      if (data) {
        // Calculate days sober
        const daysSober = sobrietyService.calculateDaysSober(
          data.current_sobriety_start_date
        )
        const recordWithCalc = { ...data, daysSober }

        dispatch(setRecord(recordWithCalc))

        // Fetch and set milestone status
        const milestoneStatus = sobrietyService.getMilestoneStatus(
          daysSober,
          data.milestones || []
        )
        dispatch(setMilestones(milestoneStatus))

        return recordWithCalc
      }

      dispatch(setRecord(null))
      return null
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch sobriety record'
      dispatch(setError(message))
      return rejectWithValue(message)
    } finally {
      dispatch(setLoading(false))
    }
  }
)

/**
 * Create sobriety record for new user
 */
export const createSobrietyRecord = createAsyncThunk(
  'sobriety/createRecord',
  async (
    { userId, recordData }: { userId: string; recordData: SobrietyRecordFormData },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setSaving(true))
      dispatch(clearError())

      const { data, error } = await sobrietyService.createRecord(userId, recordData)

      if (error) {
        dispatch(setError(error.message))
        return rejectWithValue(error.message)
      }

      // Calculate days sober
      const daysSober = sobrietyService.calculateDaysSober(
        data.current_sobriety_start_date
      )
      const recordWithCalc = { ...data, daysSober }

      dispatch(setRecord(recordWithCalc))

      // Initialize milestones
      const milestoneStatus = sobrietyService.getMilestoneStatus(daysSober, [])
      dispatch(setMilestones(milestoneStatus))

      return recordWithCalc
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create sobriety record'
      dispatch(setError(message))
      return rejectWithValue(message)
    } finally {
      dispatch(setSaving(false))
    }
  }
)

/**
 * Update sobriety record
 */
export const updateSobrietyRecord = createAsyncThunk(
  'sobriety/updateRecord',
  async (
    { userId, updates }: { userId: string; updates: Partial<SobrietyRecordFormData> },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setSaving(true))
      dispatch(clearError())

      const { data, error } = await sobrietyService.updateRecord(userId, updates)

      if (error) {
        dispatch(setError(error.message))
        return rejectWithValue(error.message)
      }

      // Calculate days sober
      const daysSober = sobrietyService.calculateDaysSober(
        data.current_sobriety_start_date
      )
      const recordWithCalc = { ...data, daysSober }

      dispatch(setRecord(recordWithCalc))

      // Update milestones
      const milestoneStatus = sobrietyService.getMilestoneStatus(
        daysSober,
        data.milestones || []
      )
      dispatch(setMilestones(milestoneStatus))

      return recordWithCalc
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update sobriety record'
      dispatch(setError(message))
      return rejectWithValue(message)
    } finally {
      dispatch(setSaving(false))
    }
  }
)

/**
 * Record a relapse event
 */
export const recordRelapse = createAsyncThunk(
  'sobriety/recordRelapse',
  async (
    { userId, relapseDate, notes }: { userId: string; relapseDate: string; notes?: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setSaving(true))
      dispatch(clearError())

      const { data, error } = await sobrietyService.recordRelapse(
        userId,
        relapseDate,
        notes
      )

      if (error) {
        dispatch(setError(error.message))
        return rejectWithValue(error.message)
      }

      // Calculate days sober from new start date
      const daysSober = sobrietyService.calculateDaysSober(
        data.current_sobriety_start_date
      )
      const recordWithCalc = { ...data, daysSober }

      dispatch(setRecord(recordWithCalc))

      // Reset milestones
      const milestoneStatus = sobrietyService.getMilestoneStatus(
        daysSober,
        data.milestones || []
      )
      dispatch(setMilestones(milestoneStatus))

      return recordWithCalc
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to record relapse'
      dispatch(setError(message))
      return rejectWithValue(message)
    } finally {
      dispatch(setSaving(false))
    }
  }
)

/**
 * Refresh days sober calculation
 * Call this periodically (e.g., when app becomes active)
 */
export const refreshDaysSober = createAsyncThunk(
  'sobriety/refreshDaysSober',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      const { data, error } = await sobrietyService.getRecord(userId)

      if (error) {
        return rejectWithValue(error.message)
      }

      if (data) {
        const daysSober = sobrietyService.calculateDaysSober(
          data.current_sobriety_start_date
        )
        dispatch(updateDaysSober(daysSober))

        // Check for new milestones
        const milestoneStatus = sobrietyService.getMilestoneStatus(
          daysSober,
          data.milestones || []
        )
        dispatch(setMilestones(milestoneStatus))

        return daysSober
      }

      return 0
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to refresh days sober'
      return rejectWithValue(message)
    }
  }
)

/**
 * Check for newly achieved milestones
 */
export const checkNewMilestones = createAsyncThunk(
  'sobriety/checkNewMilestones',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      const { data, error } = await sobrietyService.getRecord(userId)

      if (error) {
        return rejectWithValue(error.message)
      }

      if (data) {
        const daysSober = sobrietyService.calculateDaysSober(
          data.current_sobriety_start_date
        )
        const newMilestones = sobrietyService.checkNewMilestones(
          daysSober,
          data.milestones || []
        )

        return newMilestones
      }

      return []
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to check new milestones'
      return rejectWithValue(message)
    }
  }
)
