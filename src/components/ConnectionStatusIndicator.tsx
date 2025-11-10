/**
 * ConnectionStatusIndicator Component
 * Shows real-time connection status with visual feedback
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ConnectionStatusIndicatorProps {
  isConnected: boolean;
  style?: any;
}

export const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  isConnected,
  style,
}) => {
  if (isConnected) {
    return null; // Hide when connected - only show when disconnected
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.dot} />
      <Text style={styles.text}>Connecting...</Text>
    </View>
  );
};

// ============================================================
// Styles
// ============================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFCC00',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  text: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
});
