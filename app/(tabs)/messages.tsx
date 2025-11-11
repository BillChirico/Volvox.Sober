/**
 * Messages Screen
 * Conversation thread list and chat interface
 * Feature: 002-app-screens (T108-T112)
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert, Modal } from 'react-native';
import { FAB, Divider, Appbar } from 'react-native-paper';
import { MessageThread, MessageBubble, MessageInput, useMessages } from '@/features/messages';
import { LoadingSpinner } from '../../src/components/common/LoadingSpinner';
import { EmptyState } from '../../src/components/common/EmptyState';
import { useAuth } from '@/features/auth';
import { useAppSelector } from '../../src/hooks/useAppDispatch';
import { selectProfile } from '@/features/profile';
import { useAppTheme } from '../../src/theme/ThemeContext';
import { useRouter } from 'expo-router';
import type { ConversationPreview, MessageWithSender } from '@/features/messages';

export default function MessagesScreen() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const profile = useAppSelector(selectProfile);
  const router = useRouter();
  const {
    sortedConversations,
    currentMessages,
    isLoading,
    isSending,
    error,
    hasConversations,
    totalUnreadCount,
    fetchAllConversations,
    openConversation,
    send,
    markConversationAsRead,
    subscribeToMessages,
    closeConversation,
    dismissError,
  } = useMessages();

  const [selectedConversation, setSelectedConversation] = useState<ConversationPreview | null>(
    null,
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch conversations on mount
  useEffect(() => {
    if (user?.id) {
      fetchAllConversations(user.id);
    }
  }, [user?.id, fetchAllConversations]);

  // Subscribe to real-time messages when conversation is opened (T110)
  useEffect(() => {
    if (selectedConversation) {
      const handleNewMessage = (message: MessageWithSender) => {
        console.log('New message received:', message);
        // Message will be added to store via subscription thunk
      };

      subscribeToMessages(selectedConversation.connection.id, handleNewMessage);
    }

    // Cleanup: unsubscribe when conversation closes
    return () => {
      if (selectedConversation) {
        closeConversation();
      }
    };
  }, [selectedConversation, subscribeToMessages, closeConversation]);

  // Mark messages as read when conversation is opened (T112)
  useEffect(() => {
    if (selectedConversation && user?.id && selectedConversation.unreadCount > 0) {
      markConversationAsRead(selectedConversation.connection.id, user.id);
    }
  }, [selectedConversation, user?.id, markConversationAsRead]);

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsRefreshing(true);
      await fetchAllConversations(user.id);
    } catch (err) {
      console.error('Error refreshing conversations:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [user?.id, fetchAllConversations]);

  // Handle thread press
  const handleThreadPress = useCallback(
    async (conversation: ConversationPreview) => {
      try {
        await openConversation(conversation.connection.id);
        setSelectedConversation(conversation);
      } catch (err) {
        console.error('Error opening conversation:', err);
        Alert.alert('Error', 'Failed to open conversation. Please try again.');
      }
    },
    [openConversation],
  );

  // Handle close conversation modal
  const handleCloseConversation = useCallback(() => {
    setSelectedConversation(null);
    closeConversation();
  }, [closeConversation]);

  // Handle send message with optimistic updates (T111)
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!selectedConversation || !user?.id || !profile) return;

      try {
        await send(selectedConversation.connection.id, user.id, text, {
          id: profile.id,
          name: profile.name,
          profile_photo_url: profile.profile_photo_url,
        });
      } catch (err) {
        console.error('Error sending message:', err);
        throw err; // Let MessageInput handle error display
      }
    },
    [selectedConversation, user?.id, profile, send],
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

  // Loading state
  if (isLoading && !hasConversations) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LoadingSpinner text="Loading conversations..." />
      </View>
    );
  }

  // Empty state
  if (!hasConversations && !isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          icon="message-text-outline"
          title="No Conversations Yet"
          description="Start a conversation with your connections. Navigate to Connections and send a message."
          actionText="View Connections"
          onAction={() => router.push('/connections')}
        />
      </View>
    );
  }

  // Render conversation thread list (T108)
  const renderThreadItem = ({ item }: { item: ConversationPreview }) => (
    <MessageThread
      conversation={item}
      currentUserId={user?.id || ''}
      onPress={() => handleThreadPress(item)}
    />
  );

  const renderThreadSeparator = () => <Divider style={styles.separator} />;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Thread list */}
      <FlatList
        data={sortedConversations}
        keyExtractor={item => item.connection.id}
        renderItem={renderThreadItem}
        ItemSeparatorComponent={renderThreadSeparator}
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
      />

      {/* Unread count FAB (T113) */}
      {totalUnreadCount > 0 && (
        <FAB
          icon="bell"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color={theme.colors.onPrimary}
          label={totalUnreadCount > 99 ? '99+' : `${totalUnreadCount}`}
          accessibilityLabel={`${totalUnreadCount} unread messages`}
        />
      )}

      {/* Thread detail modal (T109) */}
      {selectedConversation && (
        <Modal
          visible={true}
          animationType="slide"
          onRequestClose={handleCloseConversation}
          presentationStyle="pageSheet">
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <Appbar.Header style={{ backgroundColor: theme.colors.surface }} elevated>
              <Appbar.BackAction onPress={handleCloseConversation} />
              <Appbar.Content
                title={
                  selectedConversation.connection.sponsor_id === user?.id
                    ? selectedConversation.connection.sponsee.name
                    : selectedConversation.connection.sponsor.name
                }
              />
            </Appbar.Header>

            {/* Messages list */}
            <FlatList
              data={currentMessages}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <MessageBubble message={item} currentUserId={user?.id || ''} />
              )}
              contentContainerStyle={styles.messagesList}
              inverted // Newest messages at bottom
              showsVerticalScrollIndicator={false}
            />

            {/* Message input */}
            <MessageInput
              onSend={handleSendMessage}
              isSending={isSending}
              placeholder="Type a message..."
            />
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  separator: {
    marginHorizontal: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  modalContainer: {
    flex: 1,
  },
  messagesList: {
    paddingVertical: 12,
    flexGrow: 1,
  },
});
