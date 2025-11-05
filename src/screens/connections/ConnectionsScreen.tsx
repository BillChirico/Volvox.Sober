import React from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Surface, Avatar, Card, ActivityIndicator, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useGetConnectionsQuery, Connection } from '../../store/api/connectionsApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { formatDistanceToNow } from 'date-fns';

const ConnectionsScreen: React.FC = () => {
  const navigation = useNavigation();
  const userId = useSelector((state: RootState) => state.user?.user?.id);
  const { data: connections, isLoading, refetch, isFetching } = useGetConnectionsQuery();

  const handleConnectionPress = (connection: Connection) => {
    navigation.navigate('ConnectionDetail' as never, { connection } as never);
  };

  const renderConnection = ({ item }: { item: Connection }) => {
    // Determine if user is sponsor or sponsee
    const isSponsor = item.sponsor_id === userId;
    const otherPersonName = isSponsor ? item.sponsee_name : item.sponsor_name;
    const otherPersonPhotoUrl = isSponsor ? item.sponsee_photo_url : item.sponsor_photo_url;
    const roleLabel = isSponsor ? 'Sponsee' : 'Sponsor';

    const connectedSince = formatDistanceToNow(new Date(item.connected_at), { addSuffix: true });
    const lastContactText = item.last_contact
      ? `Last contact: ${formatDistanceToNow(new Date(item.last_contact), { addSuffix: true })}`
      : 'No recent contact';

    return (
      <TouchableOpacity onPress={() => handleConnectionPress(item)}>
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <View style={styles.header}>
              {otherPersonPhotoUrl ? (
                <Avatar.Image size={60} source={{ uri: otherPersonPhotoUrl }} />
              ) : (
                <Avatar.Icon size={60} icon="account" />
              )}

              <View style={styles.connectionInfo}>
                <Text variant="titleMedium" style={styles.name}>
                  {otherPersonName}
                </Text>
                <Chip mode="flat" style={styles.roleChip} textStyle={styles.roleText}>
                  {roleLabel}
                </Chip>
              </View>
            </View>

            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Connected
                </Text>
                <Text variant="bodyMedium" style={styles.statValue}>
                  {connectedSince}
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Contact
                </Text>
                <Text variant="bodyMedium" style={styles.statValue}>
                  {lastContactText}
                </Text>
              </View>
            </View>

            {isSponsor && item.sponsee_step_progress !== undefined && (
              <View style={styles.progressSection}>
                <Text variant="bodySmall" style={styles.progressLabel}>
                  Step Progress:
                </Text>
                <Text variant="titleMedium" style={styles.progressValue}>
                  Step {item.sponsee_step_progress}/12
                </Text>
              </View>
            )}

            {!isSponsor && item.sponsor_years_sober !== undefined && (
              <View style={styles.progressSection}>
                <Text variant="bodySmall" style={styles.progressLabel}>
                  Experience:
                </Text>
                <Text variant="titleMedium" style={styles.progressValue}>
                  {item.sponsor_years_sober} years sober
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No Active Connections
      </Text>
      <Text variant="bodyMedium" style={styles.emptyMessage}>
        You don't have any active connections yet. Browse sponsors to find your match or check your
        pending requests.
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" />
        <Text variant="bodyMedium" style={styles.loadingText}>
          Loading connections...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={connections || []}
        keyExtractor={item => item.id}
        renderItem={renderConnection}
        ListEmptyComponent={renderEmpty}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        contentContainerStyle={(connections || []).length === 0 ? styles.emptyList : styles.list}
      />
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
      marginBottom: 16,
    },
    connectionInfo: {
      marginLeft: 12,
      flex: 1,
    },
    name: {
      fontWeight: 'bold',
      marginBottom: 6,
    },
    roleChip: {
      alignSelf: 'flex-start',
      backgroundColor: '#e3f2fd',
    },
    roleText: {
      fontSize: 12,
      color: '#1976d2',
      fontWeight: '600',
    },
    stats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    statItem: {
      flex: 1,
    },
    statLabel: {
      color: theme.colors.onSurfaceVariant,
      marginBottom: 4,
    },
    statValue: {
      fontWeight: '600',
    },
    progressSection: {
      backgroundColor: '#f5f5f5',
      padding: 12,
      borderRadius: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    progressLabel: {
      color: theme.colors.onSurfaceVariant,
    },
    progressValue: {
      fontWeight: 'bold',
      color: '#4CAF50',
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
  });

export default ConnectionsScreen;
