import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

export interface User {
  id: string;
  email: string;
  role: 'sponsor' | 'sponsee' | 'both';
  profile_photo_url?: string;
  name: string;
  location: {
    city: string;
    state: string;
  };
  program_type: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
}

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
      }
    },
    clearUser: state => {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

// Actions
export const { setUser, updateUser, clearUser, setLoading, setError } = userSlice.actions;

// Selectors
export const selectCurrentUser = (state: RootState) => state.user?.user;
export const selectUserRole = (state: RootState) => state.user?.user?.role;
export const selectUserLoading = (state: RootState) => state.user?.loading;
export const selectUserError = (state: RootState) => state.user?.error;

export default userSlice.reducer;
