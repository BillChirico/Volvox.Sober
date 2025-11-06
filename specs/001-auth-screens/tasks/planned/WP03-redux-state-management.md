# WP03: Redux State Management

**Status**: 📋 Planned | **Priority**: Foundational | **Dependencies**: WP02 | **Effort**: 4-5 hours

## Objective

Implement Redux auth slice with thunks for state management and session persistence.

## Subtasks

- **T012**: Create authSlice.ts (state, reducers, actions)
- **T013**: Implement authThunks.ts (signup, login, logout, resetPassword, updatePassword)
- **T014**: Create authSelectors.ts (selectSession, selectUser, selectIsAuthenticated, etc.)
- **T015**: Configure Redux Persist for auth slice (whitelist auth, exclude loading/error)
- **T016** [P]: Write unit tests for authSlice
- **T017** [P]: Write unit tests for authThunks (mock authService)

## Key Implementation

Redux State Structure (from data-model.md):

```typescript
interface AuthState {
  session: { access_token; refresh_token; expires_at; expires_in; token_type } | null;
  user: { id; email; email_confirmed_at; app_metadata; user_metadata } | null;
  loading: boolean;
  error: string | null;
}
```

## Acceptance Criteria

- Auth slice manages session/user/loading/error state
- Thunks integrate with authService from WP02
- Redux Persist saves session to AsyncStorage (FR-007, SC-007)
- 100% test coverage for slice and thunks

## Files Created

- `src/store/auth/authSlice.ts`
- `src/store/auth/authThunks.ts`
- `src/store/auth/authSelectors.ts`
- `__tests__/store/auth/authSlice.test.ts`
- `__tests__/store/auth/authThunks.test.ts`

**Modified**: `src/store/index.ts` (add auth reducer to store)
