/**
 * ConnectionProfileModal Component
 * Full profile view for connections with details
 * Feature: 002-app-screens (T101)
 */

import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Modal, Portal, Text, Button, Divider, Chip, IconButton, Surface } from 'react-native-paper';
import { ProfilePhotoUpload } from '../ProfilePhotoUpload';
import { ConnectionStatus } from './ConnectionStatus';
import { useAppTheme } from '../../theme/ThemeContext';
import type { ConnectionWithUsers } from '../../types/connection';
import { formatDistance } from 'date-fns';

interface ConnectionProfileModalProps {
  visible: boolean;
  connection: ConnectionWithUsers | null;
  currentUserId: string;
  onDismiss: () => void;
  onMessage?: () => void;
  onEndConnection?: () => void;
}

export function ConnectionProfileModal({
  visible,
  connection,
  currentUserId,
  onDismiss,
  onMessage,
  onEndConnection,
}: ConnectionProfileModalProps): JSX.Element {
  const { theme } = useAppTheme();

  if (!connection) {
    return <></>;
  }

  // Determine which user to show (the other person in the connection)
  const isUserSponsor = connection.sponsor_id === currentUserId;
  const profile = isUserSponsor ? connection.sponsee : connection.sponsor;
  const theirRole = isUserSponsor ? 'sponsee' : 'sponsor';

  // Calculate connection duration
  const connectionDuration = connection.accepted_at
    ? formatDistance(new Date(connection.accepted_at), new Date(), { addSuffix: false })
    : 'Not yet connected';

  // Parse availability if it's a JSONB array
  const availability = Array.isArray(profile.availability)
    ? profile.availability
    : [];

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modalContent,
          {
            backgroundColor: theme.colors.surface,
            maxHeight: Platform.OS === 'web' ? '90vh' : undefined,
          },
        ]}
      >
        {/* Close Button */}
        <IconButton
          icon="close"
          size={24}
          onPress={onDismiss}
          style={styles.closeButton}
          accessibilityLabel="Close profile"
        />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View style={styles.header}>
            <ProfilePhotoUpload
              photoUrl={profile.profile_photo_url || undefined}
              size={100}
              editable={false}
              accessibilityLabel={`${profile.name}'s profile photo`}
            />

            <Text variant="headlineMedium" style={styles.name}>
              {profile.name}
            </Text>

            <ConnectionStatus
              status={connection.status}
              role={theirRole}
              style={styles.statusChip}
            />
          </View>

          <Divider style={styles.divider} />

          {/* Bio */}
          {profile.bio && (
            <Surface style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                About
              </Text>
              <Text variant="bodyMedium" style={styles.bioText}>
                {profile.bio}
              </Text>
            </Surface>
          )}

          {/* Recovery Information */}
          <Surface style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Recovery Information
            </Text>

            <View style={styles.infoRow}>
              <Text variant="labelLarge" style={styles.label}>
                Role:
              </Text>
              <Chip mode="flat" style={styles.roleChip}>
                {theirRole.charAt(0).toUpperCase() + theirRole.slice(1)}
              </Chip>
            </View>

            <View style={styles.infoRow}>
              <Text variant="labelLarge" style={styles.label}>
                Program:
              </Text>
              <Text variant="bodyLarge">{profile.recovery_program}</Text>
            </View>

            {profile.sobriety_start_date && (
              <View style={styles.infoRow}>
                <Text variant="labelLarge" style={styles.label}>
                  Sober Since:
                </Text>
                <Text variant="bodyLarge">
                  {new Date(profile.sobriety_start_date).toLocaleDateString()}
                </Text>
              </View>
            )}
          </Surface>

          {/* Location */}
          {(profile.city || profile.state) && (
            <Surface style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Location
              </Text>
              <Text variant="bodyLarge">
                {profile.city && profile.state
                  ? `${profile.city}, ${profile.state}`
                  : profile.city || profile.state}
                {profile.country && profile.country !== 'United States'
                  ? `, ${profile.country}`
                  : ''}
              </Text>
            </Surface>
          )}

          {/* Availability */}
          {availability.length > 0 && (
            <Surface style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Availability
              </Text>
              <View style={styles.chipContainer}>
                {availability.map((slot: string) => (
                  <Chip key={slot} mode="outlined" style={styles.availabilityChip}>
                    {slot}
                  </Chip>
                ))}
              </View>
            </Surface>
          )}

          {/* Connection Details */}
          <Surface style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Connection Details
            </Text>

            <View style={styles.infoRow}>
              <Text variant="labelLarge" style={styles.label}>
                Connected:
              </Text>
              <Text variant="bodyLarge">{connectionDuration}</Text>
            </View>

            {connection.last_interaction_at && (
              <View style={styles.infoRow}>
                <Text variant="labelLarge" style={styles.label}>
                  Last Interaction:
                </Text>
                <Text variant="bodyLarge">
                  {formatDistance(new Date(connection.last_interaction_at), new Date(), {
                    addSuffix: true,
                  })}
                </Text>
              </View>
            )}

            {connection.status === 'ended' && connection.ended_at && (
              <>
                <View style={styles.infoRow}>
                  <Text variant="labelLarge" style={styles.label}>
                    Ended:
                  </Text>
                  <Text variant="bodyLarge">
                    {formatDistance(new Date(connection.ended_at), new Date(), {
                      addSuffix: true,
                    })}
                  </Text>
                </View>

                {connection.end_feedback && (
                  <View style={styles.feedbackContainer}>
                    <Text variant="labelLarge" style={styles.label}>
                      Feedback:
                    </Text>
                    <Text variant="bodyMedium" style={styles.feedbackText}>
                      {connection.end_feedback}
                    </Text>
                  </View>
                )}
              </>
            )}
          </Surface>

          {/* Action Buttons */}
          {connection.status === 'active' && (
            <View style={styles.actions}>
              {onMessage && (
                <Button
                  mode="contained"
                  icon="message-text"
                  onPress={onMessage}
                  style={styles.actionButton}
                  accessibilityLabel="Send message"
                >
                  Send Message
                </Button>
              )}

              {onEndConnection && (
                <Button
                  mode="outlined"
                  icon="account-remove"
                  onPress={onEndConnection}
                  style={styles.actionButton}
                  textColor={theme.colors.error}
                  accessibilityLabel="End connection"
                >
                  End Connection
                </Button>
              )}
            </View>
          )}
        </ScrollView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    marginHorizontal: 20,
    marginVertical: 40,
    borderRadius: 16,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
    ...Platform.select({
      web: {
        overflow: 'hidden',
      },
      default: {
        maxHeight: '90%',
      },
    }),
  },
  closeButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  name: {
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  statusChip: {
    marginTop: 8,
  },
  divider: {
    marginVertical: 16,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  bioText: {
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    width: 140,
    fontWeight: '500',
  },
  roleChip: {
    alignSelf: 'flex-start',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  availabilityChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  feedbackContainer: {
    marginTop: 8,
  },
  feedbackText: {
    marginTop: 8,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#E0E0E0',
    fontStyle: 'italic',
  },
  actions: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
});
