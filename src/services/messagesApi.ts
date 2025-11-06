/**
 * RTK Query API slice for Messaging (WP08 T115-T119)
 * Handles message CRUD operations and real-time updates
 */

import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { sendNewMessageNotification } from '../utils/notificationHelpers';

export interface Message {
  id: string;
  connection_id: string;
  sender_id: string;
  recipient_id: string;
  message_text: string;
  message_type: 'text' | 'checkin_response' | 'system';
  sent_at: string;
  delivered_at: string | null;
  read_at: string | null;
  archived: boolean;
}

export interface Conversation {
  connection_id: string;
  other_user_id: string;
  other_user_name: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export interface SendMessageParams {
  connection_id: string;
  recipient_id: string;
  message_text: string;
}

export interface TypingEvent {
  user_id: string;
  connection_id: string;
  is_typing: boolean;
}

export const messagesApi = createApi({
  reducerPath: 'messagesApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Messages', 'Conversations', 'UnreadCount'],
  endpoints: builder => ({
    // T115: Get conversation list with last message and unread count
    getConversations: builder.query<Conversation[], void>({
      async queryFn() {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return { error: { message: 'Not authenticated' } };

        // Get all active connections
        const { data: connections, error: connError } = await supabase
          .from('connections')
          .select(
            `
            id,
            sponsor_id,
            sponsee_id,
            users!connections_sponsor_id_fkey(id, full_name),
            users!connections_sponsee_id_fkey(id, full_name)
          `,
          )
          .eq('status', 'active')
          .or(`sponsor_id.eq.${user.id},sponsee_id.eq.${user.id}`);

        if (connError) return { error: connError };
        if (!connections) return { data: [] };

        // Get last message and unread count for each connection
        const conversations: Conversation[] = await Promise.all(
          connections.map(async (conn: any) => {
            const otherId = conn.sponsor_id === user.id ? conn.sponsee_id : conn.sponsor_id;
            const otherUser =
              conn.sponsor_id === user.id
                ? conn.users[1] // sponsee
                : conn.users[0]; // sponsor

            // Get last message
            const { data: lastMsg } = await supabase
              .from('messages')
              .select('message_text, sent_at')
              .eq('connection_id', conn.id)
              .order('sent_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            // Get unread count
            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('connection_id', conn.id)
              .eq('recipient_id', user.id)
              .is('read_at', null);

            return {
              connection_id: conn.id,
              other_user_id: otherId,
              other_user_name: otherUser?.full_name || 'Unknown',
              last_message: lastMsg?.message_text || '',
              last_message_at: lastMsg?.sent_at || conn.created_at,
              unread_count: count || 0,
            };
          }),
        );

        // Sort by most recent message
        conversations.sort(
          (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime(),
        );

        return { data: conversations };
      },
      providesTags: ['Conversations'],
    }),

    // T115: Get messages for a connection
    getMessages: builder.query<Message[], string>({
      async queryFn(connectionId) {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('connection_id', connectionId)
          .order('sent_at', { ascending: true });

        if (error) return { error };
        return { data: data as Message[] };
      },
      providesTags: (_result, _error, connectionId) => [{ type: 'Messages', id: connectionId }],
    }),

    // T116: Send message
    sendMessage: builder.mutation<Message, SendMessageParams>({
      async queryFn({ connection_id, recipient_id, message_text }) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return { error: { message: 'Not authenticated' } };

        const { data, error } = await supabase
          .from('messages')
          .insert({
            connection_id,
            sender_id: user.id,
            recipient_id,
            message_text,
            message_type: 'text',
          })
          .select()
          .single();

        if (error) return { error };

        // T138: Send push notification to recipient
        const { data: senderData } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (senderData) {
          await sendNewMessageNotification(
            recipient_id,
            senderData.full_name || 'Someone',
            message_text,
            connection_id,
          );
        }

        return { data: data as Message };
      },
      invalidatesTags: (_result, _error, { connection_id }) => [
        { type: 'Messages', id: connection_id },
        'Conversations',
        'UnreadCount',
      ],
    }),

    // T117: Mark message as delivered
    markAsDelivered: builder.mutation<void, string>({
      async queryFn(messageId) {
        const { error } = await supabase
          .from('messages')
          .update({ delivered_at: new Date().toISOString() })
          .eq('id', messageId)
          .is('delivered_at', null);

        if (error) return { error };
        return { data: undefined };
      },
    }),

    // T118: Mark message as read
    markAsRead: builder.mutation<void, string>({
      async queryFn(messageId) {
        const { error } = await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .eq('id', messageId)
          .is('read_at', null);

        if (error) return { error };
        return { data: undefined };
      },
      invalidatesTags: ['Conversations', 'UnreadCount'],
    }),

    // T118: Mark all messages in connection as read
    markConnectionAsRead: builder.mutation<void, string>({
      async queryFn(connectionId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return { error: { message: 'Not authenticated' } };

        const { error } = await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .eq('connection_id', connectionId)
          .eq('recipient_id', user.id)
          .is('read_at', null);

        if (error) return { error };
        return { data: undefined };
      },
      invalidatesTags: ['Conversations', 'UnreadCount'],
    }),

    // T122: Get total unread message count
    getUnreadCount: builder.query<number, void>({
      async queryFn() {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return { error: { message: 'Not authenticated' } };

        const { count, error } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', user.id)
          .is('read_at', null);

        if (error) return { error };
        return { data: count || 0 };
      },
      providesTags: ['UnreadCount'],
    }),
  }),
});

// T115: Realtime subscription helper
export const createMessagesSubscription = (
  connectionId: string,
  userId: string,
  onNewMessage: (message: Message) => void,
): RealtimeChannel => {
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
      payload => {
        const message = payload.new as Message;
        onNewMessage(message);
      },
    )
    .subscribe();

  return channel;
};

// T119: Typing indicator helper
export const createTypingChannel = (
  connectionId: string,
  onTyping: (event: TypingEvent) => void,
): RealtimeChannel => {
  const channel = supabase
    .channel(`typing:${connectionId}`)
    .on('broadcast', { event: 'typing' }, ({ payload }) => {
      onTyping(payload as TypingEvent);
    })
    .subscribe();

  return channel;
};

// T119: Send typing event
export const sendTypingEvent = (
  channel: RealtimeChannel,
  userId: string,
  connectionId: string,
  isTyping: boolean,
): void => {
  channel.send({
    type: 'broadcast',
    event: 'typing',
    payload: { user_id: userId, connection_id: connectionId, is_typing: isTyping },
  });
};

export const {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkAsDeliveredMutation,
  useMarkAsReadMutation,
  useMarkConnectionAsReadMutation,
  useGetUnreadCountQuery,
} = messagesApi;
