/**
 * Messages Redux Slice
 * Manages messaging state with thread normalization
 * Feature: 002-app-screens
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  MessagesState,
  ConversationPreview,
  Conversation,
  MessageWithSender,
} from '../../types'

const initialState: MessagesState = {
  conversations: [],
  currentConversation: null,
  isLoading: false,
  isSending: false,
  isLoadingMore: false,
  error: null,
}

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setConversations: (state, action: PayloadAction<ConversationPreview[]>) => {
      state.conversations = action.payload
      state.error = null
    },
    setCurrentConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.currentConversation = action.payload
      state.error = null
    },
    addMessage: (state, action: PayloadAction<MessageWithSender>) => {
      if (state.currentConversation) {
        state.currentConversation.messages.unshift(action.payload)
      }
    },
    updateMessageStatus: (
      state,
      action: PayloadAction<{ messageId: string; status: string }>
    ) => {
      if (state.currentConversation) {
        const message = state.currentConversation.messages.find(
          (m) => m.id === action.payload.messageId
        )
        if (message) {
          message.status = action.payload.status as
            | 'sending'
            | 'sent'
            | 'delivered'
            | 'read'
        }
      }
    },
    prependMessages: (state, action: PayloadAction<MessageWithSender[]>) => {
      if (state.currentConversation) {
        state.currentConversation.messages.push(...action.payload)
      }
    },
    updateConversationPreview: (
      state,
      action: PayloadAction<{
        connectionId: string
        lastMessage: MessageWithSender
        unreadCount: number
      }>
    ) => {
      const conversation = state.conversations.find(
        (c) => c.connection.id === action.payload.connectionId
      )
      if (conversation) {
        conversation.lastMessage = action.payload.lastMessage
        conversation.unreadCount = action.payload.unreadCount
        conversation.lastMessageAt = action.payload.lastMessage.created_at

        // Move to top of list
        state.conversations = [
          conversation,
          ...state.conversations.filter(
            (c) => c.connection.id !== action.payload.connectionId
          ),
        ]
      }
    },
    markConversationAsRead: (state, action: PayloadAction<string>) => {
      const conversation = state.conversations.find(
        (c) => c.connection.id === action.payload
      )
      if (conversation) {
        conversation.unreadCount = 0
      }
      if (
        state.currentConversation?.connection.id === action.payload
      ) {
        state.currentConversation.unreadCount = 0
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setSending: (state, action: PayloadAction<boolean>) => {
      state.isSending = action.payload
    },
    setLoadingMore: (state, action: PayloadAction<boolean>) => {
      state.isLoadingMore = action.payload
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isLoading = false
      state.isSending = false
      state.isLoadingMore = false
    },
    clearError: (state) => {
      state.error = null
    },
    clearCurrentConversation: (state) => {
      state.currentConversation = null
    },
    clearMessages: (state) => {
      state.conversations = []
      state.currentConversation = null
      state.isLoading = false
      state.isSending = false
      state.isLoadingMore = false
      state.error = null
    },
  },
})

export const {
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
  clearCurrentConversation,
  clearMessages,
} = messagesSlice.actions

export default messagesSlice.reducer
