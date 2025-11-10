/**
 * ConnectionCard Component
 * Displays active connection with quick actions
 * Feature: 002-app-screens (T094)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Avatar, IconButton, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../core/theme/ThemeContext';
import { ConnectionStatus } from './ConnectionStatus';
import type { ConnectionWithUsers } from '../../types/connection';

export interface ConnectionCardProps {
  /** Connection data */
  connection: ConnectionWithUsers;
  /** Current user ID to determine display role */
  currentUserId: string;
  /** Days since connection was established */
  daysSinceConnected?: number;
  /** Last interaction timestamp */
  lastInteraction?: string;
  /** Unread message count */
  unreadCount?: number;
  /** Callback when card is pressed */
  onPress: () => void;
  /** Callback when message button is pressed */
  onMessage: () => void;
  /** Whether any action is loading */
  isLoading?: boolean;
}

/**
 * Connection card component for active connections
 */
export const ConnectionCard: React.FC<ConnectionCardProps> = ({
  connection,
  currentUserId,
  daysSinceConnected = 0,
  lastInteraction,
  unreadCount = 0,
  onPress,
  onMessage,
  isLoading = false,
}) => {
  const { theme } = useAppTheme();

  // Determine which profile to display (the other person in the connection)
  const isSponsor = connection.sponsor_id === currentUserId;
  const otherPerson = isSponsor ? connection.sponsee : connection.sponsor;
  const userRole = isSponsor ? 'Sponsee' : 'Sponsor';

  /**
   * Format last interaction time
   */
  const formatLastInteraction = (): string => {
    if (!lastInteraction) return 'No recent activity';

    const lastInteractionDate = new Date(lastInteraction);
    const now = new Date();
    const diffMs = now.getTime() - lastInteractionDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return lastInteractionDate.toLocaleDateString();
  };

  /**
   * Format connection duration
   */
  const formatDuration = (): string => {
    if (daysSinceConnected === 0) return 'Just connected';
    if (daysSinceConnected === 1) return '1 day';
    if (daysSinceConnected < 30) return `${daysSinceConnected} days`;
    const months = Math.floor(daysSinceConnected / 30);
    if (months === 1) return '1 month';
    if (months < 12) return `${months} months`;
    const years = Math.floor(months / 12);
    return years === 1 ? '1 year' : `${years} years`;
  };

  return (
    <Card
      style={styles.card}
      onPress={onPress}
      disabled={isLoading}
      accessibilityLabel={`Connection with ${otherPerson.name}`}
      accessibilityHint="Tap to view full connection profile">
      <Card.Content>
        <View style={styles.header}>
          {/* Avatar */}
          {otherPerson.profile_photo_url ? (
            <Avatar.Image size={56} source={{ uri: otherPerson.profile_photo_url }} />
          ) : (
            <Avatar.Icon
              size={56}
              icon="account"
              style={{ backgroundColor: theme.colors.primaryContainer }}
            />
          )}

          {/* Info */}
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text
                variant="titleMedium"
                style={[styles.name, { color: theme.colors.onSurface }]}
                numberOfLines={1}>
                {otherPerson.name}
              </Text>
              {unreadCount > 0 && (
                <Chip
                  mode="flat"
                  compact
                  style={[styles.unreadBadge, { backgroundColor: theme.colors.primary }]}
                  textStyle={[styles.unreadText, { color: theme.colors.onPrimary }]}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Chip>
              )}
            </View>

            {/* Role */}
            <View style={styles.roleRow}>
              <MaterialCommunityIcons
                name={isSponsor ? 'account-star-outline' : 'account-supervisor-outline'}
                size={16}
                color={theme.colors.primary}
              />
              <Text variant="bodySmall" style={[styles.role, { color: theme.colors.primary }]}>
                {userRole}
              </Text>
            </View>

            {/* Connection duration */}
            <View style={styles.metaRow}>
              <MaterialCommunityIcons
                name="calendar-check"
                size={14}
                color={theme.colors.onSurfaceVariant}
              />
              <Text
                variant="bodySmall"
                style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
                Connected for {formatDuration()}
              </Text>
            </View>

            {/* Last interaction */}
            <View style={styles.metaRow}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={14}
                color={theme.colors.onSurfaceVariant}
              />
              <Text
                variant="bodySmall"
                style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
                {formatLastInteraction()}
              </Text>
            </View>
          </View>

          {/* Message button */}
          <IconButton
            icon="message-text-outline"
            size={24}
            onPress={onMessage}
            disabled={isLoading}
            containerColor={theme.colors.primaryContainer}
            iconColor={theme.colors.primary}
            accessibilityLabel={`Send message to ${otherPerson.name}`}
            accessibilityHint="Opens messaging screen for this connection"
          />
        </View>

        {/* Connection Status */}
        <View style={styles.statusContainer}>
          <ConnectionStatus status={connection.status} size="small" />
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontWeight: '600',
    flex: 1,
  },
  unreadBadge: {
    height: 20,
    minWidth: 20,
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  role: {
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
  },
  statusContainer: {
    marginTop: 12,
  },
});
