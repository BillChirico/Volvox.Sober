/**
 * Messaging domain types
 * Feature: 002-app-screens
 */

import { Tables } from '../../../types/database.types';
import { ConnectionWithUsers } from '../../connections/types/connection';
import { Profile } from '../../profile/types/profile';

// ============================================================
// Base Message Types
// ============================================================

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface Message extends Tables<'messages'> {}

export interface MessageWithSender extends Message {
  sender: Profile;
}

// ============================================================
// Conversation Types
// ============================================================

export interface Conversation {
  connection: ConnectionWithUsers;
  messages: MessageWithSender[];
  unreadCount: number;
}

export interface ConversationPreview {
  connection: ConnectionWithUsers;
  lastMessage: Message | null;
  unreadCount: number;
  lastMessageAt: string | null;
}

// ============================================================
// Message Actions
// ============================================================

export interface SendMessageData {
  connectionId: string;
  senderId: string;
  text: string;
}

export interface MarkMessageReadData {
  messageId: string;
  readAt: string;
}

export interface MarkMessagesDeliveredData {
  messageIds: string[];
  deliveredAt: string;
}

// ============================================================
// Realtime Message Events
// ============================================================

export interface NewMessageEvent {
  message: Message;
  sender: Profile;
}

export interface MessageStatusUpdateEvent {
  messageId: string;
  status: MessageStatus;
  timestamp: string;
}

export interface TypingIndicatorEvent {
  connectionId: string;
  userId: string;
  isTyping: boolean;
}

// ============================================================
// Message Validation
// ============================================================

export interface MessageValidation {
  isValid: boolean;
  error?: string;
}

export const MESSAGE_CONSTRAINTS = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 5000,
} as const;

// ============================================================
// UI State Types
// ============================================================

export interface MessagesState {
  conversations: ConversationPreview[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  isSending: boolean;
  isLoadingMore: boolean;
  error: string | null;
  offlineQueue: QueuedMessage[];
  isSyncing: boolean;
}

export interface MessageInputState {
  text: string;
  isSending: boolean;
  validationError: string | null;
}

export interface ConversationState {
  messages: MessageWithSender[];
  hasMore: boolean;
  isLoadingMore: boolean;
  error: string | null;
}

export interface TypingState {
  [connectionId: string]: {
    [userId: string]: boolean;
  };
}

// ============================================================
// Offline Queue Types
// ============================================================

export interface QueuedMessage {
  tempId: string;
  connectionId: string;
  senderId: string;
  text: string;
  senderProfile: { id: string; name: string; profile_photo_url?: string };
  createdAt: string;
  retryCount: number;
}
