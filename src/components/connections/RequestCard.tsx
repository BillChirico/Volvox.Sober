/**
 * RequestCard Component
 * Displays pending connection request with accept/decline actions
 * Feature: 002-app-screens (T095)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Avatar, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../theme/ThemeContext';
import type { ConnectionWithUsers } from '../../types/connection';

export interface RequestCardProps {
  /** Connection request data */
  connection: ConnectionWithUsers;
  /** Current user ID to determine if incoming or outgoing */
  currentUserId: string;
  /** Callback when accept button is pressed */
  onAccept: () => void;
  /** Callback when decline button is pressed */
  onDecline: () => void;
  /** Callback when card is pressed */
  onPress: () => void;
  /** Whether accept action is loading */
  isAccepting?: boolean;
  /** Whether decline action is loading */
  isDeclining?: boolean;
}

/**
 * Request card component for pending connection requests
 */
export const RequestCard: React.FC<RequestCardProps> = ({
  connection,
  currentUserId,
  onAccept,
  onDecline,
  onPress,
  isAccepting = false,
  isDeclining = false,
}) => {
  const { theme } = useAppTheme();

  // Determine if this is an incoming or outgoing request
  const isSponsor = connection.sponsor_id === currentUserId;
  const isIncoming = !isSponsor; // Sponsees receive requests from sponsors
  const otherPerson = isSponsor ? connection.sponsee : connection.sponsor;
  const userRole = isSponsor ? 'Sponsee' : 'Sponsor';

  /**
   * Format request time
   */
  const formatRequestTime = (): string => {
    const requestDate = new Date(connection.created_at);
    const now = new Date();
    const diffMs = now.getTime() - requestDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return requestDate.toLocaleDateString();
  };

  return (
    <Card
      style={styles.card}
      onPress={onPress}
      disabled={isAccepting || isDeclining}
      accessibilityLabel={`Connection request ${isIncoming ? 'from' : 'to'} ${otherPerson.name}`}
      accessibilityHint="Tap to view full profile"
    >
      <Card.Content>
        <View style={styles.header}>
          {/* Avatar */}
          {otherPerson.profile_photo_url ? (
            <Avatar.Image
              size={56}
              source={{ uri: otherPerson.profile_photo_url }}
            />
          ) : (
            <Avatar.Icon
              size={56}
              icon="account"
              style={{ backgroundColor: theme.colors.primaryContainer }}
            />
          )}

          {/* Info */}
          <View style={styles.info}>
            <Text
              variant="titleMedium"
              style={[styles.name, { color: theme.colors.onSurface }]}
              numberOfLines={1}
            >
              {otherPerson.name}
            </Text>

            {/* Role */}
            <View style={styles.roleRow}>
              <MaterialCommunityIcons
                name={
                  isSponsor ? 'account-star-outline' : 'account-supervisor-outline'
                }
                size={16}
                color={theme.colors.primary}
              />
              <Text
                variant="bodySmall"
                style={[styles.role, { color: theme.colors.primary }]}
              >
                {userRole}
              </Text>
            </View>

            {/* Request direction and time */}
            <View style={styles.metaRow}>
              <MaterialCommunityIcons
                name={isIncoming ? 'arrow-down-circle' : 'arrow-up-circle'}
                size={14}
                color={theme.colors.onSurfaceVariant}
              />
              <Text
                variant="bodySmall"
                style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}
              >
                {isIncoming ? 'Request received' : 'Request sent'} {formatRequestTime()}
              </Text>
            </View>

            {/* Location if available */}
            {otherPerson.city && otherPerson.state && (
              <View style={styles.metaRow}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={14}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  variant="bodySmall"
                  style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}
                  numberOfLines={1}
                >
                  {otherPerson.city}, {otherPerson.state}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons - Only for incoming requests */}
        {isIncoming && (
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={onDecline}
              loading={isDeclining}
              disabled={isAccepting || isDeclining}
              style={styles.declineButton}
              labelStyle={styles.buttonLabel}
              icon="close"
              accessibilityLabel={`Decline request from ${otherPerson.name}`}
            >
              Decline
            </Button>
            <Button
              mode="contained"
              onPress={onAccept}
              loading={isAccepting}
              disabled={isAccepting || isDeclining}
              style={styles.acceptButton}
              labelStyle={styles.buttonLabel}
              icon="check"
              accessibilityLabel={`Accept request from ${otherPerson.name}`}
            >
              Accept
            </Button>
          </View>
        )}

        {/* Sent request status */}
        {!isIncoming && (
          <View style={styles.sentStatus}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              variant="bodySmall"
              style={[styles.sentText, { color: theme.colors.onSurfaceVariant }]}
            >
              Awaiting response...
            </Text>
          </View>
        )}
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
    marginBottom: 12,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontWeight: '600',
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
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  declineButton: {
    flex: 1,
  },
  acceptButton: {
    flex: 2,
  },
  buttonLabel: {
    fontSize: 14,
  },
  sentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  sentText: {
    fontStyle: 'italic',
  },
});
