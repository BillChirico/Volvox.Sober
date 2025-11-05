/**
 * Sync Queue Redux Slice - Offline operation queueing and sync (T112)
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from './store';
import { StepWorkResponse } from '../services/stepsApi';

const SYNC_QUEUE_KEY = 'syncQueue';

export type OperationType = 'create' | 'update' | 'submit';

export interface SyncOperation {
  id: string;
  type: OperationType;
  stepId: string;
  responses: StepWorkResponse[];
  status?: 'not_started' | 'in_progress' | 'submitted';
  timestamp: string;
  retryCount: number;
  lastError?: string;
}

interface SyncQueueState {
  operations: SyncOperation[];
  isProcessing: boolean;
  isOnline: boolean;
  lastSyncAt: string | null;
}

const initialState: SyncQueueState = {
  operations: [],
  isProcessing: false,
  isOnline: true,
  lastSyncAt: null,
};

const syncQueueSlice = createSlice({
  name: 'syncQueue',
  initialState,
  reducers: {
    // Add operation to queue
    enqueueOperation: (state, action: PayloadAction<Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount'>>) => {
      const operation: SyncOperation = {
        ...action.payload,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      };
      state.operations.push(operation);
    },

    // Remove operation from queue
    dequeueOperation: (state, action: PayloadAction<string>) => {
      state.operations = state.operations.filter((op) => op.id !== action.payload);
    },

    // Update operation retry count and error
    updateOperationRetry: (
      state,
      action: PayloadAction<{ id: string; error: string }>
    ) => {
      const operation = state.operations.find((op) => op.id === action.payload.id);
      if (operation) {
        operation.retryCount += 1;
        operation.lastError = action.payload.error;
      }
    },

    // Set processing state
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },

    // Set online state
    setOnline: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },

    // Update last sync time
    setLastSyncAt: (state, action: PayloadAction<string>) => {
      state.lastSyncAt = action.payload;
    },

    // Clear all operations
    clearQueue: (state) => {
      state.operations = [];
    },

    // Load operations from AsyncStorage
    loadOperations: (state, action: PayloadAction<SyncOperation[]>) => {
      state.operations = action.payload;
    },
  },
});

export const {
  enqueueOperation,
  dequeueOperation,
  updateOperationRetry,
  setProcessing,
  setOnline,
  setLastSyncAt,
  clearQueue,
  loadOperations,
} = syncQueueSlice.actions;

// Selectors
export const selectSyncQueue = (state: RootState) => state.syncQueue.operations;

export const selectIsProcessing = (state: RootState) => state.syncQueue.isProcessing;

export const selectIsOnline = (state: RootState) => state.syncQueue.isOnline;

export const selectLastSyncAt = (state: RootState) => state.syncQueue.lastSyncAt;

export const selectQueueLength = (state: RootState) => state.syncQueue.operations.length;

export const selectHasPendingOperations = (state: RootState) =>
  state.syncQueue.operations.length > 0;

export const selectOperationsByStep = (stepId: string) => (state: RootState) =>
  state.syncQueue.operations.filter((op) => op.stepId === stepId);

// Thunks for async operations
export const persistQueue = () => async (dispatch: any, getState: () => RootState) => {
  try {
    const operations = selectSyncQueue(getState());
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(operations));
  } catch (error) {
    console.error('Failed to persist sync queue:', error);
  }
};

export const loadQueue = () => async (dispatch: any) => {
  try {
    const data = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    if (data) {
      const operations: SyncOperation[] = JSON.parse(data);
      dispatch(loadOperations(operations));
    }
  } catch (error) {
    console.error('Failed to load sync queue:', error);
  }
};

export const clearPersistedQueue = () => async () => {
  try {
    await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
  } catch (error) {
    console.error('Failed to clear persisted queue:', error);
  }
};

export default syncQueueSlice.reducer;
