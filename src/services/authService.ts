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
    // Use Supabase hosted page for password reset
    // User will reset password in browser, then return to app to login
    const supabaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;

    const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: `${supabaseUrl}/auth/v1/verify?type=recovery`,
    });

    return { error };
  }

  /**
   * Update the user's email (must be authenticated)
   * @param newEmail - New email address for the user
   * @returns Promise with user and error information
   */
  async updateEmail(newEmail: string): Promise<{ user: User | null; error: AuthError | null }> {
    const { data, error } = await getSupabase().auth.updateUser({
      email: newEmail,
    });

    return {
      user: data.user,
      error: error,
    };
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
   * Delete the current user's account (must be authenticated)
   * WARNING: This action is irreversible and will delete all user data
   * @returns Promise with error information if any
   */
  async deleteAccount(): Promise<{ error: AuthError | Error | null }> {
    try {
      // Get current user ID
      const { data: { user }, error: userError } = await getSupabase().auth.getUser();

      if (userError || !user) {
        return { error: userError || new Error('User not authenticated') };
      }

      // Call Supabase admin API to delete user
      // Note: This requires RLS policies and/or Edge Function implementation
      // For now, we'll use the auth.admin.deleteUser which requires service role
      // In production, this should be handled via an Edge Function with proper authorization
      const { error } = await getSupabase().rpc('delete_user_account', {
        user_id: user.id,
      });

      if (error) {
        return { error };
      }

      // Sign out after successful deletion
      await this.signOut();

      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('Failed to delete account'),
      };
    }
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
