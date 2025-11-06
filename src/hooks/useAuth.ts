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
  updateEmailThunk,
  deleteAccountThunk,
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
import authService from '../services/authService';

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

  const updateEmail = useCallback(
    (newEmail: string, password: string) => {
      return dispatch(updateEmailThunk({ newEmail, password }));
    },
    [dispatch]
  );

  const updatePassword = useCallback(
    (currentPassword: string, newPassword: string) => {
      return dispatch(updatePasswordThunk({ currentPassword, newPassword }));
    },
    [dispatch]
  );

  const deleteAccount = useCallback(
    (password: string) => {
      return dispatch(deleteAccountThunk({ password }));
    },
    [dispatch]
  );

  const dismissError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const resendVerificationEmail = useCallback(async () => {
    if (!user?.email) {
      throw new Error('No user email available');
    }
    return await authService.resendVerification(user.email);
  }, [user?.email]);

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
    resendVerificationEmail,
    updateEmail,
    updatePassword,
    deleteAccount,
    dismissError,
  };
};
