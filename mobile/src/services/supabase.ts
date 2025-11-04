/**
 * Supabase Client Service
 * Singleton instance for interacting with Supabase backend
 */

import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Secure storage adapter for Supabase auth tokens
 * Uses expo-secure-store for native platforms
 */
const SecureStoreAdapter = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        // Fallback to localStorage for web
        return localStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error getting item from secure store:', error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Fallback to localStorage for web
        localStorage.setItem(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error setting item in secure store:', error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Fallback to localStorage for web
        localStorage.removeItem(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error removing item from secure store:', error);
    }
  },
};

/**
 * Create Supabase client with secure storage for auth tokens
 */
const supabaseClient: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Get current auth session
 */
export const getSession = async (): Promise<Session | null> => {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();
  return session;
};

/**
 * Get current user
 */
export const getUser = async () => {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  return user;
};

/**
 * Sign up with email and password
 */
export const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
  return await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
};

/**
 * Sign in with email and password
 */
export const signIn = async (email: string, password: string) => {
  return await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });
};

/**
 * Sign out
 */
export const signOut = async () => {
  return await supabaseClient.auth.signOut();
};

/**
 * Reset password (request email)
 */
export const resetPassword = async (email: string) => {
  return await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: 'volvox-sober://reset-password',
  });
};

/**
 * Update password
 */
export const updatePassword = async (newPassword: string) => {
  return await supabaseClient.auth.updateUser({
    password: newPassword,
  });
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => {
  return supabaseClient.auth.onAuthStateChange(callback);
};

export default supabaseClient;
