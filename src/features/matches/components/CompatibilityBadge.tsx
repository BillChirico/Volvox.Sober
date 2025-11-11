/**
 * CompatibilityBadge Component
 * Displays compatibility score with color coding and label
 * Feature: 002-app-screens
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../../theme/ThemeContext';

export interface CompatibilityBadgeProps {
  /** Compatibility score (0-100) */
  score: number;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
}

/**
 * Get color based on compatibility score
 */
function getCompatibilityColor(score: number): string {
  if (score >= 80) return '#4CAF50'; // Green - Excellent
  if (score >= 60) return '#2196F3'; // Blue - Good
  if (score >= 40) return '#FFC107'; // Amber - Fair
  return '#FF9800'; // Orange - Low
}

/**
 * Get label based on compatibility score
 */
function getCompatibilityLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Low';
}

/**
 * Get size dimensions
 */
function getSizeDimensions(size: 'small' | 'medium' | 'large') {
  switch (size) {
    case 'small':
      return { diameter: 48, fontSize: 16, labelSize: 10 };
    case 'large':
      return { diameter: 80, fontSize: 28, labelSize: 14 };
    case 'medium':
    default:
      return { diameter: 64, fontSize: 22, labelSize: 12 };
  }
}

/**
 * Compatibility badge component
 */
export const CompatibilityBadge: React.FC<CompatibilityBadgeProps> = ({
  score,
  size = 'medium',
}) => {
  const { theme } = useAppTheme();
  const color = getCompatibilityColor(score);
  const label = getCompatibilityLabel(score);
  const { diameter, fontSize, labelSize } = getSizeDimensions(size);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.badge,
          {
            width: diameter,
            height: diameter,
            borderRadius: diameter / 2,
            backgroundColor: color,
          },
        ]}
        accessibilityLabel={`Compatibility score: ${score} out of 100, ${label} match`}
        accessibilityRole="text">
        <Text
          style={[
            styles.scoreText,
            {
              fontSize,
              color: '#FFFFFF',
            },
          ]}>
          {score}
        </Text>
        <Text
          style={[
            styles.maxText,
            {
              fontSize: labelSize,
              color: '#FFFFFF',
            },
          ]}>
          / 100
        </Text>
      </View>
      <Text
        variant="labelSmall"
        style={[
          styles.label,
          {
            color: theme.colors.onSurface,
            fontSize: labelSize,
          },
        ]}>
        {label} Match
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scoreText: {
    fontWeight: '700',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  maxText: {
    fontWeight: '600',
    opacity: 0.9,
    marginTop: -2,
  },
  label: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
