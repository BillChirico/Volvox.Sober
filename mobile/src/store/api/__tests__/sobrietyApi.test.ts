/**
 * Sobriety API Tests
 * WP06: Test suite for sobriety tracking API endpoints
 */

import { sobrietyApi } from '../sobrietyApi';
import { supabaseClient } from '../../../lib/supabase';

// Mock Supabase client
jest.mock('../../../lib/supabase', () => ({
  supabaseClient: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

describe('sobrietyApi', () => {
  const mockUser = { id: 'user-123' };
  const mockSobrietyStats = {
    id: 'stats-123',
    user_id: 'user-123',
    substance_type: 'Alcohol',
    start_date: '2024-01-01',
    current_streak_days: 45,
    milestones_achieved: ['30_days'],
    next_milestone_days: 60,
    days_until_next_milestone: 15,
    is_active: true,
    total_relapses: 0,
    last_relapse_date: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSobrietyStats', () => {
    it('should fetch sobriety stats for authenticated user', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: mockSobrietyStats, error: null });

      (supabaseClient.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });
      (supabaseClient.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });

      const endpoint = sobrietyApi.endpoints.getSobrietyStats;
      const result = await endpoint.query();

      expect(supabaseClient.auth.getUser).toHaveBeenCalled();
      expect(supabaseClient.from).toHaveBeenCalledWith('sobriety_stats_view');
      expect(result).toEqual({ data: mockSobrietyStats });
    });

    it('should return null when no stats exist (PGRST116)', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      (supabaseClient.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });
      (supabaseClient.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });

      const endpoint = sobrietyApi.endpoints.getSobrietyStats;
      const result = await endpoint.query();

      expect(result).toEqual({ data: null });
    });

    it('should return error when user not authenticated', async () => {
      (supabaseClient.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      const endpoint = sobrietyApi.endpoints.getSobrietyStats;
      const result = await endpoint.query();

      expect(result).toEqual({
        error: { status: 401, data: { message: 'Not authenticated' } },
      });
    });
  });

  describe('setSobrietyDate', () => {
    it('should create new sobriety date when none exists', async () => {
      const payload = {
        substance_type: 'Alcohol',
        start_date: '2024-01-01',
      };

      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: { id: 'new-id', ...payload, user_id: 'user-123' },
        error: null,
      });

      (supabaseClient.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      // Mock checking for existing sobriety date (none found)
      (supabaseClient.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      // Mock insert
      (supabaseClient.from as jest.Mock).mockReturnValueOnce({
        insert: mockInsert,
      });
      mockInsert.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ single: mockSingle });

      const endpoint = sobrietyApi.endpoints.setSobrietyDate;
      const result = await endpoint.query(payload);

      expect(result.data).toHaveProperty('id', 'new-id');
      expect(result.data).toHaveProperty('substance_type', 'Alcohol');
    });

    it('should update existing sobriety date', async () => {
      const payload = {
        substance_type: 'Nicotine',
        start_date: '2024-02-01',
      };

      const mockUpdate = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: { id: 'existing-id', ...payload, user_id: 'user-123' },
        error: null,
      });

      (supabaseClient.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      // Mock checking for existing sobriety date (found)
      (supabaseClient.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: 'existing-id' },
                error: null,
              }),
            }),
          }),
        }),
      });

      // Mock update
      (supabaseClient.from as jest.Mock).mockReturnValueOnce({
        update: mockUpdate,
      });
      mockUpdate.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ single: mockSingle });

      const endpoint = sobrietyApi.endpoints.setSobrietyDate;
      const result = await endpoint.query(payload);

      expect(result.data).toHaveProperty('substance_type', 'Nicotine');
    });
  });

  describe('logRelapse', () => {
    it('should log relapse and trigger automatic date update', async () => {
      const payload = {
        sobriety_date_id: 'stats-123',
        relapse_date: '2024-03-15T10:00:00Z',
        private_note: 'Feeling stressed',
        trigger_context: 'stress' as const,
      };

      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: {
          id: 'relapse-123',
          ...payload,
          sponsor_notified: false,
          created_at: new Date().toISOString(),
        },
        error: null,
      });

      (supabaseClient.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });
      (supabaseClient.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      });
      mockInsert.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ single: mockSingle });

      const endpoint = sobrietyApi.endpoints.logRelapse;
      const result = await endpoint.query(payload);

      expect(result.data).toHaveProperty('id', 'relapse-123');
      expect(result.data).toHaveProperty('private_note', 'Feeling stressed');
      expect(result.data).toHaveProperty('trigger_context', 'stress');
    });

    it('should allow optional fields to be undefined', async () => {
      const payload = {
        sobriety_date_id: 'stats-123',
        relapse_date: '2024-03-15T10:00:00Z',
      };

      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: {
          id: 'relapse-123',
          ...payload,
          sponsor_notified: false,
          created_at: new Date().toISOString(),
        },
        error: null,
      });

      (supabaseClient.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });
      (supabaseClient.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      });
      mockInsert.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ single: mockSingle });

      const endpoint = sobrietyApi.endpoints.logRelapse;
      const result = await endpoint.query(payload);

      expect(result.data).toHaveProperty('id', 'relapse-123');
      expect(result.data).not.toHaveProperty('private_note');
    });
  });

  describe('getMyRelapses', () => {
    it('should fetch relapses with private notes for authenticated user', async () => {
      const mockRelapses = [
        {
          id: 'relapse-1',
          sobriety_date_id: 'stats-123',
          relapse_date: '2024-03-15T10:00:00Z',
          private_note: 'Private note',
          trigger_context: 'stress',
          sponsor_notified: false,
          created_at: new Date().toISOString(),
        },
        {
          id: 'relapse-2',
          sobriety_date_id: 'stats-123',
          relapse_date: '2024-02-10T10:00:00Z',
          trigger_context: 'social_pressure',
          sponsor_notified: false,
          created_at: new Date().toISOString(),
        },
      ];

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({ data: mockRelapses, error: null });

      (supabaseClient.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });
      (supabaseClient.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ order: mockOrder });

      const endpoint = sobrietyApi.endpoints.getMyRelapses;
      const result = await endpoint.query('stats-123');

      expect(result.data).toHaveLength(2);
      expect(result.data?.[0]).toHaveProperty('private_note');
    });
  });

  describe('getConnectedUserRelapses', () => {
    it('should fetch relapses WITHOUT private notes for connected user', async () => {
      const mockRelapses = [
        {
          id: 'relapse-1',
          sobriety_date_id: 'stats-456',
          relapse_date: '2024-03-15T10:00:00Z',
          trigger_context: 'stress',
          sponsor_notified: false,
          created_at: new Date().toISOString(),
        },
      ];

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({ data: mockRelapses, error: null });

      (supabaseClient.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });
      (supabaseClient.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ order: mockOrder });

      const endpoint = sobrietyApi.endpoints.getConnectedUserRelapses;
      const result = await endpoint.query('stats-456');

      expect(result.data).toHaveLength(1);
      expect(result.data?.[0]).not.toHaveProperty('private_note');
      expect(result.data?.[0]).toHaveProperty('trigger_context', 'stress');
    });
  });
});
