import { configureStore } from '@reduxjs/toolkit';
import { connectionsApi } from '../../../src/store/api/connectionsApi';
import supabaseClient from '../../../src/services/supabase';

const mockFrom = supabaseClient.from as jest.Mock;
const mockGetUser = supabaseClient.auth.getUser as jest.Mock;

describe('connectionsApi', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        [connectionsApi.reducerPath]: connectionsApi.reducer,
      },
      middleware: getDefaultMiddleware => getDefaultMiddleware().concat(connectionsApi.middleware),
    });

    jest.clearAllMocks();

    // Default mock for authenticated user
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });
  });

  describe('sendRequest', () => {
    it('sends connection request successfully', async () => {
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'request-1',
              sponsee_id: 'user-123',
              sponsor_id: 'sponsor-456',
              message: 'Hello',
              status: 'pending',
            },
            error: null,
          }),
        }),
      });

      mockFrom.mockReturnValue({
        insert: mockInsert,
      });

      const result = await store.dispatch(
        connectionsApi.endpoints.sendRequest.initiate({
          sponsor_id: 'sponsor-456',
          message: 'Hello',
        }),
      );

      expect(mockFrom).toHaveBeenCalledWith('connection_requests');
      expect(mockInsert).toHaveBeenCalledWith({
        sponsee_id: 'user-123',
        sponsor_id: 'sponsor-456',
        message: 'Hello',
        status: 'pending',
      });
      expect(result.data).toEqual({
        id: 'request-1',
        sponsee_id: 'user-123',
        sponsor_id: 'sponsor-456',
        message: 'Hello',
        status: 'pending',
      });
    });

    it('returns error when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await store.dispatch(
        connectionsApi.endpoints.sendRequest.initiate({
          sponsor_id: 'sponsor-456',
        }),
      );

      expect(result.error).toEqual({
        status: 401,
        data: { message: 'Not authenticated' },
      });
    });
  });

  describe('getPendingRequests', () => {
    it('fetches pending requests for sponsor', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [
                {
                  id: 'request-1',
                  sponsor_id: 'user-123',
                  sponsee_id: 'sponsee-789',
                  status: 'pending',
                  sponsee: { id: 'sponsee-789', name: 'John Doe', profile_photo_url: null },
                },
              ],
              error: null,
            }),
          }),
        }),
      });

      mockFrom.mockReturnValue({
        select: mockSelect,
      });

      const result = await store.dispatch(connectionsApi.endpoints.getPendingRequests.initiate());

      expect(mockFrom).toHaveBeenCalledWith('connection_requests');
      expect(result.data).toEqual([
        {
          id: 'request-1',
          sponsor_id: 'user-123',
          sponsee_id: 'sponsee-789',
          status: 'pending',
          sponsee: { id: 'sponsee-789', name: 'John Doe', profile_photo_url: null },
          sponsee_name: 'John Doe',
          sponsee_photo_url: null,
        },
      ]);
    });
  });

  describe('acceptRequest', () => {
    it('accepts request and creates connection', async () => {
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'request-1',
                sponsee_id: 'sponsee-789',
                sponsor_id: 'sponsor-456',
                status: 'accepted',
              },
              error: null,
            }),
          }),
        }),
      });

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'connection-1',
              sponsee_id: 'sponsee-789',
              sponsor_id: 'sponsor-456',
              status: 'active',
            },
            error: null,
          }),
        }),
      });

      mockFrom
        .mockReturnValueOnce({ update: mockUpdate })
        .mockReturnValueOnce({ insert: mockInsert });

      const result = await store.dispatch(
        connectionsApi.endpoints.acceptRequest.initiate({
          request_id: 'request-1',
        }),
      );

      expect(result.data).toEqual({
        id: 'connection-1',
        sponsee_id: 'sponsee-789',
        sponsor_id: 'sponsor-456',
        status: 'active',
      });
    });
  });

  describe('declineRequest', () => {
    it('declines request with reason', async () => {
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      });

      mockFrom.mockReturnValue({
        update: mockUpdate,
      });

      const result = await store.dispatch(
        connectionsApi.endpoints.declineRequest.initiate({
          request_id: 'request-1',
          reason: 'At capacity',
        }),
      );

      expect(mockUpdate).toHaveBeenCalledWith({
        status: 'declined',
        declined_reason: 'At capacity',
      });
      expect(result.data).toBeUndefined();
    });
  });

  describe('getConnections', () => {
    it('fetches active connections', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        or: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [
                {
                  id: 'connection-1',
                  sponsee_id: 'user-123',
                  sponsor_id: 'sponsor-456',
                  status: 'active',
                  sponsee: { id: 'user-123', name: 'Me', profile_photo_url: null },
                  sponsor: { id: 'sponsor-456', name: 'My Sponsor', profile_photo_url: null },
                  sponsee_profile: { step_progress: 5 },
                  sponsor_profile: { years_sober: 3 },
                },
              ],
              error: null,
            }),
          }),
        }),
      });

      mockFrom.mockReturnValue({
        select: mockSelect,
      });

      const result = await store.dispatch(connectionsApi.endpoints.getConnections.initiate());

      expect(result.data).toHaveLength(1);
      expect(result.data![0].sponsee_name).toBe('Me');
      expect(result.data![0].sponsor_name).toBe('My Sponsor');
    });
  });

  describe('disconnect', () => {
    it('disconnects connection', async () => {
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      mockFrom.mockReturnValue({
        update: mockUpdate,
      });

      const result = await store.dispatch(
        connectionsApi.endpoints.disconnect.initiate({
          connection_id: 'connection-1',
        }),
      );

      expect(mockUpdate).toHaveBeenCalledWith({
        status: 'disconnected',
        disconnected_at: expect.any(String),
      });
      expect(result.data).toBeUndefined();
    });
  });

  describe('cancelRequest', () => {
    it('cancels pending request', async () => {
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      mockFrom.mockReturnValue({
        update: mockUpdate,
      });

      const result = await store.dispatch(
        connectionsApi.endpoints.cancelRequest.initiate('request-1'),
      );

      expect(mockUpdate).toHaveBeenCalledWith({ status: 'cancelled' });
      expect(result.data).toBeUndefined();
    });
  });
});
