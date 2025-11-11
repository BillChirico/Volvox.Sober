/**
 * Sobriety Feature Public API
 * Feature: Sobriety
 *
 * This barrel file exports the public API for the Sobriety feature.
 * External code should only import from this file, not from internal modules.
 *
 * Directory structure:
 * - components/: Sobriety UI components (SobrietyDatePicker, MilestoneCard, etc.)
 * - hooks/: React hooks for sobriety operations (useSobrietyTracking)
 * - services/: API clients and business logic (sobrietyService)
 * - store/: Redux state management (sobrietySlice, sobrietyThunks, sobrietySelectors)
 * - types/: TypeScript type definitions (SobrietyState, Milestone, etc.)
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

// Screens: N/A - use app/(tabs)/sobriety/ per Expo Router architecture
