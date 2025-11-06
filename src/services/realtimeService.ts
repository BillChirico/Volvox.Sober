/**
 * Realtime Service
 * Manages Supabase Realtime subscriptions for live message delivery and read receipts
 */

import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { getCurrentUserId } from './supabase';
import type { Database } from '../types/database.types';
import type { Message } from '../types';

type MessageRow = Database['public']['Tables']['messages']['Row'];

// ============================================================
// Types
// ============================================================

export interface RealtimeSubscriptionCallbacks {
  onMessage?: (message: MessageRow) => void;
  onReadReceipt?: (messageId: string, readAt: string) => void;
  onError?: (error: Error) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export interface RealtimeSubscription {
  channel: RealtimeChannel;
  unsubscribe: () => Promise<void>;
}

// ============================================================
// Message Subscriptions
// ============================================================

/**
 * Subscribe to new messages in a specific connection
 * Receives real-time notifications when new messages are inserted
 */
export const subscribeToMessages = async (
  connectionId: string,
  callbacks: RealtimeSubscriptionCallbacks,
): Promise<RealtimeSubscription> => {
  const currentUserId = await getCurrentUserId();

  const channel = supabase
    .channel(`messages:${connectionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `connection_id=eq.${connectionId}`,
      },
      (payload: RealtimePostgresChangesPayload<MessageRow>) => {
        try {
          const newMessage = payload.new as MessageRow;

          // Only trigger callback if message is from someone else
          if (newMessage.sender_id !== currentUserId && callbacks.onMessage) {
            callbacks.onMessage(newMessage);
          }
        } catch (error) {
          console.error('Error processing new message:', error);
          callbacks.onError?.(error instanceof Error ? error : new Error('Unknown error'));
        }
      },
    )
    .subscribe(status => {
      if (status === 'SUBSCRIBED') {
        callbacks.onConnected?.();
      } else if (status === 'CLOSED') {
        callbacks.onDisconnected?.();
      }
    });

  return {
    channel,
    unsubscribe: async () => {
      await supabase.removeChannel(channel);
    },
  };
};

/**
 * Subscribe to read receipt updates in a specific connection
 * Receives real-time notifications when messages are marked as read
 */
export const subscribeToReadReceipts = async (
  connectionId: string,
  callbacks: RealtimeSubscriptionCallbacks,
): Promise<RealtimeSubscription> => {
  const currentUserId = await getCurrentUserId();

  const channel = supabase
    .channel(`read-receipts:${connectionId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `connection_id=eq.${connectionId}`,
      },
      (payload: RealtimePostgresChangesPayload<MessageRow>) => {
        try {
          const updatedMessage = payload.new as MessageRow;
          const oldMessage = payload.old as MessageRow;

          // Only trigger callback if read_at changed and message is from current user
          if (
            updatedMessage.sender_id === currentUserId &&
            updatedMessage.read_at &&
            !oldMessage.read_at &&
            callbacks.onReadReceipt
          ) {
            callbacks.onReadReceipt(updatedMessage.id, updatedMessage.read_at);
          }
        } catch (error) {
          console.error('Error processing read receipt:', error);
          callbacks.onError?.(error instanceof Error ? error : new Error('Unknown error'));
        }
      },
    )
    .subscribe(status => {
      if (status === 'SUBSCRIBED') {
        callbacks.onConnected?.();
      } else if (status === 'CLOSED') {
        callbacks.onDisconnected?.();
      }
    });

  return {
    channel,
    unsubscribe: async () => {
      await supabase.removeChannel(channel);
    },
  };
};

/**
 * Subscribe to both messages and read receipts in a single call
 * Convenience function for components that need both subscriptions
 */
export const subscribeToConversation = async (
  connectionId: string,
  callbacks: RealtimeSubscriptionCallbacks,
): Promise<{
  messageSubscription: RealtimeSubscription;
  readReceiptSubscription: RealtimeSubscription;
  unsubscribeAll: () => Promise<void>;
}> => {
  const messageSubscription = await subscribeToMessages(connectionId, callbacks);
  const readReceiptSubscription = await subscribeToReadReceipts(connectionId, callbacks);

  return {
    messageSubscription,
    readReceiptSubscription,
    unsubscribeAll: async () => {
      await messageSubscription.unsubscribe();
      await readReceiptSubscription.unsubscribe();
    },
  };
};

// ============================================================
// Connection State Management
// ============================================================

/**
 * Get the current realtime connection state
 */
export const getRealtimeConnectionState = () => {
  return {
    status: supabase.realtime.connection.status,
    isConnected: supabase.realtime.connection.status === 'connected',
  };
};

/**
 * Manually reconnect to realtime if disconnected
 */
export const reconnectRealtime = () => {
  supabase.realtime.connect();
};

/**
 * Manually disconnect from realtime
 */
export const disconnectRealtime = () => {
  supabase.realtime.disconnect();
};
