/**
 * Image Optimization Utilities
 * Provides functions for image caching, prefetching, and optimization
 */

import { Image } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

/**
 * Image cache configuration
 */
const IMAGE_CACHE_DIR = `${FileSystem.cacheDirectory}images/`;
const MAX_CACHE_SIZE_MB = 50;
const MAX_CACHE_AGE_DAYS = 7;

/**
 * Initialize image cache directory
 */
export const initializeImageCache = async (): Promise<void> => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(IMAGE_CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(IMAGE_CACHE_DIR, { intermediates: true });
    }
  } catch (error) {
    console.error('Failed to initialize image cache:', error);
  }
};

/**
 * Get cached image URI or download and cache
 */
export const getCachedImageUri = async (uri: string): Promise<string> => {
  try {
    // Generate cache filename from URI
    const filename = encodeURIComponent(uri);
    const cachedPath = `${IMAGE_CACHE_DIR}${filename}`;

    // Check if image exists in cache
    const fileInfo = await FileSystem.getInfoAsync(cachedPath);

    if (fileInfo.exists) {
      // Check if cache is still valid
      const ageInDays =
        (Date.now() - (fileInfo.modificationTime || 0) * 1000) / (1000 * 60 * 60 * 24);

      if (ageInDays < MAX_CACHE_AGE_DAYS) {
        return cachedPath;
      } else {
        // Cache expired, delete old file
        await FileSystem.deleteAsync(cachedPath, { idempotent: true });
      }
    }

    // Download and cache image
    const downloadResult = await FileSystem.downloadAsync(uri, cachedPath);
    return downloadResult.uri;
  } catch (error) {
    console.error('Failed to cache image:', error);
    // Return original URI on error
    return uri;
  }
};

/**
 * Prefetch images for better performance
 */
export const prefetchImages = async (uris: string[]): Promise<void> => {
  try {
    await Promise.all(
      uris.map(uri =>
        Image.prefetch(uri).catch(err => {
          console.warn(`Failed to prefetch image: ${uri}`, err);
        }),
      ),
    );
  } catch (error) {
    console.error('Failed to prefetch images:', error);
  }
};

/**
 * Prefetch local assets
 */
export const prefetchAssets = async (assets: number[]): Promise<void> => {
  try {
    const assetPromises = assets.map(asset => Asset.fromModule(asset).downloadAsync());
    await Promise.all(assetPromises);
  } catch (error) {
    console.error('Failed to prefetch assets:', error);
  }
};

/**
 * Clear image cache
 */
export const clearImageCache = async (): Promise<void> => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(IMAGE_CACHE_DIR);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(IMAGE_CACHE_DIR, { idempotent: true });
      await FileSystem.makeDirectoryAsync(IMAGE_CACHE_DIR, { intermediates: true });
    }
  } catch (error) {
    console.error('Failed to clear image cache:', error);
  }
};

/**
 * Get cache size in MB
 */
export const getCacheSize = async (): Promise<number> => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(IMAGE_CACHE_DIR);
    if (!dirInfo.exists) {
      return 0;
    }

    const files = await FileSystem.readDirectoryAsync(IMAGE_CACHE_DIR);
    let totalSize = 0;

    for (const file of files) {
      const fileInfo = await FileSystem.getInfoAsync(`${IMAGE_CACHE_DIR}${file}`);
      if (fileInfo.exists && fileInfo.size) {
        totalSize += fileInfo.size;
      }
    }

    return totalSize / (1024 * 1024); // Convert to MB
  } catch (error) {
    console.error('Failed to get cache size:', error);
    return 0;
  }
};

/**
 * Clean old cache files if cache exceeds max size
 */
export const cleanOldCacheFiles = async (): Promise<void> => {
  try {
    const cacheSize = await getCacheSize();

    if (cacheSize > MAX_CACHE_SIZE_MB) {
      const files = await FileSystem.readDirectoryAsync(IMAGE_CACHE_DIR);

      // Get file info with modification times
      const fileInfos = await Promise.all(
        files.map(async file => {
          const path = `${IMAGE_CACHE_DIR}${file}`;
          const info = await FileSystem.getInfoAsync(path);
          return { path, modificationTime: info.modificationTime || 0 };
        }),
      );

      // Sort by modification time (oldest first)
      fileInfos.sort((a, b) => a.modificationTime - b.modificationTime);

      // Delete oldest files until cache is under limit
      let currentSize = cacheSize;
      for (const fileInfo of fileInfos) {
        if (currentSize <= MAX_CACHE_SIZE_MB * 0.8) break; // Leave 20% buffer

        await FileSystem.deleteAsync(fileInfo.path, { idempotent: true });

        const info = await FileSystem.getInfoAsync(fileInfo.path);
        if (info.size) {
          currentSize -= info.size / (1024 * 1024);
        }
      }
    }
  } catch (error) {
    console.error('Failed to clean old cache files:', error);
  }
};

/**
 * Optimize image URI for specific dimensions
 * (Add query parameters for image resize services if using CDN)
 */
export const optimizeImageUri = (uri: string, width: number, height: number): string => {
  try {
    // If using a CDN with resize capabilities, add query parameters
    // Example: Cloudinary, imgix, etc.
    // This is a placeholder - adapt to your CDN service
    const url = new URL(uri);
    url.searchParams.set('w', Math.round(width).toString());
    url.searchParams.set('h', Math.round(height).toString());
    url.searchParams.set('fit', 'cover');
    url.searchParams.set('q', '80'); // Quality: 80%
    return url.toString();
  } catch (_error) {
    // If URL parsing fails, return original
    return uri;
  }
};

/**
 * Generate thumbnail URI
 */
export const getThumbnailUri = (uri: string): string => {
  return optimizeImageUri(uri, 200, 200);
};

/**
 * Image optimization configuration
 */
export const IMAGE_OPTIMIZATION_CONFIG = {
  thumbnailSize: { width: 200, height: 200 },
  cardImageSize: { width: 400, height: 400 },
  fullImageSize: { width: 1200, height: 1200 },
  quality: 80,
  cacheEnabled: true,
  prefetchEnabled: true,
};
