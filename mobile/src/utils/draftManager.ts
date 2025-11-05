/**
 * Draft Manager - AsyncStorage management for step work drafts (T104)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFT_KEY_PREFIX = 'stepwork:draft:';

export interface DraftData {
  [questionId: number]: string;
}

class DraftManager {
  /**
   * Generate storage key for a step
   */
  private getKey(stepId: string): string {
    return `${DRAFT_KEY_PREFIX}${stepId}`;
  }

  /**
   * Save draft to AsyncStorage
   */
  async saveDraft(stepId: string, responses: DraftData): Promise<void> {
    try {
      const key = this.getKey(stepId);
      const data = JSON.stringify({
        responses,
        savedAt: new Date().toISOString(),
      });
      await AsyncStorage.setItem(key, data);
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }

  /**
   * Load draft from AsyncStorage
   */
  async loadDraft(stepId: string): Promise<DraftData | null> {
    try {
      const key = this.getKey(stepId);
      const data = await AsyncStorage.getItem(key);

      if (!data) {
        return null;
      }

      const parsed = JSON.parse(data);
      return parsed.responses;
    } catch (error) {
      console.error('Failed to load draft:', error);
      return null;
    }
  }

  /**
   * Clear draft from AsyncStorage
   */
  async clearDraft(stepId: string): Promise<void> {
    try {
      const key = this.getKey(stepId);
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }

  /**
   * Check if draft exists for a step
   */
  async hasDraft(stepId: string): Promise<boolean> {
    try {
      const key = this.getKey(stepId);
      const data = await AsyncStorage.getItem(key);
      return data !== null;
    } catch (error) {
      console.error('Failed to check draft:', error);
      return false;
    }
  }

  /**
   * Get all draft keys (for debugging/cleanup)
   */
  async getAllDraftKeys(): Promise<string[]> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      return allKeys.filter((key) => key.startsWith(DRAFT_KEY_PREFIX));
    } catch (error) {
      console.error('Failed to get draft keys:', error);
      return [];
    }
  }

  /**
   * Clear all drafts (useful for testing/reset)
   */
  async clearAllDrafts(): Promise<void> {
    try {
      const draftKeys = await this.getAllDraftKeys();
      await AsyncStorage.multiRemove(draftKeys);
    } catch (error) {
      console.error('Failed to clear all drafts:', error);
    }
  }

  /**
   * Get draft metadata (when it was saved)
   */
  async getDraftMetadata(
    stepId: string
  ): Promise<{ savedAt: string; responses: DraftData } | null> {
    try {
      const key = this.getKey(stepId);
      const data = await AsyncStorage.getItem(key);

      if (!data) {
        return null;
      }

      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to get draft metadata:', error);
      return null;
    }
  }
}

// Export singleton instance
export const draftManager = new DraftManager();
