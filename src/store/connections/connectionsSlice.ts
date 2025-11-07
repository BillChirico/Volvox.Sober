/**
 * Connections Redux Slice
 * Manages connection state with status grouping
 * Feature: 002-app-screens
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ConnectionsState, ConnectionDetails, ConnectionRequest } from '../../types';

const initialState: ConnectionsState = {
  activeConnections: [],
  pendingRequests: [],
  sentRequests: [],
  endedConnections: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
};

const connectionsSlice = createSlice({
  name: 'connections',
  initialState,
  reducers: {
    setActiveConnections: (state, action: PayloadAction<ConnectionDetails[]>) => {
      state.activeConnections = action.payload;
      state.error = null;
    },
    setPendingRequests: (state, action: PayloadAction<ConnectionRequest[]>) => {
      state.pendingRequests = action.payload;
      state.error = null;
    },
    setSentRequests: (state, action: PayloadAction<ConnectionRequest[]>) => {
      state.sentRequests = action.payload;
      state.error = null;
    },
    setEndedConnections: (state, action: PayloadAction<ConnectionDetails[]>) => {
      state.endedConnections = action.payload;
      state.error = null;
    },
    addPendingRequest: (state, action: PayloadAction<ConnectionRequest>) => {
      state.pendingRequests.unshift(action.payload);
    },
    addSentRequest: (state, action: PayloadAction<ConnectionRequest>) => {
      state.sentRequests.unshift(action.payload);
    },
    removePendingRequest: (state, action: PayloadAction<string>) => {
      state.pendingRequests = state.pendingRequests.filter(req => req.id !== action.payload);
    },
    removeSentRequest: (state, action: PayloadAction<string>) => {
      state.sentRequests = state.sentRequests.filter(req => req.id !== action.payload);
    },
    acceptRequest: (state, action: PayloadAction<string>) => {
      const request = state.pendingRequests.find(r => r.id === action.payload);
      if (request) {
        state.pendingRequests = state.pendingRequests.filter(r => r.id !== action.payload);
        // Will be added to activeConnections via separate action
      }
    },
    addActiveConnection: (state, action: PayloadAction<ConnectionDetails>) => {
      state.activeConnections.unshift(action.payload);
    },
    updateConnectionUnreadCount: (
      state,
      action: PayloadAction<{ connectionId: string; count: number }>,
    ) => {
      const connection = state.activeConnections.find(c => c.id === action.payload.connectionId);
      if (connection) {
        connection.unreadMessageCount = action.payload.count;
      }
    },
    endConnection: (state, action: PayloadAction<string>) => {
      const connection = state.activeConnections.find(c => c.id === action.payload);
      if (connection) {
        state.activeConnections = state.activeConnections.filter(c => c.id !== action.payload);
        state.endedConnections.unshift(connection);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.isRefreshing = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
      state.isRefreshing = false;
    },
    clearError: state => {
      state.error = null;
    },
    clearConnections: state => {
      state.activeConnections = [];
      state.pendingRequests = [];
      state.sentRequests = [];
      state.endedConnections = [];
      state.isLoading = false;
      state.isRefreshing = false;
      state.error = null;
    },
  },
});

export const {
  setActiveConnections,
  setPendingRequests,
  setSentRequests,
  setEndedConnections,
  addPendingRequest,
  addSentRequest,
  removePendingRequest,
  removeSentRequest,
  acceptRequest,
  addActiveConnection,
  updateConnectionUnreadCount,
  endConnection,
  setLoading,
  setRefreshing,
  setError,
  clearError,
  clearConnections,
} = connectionsSlice.actions;

export default connectionsSlice.reducer;
