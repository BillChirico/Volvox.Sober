/**
 * Offline Sync Utility - Manages offline operations and sync queue (T111-T112)
 */

import NetInfo from '@react-native-community/netinfo';
import { store } from '../store/store';
import {
  enqueueOperation,
  dequeueOperation,
  updateOperationRetry,
  setProcessing,
  setOnline,
  setLastSyncAt,
  persistQueue,
  loadQueue,
  selectSyncQueue,
  selectIsProcessing,
  SyncOperation,
} from '../store/syncQueueSlice';
import { StepWorkResponse } from '../services/stepsApi';

const MAX_RETRY_COUNT = 3;
const RETRY_DELAY_MS = 2000; // 2 seconds

class OfflineSync {
  private unsubscribeNetInfo: (() => void) | null = null;

  /**
   * Initialize offline sync system
   */
  async initialize() {
    // Load persisted queue
    await store.dispatch(loadQueue());

    // Subscribe to network state changes
    this.unsubscribeNetInfo = NetInfo.addEventListener(state => {
      const isOnline = state.isConnected && state.isInternetReachable;
      store.dispatch(setOnline(isOnline ?? false));

      // Trigger sync when coming back online
      if (isOnline) {
        this.processQueue();
      }
    });

    // Check initial network state
    const netInfo = await NetInfo.fetch();
    const isOnline = netInfo.isConnected && netInfo.isInternetReachable;
    store.dispatch(setOnline(isOnline ?? false));

    // Process any pending operations
    if (isOnline) {
      this.processQueue();
    }
  }

  /**
   * Cleanup and unsubscribe
   */
  cleanup() {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
      this.unsubscribeNetInfo = null;
    }
  }

  /**
   * Queue an operation for sync
   */
  async queueOperation(
    type: 'create' | 'update' | 'submit',
    stepId: string,
    responses: StepWorkResponse[],
    status?: 'not_started' | 'in_progress' | 'submitted',
  ) {
    store.dispatch(
      enqueueOperation({
        type,
        stepId,
        responses,
        status,
      }),
    );

    // Persist queue
    await store.dispatch(persistQueue());

    // Try to process immediately if online
    const state = store.getState();
    if (state.syncQueue.isOnline && !state.syncQueue.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Process sync queue
   */
  async processQueue() {
    const state = store.getState();

    // Already processing or offline
    if (selectIsProcessing(state) || !state.syncQueue.isOnline) {
      return;
    }

    const operations = selectSyncQueue(state);
    if (operations.length === 0) {
      return;
    }

    store.dispatch(setProcessing(true));

    try {
      // Process operations sequentially
      for (const operation of operations) {
        await this.processOperation(operation);
      }

      // Update last sync time
      store.dispatch(setLastSyncAt(new Date().toISOString()));
    } catch (error) {
      console.error('Queue processing error:', error);
    } finally {
      store.dispatch(setProcessing(false));
    }
  }

  /**
   * Process individual operation
   */
  private async processOperation(operation: SyncOperation) {
    try {
      // Check retry limit
      if (operation.retryCount >= MAX_RETRY_COUNT) {
        console.warn(`Operation ${operation.id} exceeded max retries, removing from queue`);
        store.dispatch(dequeueOperation(operation.id));
        await store.dispatch(persistQueue());
        return;
      }

      // Execute operation based on type
      switch (operation.type) {
        case 'create':
        case 'update':
          await this.executeSave(operation);
          break;
        case 'submit':
          await this.executeSubmit(operation);
          break;
        default:
          console.warn(`Unknown operation type: ${operation.type}`);
      }

      // Success: remove from queue
      store.dispatch(dequeueOperation(operation.id));
      await store.dispatch(persistQueue());
    } catch (error: any) {
      console.error(`Failed to process operation ${operation.id}:`, error);

      // Update retry count and error
      store.dispatch(
        updateOperationRetry({
          id: operation.id,
          error: error.message || 'Unknown error',
        }),
      );
      await store.dispatch(persistQueue());

      // Wait before next retry
      await this.delay(RETRY_DELAY_MS * (operation.retryCount + 1));
    }
  }

  /**
   * Execute save operation
   */
  private async executeSave(operation: SyncOperation) {
    // Note: This would need to be refactored to work outside React components
    // For now, this is a placeholder showing the intended logic
    const response = await fetch('/api/step-work', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stepId: operation.stepId,
        responses: operation.responses,
        status: operation.status || 'in_progress',
      }),
    });

    if (!response.ok) {
      throw new Error(`Save failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Execute submit operation
   */
  private async executeSubmit(operation: SyncOperation) {
    // Note: This would need to be refactored to work outside React components
    // For now, this is a placeholder showing the intended logic
    const response = await fetch('/api/step-work/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stepId: operation.stepId,
        responses: operation.responses,
      }),
    });

    if (!response.ok) {
      throw new Error(`Submit failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if online
   */
  isOnline(): boolean {
    const state = store.getState();
    return state.syncQueue.isOnline;
  }

  /**
   * Get pending operations count
   */
  getPendingCount(): number {
    const state = store.getState();
    return state.syncQueue.operations.length;
  }

  /**
   * Manual sync trigger
   */
  async sync() {
    await this.processQueue();
  }
}

// Export singleton instance
export const offlineSync = new OfflineSync();
