/**
 * Profile Feature Public API
 * Feature: Profile
 *
 * This barrel file exports the public API for the Profile feature.
 * External code should only import from this file, not from internal modules.
 *
 * Directory structure:
 * - components/: Profile UI components (ProfileHeader, ProfileCard, etc.)
 * - hooks/: React hooks for profile operations (useProfile)
 * - services/: API clients and business logic (profileService, profileCache)
 * - store/: Redux state management (profileSlice, profileThunks, profileSelectors)
 * - types/: TypeScript type definitions (UserProfile, ProfileFormData, etc.)
 * - screens/: Screen components (N/A - screens in app/ directory per Expo Router)
 */

// Components
export * from './components';

// Hooks
export * from './hooks';

// Services
export * from './services';

// Store
export * from './store';

// Types
export * from './types';

// Screens: N/A - use app/(tabs)/profile/ per Expo Router architecture
