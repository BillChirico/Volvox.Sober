/**
 * useMessages Hook
 * Custom hook for messaging operations with Realtime subscriptions and offline queue
 * Feature: 002-app-screens
 */

import { useCallback, useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useAppDispatch, useAppSelector } from './useAppDispatch';
import {
  fetchConversations,
  fetchConversation,
  loadMoreMessages,
  sendMessage,
  markAsRead,
  subscribeToConversation,
  unsubscribeFromConversation,
  syncOfflineQueue,
} from '../store/messages/messagesThunks';
import {
  selectConversations,
  selectCurrentConversation,
  selectMessagesLoading,
  selectMessagesSending,
  selectMessagesLoadingMore,
  selectMessagesError,
  selectHasConversations,
  selectTotalUnreadCount,
  selectHasUnreadMessages,
  selectCurrentMessages,
  selectConversationsSortedByActivity,
  selectIsMessagesOperationInProgress,
  selectMessageStatistics,
  selectOfflineQueue,
  selectIsSyncing,
  selectQueuedMessagesCount,
  selectHasQueuedMessages,
} from '../store/messages/messagesSelectors';
import { clearError, clearCurrentConversation } from '../store/messages/messagesSlice';
import type { MessageWithSender } from '../types';

/**
 * Hook for managing messages and conversations
 */
export const useMessages = () => {
  const dispatch = useAppDispatch();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Selectors
  const conversations = useAppSelector(selectConversations);
  const currentConversation = useAppSelector(selectCurrentConversation);
  const isLoading = useAppSelector(selectMessagesLoading);
  const isSending = useAppSelector(selectMessagesSending);
  const isLoadingMore = useAppSelector(selectMessagesLoadingMore);
  const error = useAppSelector(selectMessagesError);
  const hasConversations = useAppSelector(selectHasConversations);
  const totalUnreadCount = useAppSelector(selectTotalUnreadCount);
  const hasUnreadMessages = useAppSelector(selectHasUnreadMessages);
  const currentMessages = useAppSelector(selectCurrentMessages);
  const sortedConversations = useAppSelector(selectConversationsSortedByActivity);
  const isOperationInProgress = useAppSelector(selectIsMessagesOperationInProgress);
  const statistics = useAppSelector(selectMessageStatistics);
  const offlineQueue = useAppSelector(selectOfflineQueue);
  const isSyncing = useAppSelector(selectIsSyncing);
  const queuedMessagesCount = useAppSelector(selectQueuedMessagesCount);
  const hasQueuedMessages = useAppSelector(selectHasQueuedMessages);

  // Actions
  const fetchAllConversations = useCallback(
    (userId: string) => {
      return dispatch(fetchConversations(userId));
    },
    [dispatch],
  );

  const openConversation = useCallback(
    (connectionId: string, limit?: number) => {
      return dispatch(fetchConversation({ connectionId, limit }));
    },
    [dispatch],
  );

  const loadMore = useCallback(
    (connectionId: string, offset: number, limit?: number) => {
      return dispatch(loadMoreMessages({ connectionId, offset, limit }));
    },
    [dispatch],
  );

  const send = useCallback(
    (
      connectionId: string,
      senderId: string,
      text: string,
      senderProfile: { id: string; name: string; profile_photo_url?: string },
    ) => {
      return dispatch(sendMessage({ connectionId, senderId, text, senderProfile }));
    },
    [dispatch],
  );

  const markConversationAsRead = useCallback(
    (connectionId: string, userId: string) => {
      return dispatch(markAsRead({ connectionId, userId }));
    },
    [dispatch],
  );

  const subscribeToMessages = useCallback(
    (connectionId: string, onNewMessage: (message: MessageWithSender) => void) => {
      // Unsubscribe from previous subscription if exists
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      // Subscribe to new conversation
      dispatch(
        subscribeToConversation({
          connectionId,
          onNewMessage,
        }),
      ).then((result: any) => {
        if (result.meta.requestStatus === 'fulfilled') {
          unsubscribeRef.current = result.payload as () => void;
        }
      });
    },
    [dispatch],
  );

  const unsubscribeFromMessages = useCallback(
    (connectionId: string) => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      dispatch(unsubscribeFromConversation(connectionId));
    },
    [dispatch],
  );

  const closeConversation = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    dispatch(clearCurrentConversation());
  }, [dispatch]);

  const dismissError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const syncQueue = useCallback(() => {
    return dispatch(syncOfflineQueue());
  }, [dispatch]);

  // Network listener: Auto-sync queue when reconnecting
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isOnline = state.isConnected && state.isInternetReachable !== false;

      // If we just came online and have queued messages, sync them
      if (isOnline && queuedMessagesCount > 0 && !isSyncing) {
        dispatch(syncOfflineQueue());
      }
    });

    return unsubscribe;
  }, [dispatch, queuedMessagesCount, isSyncing]);

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  return {
    // State
    conversations,
    currentConversation,
    isLoading,
    isSending,
    isLoadingMore,
    error,
    hasConversations,
    totalUnreadCount,
    hasUnreadMessages,
    currentMessages,
    sortedConversations,
    isOperationInProgress,
    statistics,
    offlineQueue,
    isSyncing,
    queuedMessagesCount,
    hasQueuedMessages,

    // Actions
    fetchAllConversations,
    openConversation,
    loadMore,
    send,
    markConversationAsRead,
    subscribeToMessages,
    unsubscribeFromMessages,
    closeConversation,
    dismissError,
    syncQueue,
  };
};
