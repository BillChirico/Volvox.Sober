/**
 * Auto Save Indicator Component - Visual feedback for save status (T113)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { selectIsOnline, selectHasPendingOperations } from '../store/syncQueueSlice';

export type SaveStatus = 'saved' | 'saving' | 'offline' | 'error';

interface AutoSaveIndicatorProps {
  status: SaveStatus;
  lastSavedAt?: string | null;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  status,
  lastSavedAt,
}) => {
  const isOnline = useSelector(selectIsOnline);
  const hasPendingOps = useSelector(selectHasPendingOperations);

  // Override status based on network state
  let effectiveStatus = status;
  if (!isOnline) {
    effectiveStatus = 'offline';
  } else if (hasPendingOps && status === 'saved') {
    effectiveStatus = 'saving';
  }

  const getStatusConfig = () => {
    switch (effectiveStatus) {
      case 'saved':
        return {
          icon: '✓',
          text: 'Saved',
          color: '#4CAF50',
          showSpinner: false,
        };
      case 'saving':
        return {
          icon: null,
          text: 'Saving...',
          color: '#FF9800',
          showSpinner: true,
        };
      case 'offline':
        return {
          icon: '⚠',
          text: 'Offline - saved locally',
          color: '#F44336',
          showSpinner: false,
        };
      case 'error':
        return {
          icon: '✕',
          text: 'Save failed',
          color: '#D32F2F',
          showSpinner: false,
        };
      default:
        return {
          icon: '•',
          text: 'Ready',
          color: '#9E9E9E',
          showSpinner: false,
        };
    }
  };

  const config = getStatusConfig();

  const formatLastSaved = () => {
    if (!lastSavedAt) return '';

    const date = new Date(lastSavedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);

    if (diffSeconds < 60) {
      return 'just now';
    } else if (diffMinutes === 1) {
      return '1 minute ago';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        {config.showSpinner ? (
          <ActivityIndicator size="small" color={config.color} />
        ) : (
          <Text style={[styles.icon, { color: config.color }]}>{config.icon}</Text>
        )}
        <Text style={[styles.statusText, { color: config.color }]}>{config.text}</Text>
      </View>

      {effectiveStatus === 'saved' && lastSavedAt && (
        <Text style={styles.timestampText}>{formatLastSaved()}</Text>
      )}

      {effectiveStatus === 'offline' && hasPendingOps && (
        <Text style={styles.warningText}>
          Changes will sync when connection restored
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timestampText: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
    marginLeft: 20,
  },
  warningText: {
    fontSize: 10,
    color: '#F44336',
    marginTop: 4,
    marginLeft: 20,
  },
});
