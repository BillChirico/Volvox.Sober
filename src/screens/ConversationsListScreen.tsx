/**
 * Conversations List Screen (T120)
 *
 * Displays all active conversations with last message and unread count
 */

import React, { useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { List, Text, Badge, Searchbar, ActivityIndicator, useTheme } from 'react-native-paper';
import { useGetConversationsQuery } from '../services/messagesApi';
import { formatDistanceToNow } from 'date-fns';

interface ConversationsListScreenProps {
  navigation: any;
}

export const ConversationsListScreen: React.FC<ConversationsListScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: conversations, isLoading, refetch, isFetching } = useGetConversationsQuery();

  const filteredConversations = conversations?.filter(
    conv =>
      conv.other_user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.last_message.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderConversation = ({ item }: { item: any }) => {
    const timeAgo = formatDistanceToNow(new Date(item.last_message_at), { addSuffix: true });

    return (
      <List.Item
        title={item.other_user_name}
        description={item.last_message || 'No messages yet'}
        descriptionNumberOfLines={1}
        left={() => <List.Icon icon="account-circle" color={theme.colors.primary} />}
        right={() => (
          <View style={styles.rightContent}>
            <Text variant="bodySmall" style={styles.timeText}>
              {timeAgo}
            </Text>
            {item.unread_count > 0 && <Badge style={styles.badge}>{item.unread_count}</Badge>}
          </View>
        )}
        onPress={() =>
          navigation.navigate('MessageThread', {
            connectionId: item.connection_id,
            otherUserId: item.other_user_id,
            otherUserName: item.other_user_name,
          })
        }
        style={styles.conversationItem}
      />
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* T123: Message search */}
      <Searchbar
        placeholder="Search conversations"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <FlatList
        data={filteredConversations}
        renderItem={renderConversation}
        keyExtractor={item => item.connection_id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No conversations yet
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Connect with a sponsor or sponsee to start messaging
            </Text>
          </View>
        }
      />
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchBar: {
      margin: 12,
      elevation: 2,
    },
    listContent: {
      flexGrow: 1,
    },
    conversationItem: {
      backgroundColor: theme.colors.surface,
      marginBottom: 1,
    },
    rightContent: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      marginRight: 8,
    },
    timeText: {
      color: theme.colors.onSurfaceVariant,
      marginBottom: 4,
    },
    badge: {
      backgroundColor: theme.colors.primary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyText: {
      textAlign: 'center',
      marginBottom: 8,
      color: theme.colors.onSurface,
    },
    emptySubtext: {
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
    },
  });
