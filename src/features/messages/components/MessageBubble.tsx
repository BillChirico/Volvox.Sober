/**
 * MessageBubble Component
 * Displays individual message bubble with timestamp and status
 * Feature: 002-app-screens (T107)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../../theme/ThemeContext';
import type { MessageWithSender } from '../types';

export interface MessageBubbleProps {
  /** Message data with sender information */
  message: MessageWithSender;
  /** Current user ID to determine sent/received styling */
  currentUserId: string;
  /** Whether to show sender name (for group contexts or testing) */
  showSenderName?: boolean;
}

/**
 * Message bubble component for individual messages
 */
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  currentUserId,
  showSenderName = false,
}) => {
  const { theme } = useAppTheme();

  const isSent = message.sender_id === currentUserId;

  /**
   * Format message timestamp
   */
  const formatTimestamp = (): string => {
    const messageDate = new Date(message.created_at);
    const now = new Date();
    const diffMs = now.getTime() - messageDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Same day: show time
    if (diffDays === 0) {
      const hours = messageDate.getHours();
      const minutes = messageDate.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, '0');
      return `${displayHours}:${displayMinutes} ${ampm}`;
    }

    // Yesterday
    if (diffDays === 1) {
      return 'Yesterday';
    }

    // Within a week: show day name
    if (diffDays < 7) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[messageDate.getDay()];
    }

    // Older: show date
    const month = messageDate.getMonth() + 1;
    const day = messageDate.getDate();
    return `${month}/${day}`;
  };

  /**
   * Get status icon for sent messages
   */
  const getStatusIcon = (): {
    name: 'check' | 'check-all' | 'clock-outline' | 'alert-circle-outline';
    color: string;
  } | null => {
    if (!isSent) return null;

    switch (message.status) {
      case 'sending':
        return { name: 'clock-outline', color: theme.colors.onSurfaceVariant };
      case 'sent':
        return { name: 'check', color: theme.colors.onSurfaceVariant };
      case 'delivered':
        return { name: 'check-all', color: theme.colors.onSurfaceVariant };
      case 'read':
        return { name: 'check-all', color: theme.colors.primary };
      default:
        return { name: 'alert-circle-outline', color: theme.colors.error };
    }
  };

  const statusIcon = getStatusIcon();

  return (
    <View style={[styles.container, isSent ? styles.sentContainer : styles.receivedContainer]}>
      {/* Sender name (for received messages when showSenderName is true) */}
      {!isSent && showSenderName && (
        <Text variant="labelSmall" style={[styles.senderName, { color: theme.colors.primary }]}>
          {message.sender.name}
        </Text>
      )}

      {/* Message bubble */}
      <Surface
        style={[
          styles.bubble,
          isSent
            ? [styles.sentBubble, { backgroundColor: theme.colors.primaryContainer }]
            : [styles.receivedBubble, { backgroundColor: theme.colors.surfaceVariant }],
        ]}
        elevation={1}>
        {/* Message text */}
        <Text
          variant="bodyMedium"
          style={[
            styles.messageText,
            {
              color: isSent ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant,
            },
          ]}>
          {message.text}
        </Text>

        {/* Timestamp and status */}
        <View style={styles.footer}>
          <Text
            variant="labelSmall"
            style={[
              styles.timestamp,
              {
                color: isSent ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant,
              },
            ]}>
            {formatTimestamp()}
          </Text>

          {/* Status icon (only for sent messages) */}
          {statusIcon && (
            <MaterialCommunityIcons
              name={statusIcon.name}
              size={14}
              color={statusIcon.color}
              style={styles.statusIcon}
            />
          )}
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 12,
    maxWidth: '80%',
  },
  sentContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  receivedContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderName: {
    marginBottom: 4,
    marginLeft: 12,
    fontWeight: '600',
  },
  bubble: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 60,
  },
  sentBubble: {
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  timestamp: {
    fontSize: 11,
    opacity: 0.7,
  },
  statusIcon: {
    opacity: 0.7,
  },
});
