/**
 * Sobriety Redux Slice
 * Manages sobriety tracking state with calculations
 * Feature: 002-app-screens
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SobrietyRecordWithCalculations, SobrietyState, MilestoneStatus } from '../../types';

const initialState: SobrietyState = {
  record: null,
  milestones: [],
  isLoading: false,
  isSaving: false,
  error: null,
};

const sobrietySlice = createSlice({
  name: 'sobriety',
  initialState,
  reducers: {
    setRecord: (state, action: PayloadAction<SobrietyRecordWithCalculations | null>) => {
      state.record = action.payload;
      state.error = null;
    },
    setMilestones: (state, action: PayloadAction<MilestoneStatus[]>) => {
      state.milestones = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSaving: (state, action: PayloadAction<boolean>) => {
      state.isSaving = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
      state.isSaving = false;
    },
    clearError: state => {
      state.error = null;
    },
    updateDaysSober: (state, action: PayloadAction<number>) => {
      if (state.record) {
        state.record.daysSober = action.payload;
      }
    },
    clearSobriety: state => {
      state.record = null;
      state.milestones = [];
      state.isLoading = false;
      state.isSaving = false;
      state.error = null;
    },
  },
});

export const {
  setRecord,
  setMilestones,
  setLoading,
  setSaving,
  setError,
  clearError,
  updateDaysSober,
  clearSobriety,
} = sobrietySlice.actions;

export default sobrietySlice.reducer;
