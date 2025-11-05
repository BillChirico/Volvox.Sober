/**
 * Offline Message Queue (T129)
 *
 * Queues messages when offline and syncs on reconnect
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

interface QueuedMessage {
  id: string;
  connection_id: string;
  recipient_id: string;
  message_text: string;
  queued_at: string;
  retry_count: number;
}

const QUEUE_KEY_PREFIX = 'messageQueue:';
const MAX_QUEUE_SIZE = 100;
const MAX_RETRY_ATTEMPTS = 3;

class OfflineMessageQueue {
  private syncInProgress = false;
  private onSyncCallback: ((connectionId: string) => void) | null = null;

  /**
   * Add message to offline queue
   */
  async enqueue(
    connectionId: string,
    recipientId: string,
    messageText: string
  ): Promise<string> {
    const queueKey = `${QUEUE_KEY_PREFIX}${connectionId}`;

    // Get existing queue
    const queueJson = await AsyncStorage.getItem(queueKey);
    const queue: QueuedMessage[] = queueJson ? JSON.parse(queueJson) : [];

    // Check queue size limit
    if (queue.length >= MAX_QUEUE_SIZE) {
      throw new Error('Message queue full. Connect to internet to sync.');
    }

    // Create queued message
    const messageId = `queued-${Date.now()}-${Math.random()}`;
    const queuedMessage: QueuedMessage = {
      id: messageId,
      connection_id: connectionId,
      recipient_id: recipientId,
      message_text: messageText,
      queued_at: new Date().toISOString(),
      retry_count: 0,
    };

    queue.push(queuedMessage);
    await AsyncStorage.setItem(queueKey, JSON.stringify(queue));

    return messageId;
  }

  /**
   * Get queued messages for a connection
   */
  async getQueue(connectionId: string): Promise<QueuedMessage[]> {
    const queueKey = `${QUEUE_KEY_PREFIX}${connectionId}`;
    const queueJson = await AsyncStorage.getItem(queueKey);
    return queueJson ? JSON.parse(queueJson) : [];
  }

  /**
   * Get queue size for a connection
   */
  async getQueueSize(connectionId: string): Promise<number> {
    const queue = await this.getQueue(connectionId);
    return queue.length;
  }

  /**
   * Get total queue size across all connections
   */
  async getTotalQueueSize(): Promise<number> {
    const allKeys = await AsyncStorage.getAllKeys();
    const queueKeys = allKeys.filter(key => key.startsWith(QUEUE_KEY_PREFIX));

    let total = 0;
    for (const key of queueKeys) {
      const queueJson = await AsyncStorage.getItem(key);
      const queue: QueuedMessage[] = queueJson ? JSON.parse(queueJson) : [];
      total += queue.length;
    }

    return total;
  }

  /**
   * Remove message from queue
   */
  async dequeue(connectionId: string, messageId: string): Promise<void> {
    const queueKey = `${QUEUE_KEY_PREFIX}${connectionId}`;
    const queue = await this.getQueue(connectionId);

    const updatedQueue = queue.filter(msg => msg.id !== messageId);
    await AsyncStorage.setItem(queueKey, JSON.stringify(updatedQueue));
  }

  /**
   * Clear all queued messages for a connection
   */
  async clearQueue(connectionId: string): Promise<void> {
    const queueKey = `${QUEUE_KEY_PREFIX}${connectionId}`;
    await AsyncStorage.removeItem(queueKey);
  }

  /**
   * Increment retry count for a message
   */
  async incrementRetry(connectionId: string, messageId: string): Promise<void> {
    const queueKey = `${QUEUE_KEY_PREFIX}${connectionId}`;
    const queue = await this.getQueue(connectionId);

    const updatedQueue = queue.map(msg => {
      if (msg.id === messageId) {
        return { ...msg, retry_count: msg.retry_count + 1 };
      }
      return msg;
    });

    await AsyncStorage.setItem(queueKey, JSON.stringify(updatedQueue));
  }

  /**
   * Sync queued messages for a specific connection
   */
  async syncConnection(
    connectionId: string,
    sendFn: (recipientId: string, messageText: string) => Promise<void>
  ): Promise<{ successful: number; failed: number }> {
    const queue = await this.getQueue(connectionId);

    if (queue.length === 0) {
      return { successful: 0, failed: 0 };
    }

    let successful = 0;
    let failed = 0;

    // Process queue sequentially
    for (const message of queue) {
      try {
        await sendFn(message.recipient_id, message.message_text);
        await this.dequeue(connectionId, message.id);
        successful++;
      } catch (error) {
        console.error('Failed to send queued message:', error);

        // Increment retry count
        await this.incrementRetry(connectionId, message.id);

        // Remove if max retries exceeded
        if (message.retry_count >= MAX_RETRY_ATTEMPTS) {
          console.warn('Max retries exceeded for message:', message.id);
          await this.dequeue(connectionId, message.id);
        }

        failed++;
      }
    }

    // Notify callback if provided
    if (this.onSyncCallback && (successful > 0 || failed > 0)) {
      this.onSyncCallback(connectionId);
    }

    return { successful, failed };
  }

  /**
   * Sync all queued messages across all connections
   */
  async syncAll(
    sendFn: (connectionId: string, recipientId: string, messageText: string) => Promise<void>
  ): Promise<{ total: number; successful: number; failed: number }> {
    if (this.syncInProgress) {
      console.warn('Sync already in progress');
      return { total: 0, successful: 0, failed: 0 };
    }

    this.syncInProgress = true;

    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const queueKeys = allKeys.filter(key => key.startsWith(QUEUE_KEY_PREFIX));

      let totalProcessed = 0;
      let totalSuccessful = 0;
      let totalFailed = 0;

      for (const queueKey of queueKeys) {
        const connectionId = queueKey.replace(QUEUE_KEY_PREFIX, '');
        const queue = await this.getQueue(connectionId);

        totalProcessed += queue.length;

        for (const message of queue) {
          try {
            await sendFn(connectionId, message.recipient_id, message.message_text);
            await this.dequeue(connectionId, message.id);
            totalSuccessful++;
          } catch (error) {
            console.error('Failed to send queued message:', error);
            await this.incrementRetry(connectionId, message.id);

            if (message.retry_count >= MAX_RETRY_ATTEMPTS) {
              await this.dequeue(connectionId, message.id);
            }

            totalFailed++;
          }
        }
      }

      return {
        total: totalProcessed,
        successful: totalSuccessful,
        failed: totalFailed,
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Check if online and trigger sync
   */
  async checkAndSync(
    sendFn: (connectionId: string, recipientId: string, messageText: string) => Promise<void>
  ): Promise<void> {
    const netInfo = await NetInfo.fetch();

    if (netInfo.isConnected) {
      await this.syncAll(sendFn);
    }
  }

  /**
   * Setup auto-sync on network reconnect
   */
  setupAutoSync(
    sendFn: (connectionId: string, recipientId: string, messageText: string) => Promise<void>
  ): () => void {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && !this.syncInProgress) {
        console.log('Network reconnected, syncing queued messages...');
        this.syncAll(sendFn);
      }
    });

    return unsubscribe;
  }

  /**
   * Set callback for sync events
   */
  onSync(callback: (connectionId: string) => void): void {
    this.onSyncCallback = callback;
  }

  /**
   * Check if queue is approaching limit
   */
  async isQueueNearLimit(connectionId: string): Promise<boolean> {
    const size = await this.getQueueSize(connectionId);
    return size >= 50; // Warn at 50% capacity
  }
}

// Export singleton instance
export const offlineMessageQueue = new OfflineMessageQueue();
