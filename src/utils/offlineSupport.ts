/**
 * Offline Support Utilities
 * Handles network status detection and offline queue management
 */

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { store } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Offline queue storage key
 */
const OFFLINE_QUEUE_KEY = '@volvox/offline_queue';

/**
 * Queued action interface
 */
export interface QueuedAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

/**
 * Network status listener
 */
let networkStatusListener: (() => void) | null = null;

/**
 * Initialize offline support
 */
export const initializeOfflineSupport = (): void => {
  // Subscribe to network status changes
  networkStatusListener = NetInfo.addEventListener(handleNetworkChange);

  // Check initial network status
  NetInfo.fetch().then(handleNetworkChange);
};

/**
 * Cleanup offline support listeners
 */
export const cleanupOfflineSupport = (): void => {
  if (networkStatusListener) {
    networkStatusListener();
    networkStatusListener = null;
  }
};

/**
 * Handle network status changes
 */
const handleNetworkChange = async (state: NetInfoState): Promise<void> => {
  if (state.isConnected && state.isInternetReachable) {
    // Network is available, process offline queue
    await processOfflineQueue();
  }
};

/**
 * Check if device is online
 */
export const isOnline = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return state.isConnected === true && state.isInternetReachable !== false;
};

/**
 * Add action to offline queue
 */
export const queueOfflineAction = async (
  type: string,
  payload: any,
  maxRetries: number = 3,
): Promise<void> => {
  try {
    const queue = await getOfflineQueue();

    const queuedAction: QueuedAction = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries,
    };

    queue.push(queuedAction);
    await saveOfflineQueue(queue);
  } catch (error) {
    console.error('Failed to queue offline action:', error);
  }
};

/**
 * Get offline queue from storage
 */
const getOfflineQueue = async (): Promise<QueuedAction[]> => {
  try {
    const queueJson = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return queueJson ? JSON.parse(queueJson) : [];
  } catch (error) {
    console.error('Failed to get offline queue:', error);
    return [];
  }
};

/**
 * Save offline queue to storage
 */
const saveOfflineQueue = async (queue: QueuedAction[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Failed to save offline queue:', error);
  }
};

/**
 * Process offline queue
 */
export const processOfflineQueue = async (): Promise<void> => {
  try {
    const queue = await getOfflineQueue();

    if (queue.length === 0) {
      return;
    }

    console.log(`Processing ${queue.length} queued actions...`);

    const failedActions: QueuedAction[] = [];

    for (const action of queue) {
      try {
        // Dispatch queued action to Redux store
        await store.dispatch({ type: action.type, payload: action.payload });
        console.log(`Successfully processed queued action: ${action.type}`);
      } catch (error) {
        console.error(`Failed to process queued action: ${action.type}`, error);

        // Increment retry count
        action.retryCount += 1;

        // Re-queue if under max retries
        if (action.retryCount < action.maxRetries) {
          failedActions.push(action);
        } else {
          console.warn(`Max retries reached for action: ${action.type}`);
        }
      }
    }

    // Save remaining failed actions back to queue
    await saveOfflineQueue(failedActions);

    if (failedActions.length === 0) {
      console.log('All queued actions processed successfully');
    } else {
      console.log(`${failedActions.length} actions remain in queue for retry`);
    }
  } catch (error) {
    console.error('Failed to process offline queue:', error);
  }
};

/**
 * Clear offline queue
 */
export const clearOfflineQueue = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch (error) {
    console.error('Failed to clear offline queue:', error);
  }
};

/**
 * Get queue size
 */
export const getQueueSize = async (): Promise<number> => {
  try {
    const queue = await getOfflineQueue();
    return queue.length;
  } catch (error) {
    console.error('Failed to get queue size:', error);
    return 0;
  }
};

/**
 * Offline-first thunk wrapper
 * Executes action immediately if online, queues if offline
 */
export const offlineFirstThunk = <T extends (...args: any[]) => any>(
  thunk: T,
  actionType: string,
) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const online = await isOnline();

    if (online) {
      // Execute immediately if online
      return thunk(...args);
    } else {
      // Queue for later if offline
      await queueOfflineAction(actionType, args);
      throw new Error('Action queued for execution when online');
    }
  };
};

/**
 * Network status monitoring
 */
export const useNetworkStatus = (): {
  isConnected: boolean;
  isInternetReachable: boolean | null;
} => {
  const [networkState, setNetworkState] = React.useState<NetInfoState | null>(null);

  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(setNetworkState);

    NetInfo.fetch().then(setNetworkState);

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isConnected: networkState?.isConnected ?? false,
    isInternetReachable: networkState?.isInternetReachable ?? null,
  };
};

/**
 * Storage quota management
 */
export const getStorageQuota = async (): Promise<{
  used: number;
  available: number;
  total: number;
}> => {
  try {
    // Get all AsyncStorage keys
    const keys = await AsyncStorage.getAllKeys();
    let totalSize = 0;

    // Calculate total storage used
    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        totalSize += new Blob([value]).size;
      }
    }

    // AsyncStorage typically has ~6MB limit on iOS, ~10MB on Android
    const estimatedLimit = 10 * 1024 * 1024; // 10MB

    return {
      used: totalSize,
      available: estimatedLimit - totalSize,
      total: estimatedLimit,
    };
  } catch (error) {
    console.error('Failed to get storage quota:', error);
    return { used: 0, available: 0, total: 0 };
  }
};

// Import React for useNetworkStatus hook
import React from 'react';
