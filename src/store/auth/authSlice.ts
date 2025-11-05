import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Session, User } from '@supabase/supabase-js';

export interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  session: null,
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<Session | null>) => {
      state.session = action.payload;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.session = null;
      state.user = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setSession,
  setUser,
  setLoading,
  setError,
  clearError,
  clearAuth,
} = authSlice.actions;

export default authSlice.reducer;
