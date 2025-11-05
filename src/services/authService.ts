import { createClient, AuthError, Session, User, SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Initialize Supabase client lazily to support testing
let supabaseInstance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env file.');
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

// For testing: allow setting a mock Supabase instance
export function __setSupabaseInstance(instance: SupabaseClient | null): void {
  supabaseInstance = instance;
}

export interface SignUpParams {
  email: string;
  password: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface AuthResponse {
  session: Session | null;
  user: User | null;
  error: AuthError | null;
}

/**
 * Authentication Service
 * Provides methods for user authentication operations using Supabase Auth
 */
class AuthService {
  /**
   * Sign up a new user with email and password
   * @param email - User's email address
   * @param password - User's password (must meet strength requirements)
   * @returns Promise with session, user, and error information
   */
  async signUp(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await getSupabase().auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'volvoxsober://auth/verify',
      },
    });

    return {
      session: data.session,
      user: data.user,
      error: error,
    };
  }

  /**
   * Resend verification email for unverified users
   * @param email - User's email address
   * @returns Promise with error information if any
   */
  async resendVerification(email: string): Promise<{ error: AuthError | null }> {
    const { error } = await getSupabase().auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: 'volvoxsober://auth/verify',
      },
    });

    return { error };
  }

  /**
   * Sign in an existing user with email and password
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise with session, user, and error information
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    });

    return {
      session: data.session,
      user: data.user,
      error: error,
    };
  }

  /**
   * Request a password reset email
   * @param email - User's email address
   * @returns Promise with error information if any
   */
  async resetPasswordRequest(email: string): Promise<{ error: AuthError | null }> {
    const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: 'volvoxsober://auth/forgot-password',
    });

    return { error };
  }

  /**
   * Update the user's password (must be authenticated)
   * @param newPassword - New password for the user
   * @returns Promise with user and error information
   */
  async updatePassword(
    newPassword: string,
  ): Promise<{ user: User | null; error: AuthError | null }> {
    const { data, error } = await getSupabase().auth.updateUser({
      password: newPassword,
    });

    return {
      user: data.user,
      error: error,
    };
  }

  /**
   * Sign out the current user
   * @returns Promise with error information if any
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    const { error } = await getSupabase().auth.signOut();
    return { error };
  }

  /**
   * Get the current session
   * @returns Promise with session and error information
   */
  async getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    const { data, error } = await getSupabase().auth.getSession();
    return {
      session: data.session,
      error: error,
    };
  }

  /**
   * Subscribe to authentication state changes
   * @param callback - Function to call when auth state changes
   * @returns Unsubscribe function
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void): {
    unsubscribe: () => void;
  } {
    const { data } = getSupabase().auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });

    return {
      unsubscribe: data.subscription.unsubscribe,
    };
  }
}

export const authService = new AuthService();
export default authService;
