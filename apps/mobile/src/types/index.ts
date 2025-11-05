/**
 * Application types for Volvox.Sober
 * Domain models and UI types
 */

import { Tables } from './database.types'

// Re-export database types
export * from './database.types'

// ============================================================
// Message Types
// ============================================================

export interface Message extends Tables<'messages'> {
  sender?: User
  recipient?: User
}

export interface MessageWithConnection extends Message {
  connection: Connection
}

export interface ConversationPreview {
  connection: ConnectionWithUsers
  lastMessage?: Message
  unreadCount: number
}

// ============================================================
// Connection Types
// ============================================================

export interface Connection extends Tables<'connections'> {}

export interface ConnectionWithUsers extends Connection {
  sponsor: User
  sponsee: User
}

// ============================================================
// User Types
// ============================================================

export interface User extends Tables<'users'> {}

export interface UserProfile extends User {
  role?: 'sponsor' | 'sponsee'
}

// ============================================================
// Check-In Types
// ============================================================

export interface CheckIn extends Tables<'check_ins'> {}

export interface CheckInWithConnection extends CheckIn {
  connection: ConnectionWithUsers
}

export interface CheckInResponse extends Tables<'check_in_responses'> {}

export interface CheckInResponseWithCheckIn extends CheckInResponse {
  check_in: CheckIn
}

// ============================================================
// Pagination Types
// ============================================================

export interface PaginatedResult<T> {
  data: T[]
  count: number | null
  hasMore: boolean
  nextPage?: number
}

export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T> {
  data?: T
  error?: ApiError
}

export interface ApiError {
  message: string
  code?: string
  details?: unknown
}

// ============================================================
// UI State Types
// ============================================================

export interface LoadingState {
  isLoading: boolean
  error?: string
}

export interface MessageInputState {
  text: string
  isSending: boolean
}

export interface ConversationState extends LoadingState {
  messages: Message[]
  hasMore: boolean
  isLoadingMore: boolean
}
