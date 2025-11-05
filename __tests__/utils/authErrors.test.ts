import {
  mapAuthError,
  isNetworkError,
  isValidationError,
  isRateLimitError,
} from '../../src/utils/authErrors';
import { AuthError } from '@supabase/supabase-js';

describe('Auth Error Utilities', () => {
  describe('mapAuthError', () => {
    it('should handle null error', () => {
      const message = mapAuthError(null);
      expect(message).toBe('An unknown error occurred');
    });

    it('should map invalid login credentials error', () => {
      const error = new Error('Invalid login credentials') as AuthError;
      const message = mapAuthError(error);
      expect(message).toBe('Invalid email or password. Please try again.');
    });

    it('should map email not confirmed error', () => {
      const error = new Error('Email not confirmed') as AuthError;
      const message = mapAuthError(error);
      expect(message).toContain('verify your email address');
    });

    it('should map user already registered error', () => {
      const error = new Error('User already registered') as AuthError;
      const message = mapAuthError(error);
      expect(message).toContain('account with this email already exists');
    });

    it('should map invalid email error', () => {
      const error = new Error('Invalid email') as AuthError;
      const message = mapAuthError(error);
      expect(message).toBe('Please enter a valid email address.');
    });

    it('should map weak password error', () => {
      const error = new Error('Password too weak') as AuthError;
      const message = mapAuthError(error);
      expect(message).toContain('Password does not meet requirements');
    });

    it('should map short password error', () => {
      const error = new Error('Password too short') as AuthError;
      const message = mapAuthError(error);
      expect(message).toContain('Password does not meet requirements');
    });

    it('should map incorrect password error', () => {
      const error = new Error('Password incorrect') as AuthError;
      const message = mapAuthError(error);
      expect(message).toBe('Invalid email or password. Please try again.');
    });

    it('should map rate limit error', () => {
      const error = new Error('Rate limit exceeded') as AuthError;
      const message = mapAuthError(error);
      expect(message).toContain('Too many attempts');
    });

    it('should map email rate limit error', () => {
      const error = new Error('Email rate limit exceeded') as AuthError;
      const message = mapAuthError(error);
      expect(message).toContain('Too many email requests');
    });

    it('should map session expired error generically (FR-011)', () => {
      const error = new Error('Session expired') as AuthError;
      const message = mapAuthError(error);
      expect(message).toBe('Your session has expired. Please sign in again.');
    });

    it('should map token error generically (FR-011)', () => {
      const error = new Error('Invalid token') as AuthError;
      const message = mapAuthError(error);
      expect(message).toBe('Your session has expired. Please sign in again.');
    });

    it('should map refresh token error generically (FR-011)', () => {
      const error = new Error('Refresh token expired') as AuthError;
      const message = mapAuthError(error);
      expect(message).toBe('Your session has expired. Please sign in again.');
    });

    it('should map password reset error', () => {
      const error = new Error('Password reset failed') as AuthError;
      const message = mapAuthError(error);
      expect(message).toContain('Unable to reset password');
    });

    it('should map network error', () => {
      const error = new Error('Network request failed') as AuthError;
      const message = mapAuthError(error);
      expect(message).toContain('Network error');
    });

    it('should map fetch error', () => {
      const error = new Error('Fetch failed') as AuthError;
      const message = mapAuthError(error);
      expect(message).toContain('Network error');
    });

    it('should map server error generically (FR-011)', () => {
      const error = new Error('Internal server error') as AuthError;
      const message = mapAuthError(error);
      expect(message).toBe('A server error occurred. Please try again later.');
    });

    it('should map verification error', () => {
      const error = new Error('Email verification failed') as AuthError;
      const message = mapAuthError(error);
      expect(message).toContain('Email verification failed');
    });

    it('should handle unknown error with generic message (FR-011)', () => {
      const error = new Error('Some random unknown error') as AuthError;
      const message = mapAuthError(error);
      expect(message).toBe('An error occurred. Please try again or contact support if the problem persists.');
    });

    it('should handle case-insensitive error messages', () => {
      const error = new Error('INVALID LOGIN CREDENTIALS') as AuthError;
      const message = mapAuthError(error);
      expect(message).toBe('Invalid email or password. Please try again.');
    });
  });

  describe('isNetworkError', () => {
    it('should return true for network error', () => {
      const error = new Error('Network request failed');
      expect(isNetworkError(error)).toBe(true);
    });

    it('should return true for fetch error', () => {
      const error = new Error('Fetch failed');
      expect(isNetworkError(error)).toBe(true);
    });

    it('should return true for timeout error', () => {
      const error = new Error('Request timeout');
      expect(isNetworkError(error)).toBe(true);
    });

    it('should return false for non-network error', () => {
      const error = new Error('Invalid credentials');
      expect(isNetworkError(error)).toBe(false);
    });

    it('should return false for null error', () => {
      expect(isNetworkError(null)).toBe(false);
    });
  });

  describe('isValidationError', () => {
    it('should return true for invalid error', () => {
      const error = new Error('Invalid email');
      expect(isValidationError(error)).toBe(true);
    });

    it('should return true for required error', () => {
      const error = new Error('Email is required');
      expect(isValidationError(error)).toBe(true);
    });

    it('should return true for weak password error', () => {
      const error = new Error('Password too weak');
      expect(isValidationError(error)).toBe(true);
    });

    it('should return true for too short error', () => {
      const error = new Error('Password too short');
      expect(isValidationError(error)).toBe(true);
    });

    it('should return false for non-validation error', () => {
      const error = new Error('Network error');
      expect(isValidationError(error)).toBe(false);
    });

    it('should return false for null error', () => {
      expect(isValidationError(null)).toBe(false);
    });
  });

  describe('isRateLimitError', () => {
    it('should return true for rate limit error', () => {
      const error = new Error('Rate limit exceeded');
      expect(isRateLimitError(error)).toBe(true);
    });

    it('should return true for too many attempts error', () => {
      const error = new Error('Too many login attempts');
      expect(isRateLimitError(error)).toBe(true);
    });

    it('should return false for non-rate-limit error', () => {
      const error = new Error('Invalid credentials');
      expect(isRateLimitError(error)).toBe(false);
    });

    it('should return false for null error', () => {
      expect(isRateLimitError(null)).toBe(false);
    });
  });

  describe('Security considerations (FR-011)', () => {
    it('should not expose internal error details', () => {
      const error = new Error('Database connection failed on server xyz.internal') as AuthError;
      const message = mapAuthError(error);
      expect(message).not.toContain('xyz.internal');
      expect(message).not.toContain('Database');
    });

    it('should not expose token details', () => {
      const error = new Error('JWT token abc123 is invalid') as AuthError;
      const message = mapAuthError(error);
      expect(message).not.toContain('abc123');
      expect(message).not.toContain('JWT');
    });

    it('should provide generic message for session errors', () => {
      const error = new Error('Session token validation failed in auth service') as AuthError;
      const message = mapAuthError(error);
      expect(message).toBe('Your session has expired. Please sign in again.');
    });

    it('should provide generic message for server errors', () => {
      const error = new Error('Internal error in authentication service layer') as AuthError;
      const message = mapAuthError(error);
      expect(message).toBe('A server error occurred. Please try again later.');
    });
  });
});
