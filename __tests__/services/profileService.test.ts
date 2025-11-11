/**
 * ProfileService Tests
 * Tests for profile creation with sobriety record integration
 * Feature: 002-app-screens
 */

import profileService from '../../src/features/profile/services/profileService';
import sobrietyService from '../../src/features/sobriety/services/sobrietyService';
import supabaseClient from '../../src/services/supabase';
import { ProfileFormData } from '../../src/types';

// Mock Supabase client
jest.mock('../../src/services/supabase', () => ({
  __esModule: true,
  default: {
    from: jest.fn(),
    auth: {
      getSession: jest.fn(),
    },
  },
}));

// Mock sobrietyService
jest.mock('../../src/features/sobriety/services/sobrietyService', () => ({
  __esModule: true,
  default: {
    createSobrietyRecord: jest.fn(),
  },
}));

describe('ProfileService', () => {
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockSession = {
    user: {
      id: mockUserId,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProfile', () => {
    it('should create sobriety record when profile is created with sobriety_start_date', async () => {
      const profileData: ProfileFormData = {
        name: 'John Doe',
        bio: 'Test bio',
        role: 'sponsee',
        recovery_program: 'AA',
        sobriety_start_date: '2024-01-01',
        city: 'New York',
        state: 'NY',
        country: 'United States',
        availability: ['weekdays', 'mornings'],
      };

      const mockProfile = {
        id: mockUserId,
        ...profileData,
        profile_completion_percentage: 100,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
      };

      // Mock successful auth session
      (supabaseClient.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      // Mock successful profile creation
      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      (supabaseClient.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      });

      mockInsert.mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        single: mockSingle,
      });

      // Mock successful sobriety record creation
      (sobrietyService.createSobrietyRecord as jest.Mock).mockResolvedValue({
        data: {
          id: 'sobriety-record-id',
          user_id: mockUserId,
          current_sobriety_start_date: profileData.sobriety_start_date,
          previous_sobriety_dates: [],
          milestones: [],
          reflections: [],
        },
        error: null,
      });

      // Execute
      const result = await profileService.createProfile(mockUserId, profileData);

      // Verify profile was created
      expect(result.data).toEqual(mockProfile);
      expect(result.error).toBeNull();

      // Verify sobriety record was created
      expect(sobrietyService.createSobrietyRecord).toHaveBeenCalledWith(
        mockUserId,
        profileData.sobriety_start_date,
      );
      expect(sobrietyService.createSobrietyRecord).toHaveBeenCalledTimes(1);
    });

    it('should fail profile creation when sobriety record creation fails (sobriety date is required)', async () => {
      const profileData: ProfileFormData = {
        name: 'Jane Doe',
        bio: 'Test bio',
        role: 'sponsor',
        recovery_program: 'NA',
        sobriety_start_date: '2023-06-15',
        availability: ['evenings'],
      };

      const mockProfile = {
        id: mockUserId,
        name: profileData.name,
        bio: profileData.bio,
        role: profileData.role,
        recovery_program: profileData.recovery_program,
        sobriety_start_date: profileData.sobriety_start_date,
        city: null,
        state: null,
        country: 'United States',
        availability: profileData.availability,
        preferences: {},
        profile_completion_percentage: 87,
        profile_photo_url: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
      };

      // Mock successful auth session
      (supabaseClient.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      // Mock successful profile creation
      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      (supabaseClient.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      });

      mockInsert.mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        single: mockSingle,
      });

      // Mock sobriety record creation failure
      const sobrietyError = new Error('Failed to create sobriety record');
      (sobrietyService.createSobrietyRecord as jest.Mock).mockResolvedValue({
        data: null,
        error: sobrietyError,
      });

      // Execute
      const result = await profileService.createProfile(mockUserId, profileData);

      // Verify profile creation FAILED when sobriety record failed
      // (because sobriety_start_date is required for all roles)
      expect(result.data).toBeNull();
      expect(result.error).not.toBeNull();
      expect(result.error?.message).toContain('sobriety record');

      // Verify sobriety record creation was attempted
      expect(sobrietyService.createSobrietyRecord).toHaveBeenCalledWith(
        mockUserId,
        profileData.sobriety_start_date,
      );
    });

    it('should not create sobriety record when sobriety_start_date is not provided', async () => {
      const profileData: ProfileFormData = {
        name: 'Bob Smith',
        role: 'sponsor',
        recovery_program: 'AA',
        availability: ['anytime'],
      };

      const mockProfile = {
        id: mockUserId,
        ...profileData,
        bio: null,
        sobriety_start_date: null,
        city: null,
        state: null,
        country: 'United States',
        preferences: {},
        profile_photo_url: null,
        profile_completion_percentage: 62,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
      };

      // Mock successful auth session
      (supabaseClient.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      // Mock successful profile creation
      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      (supabaseClient.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      });

      mockInsert.mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        single: mockSingle,
      });

      // Execute
      const result = await profileService.createProfile(mockUserId, profileData);

      // Verify profile was created
      expect(result.data).toEqual(mockProfile);
      expect(result.error).toBeNull();

      // Verify sobriety record was NOT created
      expect(sobrietyService.createSobrietyRecord).not.toHaveBeenCalled();
    });
  });
});
