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
// NOTE: Feature-specific types have been moved to their respective feature directories:
// - Profile types: src/features/profile/types/
// - Onboarding types: src/features/onboarding/types/
// - Sobriety types: src/features/sobriety/types/
// - Match types: src/features/matches/types/
// - Connection types: src/features/connections/types/
// - Message types: src/features/messages/types/
// Import from @/features/{feature} instead of this barrel export.

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

// CheckInWithConnection requires ConnectionWithUsers from connections feature
// Import it when needed from @/features/connections
export interface CheckInWithConnection extends CheckIn {
  connection: any; // Use ConnectionWithUsers from @/features/connections when importing
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
