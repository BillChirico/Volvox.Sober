/**
 * MessageThread Component
 * Displays conversation preview in thread list
 * Feature: 002-app-screens (T105)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Avatar, Badge } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../../theme/ThemeContext';
import type { ConversationPreview } from '../types';

export interface MessageThreadProps {
  /** Conversation preview data */
  conversation: ConversationPreview;
  /** Current user ID to determine other person */
  currentUserId: string;
  /** Callback when thread is pressed */
  onPress: () => void;
}

/**
 * Message thread component for conversation list
 */
export const MessageThread: React.FC<MessageThreadProps> = ({
  conversation,
  currentUserId,
  onPress,
}) => {
  const { theme } = useAppTheme();

  // Determine the other person in the conversation
  const connection = conversation.connection;
  const isSponsor = connection.sponsor_id === currentUserId;
  const otherPerson = isSponsor ? connection.sponsee : connection.sponsor;

  /**
   * Format last message timestamp
   */
  const formatTimestamp = (): string => {
    if (!conversation.lastMessageAt) return '';

    const messageDate = new Date(conversation.lastMessageAt);
    const now = new Date();
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d`;

    // Format as MM/DD for older messages
    const month = messageDate.getMonth() + 1;
    const day = messageDate.getDate();
    return `${month}/${day}`;
  };

  /**
   * Get truncated last message preview
   */
  const getMessagePreview = (): string => {
    if (!conversation.lastMessage) {
      return 'No messages yet';
    }

    const maxLength = 50;
    const text = conversation.lastMessage.text;

    if (text.length <= maxLength) {
      return text;
    }

    return `${text.substring(0, maxLength)}...`;
  };

  /**
   * Determine if current user sent the last message
   */
  const isLastMessageFromCurrentUser = (): boolean => {
    return conversation.lastMessage?.sender_id === currentUserId;
  };

  const hasUnread = conversation.unreadCount > 0;
  const timestamp = formatTimestamp();
  const messagePreview = getMessagePreview();

  return (
    <Card
      style={[styles.card, hasUnread && { backgroundColor: theme.colors.surfaceVariant }]}
      onPress={onPress}
      accessibilityLabel={`Conversation with ${otherPerson.name}`}
      accessibilityHint={`${conversation.unreadCount} unread messages. Tap to open conversation.`}>
      <Card.Content>
        <View style={styles.content}>
          {/* Avatar */}
          {otherPerson.profile_photo_url ? (
            <Avatar.Image size={56} source={{ uri: otherPerson.profile_photo_url }} />
          ) : (
            <Avatar.Icon
              size={56}
              icon="account"
              style={{ backgroundColor: theme.colors.primaryContainer }}
            />
          )}

          {/* Thread info */}
          <View style={styles.info}>
            {/* Header row: name and timestamp */}
            <View style={styles.headerRow}>
              <Text
                variant="titleMedium"
                style={[
                  styles.name,
                  {
                    color: theme.colors.onSurface,
                    fontWeight: hasUnread ? '700' : '600',
                  },
                ]}
                numberOfLines={1}>
                {otherPerson.name}
              </Text>

              {timestamp && (
                <Text
                  variant="labelSmall"
                  style={[
                    styles.timestamp,
                    {
                      color: hasUnread ? theme.colors.primary : theme.colors.onSurfaceVariant,
                      fontWeight: hasUnread ? '600' : '400',
                    },
                  ]}>
                  {timestamp}
                </Text>
              )}
            </View>

            {/* Message preview row */}
            <View style={styles.previewRow}>
              {/* Sent indicator for user's own messages */}
              {isLastMessageFromCurrentUser() && conversation.lastMessage && (
                <MaterialCommunityIcons
                  name={
                    conversation.lastMessage.status === 'read'
                      ? 'check-all'
                      : conversation.lastMessage.status === 'delivered'
                        ? 'check-all'
                        : 'check'
                  }
                  size={14}
                  color={
                    conversation.lastMessage.status === 'read'
                      ? theme.colors.primary
                      : theme.colors.onSurfaceVariant
                  }
                  style={styles.sentIcon}
                />
              )}

              {/* Message preview text */}
              <Text
                variant="bodyMedium"
                style={[
                  styles.preview,
                  {
                    color: hasUnread ? theme.colors.onSurface : theme.colors.onSurfaceVariant,
                    fontWeight: hasUnread ? '600' : '400',
                  },
                ]}
                numberOfLines={2}>
                {messagePreview}
              </Text>

              {/* Unread badge */}
              {hasUnread && (
                <Badge size={20} style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                  {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                </Badge>
              )}
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 4,
    elevation: 1,
  },
  content: {
    flexDirection: 'row',
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sentIcon: {
    marginTop: 2,
  },
  preview: {
    flex: 1,
    fontSize: 14,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
});
