// Create mock auth methods
const mockSupabaseAuth = {
  signUp: jest.fn(),
  signInWithPassword: jest.fn(),
  resetPasswordForEmail: jest.fn(),
  updateUser: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
  onAuthStateChange: jest.fn(),
};

// Mock expo-constants BEFORE importing authService
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        EXPO_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        EXPO_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      },
    },
  },
}));

// Mock the Supabase client BEFORE importing authService
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: mockSupabaseAuth,
  })),
}));

// Mock the supabase service module
jest.mock('../../src/services/supabase', () => ({
  __esModule: true,
  default: {
    auth: mockSupabaseAuth,
  },
}));

import { authService, __setSupabaseInstance } from '../../src/features/auth/services/authService';

describe('AuthService', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Set mock Supabase instance
    __setSupabaseInstance({
      auth: mockSupabaseAuth,
    } as any);
  });

  afterEach(() => {
    // Clean up mock instance
    __setSupabaseInstance(null);
  });

  describe('signUp', () => {
    it('should successfully sign up a new user', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockSession = { access_token: 'token123' };

      mockSupabaseAuth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await authService.signUp('test@example.com', 'Password123!');

      expect(mockSupabaseAuth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
        options: {
          emailRedirectTo: 'volvoxsober://auth/verify',
        },
      });
      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
    });

    it('should handle sign up errors', async () => {
      const mockError = { message: 'User already registered' };

      mockSupabaseAuth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      const result = await authService.signUp('existing@example.com', 'Password123!');

      expect(result.error).toEqual(mockError);
      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
    });
  });

  describe('signIn', () => {
    it('should successfully sign in an existing user', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockSession = { access_token: 'token123' };

      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await authService.signIn('test@example.com', 'Password123!');

      expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
      });
      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
    });

    it('should handle invalid credentials', async () => {
      const mockError = { message: 'Invalid login credentials' };

      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      const result = await authService.signIn('test@example.com', 'WrongPassword');

      expect(result.error).toEqual(mockError);
      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
    });
  });

  describe('resetPasswordRequest', () => {
    it('should successfully request password reset', async () => {
      mockSupabaseAuth.resetPasswordForEmail.mockResolvedValue({
        error: null,
      });

      const result = await authService.resetPasswordRequest('test@example.com');

      expect(mockSupabaseAuth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: 'volvoxsober://auth/forgot-password',
      });
      expect(result.error).toBeNull();
    });

    it('should handle reset password errors', async () => {
      const mockError = { message: 'Rate limit exceeded' };

      mockSupabaseAuth.resetPasswordForEmail.mockResolvedValue({
        error: mockError,
      });

      const result = await authService.resetPasswordRequest('test@example.com');

      expect(result.error).toEqual(mockError);
    });
  });

  describe('updatePassword', () => {
    it('should successfully update password', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };

      mockSupabaseAuth.updateUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await authService.updatePassword('NewPassword123!');

      expect(mockSupabaseAuth.updateUser).toHaveBeenCalledWith({
        password: 'NewPassword123!',
      });
      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it('should handle update password errors', async () => {
      const mockError = { message: 'Password too weak' };

      mockSupabaseAuth.updateUser.mockResolvedValue({
        data: { user: null },
        error: mockError,
      });

      const result = await authService.updatePassword('weak');

      expect(result.error).toEqual(mockError);
      expect(result.user).toBeNull();
    });
  });

  describe('signOut', () => {
    it('should successfully sign out', async () => {
      mockSupabaseAuth.signOut.mockResolvedValue({
        error: null,
      });

      const result = await authService.signOut();

      expect(mockSupabaseAuth.signOut).toHaveBeenCalled();
      expect(result.error).toBeNull();
    });

    it('should handle sign out errors', async () => {
      const mockError = { message: 'Session expired' };

      mockSupabaseAuth.signOut.mockResolvedValue({
        error: mockError,
      });

      const result = await authService.signOut();

      expect(result.error).toEqual(mockError);
    });
  });

  describe('getSession', () => {
    it('should successfully get current session', async () => {
      const mockSession = { access_token: 'token123' };

      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await authService.getSession();

      expect(mockSupabaseAuth.getSession).toHaveBeenCalled();
      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
    });

    it('should return null when no session exists', async () => {
      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await authService.getSession();

      expect(result.session).toBeNull();
      expect(result.error).toBeNull();
    });
  });

  describe('onAuthStateChange', () => {
    it('should subscribe to auth state changes', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();

      mockSupabaseAuth.onAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: mockUnsubscribe,
          },
        },
      });

      const { unsubscribe } = authService.onAuthStateChange(mockCallback);

      expect(mockSupabaseAuth.onAuthStateChange).toHaveBeenCalledWith(expect.any(Function));

      // Test unsubscribe
      unsubscribe();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should call callback when auth state changes', () => {
      const mockCallback = jest.fn();
      let authChangeCallback: any;

      mockSupabaseAuth.onAuthStateChange.mockImplementation((callback: any) => {
        authChangeCallback = callback;
        return {
          data: {
            subscription: {
              unsubscribe: jest.fn(),
            },
          },
        };
      });

      authService.onAuthStateChange(mockCallback);

      // Simulate auth state change
      const mockSession = { access_token: 'token123' };
      authChangeCallback('SIGNED_IN', mockSession);

      expect(mockCallback).toHaveBeenCalledWith('SIGNED_IN', mockSession);
    });
  });
});
