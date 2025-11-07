/**
 * Application types for Volvox.Sober
 * Domain models and UI types
 */

// ============================================================
// Database Types
// ============================================================

export * from './database.types';

// ============================================================
// Domain Types (Feature 002-app-screens)
// ============================================================

export * from './profile';
export * from './onboarding';
export * from './sobriety';
export * from './match';
export * from './connection';
export * from './message';
export * from './navigation';

// ============================================================
// Legacy Types (from previous features)
// ============================================================

import { Tables } from './database.types';

export interface User extends Tables<'users'> {}

export interface UserProfile extends User {
  role?: 'sponsor' | 'sponsee';
}

export interface CheckIn extends Tables<'check_ins'> {}

export interface CheckInResponse extends Tables<'check_in_responses'> {}

export interface CheckInWithConnection extends CheckIn {
  connection: ConnectionWithUsers;
}

export interface CheckInResponseWithCheckIn extends CheckInResponse {
  check_in: CheckIn;
}

// ============================================================
// Pagination Types
// ============================================================

export interface PaginatedResult<T> {
  data: T[];
  count: number | null;
  hasMore: boolean;
  nextPage?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

// ============================================================
// UI State Types (Shared)
// ============================================================

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface AsyncOperationState extends LoadingState {
  isSuccess: boolean;
}

// Re-import connection types for legacy compatibility
import { Connection, ConnectionWithUsers } from './connection';
export type { Connection, ConnectionWithUsers };
