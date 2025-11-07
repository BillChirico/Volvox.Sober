/**
 * Messages Redux Thunks
 * Async operations for messaging with optimistic updates and offline queue
 * Feature: 002-app-screens
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import NetInfo from '@react-native-community/netinfo';
import messageServiceV2 from '../../services/messageServiceV2';
import {
  setConversations,
  setCurrentConversation,
  addMessage,
  updateMessageStatus,
  prependMessages,
  updateConversationPreview,
  markConversationAsRead,
  setLoading,
  setSending,
  setLoadingMore,
  setError,
  clearError,
  addToQueue,
  removeFromQueue,
  incrementRetryCount,
  setSyncing,
} from './messagesSlice';
import type { MessageWithSender, QueuedMessage } from '../../types';
import type { RootState } from '../index';

// Maximum retry attempts for queued messages
const MAX_RETRY_COUNT = 3;

/**
 * Fetch all conversation previews for user
 */
export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());

      const { data, error } = await messageServiceV2.getConversations(userId);

      if (error) {
        dispatch(setError(error.message));
        return rejectWithValue(error.message);
      }

      dispatch(setConversations(data));
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch conversations';
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setLoading(false));
    }
  },
);

/**
 * Fetch full conversation with messages
 */
export const fetchConversation = createAsyncThunk(
  'messages/fetchConversation',
  async (
    { connectionId, limit = 50 }: { connectionId: string; limit?: number },
    { dispatch, rejectWithValue },
  ) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());

      const { data, error } = await messageServiceV2.getConversation(connectionId, limit);

      if (error) {
        dispatch(setError(error.message));
        return rejectWithValue(error.message);
      }

      dispatch(setCurrentConversation(data));
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch conversation';
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setLoading(false));
    }
  },
);

/**
 * Load more messages for current conversation (pagination)
 */
export const loadMoreMessages = createAsyncThunk(
  'messages/loadMore',
  async (
    { connectionId, offset, limit = 50 }: { connectionId: string; offset: number; limit?: number },
    { dispatch, rejectWithValue },
  ) => {
    try {
      dispatch(setLoadingMore(true));
      dispatch(clearError());

      const { data, error } = await messageServiceV2.getMessages(connectionId, limit, offset);

      if (error) {
        dispatch(setError(error.message));
        return rejectWithValue(error.message);
      }

      dispatch(prependMessages(data));
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load more messages';
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setLoadingMore(false));
    }
  },
);

/**
 * Send new message with optimistic update and offline queue support
 */
export const sendMessage = createAsyncThunk(
  'messages/send',
  async (
    {
      connectionId,
      senderId,
      text,
      senderProfile,
    }: {
      connectionId: string;
      senderId: string;
      text: string;
      senderProfile: { id: string; name: string; profile_photo_url?: string };
    },
    { dispatch, rejectWithValue },
  ) => {
    // Validate message
    const validation = messageServiceV2.validateMessage(text);
    if (!validation.isValid) {
      dispatch(setError(validation.error || 'Invalid message'));
      return rejectWithValue(validation.error);
    }

    try {
      dispatch(setSending(true));
      dispatch(clearError());

      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      const isOnline = netInfo.isConnected && netInfo.isInternetReachable !== false;

      const tempId = `temp-${Date.now()}`;

      // Optimistic update: Add message immediately
      const optimisticMessage: MessageWithSender = {
        id: tempId,
        connection_id: connectionId,
        sender_id: senderId,
        text,
        status: isOnline ? 'sending' : 'queued',
        created_at: new Date().toISOString(),
        sender: senderProfile,
      };
      dispatch(addMessage(optimisticMessage));

      // If offline, queue the message
      if (!isOnline) {
        const queuedMessage: QueuedMessage = {
          tempId,
          connectionId,
          senderId,
          text,
          senderProfile,
          createdAt: new Date().toISOString(),
          retryCount: 0,
        };
        dispatch(addToQueue(queuedMessage));
        return { tempId, queued: true };
      }

      // Send to server if online
      const { data, error } = await messageServiceV2.sendMessage(connectionId, senderId, text);

      if (error) {
        // Revert optimistic update on error
        dispatch(updateMessageStatus({ messageId: tempId, status: 'failed' }));
        dispatch(setError(error.message));
        return rejectWithValue(error.message);
      }

      // Update to real message from server
      dispatch(updateMessageStatus({ messageId: tempId, status: 'sent' }));

      // Update conversation preview
      dispatch(
        updateConversationPreview({
          connectionId,
          lastMessage: {
            ...data,
            sender: senderProfile,
          },
          unreadCount: 0,
        }),
      );

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send message';
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setSending(false));
    }
  },
);

