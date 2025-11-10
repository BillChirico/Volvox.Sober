/**
 * Auth API Slice
 * RTK Query API for authentication operations
 */

import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { AuthResponse, AuthError } from '@supabase/supabase-js';
import { signIn, signUp, signOut, resetPassword, updatePassword } from '../../services/supabase';

interface SignUpRequest {
  email: string;
  password: string;
  name: string;
  age: number;
  role: 'sponsor' | 'sponsee' | 'both';
}

interface SignInRequest {
  email: string;
  password: string;
}

interface ResetPasswordRequest {
  email: string;
}

interface UpdatePasswordRequest {
  newPassword: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Auth'],
  endpoints: builder => ({
    signUp: builder.mutation<AuthResponse, SignUpRequest>({
      queryFn: async ({ email, password, name, age, role }) => {
        try {
          const response = await signUp(email, password, { name, age, role });
          if (response.error) {
            return { error: response.error as AuthError };
          }
          return { data: response };
        } catch (error) {
          return { error: error as AuthError };
        }
      },
      invalidatesTags: ['Auth'],
    }),

    signIn: builder.mutation<AuthResponse, SignInRequest>({
      queryFn: async ({ email, password }) => {
        try {
          const response = await signIn(email, password);
          if (response.error) {
            return { error: response.error as AuthError };
          }
          return { data: response };
        } catch (error) {
          return { error: error as AuthError };
        }
      },
      invalidatesTags: ['Auth'],
    }),

    signOut: builder.mutation<void, void>({
      queryFn: async () => {
        try {
          const response = await signOut();
          if (response.error) {
            return { error: response.error as AuthError };
          }
          return { data: undefined };
        } catch (error) {
          return { error: error as AuthError };
        }
      },
      invalidatesTags: ['Auth'],
    }),

    resetPassword: builder.mutation<void, ResetPasswordRequest>({
      queryFn: async ({ email }) => {
        try {
          const response = await resetPassword(email);
          if (response.error) {
            return { error: response.error as AuthError };
          }
          return { data: undefined };
        } catch (error) {
          return { error: error as AuthError };
        }
      },
    }),

    updatePassword: builder.mutation<void, UpdatePasswordRequest>({
      queryFn: async ({ newPassword }) => {
        try {
          const response = await updatePassword(newPassword);
          if (response.error) {
            return { error: response.error as AuthError };
          }
          return { data: undefined };
        } catch (error) {
          return { error: error as AuthError };
        }
      },
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const {
  useSignUpMutation,
  useSignInMutation,
  useSignOutMutation,
  useResetPasswordMutation,
  useUpdatePasswordMutation,
} = authApi;
