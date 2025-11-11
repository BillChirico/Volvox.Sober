/**
 * Connections Redux Thunks
 * Async operations for connection management
 * Feature: 002-app-screens
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import connectionService from '../services/connectionService';
import {
  setActiveConnections,
  setPendingRequests,
  setSentRequests,
  setEndedConnections,
  addActiveConnection,
  addSentRequest,
  removePendingRequest,
  removeSentRequest,
  acceptRequest,
  endConnection,
  updateConnectionUnreadCount,
  setLoading,
  setRefreshing,
  setError,
  clearError,
} from './connectionsSlice';
import type { CreateConnectionData } from '../../../types';

/**
 * Fetch all active connections
 */
export const fetchActiveConnections = createAsyncThunk(
  'connections/fetchActive',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());

      const { data, error } = await connectionService.getActiveConnections(userId);

      if (error) {
        dispatch(setError(error.message));
        return rejectWithValue(error.message);
      }

      dispatch(setActiveConnections(data));
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch active connections';
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setLoading(false));
    }
  },
);

/**
 * Fetch pending connection requests (received)
 */
export const fetchPendingRequests = createAsyncThunk(
  'connections/fetchPending',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());

      const { data, error } = await connectionService.getPendingRequests(userId);

      if (error) {
        dispatch(setError(error.message));
        return rejectWithValue(error.message);
      }

      dispatch(setPendingRequests(data));
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch pending requests';
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setLoading(false));
    }
  },
);

/**
 * Fetch sent connection requests
 */
export const fetchSentRequests = createAsyncThunk(
  'connections/fetchSent',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());

      const { data, error } = await connectionService.getSentRequests(userId);

      if (error) {
        dispatch(setError(error.message));
        return rejectWithValue(error.message);
      }

      dispatch(setSentRequests(data));
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch sent requests';
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setLoading(false));
    }
  },
);

/**
 * Fetch ended connections
 */
export const fetchEndedConnections = createAsyncThunk(
  'connections/fetchEnded',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());

      const { data, error } = await connectionService.getEndedConnections(userId);

      if (error) {
        dispatch(setError(error.message));
        return rejectWithValue(error.message);
      }

      dispatch(setEndedConnections(data));
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch ended connections';
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setLoading(false));
    }
  },
);

/**
 * Fetch all connections grouped by status
 */
export const fetchAllConnections = createAsyncThunk(
  'connections/fetchAll',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());

      // Fetch all connection types in parallel
      const [activeResult, pendingResult, sentResult, endedResult] = await Promise.all([
        connectionService.getActiveConnections(userId),
        connectionService.getPendingRequests(userId),
        connectionService.getSentRequests(userId),
        connectionService.getEndedConnections(userId),
      ]);

      // Check for errors
      if (activeResult.error) {
        dispatch(setError(activeResult.error.message));
        return rejectWithValue(activeResult.error.message);
      }
      if (pendingResult.error) {
        dispatch(setError(pendingResult.error.message));
        return rejectWithValue(pendingResult.error.message);
      }
      if (sentResult.error) {
        dispatch(setError(sentResult.error.message));
        return rejectWithValue(sentResult.error.message);
      }
      if (endedResult.error) {
        dispatch(setError(endedResult.error.message));
        return rejectWithValue(endedResult.error.message);
      }

      // Update all state
      dispatch(setActiveConnections(activeResult.data));
      dispatch(setPendingRequests(pendingResult.data));
      dispatch(setSentRequests(sentResult.data));
      dispatch(setEndedConnections(endedResult.data));

      return {
        active: activeResult.data,
        pending: pendingResult.data,
        sent: sentResult.data,
        ended: endedResult.data,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch connections';
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setLoading(false));
    }
  },
);

/**
 * Refresh all connections (pull-to-refresh)
 */
export const refreshAllConnections = createAsyncThunk(
  'connections/refreshAll',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setRefreshing(true));
      dispatch(clearError());

      const [activeResult, pendingResult, sentResult] = await Promise.all([
        connectionService.getActiveConnections(userId),
        connectionService.getPendingRequests(userId),
        connectionService.getSentRequests(userId),
      ]);

      if (activeResult.error || pendingResult.error || sentResult.error) {
        const errorMsg = 'Failed to refresh connections';
        dispatch(setError(errorMsg));
        return rejectWithValue(errorMsg);
      }

      dispatch(setActiveConnections(activeResult.data));
      dispatch(setPendingRequests(pendingResult.data));
      dispatch(setSentRequests(sentResult.data));

      return {
        active: activeResult.data,
        pending: pendingResult.data,
        sent: sentResult.data,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to refresh connections';
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setRefreshing(false));
    }
  },
);

/**
 * Create new connection request
 */
export const createConnectionRequest = createAsyncThunk(
  'connections/create',
  async (data: CreateConnectionData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(clearError());

      const { data: connection, error } = await connectionService.createConnection(data);

      if (error) {
        dispatch(setError(error.message));
        return rejectWithValue(error.message);
      }

      // Add to sent requests (requester's perspective)
      dispatch(
        addSentRequest({
          id: connection.id,
          sponsor_id: connection.sponsor_id,
          sponsee_id: connection.sponsee_id,
          status: connection.status,
          created_at: connection.created_at,
        }),
      );

      return connection;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create connection request';
      dispatch(setError(message));
      return rejectWithValue(message);
    }
  },
);

/**
 * Accept connection request
 */
export const acceptConnectionRequest = createAsyncThunk(
  'connections/accept',
  async (requestId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(clearError());

      const { data, error } = await connectionService.acceptRequest(requestId);

      if (error) {
        dispatch(setError(error.message));
        return rejectWithValue(error.message);
      }

      dispatch(acceptRequest(requestId));
      dispatch(addActiveConnection(data));

      return data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to accept connection request';
      dispatch(setError(message));
      return rejectWithValue(message);
    }
  },
);

/**
 * Decline connection request
 */
export const declineConnectionRequest = createAsyncThunk(
  'connections/decline',
  async (requestId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(clearError());

      const { error } = await connectionService.declineRequest(requestId);

      if (error) {
        dispatch(setError(error.message));
        return rejectWithValue(error.message);
      }

      dispatch(removePendingRequest(requestId));

      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to decline connection request';
      dispatch(setError(message));
      return rejectWithValue(message);
    }
  },
);

/**
 * Cancel sent connection request
 */
export const cancelConnectionRequest = createAsyncThunk(
  'connections/cancel',
  async (requestId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(clearError());

      const { error } = await connectionService.cancelRequest(requestId);

      if (error) {
        dispatch(setError(error.message));
        return rejectWithValue(error.message);
      }

      dispatch(removeSentRequest(requestId));

      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to cancel connection request';
      dispatch(setError(message));
      return rejectWithValue(message);
    }
  },
);

/**
 * End active connection
 */
export const endActiveConnection = createAsyncThunk(
  'connections/end',
  async (connectionId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(clearError());

      const { data, error } = await connectionService.endConnection(connectionId);

      if (error) {
        dispatch(setError(error.message));
        return rejectWithValue(error.message);
      }

      dispatch(endConnection(connectionId));

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to end connection';
      dispatch(setError(message));
      return rejectWithValue(message);
    }
  },
);

/**
 * Update unread message count for connection
 */
export const updateUnreadCount = createAsyncThunk(
  'connections/updateUnreadCount',
  async ({ connectionId, count }: { connectionId: string; count: number }, { dispatch }) => {
    dispatch(updateConnectionUnreadCount({ connectionId, count }));
    return { connectionId, count };
  },
);
