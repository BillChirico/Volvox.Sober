/**
 * ConnectionStatus Component
 * Visual status indicator for connections
 * Feature: 002-app-screens (T096)
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../../theme/ThemeContext';
import type { ConnectionStatus as Status } from '../types';

export interface ConnectionStatusProps {
  /** Connection status */
  status: Status;
  /** Display size */
  size?: 'small' | 'medium' | 'large';
  /** Show icon */
  showIcon?: boolean;
}

/**
 * Connection status component
 */
export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  size = 'medium',
  showIcon = true,
}) => {
  const { theme } = useAppTheme();

  /**
   * Get status configuration
   */
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending',
          icon: 'clock-outline' as const,
          backgroundColor: theme.colors.secondaryContainer,
          textColor: theme.colors.onSecondaryContainer,
        };
      case 'active':
        return {
          label: 'Active',
          icon: 'check-circle-outline' as const,
          backgroundColor: theme.colors.primaryContainer,
          textColor: theme.colors.onPrimaryContainer,
        };
      case 'ended':
        return {
          label: 'Ended',
          icon: 'close-circle-outline' as const,
          backgroundColor: theme.colors.surfaceVariant,
          textColor: theme.colors.onSurfaceVariant,
        };
      default:
        return {
          label: 'Unknown',
          icon: 'help-circle-outline' as const,
          backgroundColor: theme.colors.surfaceVariant,
          textColor: theme.colors.onSurfaceVariant,
        };
    }
  };

  const config = getStatusConfig();

  /**
   * Get chip size props
   */
  const getSizeProps = () => {
    switch (size) {
      case 'small':
        return {
          compact: true,
          textStyle: styles.smallText,
        };
      case 'large':
        return {
          compact: false,
          textStyle: styles.largeText,
        };
      case 'medium':
      default:
        return {
          compact: false,
          textStyle: styles.mediumText,
        };
    }
  };

  const sizeProps = getSizeProps();

  return (
    <Chip
      mode="flat"
      icon={
        showIcon
          ? () => (
              <MaterialCommunityIcons
                name={config.icon}
                size={size === 'small' ? 14 : size === 'large' ? 20 : 16}
                color={config.textColor}
              />
            )
          : undefined
      }
      style={[styles.chip, { backgroundColor: config.backgroundColor }]}
      textStyle={[sizeProps.textStyle, { color: config.textColor }]}
      compact={sizeProps.compact}
      accessibilityLabel={`Connection status: ${config.label}`}>
      {config.label}
    </Chip>
  );
};

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
  },
  smallText: {
    fontSize: 11,
    fontWeight: '500',
  },
  mediumText: {
    fontSize: 13,
    fontWeight: '500',
  },
  largeText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
