import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, Avatar, Button, Divider, Dialog, Portal, useTheme } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDisconnectMutation, Connection } from '../../store/api/connectionsApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { formatDistanceToNow, format } from 'date-fns';

const ConnectionDetailScreen: React.FC = () => {
  const theme = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const userId = useSelector((state: RootState) => state.user?.user?.id);

  const { connection } = (route.params as { connection: Connection }) || {};

  const [disconnect, { isLoading: isDisconnecting }] = useDisconnectMutation();
  const [disconnectDialogVisible, setDisconnectDialogVisible] = useState(false);

  if (!connection) {
    return null;
  }

  // Determine if user is sponsor or sponsee
  const isSponsor = connection.sponsor_id === userId;
  const otherPersonName = isSponsor ? connection.sponsee_name : connection.sponsor_name;
  const otherPersonPhotoUrl = isSponsor ? connection.sponsee_photo_url : connection.sponsor_photo_url;
  const roleLabel = isSponsor ? 'Your Sponsee' : 'Your Sponsor';

  const connectedDate = format(new Date(connection.connected_at), 'MMMM d, yyyy');
  const connectedSince = formatDistanceToNow(new Date(connection.connected_at), { addSuffix: true });

  const handleDisconnectConfirm = async () => {
    try {
      await disconnect({ connection_id: connection.id }).unwrap();
      setDisconnectDialogVisible(false);

      // Navigate back to connections list
      navigation.goBack();
    } catch (error: any) {
      console.error('Failed to disconnect:', error);
    }
  };

  const handleSendMessage = () => {
    // Navigate to messaging screen (WP06)
    navigation.navigate('Chat' as never, {
      connectionId: connection.id,
      otherPersonName,
      otherPersonPhotoUrl,
    } as never);
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

          {connection.last_contact && (
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                💬 Last Contact:
              </Text>
              <Text variant="bodyMedium">
                {formatDistanceToNow(new Date(connection.last_contact), { addSuffix: true })}
              </Text>
            </View>
          )}
        </View>

        <Divider style={styles.divider} />

        {/* Progress Info */}
        {isSponsor && connection.sponsee_step_progress !== undefined && (
          <>
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Sponsee Progress
              </Text>

              <Surface style={styles.progressCard} elevation={0}>
                <Text variant="bodySmall" style={styles.progressLabel}>
                  Current Step
                </Text>
                <Text variant="displaySmall" style={styles.progressValue}>
                  {connection.sponsee_step_progress}/12
                </Text>
                <Text variant="bodySmall" style={styles.progressHint}>
                  Track their journey through the 12 steps
                </Text>
              </Surface>
            </View>

            <Divider style={styles.divider} />
          </>
        )}

        {!isSponsor && connection.sponsor_years_sober !== undefined && (
          <>
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Sponsor Experience
              </Text>

              <Surface style={styles.progressCard} elevation={0}>
                <Text variant="bodySmall" style={styles.progressLabel}>
                  Years Sober
                </Text>
                <Text variant="displaySmall" style={styles.progressValue}>
                  {connection.sponsor_years_sober}
                </Text>
                <Text variant="bodySmall" style={styles.progressHint}>
                  Experience in recovery
                </Text>
              </Surface>
            </View>

            <Divider style={styles.divider} />
          </>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleSendMessage}
            style={styles.messageButton}
            icon="message"
          >
            Send Message
          </Button>

          <Button
            mode="outlined"
            onPress={() => setDisconnectDialogVisible(true)}
            style={[styles.disconnectButton, { borderColor: theme.colors.error }]}
            textColor={theme.colors.error}
            icon="link-off"
          >
            Disconnect
          </Button>
        </View>

        {/* Info Note */}
        <Surface style={styles.infoNote} elevation={0}>
          <Text variant="bodySmall" style={styles.infoText}>
            ℹ️ Disconnecting will end this sponsorship relationship. Messages will be archived for 90 days.
          </Text>
        </Surface>
      </Surface>

      {/* Disconnect Dialog */}
      <Portal>
        <Dialog visible={disconnectDialogVisible} onDismiss={() => setDisconnectDialogVisible(false)}>
          <Dialog.Title>Disconnect Connection</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to disconnect from {otherPersonName}?
            </Text>
            <Text variant="bodySmall" style={styles.warningText}>
              This action will end your sponsorship relationship. Your message history will be archived for 90 days, after which it will be permanently deleted.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDisconnectDialogVisible(false)}>Cancel</Button>
            <Button
              onPress={handleDisconnectConfirm}
              loading={isDisconnecting}
              textColor={theme.colors.error}
            >
              Disconnect
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
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
