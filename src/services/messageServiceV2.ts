/**
 * Message Service V2
 * Message operations with Realtime subscriptions for feature 002-app-screens
 * Updated for new message schema without recipient_id
 */

import supabaseClient from './supabase';
import {
  Message,
  MessageWithSender,
  Conversation,
  ConversationPreview,
  SendMessageData,
  MarkMessageReadData,
  MarkMessagesDeliveredData,
  Profile,
  ConnectionWithUsers,
  TablesInsert,
  TablesUpdate,
  NewMessageEvent,
  MessageStatusUpdateEvent,
} from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';

class MessageServiceV2 {
  private activeChannels: Map<string, RealtimeChannel> = new Map();

  /**
   * Send a new message
   */
  async sendMessage(data: SendMessageData): Promise<{ data: Message | null; error: Error | null }> {
    try {
      const insertData: TablesInsert<'messages'> = {
        connection_id: data.connectionId,
        sender_id: data.senderId,
        text: data.text,
        status: 'sending',
      };

      const { data: message, error } = await supabaseClient
        .from('messages')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      // Update status to sent
      const { data: updatedMessage } = await supabaseClient
        .from('messages')
        .update({ status: 'sent' })
        .eq('id', message.id)
        .select()
        .single();

      return { data: updatedMessage || message, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get messages for a connection
   */
  async getMessages(
    connectionId: string,
    limit = 50,
    offset = 0,
  ): Promise<{ data: MessageWithSender[]; error: Error | null }> {
    try {
      const { data: messages, error } = await supabaseClient
        .from('messages')
        .select(
          `
          *,
          sender:profiles!messages_sender_id_fkey(*)
        `,
        )
        .eq('connection_id', connectionId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const messagesWithSender = (messages || []).map(msg => ({
        ...msg,
        sender: msg.sender as unknown as Profile,
      }));

      return { data: messagesWithSender, error: null };
    } catch (error) {
      return { data: [], error: error as Error };
    }
  }

  /**
   * Get conversation (connection + messages)
   */
  async getConversation(
    connectionId: string,
  ): Promise<{ data: Conversation | null; error: Error | null }> {
    try {
      // Get connection with users
      const { data: connection, error: connError } = await supabaseClient
        .from('connections')
        .select(
          `
          *,
          sponsor:profiles!connections_sponsor_id_fkey(*),
          sponsee:profiles!connections_sponsee_id_fkey(*)
        `,
        )
        .eq('id', connectionId)
        .single();

      if (connError) throw connError;

      const connectionWithUsers: ConnectionWithUsers = {
        ...connection,
        sponsor: connection.sponsor as unknown as Profile,
        sponsee: connection.sponsee as unknown as Profile,
      };

      // Get messages
      const { data: messages, error: msgError } = await this.getMessages(connectionId);

      if (msgError) throw msgError;

      // Get unread count
      const { count: unreadCount } = await supabaseClient
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('connection_id', connectionId)
        .eq('status', 'sent');

      const conversation: Conversation = {
        connection: connectionWithUsers,
        messages,
        unreadCount: unreadCount || 0,
      };

      return { data: conversation, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get conversation previews for user
   */
  async getConversationPreviews(
    userId: string,
  ): Promise<{ data: ConversationPreview[]; error: Error | null }> {
    try {
      const { data: connections, error: connError } = await supabaseClient
        .from('connections')
        .select(
          `
          *,
          sponsor:profiles!connections_sponsor_id_fkey(*),
          sponsee:profiles!connections_sponsee_id_fkey(*)
        `,
        )
        .or(`sponsor_id.eq.${userId},sponsee_id.eq.${userId}`)
        .eq('status', 'active')
        .order('last_interaction_at', { ascending: false, nullsFirst: false });

      if (connError) throw connError;

      const previews = await Promise.all(
        (connections || []).map(async conn => {
          // Get last message
          const { data: lastMessage } = await supabaseClient
            .from('messages')
            .select('*')
            .eq('connection_id', conn.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const { count: unreadCount } = await supabaseClient
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('connection_id', conn.id)
            .neq('sender_id', userId)
            .in('status', ['sent', 'delivered']);

          const connectionWithUsers: ConnectionWithUsers = {
            ...conn,
            sponsor: conn.sponsor as unknown as Profile,
            sponsee: conn.sponsee as unknown as Profile,
          };

          const preview: ConversationPreview = {
            connection: connectionWithUsers,
            lastMessage: lastMessage || null,
            unreadCount: unreadCount || 0,
            lastMessageAt: lastMessage?.created_at || null,
          };

          return preview;
        }),
      );

      return { data: previews, error: null };
    } catch (error) {
      return { data: [], error: error as Error };
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(data: MarkMessageReadData): Promise<{ error: Error | null }> {
    try {
      const updateData: TablesUpdate<'messages'> = {
        status: 'read',
        read_at: data.readAt,
      };

      const { error } = await supabaseClient
        .from('messages')
        .update(updateData)
        .eq('id', data.messageId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Mark multiple messages as delivered
   */
  async markAsDelivered(data: MarkMessagesDeliveredData): Promise<{ error: Error | null }> {
    try {
      const updateData: TablesUpdate<'messages'> = {
        status: 'delivered',
        delivered_at: data.deliveredAt,
      };

      const { error } = await supabaseClient
        .from('messages')
        .update(updateData)
        .in('id', data.messageIds);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Subscribe to new messages in a connection
   */
  subscribeToMessages(
    connectionId: string,
    onNewMessage: (event: NewMessageEvent) => void,
  ): () => void {
    const channelName = `connection:${connectionId}`;

    // Remove existing channel if any
    this.unsubscribeFromMessages(connectionId);

    const channel = supabaseClient
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `connection_id=eq.${connectionId}`,
        },
        async payload => {
          const message = payload.new as Message;

          // Fetch sender profile
          const { data: sender } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', message.sender_id)
            .single();

          if (sender) {
            onNewMessage({
              message,
              sender,
            });
          }
        },
      )
      .subscribe();

    this.activeChannels.set(connectionId, channel);

    // Return unsubscribe function
    return () => this.unsubscribeFromMessages(connectionId);
  }

  /**
   * Subscribe to message status updates
   */
  subscribeToMessageStatus(
    connectionId: string,
    onStatusUpdate: (event: MessageStatusUpdateEvent) => void,
  ): () => void {
    const channelName = `connection:${connectionId}:status`;

    const channel = supabaseClient
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `connection_id=eq.${connectionId}`,
        },
        payload => {
          const message = payload.new as Message;

          onStatusUpdate({
            messageId: message.id,
            status: message.status,
            timestamp: message.read_at || message.delivered_at || message.created_at,
          });
        },
      )
      .subscribe();

    this.activeChannels.set(`${connectionId}:status`, channel);

    return () => {
      channel.unsubscribe();
      this.activeChannels.delete(`${connectionId}:status`);
    };
  }

  /**
   * Unsubscribe from connection messages
   */
  unsubscribeFromMessages(connectionId: string): void {
    const channel = this.activeChannels.get(connectionId);
    if (channel) {
      channel.unsubscribe();
      this.activeChannels.delete(connectionId);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll(): void {
    this.activeChannels.forEach(channel => channel.unsubscribe());
    this.activeChannels.clear();
  }

  /**
   * Validate message text
   */
  validateMessage(text: string): { isValid: boolean; error?: string } {
    if (!text || text.trim().length === 0) {
      return { isValid: false, error: 'Message cannot be empty' };
    }

    if (text.length > 5000) {
      return { isValid: false, error: 'Message is too long (max 5000 characters)' };
    }

    return { isValid: true };
  }
}

export default new MessageServiceV2();
