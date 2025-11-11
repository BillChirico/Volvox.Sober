/**
 * Onboarding Feature Public API
 * Feature: Onboarding
 *
 * This barrel file exports the public API for the Onboarding feature.
 * External code should only import from this file, not from internal modules.
 *
 * Directory structure:
 * - components/: Onboarding UI components (WelcomeCard, ProfileForm, RoleSelector)
 * - hooks/: React hooks for onboarding operations (useOnboarding)
 * - services/: API clients and business logic (onboardingService)
 * - store/: Redux state management (onboardingSlice, onboardingThunks, onboardingSelectors)
 * - types/: TypeScript type definitions (OnboardingState, ProfileFormData, etc.)
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

// Screens: N/A - use app/(onboarding)/ per Expo Router architecture
