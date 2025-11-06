/**
 * MessageBubble Component
 * Displays a single message with sender/recipient styling
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser }) => {
  const bubbleStyle = isCurrentUser ? styles.bubbleSent : styles.bubbleReceived;
  const textStyle = isCurrentUser ? styles.textSent : styles.textReceived;

  return (
    <View style={[styles.container, isCurrentUser && styles.containerSent]}>
      <View style={[styles.bubble, bubbleStyle]}>
        <Text style={[styles.text, textStyle]}>{message.text}</Text>
        <View style={styles.footer}>
          <Text style={[styles.timestamp, isCurrentUser && styles.timestampSent]}>
            {formatTime(message.created_at)}
          </Text>
          {isCurrentUser && message.read_at && <Text style={styles.readReceipt}>✓✓</Text>}
          {isCurrentUser && !message.read_at && <Text style={styles.sentReceipt}>✓</Text>}
        </View>
      </View>
    </View>
  );
};

// ============================================================
// Helper Functions
// ============================================================

const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

// ============================================================
// Styles
// ============================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    marginHorizontal: 12,
  },
  containerSent: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  bubbleReceived: {
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 4,
  },
  bubbleSent: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 20,
  },
  textReceived: {
    color: '#000000',
  },
  textSent: {
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#8E8E93',
  },
  timestampSent: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  readReceipt: {
    fontSize: 12,
    color: '#34C759',
    marginLeft: 4,
  },
  sentReceipt: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 4,
  },
});
