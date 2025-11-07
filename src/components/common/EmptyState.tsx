/**
 * EmptyState Component
 * Reusable empty state UI for lists and data views
 * Feature: 002-app-screens
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text, Button } from 'react-native-paper';

export interface EmptyStateProps {
  /**
   * Title text
   */
  title: string;

  /**
   * Optional description text
   */
  description?: string;

  /**
   * Optional icon/emoji to display
   */
  icon?: string;

  /**
   * Optional action button text
   */
  actionText?: string;

  /**
   * Optional action button handler
   */
  onAction?: () => void;

  /**
   * Custom container style
   */
  style?: ViewStyle;

  /**
   * Test ID for testing
   */
  testID?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction,
  style,
  testID = 'empty-state',
}) => {
  return (
    <View
      style={[styles.container, style]}
      testID={testID}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`${title}${description ? `. ${description}` : ''}`}>
      {icon && (
        <Text variant="displayLarge" style={styles.icon} testID={`${testID}-icon`}>
          {icon}
        </Text>
      )}

      <Text variant="headlineSmall" style={styles.title} testID={`${testID}-title`}>
        {title}
      </Text>

      {description && (
        <Text variant="bodyMedium" style={styles.description} testID={`${testID}-description`}>
          {description}
        </Text>
      )}

      {actionText && onAction && (
        <Button
          mode="contained"
          onPress={onAction}
          style={styles.button}
          testID={`${testID}-action-button`}
          accessible={true}
          accessibilityLabel={actionText}
          accessibilityHint="Performs an action to address this empty state">
          {actionText}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.8,
  },
  title: {
    color: '#111827', // gray-900
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    color: '#6B7280', // gray-500
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 300,
  },
  button: {
    minWidth: 200,
  },
});
