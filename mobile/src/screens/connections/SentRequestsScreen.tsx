import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Surface, Avatar, Button, Card, ActivityIndicator, Dialog, Portal, Chip } from 'react-native-paper';
import { useGetSentRequestsQuery, useCancelRequestMutation, ConnectionRequest } from '../../store/api/connectionsApi';
import { formatDistanceToNow } from 'date-fns';

const SentRequestsScreen: React.FC = () => {
  const { data: requests, isLoading, refetch, isFetching } = useGetSentRequestsQuery();
  const [cancelRequest, { isLoading: isCancelling }] = useCancelRequestMutation();

  const [cancelDialogVisible, setCancelDialogVisible] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const handleCancelConfirm = async () => {
    if (!selectedRequestId) return;

    try {
      await cancelRequest(selectedRequestId).unwrap();
      setCancelDialogVisible(false);
      setSelectedRequestId(null);
    } catch (error: any) {
      console.error('Failed to cancel request:', error);
    }
  };

  const showCancelDialog = (requestId: string) => {
    setSelectedRequestId(requestId);
    setCancelDialogVisible(true);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return '#FFA000'; // Amber
      case 'accepted':
        return '#4CAF50'; // Green
      case 'declined':
        return '#F44336'; // Red
      case 'cancelled':
        return '#9E9E9E'; // Gray
      default:
        return '#757575';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'declined':
        return 'Declined';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const renderRequest = ({ item }: { item: ConnectionRequest }) => {
    const daysSince = formatDistanceToNow(new Date(item.created_at), { addSuffix: true });
    const isPending = item.status === 'pending';

    return (
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <View style={styles.header}>
            {item.sponsor_photo_url ? (
              <Avatar.Image size={60} source={{ uri: item.sponsor_photo_url }} />
            ) : (
              <Avatar.Icon size={60} icon="account" />
            )}

            <View style={styles.requestInfo}>
              <Text variant="titleMedium" style={styles.name}>
                {item.sponsor_name}
              </Text>
              <Text variant="bodySmall" style={styles.timestamp}>
                Sent {daysSince}
              </Text>
            </View>

            <Chip
              mode="flat"
              style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
              textStyle={styles.statusText}
            >
              {getStatusLabel(item.status)}
            </Chip>
          </View>

          {item.message && (
            <Surface style={styles.messageSurface} elevation={0}>
              <Text variant="labelSmall" style={styles.messageLabel}>
                Your Message:
              </Text>
              <Text variant="bodyMedium" style={styles.message}>
                "{item.message}"
              </Text>
            </Surface>
          )}

          {item.status === 'declined' && item.declined_reason && (
            <Surface style={styles.declinedSurface} elevation={0}>
              <Text variant="labelSmall" style={styles.declinedLabel}>
                Sponsor's Feedback:
              </Text>
              <Text variant="bodyMedium" style={styles.declinedReason}>
                {item.declined_reason}
              </Text>
            </Surface>
          )}

          {item.status === 'accepted' && (
            <Surface style={styles.acceptedSurface} elevation={0}>
              <Text variant="bodyMedium" style={styles.acceptedMessage}>
                ✅ Your request was accepted! Visit the Connections tab to start your sponsorship journey.
              </Text>
            </Surface>
          )}

          {isPending && (
            <View style={styles.actions}>
              <Button
                mode="outlined"
                onPress={() => showCancelDialog(item.id)}
                disabled={isCancelling}
                icon="close"
              >
                Cancel Request
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No Sent Requests
      </Text>
      <Text variant="bodyMedium" style={styles.emptyMessage}>
        You haven't sent any connection requests yet. Browse sponsors to find your match!
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
        keyExtractor={(item) => item.id}
        renderItem={renderRequest}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
        contentContainerStyle={
          (requests || []).length === 0 ? styles.emptyList : styles.list
        }
      />

      {/* Cancel Dialog */}
      <Portal>
        <Dialog visible={cancelDialogVisible} onDismiss={() => setCancelDialogVisible(false)}>
          <Dialog.Title>Cancel Request</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to cancel this connection request?
            </Text>
            <Text variant="bodySmall" style={styles.warningText}>
              You can send another request in 7 days.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCancelDialogVisible(false)}>Keep Request</Button>
            <Button onPress={handleCancelConfirm} loading={isCancelling}>
              Cancel Request
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
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
  statusChip: {
    height: 28,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  messageSurface: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  messageLabel: {
    fontWeight: '600',
    marginBottom: 4,
    color: theme.colors.onSurfaceVariant,
  },
  message: {
    fontStyle: 'italic',
    color: theme.colors.onSurface,
  },
  declinedSurface: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  declinedLabel: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#c62828',
  },
  declinedReason: {
    color: '#d32f2f',
  },
  acceptedSurface: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  acceptedMessage: {
    color: '#2e7d32',
  },
  actions: {
    marginTop: 8,
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
  warningText: {
    marginTop: 8,
    color: '#f57c00',
    fontStyle: 'italic',
  },
});

export default SentRequestsScreen;
