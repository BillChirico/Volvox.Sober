/**
 * Connection domain types
 * Feature: 002-app-screens
 */

import { Tables } from './database.types'
import { Profile } from './profile'

// ============================================================
// Base Connection Types
// ============================================================

export type ConnectionStatus = 'pending' | 'active' | 'ended'

export interface Connection extends Tables<'connections'> {}

export interface ConnectionWithUsers extends Connection {
  sponsor: Profile
  sponsee: Profile
}

// ============================================================
// Connection Request Types
// ============================================================

export interface ConnectionRequest extends Connection {
  requester: Profile
  recipient: Profile
}

export interface CreateConnectionData {
  sponsorId: string
  sponseeId: string
}

export interface AcceptConnectionData {
  connectionId: string
  acceptedAt: string
}

export interface DeclineConnectionData {
  connectionId: string
  declinedAt: string
}

export interface EndConnectionData {
  connectionId: string
  endedAt: string
  endedBy: string
  endFeedback?: string
}

// ============================================================
// Connection Details
// ============================================================

export interface ConnectionDetails extends ConnectionWithUsers {
  daysSinceConnected: number
  totalMessages: number
  unreadMessageCount: number
  lastMessagePreview?: string
}

export interface ConnectionStatistics {
  totalActive: number
  totalPending: number
  totalEnded: number
  averageDuration: number // days
  messageFrequency: number // messages per week
}

// ============================================================
// UI State Types
// ============================================================

export interface ConnectionsState {
  activeConnections: ConnectionDetails[]
  pendingRequests: ConnectionRequest[]
  sentRequests: ConnectionRequest[]
  endedConnections: ConnectionWithUsers[]
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
}

export interface ConnectionListFilters {
  status?: ConnectionStatus
  sortBy?: 'recent' | 'oldest' | 'name'
  searchQuery?: string
}

export interface ConnectionActionState {
  connectionId: string
  action: 'accepting' | 'declining' | 'ending'
  isLoading: boolean
}
