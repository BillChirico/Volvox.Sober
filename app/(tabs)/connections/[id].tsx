/**
 * Connection Detail Screen
 * View and manage a specific sponsor/sponsee connection
 * Migrated from src/screens/connections/ConnectionDetailScreen.tsx
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Surface,
  Avatar,
  Button,
  Divider,
  Dialog,
  Portal,
  useTheme,
  MD3Theme,
} from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDisconnectMutation } from '../../../src/store/api/connectionsApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../../src/store';
import { selectConnectionById } from '../../../src/store/connections/connectionsSelectors';
import { selectUser } from '@/features/auth';
import { formatDistanceToNow, format } from 'date-fns';

const ConnectionDetailScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const user = useSelector(selectUser);
  const userId = user?.id;

  // Fetch connection from store using ID (secure alternative to JSON parsing URL params)
  const connection = useSelector((state: RootState) =>
    params.id ? selectConnectionById(state, params.id) : null,
  );

  const [disconnect, { isLoading: isDisconnecting }] = useDisconnectMutation();
  const [disconnectDialogVisible, setDisconnectDialogVisible] = useState(false);

  // Navigate back if connection not found
  useEffect(() => {
    if (params.id && !connection) {
      console.error('Connection not found:', params.id);
      router.back();
    }
  }, [params.id, connection, router]);

  // Memoize derived values to prevent recalculation on every render
  const derivedData = useMemo(() => {
    if (!connection || !userId) return null;

    const isSponsor = connection.sponsor_id === userId;
    const otherPerson = isSponsor ? connection.sponsee : connection.sponsor;

    return {
      isSponsor,
      otherPerson,
      otherPersonName: otherPerson.name,
      otherPersonPhotoUrl: otherPerson.profile_photo_url,
      roleLabel: isSponsor ? 'Your Sponsee' : 'Your Sponsor',
      connectedDate: format(new Date(connection.created_at), 'MMMM d, yyyy'),
      connectedSince: formatDistanceToNow(new Date(connection.created_at), { addSuffix: true }),
    };
  }, [connection, userId]);

  if (!connection || !derivedData) {
    return null;
  }

  const { otherPersonName, otherPersonPhotoUrl, roleLabel, connectedDate, connectedSince } =
    derivedData;

  const handleDisconnectConfirm = async () => {
    try {
      await disconnect({ connection_id: connection.id }).unwrap();
      setDisconnectDialogVisible(false);

      // Navigate back to connections list
      router.back();
    } catch (error: any) {
      console.error('Failed to disconnect:', error);
    }
  };

  const handleSendMessage = () => {
    // Navigate to messaging screen
    router.push({
      pathname: '/(tabs)/messages/[id]',
      params: {
        id: connection.id,
        otherPersonName,
        otherPersonPhotoUrl,
      },
    });
  };

  const styles = createStyles(theme);

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.surface}>
        {/* Profile Header */}
        <View style={styles.header}>
          {otherPersonPhotoUrl ? (
            <Avatar.Image size={100} source={{ uri: otherPersonPhotoUrl }} />
          ) : (
            <Avatar.Icon size={100} icon="account" />
          )}
          <Text variant="headlineMedium" style={styles.name}>
            {otherPersonName}
          </Text>
          <Text variant="labelLarge" style={styles.role}>
            {roleLabel}
          </Text>
        </View>

        <Divider style={styles.divider} />

        {/* Connection Stats */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Connection Information
          </Text>

          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.label}>
              📅 Connected:
            </Text>
            <Text variant="bodyMedium">{connectedDate}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.label}>
              ⏱️ Duration:
            </Text>
            <Text variant="bodyMedium">{connectedSince}</Text>
          </View>

          {connection.last_interaction_at && (
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                💬 Last Interaction:
              </Text>
              <Text variant="bodyMedium">
                {formatDistanceToNow(new Date(connection.last_interaction_at), { addSuffix: true })}
              </Text>
            </View>
          )}
        </View>

        <Divider style={styles.divider} />

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleSendMessage}
            style={styles.messageButton}
            icon="message">
            Send Message
          </Button>

          <Button
            mode="outlined"
            onPress={() => setDisconnectDialogVisible(true)}
            style={[styles.disconnectButton, { borderColor: theme.colors.error }]}
            textColor={theme.colors.error}
            icon="link-off">
            Disconnect
          </Button>
        </View>

        {/* Info Note */}
        <Surface style={styles.infoNote} elevation={0}>
          <Text variant="bodySmall" style={styles.infoText}>
            ℹ️ Disconnecting will end this sponsorship relationship. Messages will be archived for
            90 days.
          </Text>
        </Surface>
      </Surface>

      {/* Disconnect Dialog */}
      <Portal>
        <Dialog
          visible={disconnectDialogVisible}
          onDismiss={() => setDisconnectDialogVisible(false)}>
          <Dialog.Title>Disconnect Connection</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to disconnect from {otherPersonName}?
            </Text>
            <Text variant="bodySmall" style={styles.warningText}>
              This action will end your sponsorship relationship. Your message history will be
              archived for 90 days, after which it will be permanently deleted.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDisconnectDialogVisible(false)}>Cancel</Button>
            <Button
              onPress={handleDisconnectConfirm}
              loading={isDisconnecting}
              textColor={theme.colors.error}>
              Disconnect
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surfaceVariant,
    },
    surface: {
      margin: 16,
      padding: 24,
      borderRadius: 8,
      elevation: 2,
    },
    header: {
      alignItems: 'center',
      marginBottom: 16,
    },
    name: {
      marginTop: 16,
      marginBottom: 8,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    role: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    divider: {
      marginVertical: 16,
    },
    section: {
      marginBottom: 8,
    },
    sectionTitle: {
      fontWeight: 'bold',
      marginBottom: 12,
    },
    infoRow: {
      flexDirection: 'row',
      marginBottom: 8,
      alignItems: 'center',
    },
    label: {
      fontWeight: '600',
      marginRight: 8,
      minWidth: 140,
    },
    progressCard: {
      backgroundColor: theme.colors.tertiaryContainer,
      padding: 20,
      borderRadius: 8,
      alignItems: 'center',
    },
    progressLabel: {
      color: theme.colors.onTertiaryContainer,
      marginBottom: 8,
    },
    progressValue: {
      color: theme.colors.tertiary,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    progressHint: {
      color: theme.colors.tertiary,
      fontStyle: 'italic',
    },
    actions: {
      gap: 12,
    },
    messageButton: {
      marginBottom: 8,
    },
    disconnectButton: {
      marginBottom: 16,
    },
    infoNote: {
      backgroundColor: theme.colors.errorContainer,
      padding: 12,
      borderRadius: 8,
    },
    infoText: {
      color: theme.colors.onErrorContainer,
      textAlign: 'center',
    },
    warningText: {
      marginTop: 12,
      color: theme.colors.error,
      fontStyle: 'italic',
    },
  });

export default ConnectionDetailScreen;
