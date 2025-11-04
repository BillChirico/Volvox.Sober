/**
 * Message Service
 * Handles all message-related operations with Supabase
 */

import { supabase, getCurrentUserId } from './supabase'
import type {
  Message,
  ConversationPreview,
  PaginatedResult,
  TablesInsert,
} from '../types'

// ============================================================
// Message Queries
// ============================================================

/**
 * Get paginated messages for a connection
 * @param connectionId - Connection UUID
 * @param limit - Number of messages per page (default: 50)
 * @param offset - Offset for pagination (default: 0)
 */
export const getMessages = async (
  connectionId: string,
  limit = 50,
  offset = 0
): Promise<PaginatedResult<Message>> => {
  const { data, error, count } = await supabase
    .from('messages')
    .select('*, sender:users!sender_id(*), recipient:users!recipient_id(*)', { count: 'exact' })
    .eq('connection_id', connectionId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error

  return {
    data: data || [],
    count,
    hasMore: (count || 0) > offset + limit,
    nextPage: (count || 0) > offset + limit ? Math.floor((offset + limit) / limit) : undefined,
  }
}

/**
 * Get conversation previews for current user
 * Shows all connections with their last message and unread count
 */
export const getConversations = async (): Promise<ConversationPreview[]> => {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('User not authenticated')

  // Get all active connections for the user
  const { data: connections, error: connectionsError } = await supabase
    .from('connections')
    .select('*, sponsor:users!sponsor_id(*), sponsee:users!sponsee_id(*)')
    .or(`sponsor_id.eq.${userId},sponsee_id.eq.${userId}`)
    .eq('status', 'active')
    .order('last_message_at', { ascending: false, nullsFirst: false })

  if (connectionsError) throw connectionsError

  // For each connection, get the last message and unread count
  const conversationPreviews = await Promise.all(
    (connections || []).map(async (connection) => {
      // Get last message
      const { data: lastMessage } = await supabase
        .from('messages')
        .select('*')
        .eq('connection_id', connection.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // Get unread count (messages where recipient is current user and read_at is null)
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('connection_id', connection.id)
        .eq('recipient_id', userId)
        .is('read_at', null)

      return {
        connection,
        lastMessage: lastMessage || undefined,
        unreadCount: unreadCount || 0,
      }
    })
  )

  return conversationPreviews
}

/**
 * Get unread message count for current user
 */
export const getUnreadMessageCount = async (): Promise<number> => {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('User not authenticated')

  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .is('read_at', null)

  if (error) throw error
  return count || 0
}

// ============================================================
// Message Mutations
// ============================================================

/**
 * Send a new message
 * @param connectionId - Connection UUID
 * @param recipientId - Recipient user UUID
 * @param text - Message text (max 2000 characters)
 */
export const sendMessage = async (
  connectionId: string,
  recipientId: string,
  text: string
): Promise<Message> => {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('User not authenticated')

  if (text.length > 2000) {
    throw new Error('Message text cannot exceed 2000 characters')
  }

  const messageData: TablesInsert<'messages'> = {
    connection_id: connectionId,
    sender_id: userId,
    recipient_id: recipientId,
    text,
  }

  const { data, error } = await supabase
    .from('messages')
    .insert(messageData)
    .select('*, sender:users!sender_id(*), recipient:users!recipient_id(*)')
    .single()

  if (error) throw error
  return data
}

/**
 * Mark a message as read
 * @param messageId - Message UUID
 */
export const markMessageAsRead = async (messageId: string): Promise<void> => {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('User not authenticated')

  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('id', messageId)
    .eq('recipient_id', userId) // Only recipient can mark as read
    .is('read_at', null) // Only mark if not already read

  if (error) throw error
}

/**
 * Mark all messages in a connection as read
 * @param connectionId - Connection UUID
 */
export const markAllMessagesAsRead = async (connectionId: string): Promise<void> => {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('User not authenticated')

  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('connection_id', connectionId)
    .eq('recipient_id', userId)
    .is('read_at', null)

  if (error) throw error
}

/**
 * Archive a message (soft delete)
 * @param messageId - Message UUID
 */
export const archiveMessage = async (messageId: string): Promise<void> => {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('User not authenticated')

  const { error } = await supabase
    .from('messages')
    .update({ archived: true })
    .eq('id', messageId)
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)

  if (error) throw error
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Get partner user ID in a connection
 * @param connectionId - Connection UUID
 */
export const getPartnerUserId = async (connectionId: string): Promise<string> => {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('User not authenticated')

  const { data: connection, error } = await supabase
    .from('connections')
    .select('sponsor_id, sponsee_id')
    .eq('id', connectionId)
    .single()

  if (error) throw error
  if (!connection) throw new Error('Connection not found')

  // Return the ID that is NOT the current user
  return connection.sponsor_id === userId ? connection.sponsee_id : connection.sponsor_id
}
