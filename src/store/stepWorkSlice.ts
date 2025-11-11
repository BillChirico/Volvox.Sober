/**
 * Step Work Redux Slice - Progress tracking and state management (T107)
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './index';

export type StepStatus = 'not_started' | 'in_progress' | 'submitted' | 'reviewed';

interface StepProgress {
  stepId: string;
  stepNumber: number;
  status: StepStatus;
  lastUpdated: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
}

interface StepWorkState {
  progress: Record<string, StepProgress>; // stepId -> progress
  totalSteps: number;
  completedCount: number;
  lastSyncedAt: string | null;
}

const initialState: StepWorkState = {
  progress: {},
  totalSteps: 12,
  completedCount: 0,
  lastSyncedAt: null,
};

const stepWorkSlice = createSlice({
  name: 'stepWork',
  initialState,
  reducers: {
    // Initialize progress from API data
    setProgress: (state, action: PayloadAction<StepProgress[]>) => {
      state.progress = {};
      action.payload.forEach(step => {
        state.progress[step.stepId] = step;
      });
      state.completedCount = action.payload.filter(s => s.status === 'reviewed').length;
      state.lastSyncedAt = new Date().toISOString();
    },

    // Update individual step progress
    updateStepProgress: (state, action: PayloadAction<StepProgress>) => {
      const { stepId } = action.payload;
      state.progress[stepId] = action.payload;
      state.completedCount = Object.values(state.progress).filter(
        s => s.status === 'reviewed',
      ).length;
    },

    // Update step status
    updateStepStatus: (state, action: PayloadAction<{ stepId: string; status: StepStatus }>) => {
      const { stepId, status } = action.payload;
      if (state.progress[stepId]) {
        state.progress[stepId].status = status;
        state.progress[stepId].lastUpdated = new Date().toISOString();

        if (status === 'submitted') {
          state.progress[stepId].submittedAt = new Date().toISOString();
        }

        if (status === 'reviewed') {
          state.progress[stepId].reviewedAt = new Date().toISOString();
        }

        state.completedCount = Object.values(state.progress).filter(
          s => s.status === 'reviewed',
        ).length;
      }
    },

    // Mark step as started
    startStep: (state, action: PayloadAction<{ stepId: string; stepNumber: number }>) => {
      const { stepId, stepNumber } = action.payload;
      if (!state.progress[stepId]) {
        state.progress[stepId] = {
          stepId,
          stepNumber,
          status: 'in_progress',
          lastUpdated: new Date().toISOString(),
          submittedAt: null,
          reviewedAt: null,
        };
      } else if (state.progress[stepId].status === 'not_started') {
        state.progress[stepId].status = 'in_progress';
        state.progress[stepId].lastUpdated = new Date().toISOString();
      }
    },

    // Submit step for review
    submitStep: (state, action: PayloadAction<string>) => {
      const stepId = action.payload;
      if (state.progress[stepId]) {
        state.progress[stepId].status = 'submitted';
        state.progress[stepId].submittedAt = new Date().toISOString();
        state.progress[stepId].lastUpdated = new Date().toISOString();
      }
    },

    // Mark step as reviewed
    reviewStep: (state, action: PayloadAction<string>) => {
      const stepId = action.payload;
      if (state.progress[stepId]) {
        state.progress[stepId].status = 'reviewed';
        state.progress[stepId].reviewedAt = new Date().toISOString();
        state.progress[stepId].lastUpdated = new Date().toISOString();
        state.completedCount = Object.values(state.progress).filter(
          s => s.status === 'reviewed',
        ).length;
      }
    },

    // Reset all progress (for testing/debugging)
    resetProgress: state => {
      state.progress = {};
      state.completedCount = 0;
      state.lastSyncedAt = null;
    },
  },
});

export const {
  setProgress,
  updateStepProgress,
  updateStepStatus,
  startStep,
  submitStep,
  reviewStep,
  resetProgress,
} = stepWorkSlice.actions;

// Selectors
export const selectStepProgress = (state: RootState) => state.stepWork.progress;

export const selectStepStatus = (stepId: string) => (state: RootState) =>
  state.stepWork.progress[stepId]?.status || 'not_started';

export const selectCompletedCount = (state: RootState) => state.stepWork.completedCount;

export const selectTotalSteps = (state: RootState) => state.stepWork.totalSteps;

export const selectProgressPercentage = (state: RootState) => {
  const { completedCount, totalSteps } = state.stepWork;
  return totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;
};

export const selectInProgressSteps = (state: RootState) =>
  Object.values(state.stepWork.progress).filter(s => s.status === 'in_progress');

export const selectSubmittedSteps = (state: RootState) =>
  Object.values(state.stepWork.progress).filter(s => s.status === 'submitted');

export const selectReviewedSteps = (state: RootState) =>
  Object.values(state.stepWork.progress).filter(s => s.status === 'reviewed');

export const selectNextStep = (state: RootState): number | null => {
  const progress = Object.values(state.stepWork.progress);

  // Find first not started or in progress step
  const nextNotStarted = progress.find(s => s.status === 'not_started');
  if (nextNotStarted) {
    return nextNotStarted.stepNumber;
  }

  const nextInProgress = progress.find(s => s.status === 'in_progress');
  if (nextInProgress) {
    return nextInProgress.stepNumber;
  }

  // All steps reviewed
  return null;
};

export const selectLastSyncedAt = (state: RootState) => state.stepWork.lastSyncedAt;

export default stepWorkSlice.reducer;
