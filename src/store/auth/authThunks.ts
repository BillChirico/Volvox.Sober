import { createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';
import { setSession, setUser, setLoading, setError, clearAuth } from './authSlice';

interface SignupPayload {
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface ResetPasswordPayload {
  email: string;
}

interface UpdatePasswordPayload {
  newPassword: string;
}

export const signupThunk = createAsyncThunk<{ success: boolean }, SignupPayload>(
  'auth/signup',
  async (payload: SignupPayload, { dispatch }) => {
    dispatch(setLoading(true));
    try {
      const { user, session, error } = await authService.signUp(payload.email, payload.password);

      if (error) {
        dispatch(setError(error.message));
        dispatch(setLoading(false));
        return { success: false };
      }

      if (user) {
        dispatch(setUser(user));
      }
      if (session) {
        dispatch(setSession(session));
      }
      dispatch(setLoading(false));
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      return { success: false };
    }
  },
);

export const loginThunk = createAsyncThunk<{ success: boolean }, LoginPayload>(
  'auth/login',
  async (payload: LoginPayload, { dispatch }) => {
    dispatch(setLoading(true));
    try {
      const { user, session, error } = await authService.signIn(payload.email, payload.password);

      if (error) {
        dispatch(setError(error.message));
        dispatch(setLoading(false));
        return { success: false };
      }

      if (user) {
        dispatch(setUser(user));
      }
      if (session) {
        dispatch(setSession(session));
      }
      dispatch(setLoading(false));
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      return { success: false };
    }
  },
);

export const logoutThunk = createAsyncThunk<{ success: boolean }, void>(
  'auth/logout',
  async (_, { dispatch }) => {
    dispatch(setLoading(true));
    try {
      const { error } = await authService.signOut();

      if (error) {
        dispatch(setError(error.message));
        dispatch(setLoading(false));
        return { success: false };
      }

      dispatch(clearAuth());
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      return { success: false };
    }
  },
);

export const resetPasswordRequestThunk = createAsyncThunk<
  { success: boolean },
  ResetPasswordPayload
>('auth/resetPasswordRequest', async (payload: ResetPasswordPayload, { dispatch }) => {
  dispatch(setLoading(true));
  try {
    const { error } = await authService.resetPasswordRequest(payload.email);

    if (error) {
      dispatch(setError(error.message));
      dispatch(setLoading(false));
      return { success: false };
    }

    dispatch(setLoading(false));
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Password reset request failed';
    dispatch(setError(errorMessage));
    dispatch(setLoading(false));
    return { success: false };
  }
});

export const updatePasswordThunk = createAsyncThunk<{ success: boolean }, UpdatePasswordPayload>(
  'auth/updatePassword',
  async (payload: UpdatePasswordPayload, { dispatch }) => {
    dispatch(setLoading(true));
    try {
      const { user, error } = await authService.updatePassword(payload.newPassword);

      if (error) {
        dispatch(setError(error.message));
        dispatch(setLoading(false));
        return { success: false };
      }

      if (user) {
        dispatch(setUser(user));
      }
      dispatch(setLoading(false));
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password update failed';
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      return { success: false };
    }
  },
);
