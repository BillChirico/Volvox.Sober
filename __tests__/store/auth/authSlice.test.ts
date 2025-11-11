import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  setSession,
  setUser,
  setLoading,
  setError,
  clearError,
  clearAuth,
} from '../../../src/features/auth/store/authSlice';

describe('authSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().auth;
      expect(state).toEqual({
        session: null,
        user: null,
        loading: false,
        error: null,
      });
    });
  });

  describe('setSession', () => {
    it('should set session data', () => {
      const mockSession = {
        access_token: 'test-token',
        refresh_token: 'refresh-token',
        expires_at: 1234567890,
        expires_in: 3600,
        token_type: 'bearer' as const,
      };

      store.dispatch(setSession(mockSession));
      const state = store.getState().auth;

      expect(state.session).toEqual(mockSession);
    });

    it('should clear session when null is provided', () => {
      const mockSession = {
        access_token: 'test-token',
        refresh_token: 'refresh-token',
        expires_at: 1234567890,
        expires_in: 3600,
        token_type: 'bearer' as const,
      };

      store.dispatch(setSession(mockSession));
      store.dispatch(setSession(null));
      const state = store.getState().auth;

      expect(state.session).toBeNull();
    });
  });

  describe('setUser', () => {
    it('should set user data', () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: '2024-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {},
      };

      store.dispatch(setUser(mockUser));
      const state = store.getState().auth;

      expect(state.user).toEqual(mockUser);
    });

    it('should clear user when null is provided', () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: '2024-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {},
      };

      store.dispatch(setUser(mockUser));
      store.dispatch(setUser(null));
      const state = store.getState().auth;

      expect(state.user).toBeNull();
    });
  });

  describe('setLoading', () => {
    it('should set loading to true', () => {
      store.dispatch(setLoading(true));
      const state = store.getState().auth;

      expect(state.loading).toBe(true);
    });

    it('should set loading to false', () => {
      store.dispatch(setLoading(true));
      store.dispatch(setLoading(false));
      const state = store.getState().auth;

      expect(state.loading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      const errorMessage = 'Authentication failed';

      store.dispatch(setError(errorMessage));
      const state = store.getState().auth;

      expect(state.error).toBe(errorMessage);
    });
  });

  describe('clearError', () => {
    it('should clear error message', () => {
      store.dispatch(setError('Some error'));
      store.dispatch(clearError());
      const state = store.getState().auth;

      expect(state.error).toBeNull();
    });
  });

  describe('clearAuth', () => {
    it('should reset state to initial values', () => {
      const mockSession = {
        access_token: 'test-token',
        refresh_token: 'refresh-token',
        expires_at: 1234567890,
        expires_in: 3600,
        token_type: 'bearer' as const,
      };
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: '2024-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {},
      };

      store.dispatch(setSession(mockSession));
      store.dispatch(setUser(mockUser));
      store.dispatch(setError('Some error'));
      store.dispatch(setLoading(true));

      store.dispatch(clearAuth());
      const state = store.getState().auth;

      expect(state).toEqual({
        session: null,
        user: null,
        loading: false,
        error: null,
      });
    });
  });

  describe('state transitions', () => {
    it('should handle multiple state updates correctly', () => {
      const mockSession = {
        access_token: 'test-token',
        refresh_token: 'refresh-token',
        expires_at: 1234567890,
        expires_in: 3600,
        token_type: 'bearer' as const,
      };
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: '2024-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {},
      };

      // Simulate login flow
      store.dispatch(setLoading(true));
      store.dispatch(setSession(mockSession));
      store.dispatch(setUser(mockUser));
      store.dispatch(setLoading(false));

      const state = store.getState().auth;

      expect(state.session).toEqual(mockSession);
      expect(state.user).toEqual(mockUser);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle error state correctly', () => {
      store.dispatch(setLoading(true));
      store.dispatch(setError('Login failed'));
      store.dispatch(setLoading(false));

      const state = store.getState().auth;

      expect(state.session).toBeNull();
      expect(state.user).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Login failed');
    });
  });
});
