import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  Text,
  Surface,
  Avatar,
  Button,
  Card,
  ActivityIndicator,
  Dialog,
  Portal,
  TextInput,
} from 'react-native-paper';
import {
  useGetPendingRequestsQuery,
  useAcceptRequestMutation,
  useDeclineRequestMutation,
  ConnectionRequest,
} from '../../store/api/connectionsApi';
import { formatDistanceToNow } from 'date-fns';

const PendingRequestsScreen: React.FC = () => {
  const { data: requests, isLoading, refetch, isFetching } = useGetPendingRequestsQuery();

  const [acceptRequest, { isLoading: isAccepting }] = useAcceptRequestMutation();
  const [declineRequest, { isLoading: isDeclining }] = useDeclineRequestMutation();

  const [declineDialogVisible, setDeclineDialogVisible] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  const handleAccept = async (requestId: string) => {
    try {
      await acceptRequest({ request_id: requestId }).unwrap();
    } catch (error: any) {
      console.error('Failed to accept request:', error);
    }
  };

  const handleDeclineConfirm = async () => {
    if (!selectedRequestId) return;

    try {
      await declineRequest({
        request_id: selectedRequestId,
        reason: declineReason.trim() || undefined,
      }).unwrap();

      setDeclineDialogVisible(false);
      setSelectedRequestId(null);
      setDeclineReason('');
    } catch (error: any) {
      console.error('Failed to decline request:', error);
    }
  };

  const showDeclineDialog = (requestId: string) => {
    setSelectedRequestId(requestId);
    setDeclineDialogVisible(true);
  };

  const renderRequest = ({ item }: { item: ConnectionRequest }) => {
    const daysSince = formatDistanceToNow(new Date(item.created_at), { addSuffix: true });

    return (
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <View style={styles.header}>
            {item.sponsee_photo_url ? (
              <Avatar.Image size={60} source={{ uri: item.sponsee_photo_url }} />
            ) : (
              <Avatar.Icon size={60} icon="account" />
            )}

            <View style={styles.requestInfo}>
              <Text variant="titleMedium" style={styles.name}>
                {item.sponsee_name}
              </Text>
              <Text variant="bodySmall" style={styles.timestamp}>
                Sent {daysSince}
              </Text>
            </View>
          </View>

          {item.message && (
            <Surface style={styles.messageSurface} elevation={0}>
              <Text variant="bodyMedium" style={styles.message}>
                "{item.message}"
              </Text>
            </Surface>
          )}

          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={() => showDeclineDialog(item.id)}
              style={styles.declineButton}
              disabled={isAccepting || isDeclining}>
              Decline
            </Button>

            <Button
              mode="contained"
              onPress={() => handleAccept(item.id)}
              style={styles.acceptButton}
              loading={isAccepting}
              disabled={isAccepting || isDeclining}
              icon="check">
              Accept
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No Pending Requests
      </Text>
      <Text variant="bodyMedium" style={styles.emptyMessage}>
        You don't have any pending connection requests at the moment.
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" />
        <Text variant="bodyMedium" style={styles.loadingText}>
          Loading requests...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={requests || []}
        keyExtractor={item => item.id}
        renderItem={renderRequest}
        ListEmptyComponent={renderEmpty}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        contentContainerStyle={(requests || []).length === 0 ? styles.emptyList : styles.list}
      />

      {/* Decline Dialog */}
      <Portal>
        <Dialog visible={declineDialogVisible} onDismiss={() => setDeclineDialogVisible(false)}>
          <Dialog.Title>Decline Request</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.dialogText}>
              Would you like to provide feedback to the sponsee? (Optional)
            </Text>

            <TextInput
              mode="outlined"
              multiline
              numberOfLines={4}
              value={declineReason}
              onChangeText={setDeclineReason}
              placeholder="Example: I'm at capacity, but I encourage you to keep searching..."
              style={styles.reasonInput}
              maxLength={300}
            />

            <Text variant="bodySmall" style={styles.characterCount}>
              {declineReason.length} / 300 characters
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeclineDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDeclineConfirm} loading={isDeclining}>
              Decline
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    list: {
      paddingVertical: 8,
    },
    emptyList: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      color: theme.colors.onSurfaceVariant,
    },
    card: {
      marginHorizontal: 16,
      marginVertical: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    requestInfo: {
      marginLeft: 12,
      flex: 1,
    },
    name: {
      fontWeight: 'bold',
      marginBottom: 4,
    },
    timestamp: {
      color: theme.colors.onSurfaceVariant,
    },
    messageSurface: {
      backgroundColor: '#f5f5f5',
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
    message: {
      fontStyle: 'italic',
      color: theme.colors.onSurface,
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
    },
    declineButton: {
      flex: 1,
    },
    acceptButton: {
      flex: 1,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyTitle: {
      marginBottom: 16,
      textAlign: 'center',
      fontWeight: 'bold',
    },
    emptyMessage: {
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
    },
    dialogText: {
      marginBottom: 16,
    },
    reasonInput: {
      marginBottom: 8,
    },
    characterCount: {
      textAlign: 'right',
      color: theme.colors.onSurfaceVariant,
    },
  });

export default PendingRequestsScreen;
