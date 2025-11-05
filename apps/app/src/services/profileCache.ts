import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export interface CachedProfile {
  id: string;
  email: string;
  role: 'sponsor' | 'sponsee' | 'both';
  profile_photo_url?: string;
  name: string;
  location: {
    city: string;
    state: string;
  };
  program_type: string;
  bio?: string;
  sobriety_date?: string;
  step_progress?: number;
  years_sober?: number;
  max_sponsees?: number;
  availability?: string;
  approach?: string;
  cached_at: string;
}

const CACHE_KEY_PREFIX = 'profile:';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Save profile data to AsyncStorage cache
 */
export const cacheProfile = async (userId: string, profile: Omit<CachedProfile, 'cached_at'>): Promise<void> => {
  try {
    const cachedProfile: CachedProfile = {
      ...profile,
      cached_at: new Date().toISOString(),
    };

    await AsyncStorage.setItem(
      `${CACHE_KEY_PREFIX}${userId}`,
      JSON.stringify(cachedProfile)
    );
  } catch (error) {
    console.error('Error caching profile:', error);
  }
};

/**
 * Load profile data from AsyncStorage cache
 * Returns null if cache is expired or not found
 */
export const loadCachedProfile = async (userId: string): Promise<CachedProfile | null> => {
  try {
    const cached = await AsyncStorage.getItem(`${CACHE_KEY_PREFIX}${userId}`);

    if (!cached) {
      return null;
    }

    const profile: CachedProfile = JSON.parse(cached);

    // Check if cache is expired
    const cachedAt = new Date(profile.cached_at).getTime();
    const now = new Date().getTime();

    if (now - cachedAt > CACHE_EXPIRY_MS) {
      // Cache expired, remove it
      await clearProfileCache(userId);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Error loading cached profile:', error);
    return null;
  }
};

/**
 * Clear profile cache for specific user
 */
export const clearProfileCache = async (userId: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(`${CACHE_KEY_PREFIX}${userId}`);
  } catch (error) {
    console.error('Error clearing profile cache:', error);
  }
};

/**
 * Clear all profile caches
 */
export const clearAllProfileCaches = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const profileKeys = keys.filter((key) => key.startsWith(CACHE_KEY_PREFIX));
    await AsyncStorage.multiRemove(profileKeys);
  } catch (error) {
    console.error('Error clearing all profile caches:', error);
  }
};

/**
 * Check if device is online
 */
export const isOnline = async (): Promise<boolean> => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected ?? false;
};

/**
 * Load profile with offline support
 * Attempts to load from network, falls back to cache if offline
 */
export const loadProfileWithOfflineSupport = async <T>(
  userId: string,
  fetchFn: () => Promise<T>
): Promise<{ data: T | CachedProfile | null; isFromCache: boolean; isOffline: boolean }> => {
  const online = await isOnline();

  if (online) {
    try {
      // Try to fetch from network
      const data = await fetchFn();

      // Cache the fresh data
      if (data) {
        await cacheProfile(userId, data as any);
      }

      return { data, isFromCache: false, isOffline: false };
    } catch (error) {
      console.error('Error fetching profile from network:', error);

      // Network fetch failed, try cache
      const cached = await loadCachedProfile(userId);
      return { data: cached, isFromCache: true, isOffline: false };
    }
  } else {
    // Device is offline, load from cache
    const cached = await loadCachedProfile(userId);
    return { data: cached, isFromCache: true, isOffline: true };
  }
};

/**
 * Sync indicator message for UI
 */
export const getSyncStatusMessage = (isFromCache: boolean, isOffline: boolean): string | null => {
  if (isOffline) {
    return '📴 Offline - data may be stale';
  }

  if (isFromCache) {
    return '🔄 Using cached data';
  }

  return null;
};
