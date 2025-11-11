import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../../src/store/auth/authSlice';
import {
  signupThunk,
  loginThunk,
  logoutThunk,
  resetPasswordRequestThunk,
  updatePasswordThunk,
} from '../../../src/store/auth/authThunks';
import { authService } from '../../../src/features/auth/services/authService';

// Mock authService methods
jest.mock('../../../src/features/auth/services/authService', () => ({
  authService: {
    signUp: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    resetPasswordRequest: jest.fn(),
    updatePassword: jest.fn(),
  },
}));

describe('authThunks', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
    jest.clearAllMocks();
  });

  describe('signupThunk', () => {
    it('should handle successful signup', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: null,
        app_metadata: {},
        user_metadata: {},
      };
      const mockSession = {
        access_token: 'test-token',
        refresh_token: 'refresh-token',
        expires_at: 1234567890,
        expires_in: 3600,
        token_type: 'bearer' as const,
      };

      (authService as any).signUp.mockResolvedValue({
        user: mockUser,
        session: mockSession,
        error: null,
      });

      await store.dispatch(signupThunk({ email: 'test@example.com', password: 'Test1234' }));

      const state = store.getState().auth;
      expect(state.user).toEqual(mockUser);
      expect(state.session).toEqual(mockSession);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle signup errors', async () => {
      const mockError = { message: 'User already exists', status: 400 };

      (authService as any).signUp.mockResolvedValue({
        user: null,
        session: null,
        error: mockError,
      });

      await store.dispatch(signupThunk({ email: 'test@example.com', password: 'Test1234' }));

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBe('User already exists');
    });
  });

  describe('loginThunk', () => {
    it('should handle successful login', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: '2024-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {},
      };
      const mockSession = {
        access_token: 'test-token',
        refresh_token: 'refresh-token',
        expires_at: 1234567890,
        expires_in: 3600,
        token_type: 'bearer' as const,
      };

      (authService as any).signIn.mockResolvedValue({
        user: mockUser,
        session: mockSession,
        error: null,
      });

      await store.dispatch(loginThunk({ email: 'test@example.com', password: 'Test1234' }));

      const state = store.getState().auth;
      expect(state.user).toEqual(mockUser);
      expect(state.session).toEqual(mockSession);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle invalid credentials', async () => {
      const mockError = { message: 'Invalid login credentials', status: 400 };

      (authService as any).signIn.mockResolvedValue({
        user: null,
        session: null,
        error: mockError,
      });

      await store.dispatch(loginThunk({ email: 'test@example.com', password: 'wrong' }));

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Invalid login credentials');
    });
  });

  describe('logoutThunk', () => {
    it('should handle successful logout', async () => {
      // Set up initial authenticated state
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: '2024-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {},
      };
      const mockSession = {
        access_token: 'test-token',
        refresh_token: 'refresh-token',
        expires_at: 1234567890,
        expires_in: 3600,
        token_type: 'bearer' as const,
      };

      (authService as any).signIn.mockResolvedValue({
        user: mockUser,
        session: mockSession,
        error: null,
      });

      await store.dispatch(loginThunk({ email: 'test@example.com', password: 'Test1234' }));

      // Now logout
      (authService as any).signOut.mockResolvedValue({ error: null });

      await store.dispatch(logoutThunk());

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle logout errors', async () => {
      const mockError = { message: 'Logout failed', status: 500 };

      (authService as any).signOut.mockResolvedValue({ error: mockError });

      await store.dispatch(logoutThunk());

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Logout failed');
    });
  });

  describe('resetPasswordRequestThunk', () => {
    it('should handle successful password reset request', async () => {
      (authService as any).resetPasswordRequest.mockResolvedValue({
        error: null,
      });

      await store.dispatch(resetPasswordRequestThunk({ email: 'test@example.com' }));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle password reset request errors', async () => {
      const mockError = { message: 'Email not found', status: 404 };

      (authService as any).resetPasswordRequest.mockResolvedValue({
        error: mockError,
      });

      await store.dispatch(resetPasswordRequestThunk({ email: 'test@example.com' }));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Email not found');
    });
  });

  describe('updatePasswordThunk', () => {
    it('should handle successful password update', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: '2024-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {},
      };

      (authService as any).updatePassword.mockResolvedValue({
        user: mockUser,
        error: null,
      });

      await store.dispatch(updatePasswordThunk({ newPassword: 'NewPass123' }));

      const state = store.getState().auth;
      expect(state.user).toEqual(mockUser);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle password update errors', async () => {
      const mockError = { message: 'Invalid token', status: 400 };

      (authService as any).updatePassword.mockResolvedValue({
        user: null,
        error: mockError,
      });

      await store.dispatch(updatePasswordThunk({ newPassword: 'NewPass123' }));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Invalid token');
    });
  });

  describe('loading states', () => {
    it('should set loading to true during async operations', async () => {
      (authService as any).signIn.mockImplementation(
        () =>
          new Promise(resolve => {
            setTimeout(() => {
              resolve({
                user: {
                  id: 'user-123',
                  email: 'test@example.com',
                  email_confirmed_at: '2024-01-01T00:00:00Z',
                  app_metadata: {},
                  user_metadata: {},
                },
                session: {
                  access_token: 'test-token',
                  refresh_token: 'refresh-token',
                  expires_at: 1234567890,
                  expires_in: 3600,
                  token_type: 'bearer' as const,
                },
                error: null,
              });
            }, 100);
          }),
      );

      const promise = store.dispatch(
        loginThunk({ email: 'test@example.com', password: 'Test1234' }),
      );

      // Check loading state immediately
      let state = store.getState().auth;
      expect(state.loading).toBe(true);

      await promise;

      // Check loading state after completion
      state = store.getState().auth;
      expect(state.loading).toBe(false);
    });
  });
});
