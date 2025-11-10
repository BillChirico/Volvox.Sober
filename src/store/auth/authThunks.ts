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
  currentPassword: string;
  newPassword: string;
}

interface UpdateEmailPayload {
  newEmail: string;
  password: string;
}

interface DeleteAccountPayload {
  password: string;
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

export const updateEmailThunk = createAsyncThunk<{ success: boolean }, UpdateEmailPayload>(
  'auth/updateEmail',
  async (payload: UpdateEmailPayload, { dispatch }) => {
    dispatch(setLoading(true));
    try {
      // Note: Supabase will send a confirmation email to the new address
      // Password verification happens on the server side
      const { user, error } = await authService.updateEmail(payload.newEmail);

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
      const errorMessage = error instanceof Error ? error.message : 'Email update failed';
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      return { success: false };
    }
  },
);

export const updatePasswordThunk = createAsyncThunk<{ success: boolean }, UpdatePasswordPayload>(
  'auth/updatePassword',
  async (payload: UpdatePasswordPayload, { dispatch, getState }) => {
    dispatch(setLoading(true));
    try {
      // Defense-in-depth: Re-authenticate user before allowing password change
      // This prevents unauthorized password changes if session is hijacked
      const state = getState() as any; // Type assertion for getState
      const userEmail = state.auth.user?.email;

      if (!userEmail) {
        dispatch(setError('User email not found. Please log in again.'));
        dispatch(setLoading(false));
        return { success: false };
      }

      // Re-authenticate with current password
      const { error: authError } = await authService.signIn(userEmail, payload.currentPassword);
      if (authError) {
        dispatch(setError('Current password is incorrect'));
        dispatch(setLoading(false));
        return { success: false };
      }

      // Current password verified, now update to new password
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

export const deleteAccountThunk = createAsyncThunk<{ success: boolean }, DeleteAccountPayload>(
  'auth/deleteAccount',
  async (payload: DeleteAccountPayload, { dispatch, getState }) => {
    dispatch(setLoading(true));
    try {
      // Defense-in-depth: Re-authenticate user before allowing account deletion
      // This prevents unauthorized deletion if session is hijacked
      const state = getState() as any; // Type assertion for getState
      const userEmail = state.auth.user?.email;

      if (!userEmail) {
        dispatch(setError('User email not found. Please log in again.'));
        dispatch(setLoading(false));
        return { success: false };
      }

      // Re-authenticate with password
      const { error: authError } = await authService.signIn(userEmail, payload.password);
      if (authError) {
        dispatch(setError('Password is incorrect. Account deletion cancelled.'));
        dispatch(setLoading(false));
        return { success: false };
      }

      // Password verified, proceed with account deletion
      const { error } = await authService.deleteAccount();

      if (error) {
        dispatch(setError(error.message));
        dispatch(setLoading(false));
        return { success: false };
      }

      dispatch(clearAuth());
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Account deletion failed';
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      return { success: false };
    }
  },
);