/**
 * Mark conversation as read
 */
export const markAsRead = createAsyncThunk(
  'messages/markAsRead',
  async (
    { connectionId, userId }: { connectionId: string; userId: string },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const { error } = await messageServiceV2.markAsRead(connectionId, userId);

      if (error) {
        return rejectWithValue(error.message);
      }

      dispatch(markConversationAsRead(connectionId));
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to mark conversation as read';
      return rejectWithValue(message);
    }
  },
);

/**
 * Subscribe to real-time messages for a connection
 * Returns unsubscribe function
 */
export const subscribeToConversation = createAsyncThunk(
  'messages/subscribe',
  async (
    {
      connectionId,
      onNewMessage,
    }: {
      connectionId: string;
      onNewMessage: (message: MessageWithSender) => void;
    },
    { dispatch },
  ) => {
    const unsubscribe = messageServiceV2.subscribeToMessages(connectionId, event => {
      // Add new message to state
      dispatch(addMessage(event.message));

      // Update conversation preview
      dispatch(
        updateConversationPreview({
          connectionId,
          lastMessage: event.message,
          unreadCount: 1, // Increment by 1
        }),
      );

      // Call custom handler
      onNewMessage(event.message);
    });

    return unsubscribe;
  },
);

/**
 * Unsubscribe from real-time messages
 */
export const unsubscribeFromConversation = createAsyncThunk(
  'messages/unsubscribe',
  async (connectionId: string) => {
    messageServiceV2.unsubscribeFromMessages(connectionId);
    return connectionId;
  },
);

/**
 * Sync offline message queue
 * Attempts to send all queued messages when network is available
 */
export const syncOfflineQueue = createAsyncThunk(
  'messages/syncQueue',
  async (_, { dispatch, getState }) => {
    const state = getState() as RootState;
    const queue = state.messages.offlineQueue;

    // Check if we have queued messages
    if (queue.length === 0) {
      return { synced: 0, failed: 0 };
    }

    // Check network connectivity
    const netInfo = await NetInfo.fetch();
    const isOnline = netInfo.isConnected && netInfo.isInternetReachable !== false;

    if (!isOnline) {
      return { synced: 0, failed: 0, offline: true };
    }

    dispatch(setSyncing(true));

    let syncedCount = 0;
    let failedCount = 0;

    // Process each queued message
    for (const queuedMsg of queue) {
      // Skip if max retries exceeded
      if (queuedMsg.retryCount >= MAX_RETRY_COUNT) {
        dispatch(removeFromQueue(queuedMsg.tempId));
        dispatch(updateMessageStatus({ messageId: queuedMsg.tempId, status: 'failed' }));
        failedCount++;
        continue;
      }

      try {
        // Update message status to sending
        dispatch(updateMessageStatus({ messageId: queuedMsg.tempId, status: 'sending' }));

        // Attempt to send
        const { data, error } = await messageServiceV2.sendMessage(
          queuedMsg.connectionId,
          queuedMsg.senderId,
          queuedMsg.text,
        );

        if (error) {
          // Increment retry count and keep in queue
          dispatch(incrementRetryCount(queuedMsg.tempId));
          dispatch(updateMessageStatus({ messageId: queuedMsg.tempId, status: 'queued' }));
          failedCount++;
        } else {
          // Success - remove from queue and update status
          dispatch(removeFromQueue(queuedMsg.tempId));
          dispatch(updateMessageStatus({ messageId: queuedMsg.tempId, status: 'sent' }));

          // Update conversation preview
          dispatch(
            updateConversationPreview({
              connectionId: queuedMsg.connectionId,
              lastMessage: {
                ...data,
                sender: queuedMsg.senderProfile,
              },
              unreadCount: 0,
            }),
          );
          syncedCount++;
        }
      } catch (_error) {
        // Network error - increment retry count
        dispatch(incrementRetryCount(queuedMsg.tempId));
        dispatch(updateMessageStatus({ messageId: queuedMsg.tempId, status: 'queued' }));
        failedCount++;
      }
    }

    dispatch(setSyncing(false));

    return { synced: syncedCount, failed: failedCount };
  },
);
