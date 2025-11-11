/**
 * Messages Redux Selectors
 * Memoized selectors for message state with thread selection
 * Feature: 002-app-screens
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../store';

/**
 * Base selector for messages state
 */
export const selectMessagesState = (state: RootState) => state.messages;

/**
 * Select all conversations
 */
export const selectConversations = createSelector(
  [selectMessagesState],
  messagesState => messagesState.conversations,
);

/**
 * Select current conversation
 */
export const selectCurrentConversation = createSelector(
  [selectMessagesState],
  messagesState => messagesState.currentConversation,
);

/**
 * Select messages loading state
 */
export const selectMessagesLoading = createSelector(
  [selectMessagesState],
  messagesState => messagesState.isLoading,
);

/**
 * Select message sending state
 */
export const selectMessagesSending = createSelector(
  [selectMessagesState],
  messagesState => messagesState.isSending,
);

/**
 * Select loading more messages state
 */
export const selectMessagesLoadingMore = createSelector(
  [selectMessagesState],
  messagesState => messagesState.isLoadingMore,
);

/**
 * Select messages error
 */
export const selectMessagesError = createSelector(
  [selectMessagesState],
  messagesState => messagesState.error,
);

/**
 * Select total conversations count
 */
export const selectConversationsCount = createSelector(
  [selectConversations],
  conversations => conversations.length,
);

/**
 * Select if there are any conversations
 */
export const selectHasConversations = createSelector(
  [selectConversationsCount],
  count => count > 0,
);

/**
 * Select conversations with unread messages
 */
export const selectConversationsWithUnread = createSelector(
  [selectConversations],
  conversations => {
    return conversations.filter(c => c.unreadCount > 0);
  },
);

/**
 * Select total unread count across all conversations
 */
export const selectTotalUnreadCount = createSelector([selectConversations], conversations => {
  return conversations.reduce((total, c) => total + c.unreadCount, 0);
});

/**
 * Select if there are unread messages
 */
export const selectHasUnreadMessages = createSelector([selectTotalUnreadCount], count => count > 0);

/**
 * Select conversation by connection ID
 */
export const selectConversationByConnectionId = createSelector(
  [selectConversations, (_state: RootState, connectionId: string) => connectionId],
  (conversations, connectionId) => {
    return conversations.find(c => c.connection.id === connectionId) || null;
  },
);

/**
 * Select messages from current conversation
 */
export const selectCurrentMessages = createSelector([selectCurrentConversation], conversation => {
  return conversation?.messages || [];
});

/**
 * Select current conversation connection
 */
export const selectCurrentConversationConnection = createSelector(
  [selectCurrentConversation],
  conversation => {
    return conversation?.connection || null;
  },
);

/**
 * Select current conversation unread count
 */
export const selectCurrentConversationUnreadCount = createSelector(
  [selectCurrentConversation],
  conversation => {
    return conversation?.unreadCount || 0;
  },
);

/**
 * Select last message from current conversation
 */
export const selectLastMessageInCurrentConversation = createSelector(
  [selectCurrentMessages],
  messages => {
    return messages.length > 0 ? messages[0] : null; // Messages are sorted newest first
  },
);

/**
 * Select if current conversation has more messages to load
 */
export const selectCurrentConversationHasMore = createSelector(
  [selectCurrentMessages],
  messages => {
    // Assume there are more if we have exactly 50 messages (the default limit)
    return messages.length >= 50;
  },
);

/**
 * Select conversations sorted by last message time
 */
export const selectConversationsSortedByActivity = createSelector(
  [selectConversations],
  conversations => {
    return [...conversations].sort((a, b) => {
      const aTime = new Date(a.lastMessageAt).getTime();
      const bTime = new Date(b.lastMessageAt).getTime();
      return bTime - aTime;
    });
  },
);

/**
 * Select recent conversations (last 7 days)
 */
export const selectRecentConversations = createSelector([selectConversations], conversations => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return conversations.filter(c => {
    const lastMessageTime = new Date(c.lastMessageAt);
    return lastMessageTime >= sevenDaysAgo;
  });
});

/**
 * Select messages grouped by date
 */
export const selectMessagesGroupedByDate = createSelector([selectCurrentMessages], messages => {
  const grouped: Record<string, typeof messages> = {};

  messages.forEach(message => {
    const date = new Date(message.created_at);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }

    grouped[dateKey].push(message);
  });

  return grouped;
});

/**
 * Select if any operation is in progress
 */
export const selectIsMessagesOperationInProgress = createSelector(
  [selectMessagesLoading, selectMessagesSending, selectMessagesLoadingMore],
  (isLoading, isSending, isLoadingMore): boolean => isLoading || isSending || isLoadingMore,
);

/**
 * Select message statistics
 */
export const selectMessageStatistics = createSelector(
  [selectConversationsCount, selectTotalUnreadCount, selectCurrentMessages],
  (conversationsCount, unreadCount, currentMessages) => ({
    totalConversations: conversationsCount,
    totalUnreadMessages: unreadCount,
    messagesInCurrentConversation: currentMessages.length,
  }),
);

/**
 * Select last message preview for conversation
 */
export const selectLastMessagePreview = createSelector(
  [
    selectConversations,
    (_state: RootState, connectionId: string) => connectionId,
    (_state: RootState, _connectionId: string, maxLength: number = 50) => maxLength,
  ],
  (conversations, connectionId, maxLength) => {
    const conversation = conversations.find(c => c.connection.id === connectionId);

    if (!conversation?.lastMessage) return null;

    const text = conversation.lastMessage.text;
    if (text.length <= maxLength) return text;

    return text.substring(0, maxLength) + '...';
  },
);

/**
 * Select if user is sender of message
 */
export const selectIsMessageFromUser = createSelector(
  [
    (_state: RootState, messageId: string, _userId: string) => messageId,
    (_state: RootState, _messageId: string, userId: string) => userId,
    selectCurrentMessages,
  ],
  (messageId, userId, messages) => {
    const message = messages.find(m => m.id === messageId);
    return message ? message.sender_id === userId : false;
  },
);

/**
 * Alias for selectTotalUnreadCount (used by navigation components)
 */
export const selectUnreadMessagesCount = selectTotalUnreadCount;

/**
 * Select offline queue
 */
export const selectOfflineQueue = createSelector(
  [selectMessagesState],
  messagesState => messagesState.offlineQueue,
);

/**
 * Select syncing state
 */
export const selectIsSyncing = createSelector(
  [selectMessagesState],
  messagesState => messagesState.isSyncing,
);

/**
 * Select queued messages count
 */
export const selectQueuedMessagesCount = createSelector(
  [selectOfflineQueue],
  queue => queue.length,
);

/**
 * Select if there are queued messages
 */
export const selectHasQueuedMessages = createSelector(
  [selectQueuedMessagesCount],
  count => count > 0,
);
