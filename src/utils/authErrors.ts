import { AuthError } from '@supabase/supabase-js';

/**
 * Map Supabase authentication errors to user-friendly messages
 * Implements FR-011: Security-sensitive errors should use generic messages
 *
 * @param error - AuthError from Supabase
 * @returns User-friendly error message
 */
export function mapAuthError(error: AuthError | Error | null): string {
  if (!error) {
    return 'An unknown error occurred';
  }

  const errorMessage = error.message.toLowerCase();

  // Email/Password validation errors
  if (errorMessage.includes('invalid login credentials')) {
    return 'Invalid email or password. Please try again.';
  }

  if (errorMessage.includes('email not confirmed')) {
    return 'Please verify your email address before signing in. Check your inbox for a verification link.';
  }

  if (errorMessage.includes('user already registered')) {
    return 'An account with this email already exists. Please sign in or use a different email.';
  }

  if (errorMessage.includes('invalid email')) {
    return 'Please enter a valid email address.';
  }

  if (errorMessage.includes('password')) {
    if (errorMessage.includes('too short') || errorMessage.includes('weak')) {
      return 'Password does not meet requirements. Must be at least 8 characters with uppercase, lowercase, numbers, and symbols.';
    }
    if (errorMessage.includes('incorrect')) {
      return 'Invalid email or password. Please try again.';
    }
  }

  // Rate limiting errors
  if (errorMessage.includes('email rate limit exceeded')) {
    return 'Too many email requests. Please wait before requesting another verification email.';
  }

  if (errorMessage.includes('rate limit')) {
    return 'Too many attempts. Please wait a few minutes before trying again.';
  }

  // Session/Token errors (generic for security - FR-011)
  if (errorMessage.includes('session') || errorMessage.includes('token')) {
    return 'Your session has expired. Please sign in again.';
  }

  if (errorMessage.includes('refresh token')) {
    return 'Your session has expired. Please sign in again.';
  }

  // Password reset errors
  if (errorMessage.includes('password reset')) {
    return 'Unable to reset password. Please try again or contact support.';
  }

  // Network errors
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'Network error. Please check your internet connection and try again.';
  }

  // Generic server errors (avoid exposing internal details - FR-011)
  if (errorMessage.includes('server') || errorMessage.includes('internal')) {
    return 'A server error occurred. Please try again later.';
  }

  // Email verification errors
  if (errorMessage.includes('verification') || errorMessage.includes('confirm')) {
    return 'Email verification failed. Please try again or request a new verification link.';
  }

  // Default fallback (generic message for security - FR-011)
  return 'An error occurred. Please try again or contact support if the problem persists.';
}

/**
 * Check if an error is a network error
 * @param error - Error object
 * @returns True if error is network-related
 */
export function isNetworkError(error: AuthError | Error | null): boolean {
  if (!error) return false;
  const errorMessage = error.message.toLowerCase();
  return (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('timeout')
  );
}

/**
 * Check if an error is a validation error
 * @param error - Error object
 * @returns True if error is validation-related
 */
export function isValidationError(error: AuthError | Error | null): boolean {
  if (!error) return false;
  const errorMessage = error.message.toLowerCase();
  return (
    errorMessage.includes('invalid') ||
    errorMessage.includes('required') ||
    errorMessage.includes('weak') ||
    errorMessage.includes('too short')
  );
}

/**
 * Check if an error is a rate limit error
 * @param error - Error object
 * @returns True if error is rate-limit-related
 */
export function isRateLimitError(error: AuthError | Error | null): boolean {
  if (!error) return false;
  const errorMessage = error.message.toLowerCase();
  return errorMessage.includes('rate limit') || errorMessage.includes('too many');
}
