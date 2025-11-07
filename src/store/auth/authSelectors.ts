import type { RootState } from '../index';

export const selectSession = (state: RootState) => state.auth?.session ?? null;

export const selectUser = (state: RootState) => state.auth?.user ?? null;

export const selectAuthLoading = (state: RootState) => state.auth?.loading ?? false;

export const selectAuthError = (state: RootState) => state.auth?.error ?? null;

export const selectIsAuthenticated = (state: RootState) => {
  const session = state.auth?.session;
  const user = state.auth?.user;
  // Email verification is non-blocking - users can be authenticated without verification
  return !!session && !!user;
};

export const selectIsEmailVerified = (state: RootState) => {
  const user = state.auth?.user;
  return !!user?.email_confirmed_at;
};
