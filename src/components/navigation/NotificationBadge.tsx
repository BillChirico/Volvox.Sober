/**
 * NotificationBadge Component
 * Displays a badge with unread/pending count on tab icons
 * Feature: 002-app-screens
 */

import React from 'react';
import { View, Text, StyleSheet, AccessibilityInfo } from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';

export interface NotificationBadgeProps {
  /** Number to display in the badge */
  count: number;
  /** Maximum number to display before showing "99+" */
  maxCount?: number;
  /** Accessibility label for the badge */
  accessibilityLabel?: string;
}

/**
 * Badge component for displaying notification counts on tabs
 */
export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  maxCount = 99,
  accessibilityLabel,
}) => {
  const { theme } = useAppTheme();

  // Don't render if count is 0
  if (count <= 0) {
    return null;
  }

  // Format count display
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  // Generate accessibility label if not provided
  const defaultAccessibilityLabel = `${count} ${
    count === 1 ? 'notification' : 'notifications'
  }`;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: theme.colors.error,
          minWidth: count > 9 ? 20 : 18,
        },
      ]}
      accessible={true}
      accessibilityLabel={accessibilityLabel || defaultAccessibilityLabel}
      accessibilityRole="text"
    >
      <Text
        style={[
          styles.badgeText,
          {
            color: theme.colors.onError,
          },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {displayCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
});
