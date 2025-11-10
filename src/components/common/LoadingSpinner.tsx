/**
 * LoadingSpinner Component
 * Reusable loading indicator with accessibility
 * Feature: 002-app-screens
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';

export interface LoadingSpinnerProps {
  /**
   * Optional loading text to display
   */
  text?: string;

  /**
   * Size of the spinner
   * @default 'large'
   */
  size?: 'small' | 'large';

  /**
   * Custom color for the spinner
   */
  color?: string;

  /**
   * Whether to center the spinner in its container
   * @default true
   */
  centered?: boolean;

  /**
   * Custom container style
   */
  style?: ViewStyle;

  /**
   * Test ID for testing
   */
  testID?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text,
  size = 'large',
  color,
  centered = true,
  style,
  testID = 'loading-spinner',
}) => {
  return (
    <View
      style={[styles.container, centered && styles.centered, style]}
      testID={testID}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={text || 'Loading'}
      accessibilityLiveRegion="polite">
      <ActivityIndicator
        size={size}
        color={color || '#6366F1'} // indigo-500
        testID={`${testID}-indicator`}
      />
      {text && (
        <Text variant="bodyMedium" style={styles.text} testID={`${testID}-text`}>
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 12,
    color: '#6B7280', // gray-500
    textAlign: 'center',
  },
});
