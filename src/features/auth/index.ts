/**
 * Auth Feature Public API
 * Feature: Auth
 *
 * This barrel file exports the public API for the Auth feature.
 * External code should only import from this file, not from internal modules.
 *
 * Directory structure:
 * - components/: Auth UI components (LoginForm, SignupForm, PasswordInput, etc.)
 * - hooks/: React hooks for auth operations (useAuth, useAuthRedirect)
 * - services/: API clients and business logic (authService)
 * - store/: Redux state management (authSlice, authThunks, authSelectors)
 * - types/: TypeScript type definitions (User, AuthState, etc.)
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

// Types: Co-located with their usage (components, services, store)
// - Component types: AuthErrorMessageProps, PasswordStrengthProps (exported via ./components)
// - Service types: SignUpParams, SignInParams, AuthResponse (exported via ./services)
// - Store types: AuthState (exported via ./store)

// Screens: N/A - use app/(auth)/ per Expo Router architecture
