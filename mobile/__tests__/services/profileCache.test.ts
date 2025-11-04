import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  cacheProfile,
  loadCachedProfile,
  clearProfileCache,
  CachedProfile,
} from '../../src/services/profileCache';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

describe('Profile Cache Service', () => {
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockProfile: Omit<CachedProfile, 'cached_at'> = {
    id: mockUserId,
    email: 'test@example.com',
    role: 'sponsee',
    name: 'Test User',
    location: {
      city: 'San Francisco',
      state: 'CA',
    },
    program_type: 'AA',
    bio: 'Test bio',
    sobriety_date: '2020-01-01',
    step_progress: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('cacheProfile', () => {
    it('should save profile to AsyncStorage with timestamp', async () => {
      await cacheProfile(mockUserId, mockProfile);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        `profile:${mockUserId}`,
        expect.stringContaining('"id":"123e4567-e89b-12d3-a456-426614174000"')
      );

      const callArgs = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const savedData = JSON.parse(callArgs);
      expect(savedData).toHaveProperty('cached_at');
      expect(savedData.id).toEqual(mockUserId);
    });

    it('should handle errors gracefully', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      // Should not throw
      await expect(cacheProfile(mockUserId, mockProfile)).resolves.not.toThrow();
    });
  });

  describe('loadCachedProfile', () => {
    it('should load valid cached profile', async () => {
      const cachedData: CachedProfile = {
        ...mockProfile,
        cached_at: new Date().toISOString(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(cachedData));

      const result = await loadCachedProfile(mockUserId);

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(`profile:${mockUserId}`);
      expect(result).toEqual(cachedData);
    });

    it('should return null for expired cache', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 2);

      const expiredData: CachedProfile = {
        ...mockProfile,
        cached_at: yesterday.toISOString(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(expiredData));

      const result = await loadCachedProfile(mockUserId);

      expect(result).toBeNull();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(`profile:${mockUserId}`);
    });

    it('should return null for missing cache', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await loadCachedProfile(mockUserId);

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      const result = await loadCachedProfile(mockUserId);

      expect(result).toBeNull();
    });
  });

  describe('clearProfileCache', () => {
    it('should remove cached profile', async () => {
      await clearProfileCache(mockUserId);

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(`profile:${mockUserId}`);
    });

    it('should handle errors gracefully', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      // Should not throw
      await expect(clearProfileCache(mockUserId)).resolves.not.toThrow();
    });
  });
});
