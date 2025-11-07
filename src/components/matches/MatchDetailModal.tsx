/**
 * MatchDetailModal Component
 * Full match profile view with detailed information
 * Feature: 002-app-screens
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, Text, Button, Chip, IconButton, Divider, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../theme/ThemeContext';
import { CompatibilityBadge } from './CompatibilityBadge';
import type { MatchWithProfile } from '../../types/match';

export interface MatchDetailModalProps {
  /** Match data to display */
  match: MatchWithProfile | null;
  /** Whether modal is visible */
  visible: boolean;
  /** Callback when modal is dismissed */
  onDismiss: () => void;
  /** Callback when connect button is pressed */
  onConnect: () => void;
  /** Callback when decline button is pressed */
  onDecline: () => void;
  /** Whether connect action is loading */
  isConnecting?: boolean;
  /** Whether decline action is loading */
  isDeclining?: boolean;
}

/**
 * Match detail modal component
 */
export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({
  match,
  visible,
  onDismiss,
  onConnect,
  onDecline,
  isConnecting = false,
  isDeclining = false,
}) => {
  const { theme } = useAppTheme();

  if (!match) return null;

  const { candidate } = match;

  const formatLocation = (): string => {
    const parts = [];
    if (candidate.city) parts.push(candidate.city);
    if (candidate.state) parts.push(candidate.state);
    if (candidate.country) parts.push(candidate.country);
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  };

  const formatRecoveryProgram = (): string => {
    return candidate.recovery_program || 'Not specified';
  };

  const formatSobrietyInfo = (): string => {
    if (!candidate.sobriety_start_date) return 'Not shared';

    const startDate = new Date(candidate.sobriety_start_date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Day 1';
    if (diffDays === 1) return '1 day';
    return `${diffDays} days`;
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
            Match Profile
          </Text>
          <IconButton icon="close" onPress={onDismiss} accessibilityLabel="Close profile" />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            {candidate.profile_photo_url ? (
              <Avatar.Image size={96} source={{ uri: candidate.profile_photo_url }} />
            ) : (
              <Avatar.Icon
                size={96}
                icon="account"
                style={{ backgroundColor: theme.colors.primaryContainer }}
              />
            )}
            <View style={styles.headerInfo}>
              <Text
                variant="headlineMedium"
                style={[styles.name, { color: theme.colors.onSurface }]}>
                {candidate.name}
              </Text>
              <View style={styles.locationRow}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={18}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  variant="bodyMedium"
                  style={[styles.location, { color: theme.colors.onSurfaceVariant }]}>
                  {formatLocation()}
                </Text>
              </View>
            </View>
          </View>

          {/* Compatibility Score */}
          <View style={styles.compatibilitySection}>
            <CompatibilityBadge score={match.compatibility_score} size="large" />
          </View>

          <Divider />

          {/* Bio Section */}
          {candidate.bio && (
            <>
              <View style={styles.section}>
                <Text
                  variant="titleMedium"
                  style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  About
                </Text>
                <Text
                  variant="bodyLarge"
                  style={[styles.bioText, { color: theme.colors.onSurfaceVariant }]}>
                  {candidate.bio}
                </Text>
              </View>
              <Divider />
            </>
          )}

          {/* Recovery Program */}
          <View style={styles.section}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="heart-pulse" size={24} color={theme.colors.primary} />
              <View style={styles.infoContent}>
                <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                  Recovery Program
                </Text>
                <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                  {formatRecoveryProgram()}
                </Text>
              </View>
            </View>
          </View>

          {/* Sobriety Information */}
          <View style={styles.section}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="calendar-check"
                size={24}
                color={theme.colors.primary}
              />
              <View style={styles.infoContent}>
                <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                  Sobriety Journey
                </Text>
                <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                  {formatSobrietyInfo()}
                </Text>
              </View>
            </View>
          </View>

          <Divider />

          {/* Availability */}
          {candidate.availability && candidate.availability.length > 0 && (
            <>
              <View style={styles.section}>
                <Text
                  variant="titleMedium"
                  style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  Availability
                </Text>
                <View style={styles.chipContainer}>
                  {candidate.availability.map(slot => (
                    <Chip
                      key={slot}
                      mode="outlined"
                      icon="clock-outline"
                      style={styles.availabilityChip}>
                      {slot}
                    </Chip>
                  ))}
                </View>
              </View>
              <Divider />
            </>
          )}

          {/* Role Badge */}
          <View style={styles.section}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name={candidate.role === 'sponsor' ? 'account-supervisor' : 'account-star'}
                size={24}
                color={theme.colors.primary}
              />
              <View style={styles.infoContent}>
                <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                  Role
                </Text>
                <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                  {candidate.role === 'sponsor' ? 'Sponsor' : 'Sponsee'}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={onDecline}
            loading={isDeclining}
            disabled={isConnecting || isDeclining}
            style={styles.declineButton}
            icon="close"
            accessibilityLabel="Decline this match">
            Decline
          </Button>
          <Button
            mode="contained"
            onPress={onConnect}
            loading={isConnecting}
            disabled={isConnecting || isDeclining}
            style={styles.connectButton}
            icon="account-plus"
            accessibilityLabel={`Send connection request to ${candidate.name}`}>
            Connect
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    margin: 20,
    maxHeight: '90%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  headerInfo: {
    alignItems: 'center',
    marginTop: 16,
  },
  name: {
    fontWeight: '600',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    marginLeft: 4,
  },
  compatibilitySection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  bioText: {
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoContent: {
    flex: 1,
    gap: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  availabilityChip: {
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
  declineButton: {
    flex: 1,
  },
  connectButton: {
    flex: 2,
  },
});
