/**
 * useMessages Hook
 * Custom hook for messaging operations with Realtime subscriptions
 * Feature: 002-app-screens
 */

import { useCallback, useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from './useAppDispatch'
import {
  fetchConversations,
  fetchConversation,
  loadMoreMessages,
  sendMessage,
  markAsRead,
  subscribeToConversation,
  unsubscribeFromConversation,
} from '../store/messages/messagesThunks'
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
} from '../store/messages/messagesSelectors'
import { clearError, clearCurrentConversation } from '../store/messages/messagesSlice'
import type { MessageWithSender } from '../types'

/**
 * Hook for managing messages and conversations
 */
export const useMessages = () => {
  const dispatch = useAppDispatch()
  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Selectors
  const conversations = useAppSelector(selectConversations)
  const currentConversation = useAppSelector(selectCurrentConversation)
  const isLoading = useAppSelector(selectMessagesLoading)
  const isSending = useAppSelector(selectMessagesSending)
  const isLoadingMore = useAppSelector(selectMessagesLoadingMore)
  const error = useAppSelector(selectMessagesError)
  const hasConversations = useAppSelector(selectHasConversations)
  const totalUnreadCount = useAppSelector(selectTotalUnreadCount)
  const hasUnreadMessages = useAppSelector(selectHasUnreadMessages)
  const currentMessages = useAppSelector(selectCurrentMessages)
  const sortedConversations = useAppSelector(selectConversationsSortedByActivity)
  const isOperationInProgress = useAppSelector(selectIsMessagesOperationInProgress)
  const statistics = useAppSelector(selectMessageStatistics)

  // Actions
  const fetchAllConversations = useCallback(
    (userId: string) => {
      return dispatch(fetchConversations(userId))
    },
    [dispatch]
  )

  const openConversation = useCallback(
    (connectionId: string, limit?: number) => {
      return dispatch(fetchConversation({ connectionId, limit }))
    },
    [dispatch]
  )

  const loadMore = useCallback(
    (connectionId: string, offset: number, limit?: number) => {
      return dispatch(loadMoreMessages({ connectionId, offset, limit }))
    },
    [dispatch]
  )

  const send = useCallback(
    (
      connectionId: string,
      senderId: string,
      text: string,
      senderProfile: { id: string; name: string; profile_photo_url?: string }
    ) => {
      return dispatch(sendMessage({ connectionId, senderId, text, senderProfile }))
    },
    [dispatch]
  )

  const markConversationAsRead = useCallback(
    (connectionId: string, userId: string) => {
      return dispatch(markAsRead({ connectionId, userId }))
    },
    [dispatch]
  )

  const subscribeToMessages = useCallback(
    (connectionId: string, onNewMessage: (message: MessageWithSender) => void) => {
      // Unsubscribe from previous subscription if exists
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }

      // Subscribe to new conversation
      dispatch(
        subscribeToConversation({
          connectionId,
          onNewMessage,
        })
      ).then((result: any) => {
        if (result.meta.requestStatus === 'fulfilled') {
          unsubscribeRef.current = result.payload as () => void
        }
      })
    },
    [dispatch]
  )

  const unsubscribeFromMessages = useCallback(
    (connectionId: string) => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
      dispatch(unsubscribeFromConversation(connectionId))
    },
    [dispatch]
  )

  const closeConversation = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
      unsubscribeRef.current = null
    }
    dispatch(clearCurrentConversation())
  }, [dispatch])

  const dismissError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [])

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
  }
}
