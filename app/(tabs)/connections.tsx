/**
 * Connections Screen
 * Manage sponsor/sponsee relationships
 * Feature: 002-app-screens (T097-T104)
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, SectionList, RefreshControl, Alert } from 'react-native';
import { Text, Divider, FAB } from 'react-native-paper';
import { ConnectionCard } from '../../src/components/connections/ConnectionCard';
import { RequestCard } from '../../src/components/connections/RequestCard';
import { ConnectionProfileModal } from '../../src/components/connections/ConnectionProfileModal';
import { EndConnectionModal } from '../../src/components/connections/EndConnectionModal';
import { LoadingSpinner } from '../../src/components/common/LoadingSpinner';
import { EmptyState } from '../../src/components/common/EmptyState';
import { useConnections } from '../../src/hooks/useConnections';
import { useAuth } from '../../src/hooks/useAuth';
import { useAppTheme } from '../../src/core/theme/ThemeContext';
import { useRouter } from 'expo-router';
import connectionService from '../../src/services/connectionService';
import type { ConnectionWithUsers, ConnectionRequest } from '../../src/types/connection';

interface Section {
  title: string;
  data: ConnectionWithUsers[] | ConnectionRequest[];
  type: 'pending' | 'active' | 'ended';
}

export default function ConnectionsScreen() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const router = useRouter();
  const {
    activeConnections,
    pendingRequests,
    endedConnections,
    isLoading,
    isRefreshing,
    error,
    pendingCount,
    hasPendingRequests,
    fetchAll,
    refresh,
    acceptRequest,
    declineRequest,
    dismissError,
  } = useConnections();

  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<ConnectionWithUsers | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [isEndingConnection, setIsEndingConnection] = useState(false);

  // Fetch all connections on mount
  useEffect(() => {
    if (user?.id) {
      fetchAll(user.id);
    }
  }, [user?.id, fetchAll]);

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    if (!user?.id) return;

    try {
      await refresh(user.id);
    } catch (err) {
      console.error('Error refreshing connections:', err);
    }
  }, [user?.id, refresh]);

  // Handle accept request
  const handleAcceptRequest = useCallback(
    async (connection: ConnectionWithUsers) => {
      if (!user?.id) return;

      Alert.alert(
        'Accept Connection',
        `Accept connection request from ${connection.sponsor.name}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Accept',
            onPress: async () => {
              try {
                setAcceptingId(connection.id);
                await acceptRequest(connection.id);
                Alert.alert('Success', 'Connection request accepted!', [{ text: 'OK' }]);
              } catch (err) {
                console.error('Error accepting request:', err);
                Alert.alert('Error', 'Failed to accept connection request. Please try again.', [
                  { text: 'OK' },
                ]);
              } finally {
                setAcceptingId(null);
              }
            },
          },
        ],
      );
    },
    [user?.id, acceptRequest],
  );

  // Handle decline request
  const handleDeclineRequest = useCallback(
    async (connection: ConnectionWithUsers) => {
      if (!user?.id) return;

      Alert.alert(
        'Decline Connection',
        `Decline connection request from ${connection.sponsor.name}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Decline',
            style: 'destructive',
            onPress: async () => {
              try {
                setDecliningId(connection.id);
                await declineRequest(connection.id);
                Alert.alert('Request Declined', 'Connection request has been declined.', [
                  { text: 'OK' },
                ]);
              } catch (err) {
                console.error('Error declining request:', err);
                Alert.alert('Error', 'Failed to decline connection request. Please try again.', [
                  { text: 'OK' },
                ]);
              } finally {
                setDecliningId(null);
              }
            },
          },
        ],
      );
    },
    [user?.id, declineRequest],
  );

  // Handle view connection profile
  const handleViewConnection = useCallback((connection: ConnectionWithUsers) => {
    setSelectedConnection(connection);
    setShowProfileModal(true);
  }, []);

  // Handle message connection
  const handleMessageConnection = useCallback(
    (connection: ConnectionWithUsers) => {
      // Navigate to messages tab with this connection
      router.push(`/messages/${connection.id}`);
    },
    [router],
  );

  // Handle view request profile
  const handleViewRequest = useCallback((connection: ConnectionWithUsers) => {
    setSelectedConnection(connection);
    setShowProfileModal(true);
  }, []);

  // Handle confirm end connection
  const handleConfirmEndConnection = useCallback(
    async (feedback?: string) => {
      if (!user?.id || !selectedConnection) return;

      try {
        setIsEndingConnection(true);

        await connectionService.endConnection({
          connectionId: selectedConnection.id,
          endedAt: new Date().toISOString(),
          endedBy: user.id,
          endFeedback: feedback,
        });

        Alert.alert('Connection Ended', 'Your connection has been ended successfully.', [
          { text: 'OK' },
        ]);

        // Refresh connections list
        await refresh(user.id);

        // Close modals
        setShowEndModal(false);
        setShowProfileModal(false);
        setSelectedConnection(null);
      } catch (err) {
        console.error('Error ending connection:', err);
        Alert.alert('Error', 'Failed to end connection. Please try again.', [{ text: 'OK' }]);
      } finally {
        setIsEndingConnection(false);
      }
    },
    [user?.id, selectedConnection, refresh],
  );

  // Show error alert if error exists
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        {
          text: 'OK',
          onPress: dismissError,
        },
      ]);
    }
  }, [error, dismissError]);

  // Prepare sections for SectionList
  const sections: Section[] = [];

  if (pendingRequests.length > 0) {
    sections.push({
      title: `Pending Requests (${pendingRequests.length})`,
      data: pendingRequests,
      type: 'pending',
    });
  }

  if (activeConnections.length > 0) {
    sections.push({
      title: `Active Connections (${activeConnections.length})`,
      data: activeConnections,
      type: 'active',
    });
  }

  if (endedConnections.length > 0) {
    sections.push({
      title: `Past Connections (${endedConnections.length})`,
      data: endedConnections,
      type: 'ended',
    });
  }

  // Loading state
  if (isLoading && sections.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LoadingSpinner text="Loading connections..." />
      </View>
    );
  }

  // Empty state
  if (sections.length === 0 && !isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          icon="account-group-outline"
          title="No Connections Yet"
          description="Start by browsing potential matches and sending connection requests. Your connections will appear here once accepted."
          actionText="Find Matches"
          onAction={() => router.push('/matches')}
        />
      </View>
    );
  }

  // Render section header
  const renderSectionHeader = ({ section }: { section: Section }) => (
    <View style={[styles.sectionHeader, { backgroundColor: theme.colors.surfaceVariant }]}>
      <Text
        variant="titleMedium"
        style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
        {section.title}
      </Text>
    </View>
  );

  // Render item based on section type
  const renderItem = ({
    item,
    section,
  }: {
    item: ConnectionWithUsers | ConnectionRequest;
    section: Section;
  }) => {
    if (!user?.id) return null;

    if (section.type === 'pending') {
      // Note: pendingRequests is typed as ConnectionRequest[] but contains sponsor/sponsee
      const connectionItem = item as ConnectionWithUsers;
      return (
        <RequestCard
          connection={connectionItem}
          currentUserId={user.id}
          onAccept={() => handleAcceptRequest(connectionItem)}
          onDecline={() => handleDeclineRequest(connectionItem)}
          onPress={() => handleViewRequest(connectionItem)}
          isAccepting={acceptingId === connectionItem.id}
          isDeclining={decliningId === connectionItem.id}
        />
      );
    }

    if (section.type === 'active') {
      const connectionItem = item as ConnectionWithUsers;
      return (
        <ConnectionCard
          connection={connectionItem}
          currentUserId={user.id}
          daysSinceConnected={
            connectionItem.accepted_at
              ? Math.floor(
                  (Date.now() - new Date(connectionItem.accepted_at).getTime()) /
                    (1000 * 60 * 60 * 24),
                )
              : 0
          }
          lastInteraction={connectionItem.last_interaction_at || undefined}
          unreadCount={0} // TODO: Get from messages state
          onPress={() => handleViewConnection(connectionItem)}
          onMessage={() => handleMessageConnection(connectionItem)}
        />
      );
    }

    // Ended connections
    const connectionItem = item as ConnectionWithUsers;
    return (
      <ConnectionCard
        connection={connectionItem}
        currentUserId={user.id}
        daysSinceConnected={
          connectionItem.accepted_at
            ? Math.floor(
                (Date.now() - new Date(connectionItem.accepted_at).getTime()) /
                  (1000 * 60 * 60 * 24),
              )
            : 0
        }
        lastInteraction={connectionItem.ended_at || undefined}
        unreadCount={0}
        onPress={() => handleViewConnection(connectionItem)}
        onMessage={() => handleMessageConnection(connectionItem)}
        isLoading={true} // Disable actions for ended connections
      />
    );
  };

  // Render section separator
  const renderSectionSeparator = () => <Divider style={styles.sectionSeparator} />;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SectionList
        sections={sections as any}
        keyExtractor={(item: any) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        SectionSeparatorComponent={renderSectionSeparator}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={true}
      />

      {/* Notification Badge FAB for pending requests */}
      {hasPendingRequests && (
        <FAB
          icon="bell"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color={theme.colors.onPrimary}
          label={pendingCount > 9 ? '9+' : `${pendingCount}`}
          onPress={() => {
            // Scroll to pending section
            // TODO: Implement scroll to section
            Alert.alert(
              'Pending Requests',
              `You have ${pendingCount} pending connection ${
                pendingCount === 1 ? 'request' : 'requests'
              }`,
              [{ text: 'OK' }],
            );
          }}
          accessibilityLabel={`${pendingCount} pending connection ${
            pendingCount === 1 ? 'request' : 'requests'
          }`}
        />
      )}

      {/* Connection Profile Modal */}
      <ConnectionProfileModal
        visible={showProfileModal}
        connection={selectedConnection}
        currentUserId={user?.id || ''}
        onDismiss={() => {
          setShowProfileModal(false);
          setSelectedConnection(null);
        }}
        onMessage={() => {
          if (selectedConnection) {
            handleMessageConnection(selectedConnection);
          }
        }}
        onEndConnection={() => {
          setShowProfileModal(false);
          setShowEndModal(true);
        }}
      />

      {/* End Connection Modal */}
      <EndConnectionModal
        visible={showEndModal}
        connectionName={
          selectedConnection
            ? user?.id === selectedConnection.sponsor_id
              ? selectedConnection.sponsee.name
              : selectedConnection.sponsor.name
            : ''
        }
        onDismiss={() => {
          setShowEndModal(false);
          setSelectedConnection(null);
        }}
        onConfirm={handleConfirmEndConnection}
        isLoading={isEndingConnection}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 80, // Space for FAB
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  sectionSeparator: {
    marginVertical: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
