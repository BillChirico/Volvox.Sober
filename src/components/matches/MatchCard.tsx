/**
 * MatchCard Component
 * Displays match profile with compatibility score and breakdown
 * Feature: 002-app-screens
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Avatar, Text, Button, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../theme/ThemeContext';
import { CompatibilityBadge } from './CompatibilityBadge';
import type { MatchWithProfile } from '../../types/match';

export interface MatchCardProps {
  /** Match data with candidate profile */
  match: MatchWithProfile;
  /** Callback when card is pressed */
  onPress?: () => void;
  /** Callback when connect button is pressed */
  onConnect: () => void;
  /** Whether connect action is loading */
  isConnecting?: boolean;
}

/**
 * Match card component
 */
export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onPress,
  onConnect,
  isConnecting = false,
}) => {
  const { theme } = useAppTheme();
  const { candidate } = match;

  const formatLocation = (): string => {
    const parts = [];
    if (candidate.city) parts.push(candidate.city);
    if (candidate.state) parts.push(candidate.state);
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  };

  const formatRecoveryProgram = (): string => {
    return candidate.recovery_program || 'Recovery program not specified';
  };

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      onPress={onPress}
      accessibilityLabel={`Match with ${candidate.name}`}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      <Card style={styles.card} elevation={2}>
        <Card.Content>
          {/* Header: Photo + Name + Score */}
          <View style={styles.header}>
            <View style={styles.profileSection}>
              {candidate.profile_photo_url ? (
                <Avatar.Image size={64} source={{ uri: candidate.profile_photo_url }} />
              ) : (
                <Avatar.Icon
                  size={64}
                  icon="account"
                  style={{ backgroundColor: theme.colors.primaryContainer }}
                />
              )}
              <View style={styles.profileInfo}>
                <Text
                  variant="titleLarge"
                  style={[styles.name, { color: theme.colors.onSurface }]}
                >
                  {candidate.name}
                </Text>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={16}
                    color={theme.colors.onSurfaceVariant}
                  />
                  <Text
                    variant="bodyMedium"
                    style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}
                  >
                    {formatLocation()}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons
                    name="heart-pulse"
                    size={16}
                    color={theme.colors.onSurfaceVariant}
                  />
                  <Text
                    variant="bodyMedium"
                    style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}
                  >
                    {formatRecoveryProgram()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Compatibility Score Badge */}
            <CompatibilityBadge score={match.compatibility_score} />
          </View>

          {/* Bio Preview */}
          {candidate.bio && (
            <View style={styles.bioSection}>
              <Text
                variant="bodyMedium"
                numberOfLines={3}
                style={[styles.bio, { color: theme.colors.onSurfaceVariant }]}
              >
                {candidate.bio}
              </Text>
            </View>
          )}

          {/* Availability Chips */}
          {candidate.availability && candidate.availability.length > 0 && (
            <View style={styles.availabilitySection}>
              <Text
                variant="labelMedium"
                style={[styles.sectionLabel, { color: theme.colors.onSurface }]}
              >
                Availability
              </Text>
              <View style={styles.chipContainer}>
                {candidate.availability.slice(0, 3).map((availability) => (
                  <Chip
                    key={availability}
                    mode="outlined"
                    style={styles.chip}
                    textStyle={styles.chipText}
                  >
                    {availability}
                  </Chip>
                ))}
                {candidate.availability.length > 3 && (
                  <Chip mode="outlined" style={styles.chip} textStyle={styles.chipText}>
                    +{candidate.availability.length - 3} more
                  </Chip>
                )}
              </View>
            </View>
          )}

          {/* Connect Button */}
          <Button
            mode="contained"
            onPress={onConnect}
            loading={isConnecting}
            disabled={isConnecting}
            style={styles.connectButton}
            icon="account-plus"
            accessibilityLabel="Send connection request"
            accessibilityHint={`Send a connection request to ${candidate.name}`}
          >
            {isConnecting ? 'Sending...' : 'Send Connection Request'}
          </Button>
        </Card.Content>
      </Card>
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  profileSection: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  profileInfo: {
    marginLeft: 12,
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontWeight: '600',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    marginLeft: 6,
    flex: 1,
  },
  bioSection: {
    marginBottom: 16,
  },
  bio: {
    lineHeight: 20,
  },
  availabilitySection: {
    marginBottom: 16,
  },
  sectionLabel: {
    marginBottom: 8,
    fontWeight: '600',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    height: 28,
  },
  chipText: {
    fontSize: 12,
  },
  connectButton: {
    marginTop: 8,
  },
});
