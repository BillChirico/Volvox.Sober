/**
 * useAuth Hook
 * Custom hook for authentication operations
 * Feature: 002-app-screens
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './useAppDispatch';
import {
  signupThunk,
  loginThunk,
  logoutThunk,
  resetPasswordRequestThunk,
  updatePasswordThunk,
} from '../store/auth/authThunks';
import {
  selectSession,
  selectUser,
  selectAuthLoading,
  selectAuthError,
  selectIsAuthenticated,
  selectIsEmailVerified,
} from '../store/auth/authSelectors';
import { clearError } from '../store/auth/authSlice';

/**
 * Hook for managing authentication
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const session = useAppSelector(selectSession);
  const user = useAppSelector(selectUser);
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isEmailVerified = useAppSelector(selectIsEmailVerified);

  // Actions
  const signup = useCallback(
    (email: string, password: string) => {
      return dispatch(signupThunk({ email, password }));
    },
    [dispatch]
  );

  const login = useCallback(
    (email: string, password: string) => {
      return dispatch(loginThunk({ email, password }));
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    return dispatch(logoutThunk());
  }, [dispatch]);

  const resetPasswordRequest = useCallback(
    (email: string) => {
      return dispatch(resetPasswordRequestThunk({ email }));
    },
    [dispatch]
  );

  const updatePassword = useCallback(
    (newPassword: string) => {
      return dispatch(updatePasswordThunk({ newPassword }));
    },
    [dispatch]
  );

  const dismissError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // State
    session,
    user,
    loading,
    error,
    isAuthenticated,
    isEmailVerified,

    // Actions
    signup,
    login,
    logout,
    resetPasswordRequest,
    updatePassword,
    dismissError,
  };
};
