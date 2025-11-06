/**
 * Connection Service
 * Manage sponsor/sponsee connections and requests
 * Feature: 002-app-screens
 */

import supabaseClient from './supabase'
import {
  Connection,
  ConnectionWithUsers,
  ConnectionDetails,
  CreateConnectionData,
  AcceptConnectionData,
  DeclineConnectionData,
  EndConnectionData,
  Profile,
  TablesInsert,
  TablesUpdate,
} from '../types'

class ConnectionService {
  /**
   * Get all active connections for a user
   */
  async getActiveConnections(
    userId: string
  ): Promise<{ data: ConnectionWithUsers[]; error: Error | null }> {
    try {
      const { data: connections, error } = await supabaseClient
        .from('connections')
        .select(
          `
          *,
          sponsor:profiles!connections_sponsor_id_fkey(*),
          sponsee:profiles!connections_sponsee_id_fkey(*)
        `
        )
        .or(`sponsor_id.eq.${userId},sponsee_id.eq.${userId}`)
        .eq('status', 'active')
        .order('last_interaction_at', { ascending: false, nullsFirst: false })

      if (error) throw error

      const connectionsWithUsers = (connections || []).map(conn => ({
        ...conn,
        sponsor: conn.sponsor as unknown as Profile,
        sponsee: conn.sponsee as unknown as Profile,
      }))

      return { data: connectionsWithUsers, error: null }
    } catch (error) {
      return { data: [], error: error as Error }
    }
  }

  /**
   * Get pending connection requests (received by user)
   */
  async getPendingRequests(
    userId: string
  ): Promise<{ data: ConnectionWithUsers[]; error: Error | null }> {
    try {
      const { data: connections, error } = await supabaseClient
        .from('connections')
        .select(
          `
          *,
          sponsor:profiles!connections_sponsor_id_fkey(*),
          sponsee:profiles!connections_sponsee_id_fkey(*)
        `
        )
        .or(`sponsor_id.eq.${userId},sponsee_id.eq.${userId}`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error

      const connectionsWithUsers = (connections || []).map(conn => ({
        ...conn,
        sponsor: conn.sponsor as unknown as Profile,
        sponsee: conn.sponsee as unknown as Profile,
      }))

      return { data: connectionsWithUsers, error: null }
    } catch (error) {
      return { data: [], error: error as Error }
    }
  }

  /**
   * Get connection by ID
   */
  async getConnection(
    connectionId: string
  ): Promise<{ data: ConnectionWithUsers | null; error: Error | null }> {
    try {
      const { data: connection, error } = await supabaseClient
        .from('connections')
        .select(
          `
          *,
          sponsor:profiles!connections_sponsor_id_fkey(*),
          sponsee:profiles!connections_sponsee_id_fkey(*)
        `
        )
        .eq('id', connectionId)
        .single()

      if (error) throw error

      const connectionWithUsers: ConnectionWithUsers = {
        ...connection,
        sponsor: connection.sponsor as unknown as Profile,
        sponsee: connection.sponsee as unknown as Profile,
      }

      return { data: connectionWithUsers, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  /**
   * Create a new connection request
   */
  async createConnection(
    data: CreateConnectionData
  ): Promise<{ data: Connection | null; error: Error | null }> {
    try {
      const insertData: TablesInsert<'connections'> = {
        sponsor_id: data.sponsorId,
        sponsee_id: data.sponseeId,
        status: 'pending',
      }

      const { data: connection, error } = await supabaseClient
        .from('connections')
        .insert(insertData)
        .select()
        .single()

      if (error) throw error

      return { data: connection, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  /**
   * Accept a connection request
   */
  async acceptConnection(
    data: AcceptConnectionData
  ): Promise<{ data: Connection | null; error: Error | null }> {
    try {
      const updateData: TablesUpdate<'connections'> = {
        status: 'active',
        accepted_at: data.acceptedAt,
      }

      const { data: connection, error } = await supabaseClient
        .from('connections')
        .update(updateData)
        .eq('id', data.connectionId)
        .eq('status', 'pending')
        .select()
        .single()

      if (error) throw error

      return { data: connection, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  /**
   * Decline a connection request
   */
  async declineConnection(
    data: DeclineConnectionData
  ): Promise<{ error: Error | null }> {
    try {
      const updateData: TablesUpdate<'connections'> = {
        declined_at: data.declinedAt,
      }

      // Instead of changing status, we could delete or mark as declined
      // For now, we'll delete the request
      const { error } = await supabaseClient
        .from('connections')
        .delete()
        .eq('id', data.connectionId)
        .eq('status', 'pending')

      if (error) throw error

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  /**
   * End an active connection
   */
  async endConnection(
    data: EndConnectionData
  ): Promise<{ data: Connection | null; error: Error | null }> {
    try {
      const updateData: TablesUpdate<'connections'> = {
        status: 'ended',
        ended_at: data.endedAt,
        ended_by: data.endedBy,
        end_feedback: data.endFeedback,
      }

      const { data: connection, error } = await supabaseClient
        .from('connections')
        .update(updateData)
        .eq('id', data.connectionId)
        .eq('status', 'active')
        .select()
        .single()

      if (error) throw error

      return { data: connection, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  /**
   * Calculate days since connection was established
   */
  calculateDaysSinceConnected(acceptedAt: string | undefined): number {
    if (!acceptedAt) return 0

    const accepted = new Date(acceptedAt)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - accepted.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  /**
   * Get connection details with statistics
   */
  async getConnectionDetails(
    connectionId: string
  ): Promise<{ data: ConnectionDetails | null; error: Error | null }> {
    try {
      const { data: connection, error: connError } = await this.getConnection(
        connectionId
      )

      if (connError || !connection) {
        throw connError || new Error('Connection not found')
      }

      // Get message count and unread count
      const { count: totalMessages } = await supabaseClient
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('connection_id', connectionId)

      const userId = connection.sponsor.id // Or get from context
      const { count: unreadCount } = await supabaseClient
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('connection_id', connectionId)
        .neq('sender_id', userId)
        .eq('status', 'sent')

      // Get last message preview
      const { data: lastMessage } = await supabaseClient
        .from('messages')
        .select('text')
        .eq('connection_id', connectionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      const details: ConnectionDetails = {
        ...connection,
        daysSinceConnected: this.calculateDaysSinceConnected(
          connection.accepted_at
        ),
        totalMessages: totalMessages || 0,
        unreadMessageCount: unreadCount || 0,
        lastMessagePreview: lastMessage?.text,
      }

      return { data: details, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }
}

export default new ConnectionService()
