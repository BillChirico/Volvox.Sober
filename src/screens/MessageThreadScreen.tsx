/**
 * Message Thread Screen (T121)
 *
 * Real-time messaging interface with typing indicators
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import {
  TextInput,
  IconButton,
  Text,
  ActivityIndicator,
  useTheme,
  Snackbar,
} from 'react-native-paper';
import {
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkConnectionAsReadMutation,
  createMessagesSubscription,
  createTypingChannel,
  sendTypingEvent,
  Message,
} from '../services/messagesApi';
import { offlineMessageQueue } from '../services/offlineMessageQueue';
import { RealtimeChannel } from '@supabase/supabase-js';
import { format } from 'date-fns';
import NetInfo from '@react-native-community/netinfo';

interface MessageThreadScreenProps {
  route: {
    params: {
      connectionId: string;
      otherUserId: string;
      otherUserName: string;
    };
  };
  navigation: any;
}

export const MessageThreadScreen: React.FC<MessageThreadScreenProps> = ({ route }) => {
  const { connectionId, otherUserId, otherUserName } = route.params;
  const theme = useTheme();
  const styles = createStyles(theme);

  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const flatListRef = useRef<FlatList>(null);
  const messageChannelRef = useRef<RealtimeChannel | null>(null);
  const typingChannelRef = useRef<RealtimeChannel | null>(null);
  const autoSyncUnsubscribe = useRef<(() => void) | null>(null);

  const { data: initialMessages, isLoading } = useGetMessagesQuery(connectionId);
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [markAsRead] = useMarkConnectionAsReadMutation();

  const [currentUserId, setCurrentUserId] = useState<string>('');

  // Get current user ID
  useEffect(() => {
    import('../services/supabase').then(({ supabase }) => {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) setCurrentUserId(data.user.id);
      });
    });
  }, []);

  // T129: Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? true);
    });

    return () => unsubscribe();
  }, []);

  // T129: Setup auto-sync on mount
  useEffect(() => {
    if (!currentUserId) return;

    autoSyncUnsubscribe.current = offlineMessageQueue.setupAutoSync(
      async (connId, recipientId, messageText) => {
        await sendMessage({
          connection_id: connId,
          recipient_id: recipientId,
          message_text: messageText,
        }).unwrap();
      },
    );

    // Callback for sync completion
    offlineMessageQueue.onSync(connId => {
      if (connId === connectionId) {
        setSnackbarMessage('Queued messages sent');
        setSnackbarVisible(true);
      }
    });

    return () => {
      if (autoSyncUnsubscribe.current) {
        autoSyncUnsubscribe.current();
      }
    };
  }, [currentUserId, connectionId, sendMessage]);

  // Initialize messages from query
  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // T115: Setup Realtime subscription
  useEffect(() => {
    if (!currentUserId) return;

    messageChannelRef.current = createMessagesSubscription(
      connectionId,
      currentUserId,
      newMessage => {
        setMessages(prev => [...prev, newMessage]);
        // Auto-scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      },
    );

    // T119: Setup typing indicators
    typingChannelRef.current = createTypingChannel(connectionId, event => {
      if (event.user_id !== currentUserId && event.is_typing) {
        setIsTyping(true);

        // Clear after 3 seconds
        if (typingTimeout) clearTimeout(typingTimeout);
        const timeout = setTimeout(() => setIsTyping(false), 3000);
        setTypingTimeout(timeout);
      } else if (event.user_id !== currentUserId) {
        setIsTyping(false);
      }
    });

    return () => {
      if (messageChannelRef.current) {
        messageChannelRef.current.unsubscribe();
      }
      if (typingChannelRef.current) {
        typingChannelRef.current.unsubscribe();
      }
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [connectionId, currentUserId]);

  // T118: Mark messages as read when viewing
  useEffect(() => {
    markAsRead(connectionId);
  }, [connectionId, markAsRead]);

  // T119: Send typing events
  const handleTyping = (text: string) => {
    setMessageText(text);

    if (typingChannelRef.current && currentUserId) {
      sendTypingEvent(typingChannelRef.current, currentUserId, connectionId, text.length > 0);
    }
  };

  // T116 + T129: Send message (with offline support)
  const handleSendMessage = async () => {
    if (messageText.trim().length === 0) return;

    const textToSend = messageText.trim();
    setMessageText('');

    // T129: Check if offline, queue message
    if (!isOnline) {
      try {
        const queuedId = await offlineMessageQueue.enqueue(connectionId, otherUserId, textToSend);

        // Show queued message in UI
        const queuedMessage: Message = {
          id: queuedId,
          connection_id: connectionId,
          sender_id: currentUserId,
          recipient_id: otherUserId,
          message_text: textToSend,
          message_type: 'text',
          sent_at: new Date().toISOString(),
          delivered_at: null,
          read_at: null,
          archived: false,
        };
        setMessages(prev => [...prev, queuedMessage]);

        setSnackbarMessage('Message queued (offline)');
        setSnackbarVisible(true);

        // Auto-scroll
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } catch (error) {
        console.error('Failed to queue message:', error);
        setMessageText(textToSend);
        setSnackbarMessage('Queue full. Connect to sync.');
        setSnackbarVisible(true);
      }
      return;
    }

    // Online: Send immediately with optimistic UI
    try {
      // Optimistic UI update
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        connection_id: connectionId,
        sender_id: currentUserId,
        recipient_id: otherUserId,
        message_text: textToSend,
        message_type: 'text',
        sent_at: new Date().toISOString(),
        delivered_at: null,
        read_at: null,
        archived: false,
      };
      setMessages(prev => [...prev, tempMessage]);

      await sendMessage({
        connection_id: connectionId,
        recipient_id: otherUserId,
        message_text: textToSend,
      }).unwrap();

      // Remove temp message (real one will come via Realtime)
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));

      // Stop typing indicator
      if (typingChannelRef.current && currentUserId) {
        sendTypingEvent(typingChannelRef.current, currentUserId, connectionId, false);
      }

      // Auto-scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Rollback optimistic update
      setMessages(prev => prev.slice(0, -1));
      setMessageText(textToSend);
      setSnackbarMessage('Failed to send message');
      setSnackbarVisible(true);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.sender_id === currentUserId;
    const time = format(new Date(item.sent_at), 'HH:mm');
    const isQueued = item.id.startsWith('queued-');

    return (
      <View
        style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
          isQueued && styles.queuedMessage,
        ]}>
        <Text style={styles.messageText}>{item.message_text}</Text>
        <View style={styles.messageFooter}>
          <Text style={styles.messageTime}>{time}</Text>
          {isOwnMessage && (
            <Text style={styles.messageStatus}>
              {isQueued ? '⏳ Queued' : item.read_at ? '✓✓ Read' : item.delivered_at ? '✓✓' : '✓'}
            </Text>
          )}
        </View>
      </View>
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* T119: Typing indicator */}
      {isTyping && (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>{otherUserName} is typing...</Text>
        </View>
      )}

      {/* Message input */}
      <View style={styles.inputContainer}>
        <TextInput
          value={messageText}
          onChangeText={handleTyping}
          placeholder="Type a message..."
          mode="outlined"
          multiline
          maxLength={1000}
          style={styles.textInput}
          right={
            <TextInput.Icon
              icon="send"
              onPress={handleSendMessage}
              disabled={isSending || messageText.trim().length === 0}
            />
          }
        />
      </View>

      {/* T129: Offline/sync status snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}>
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
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
    messagesList: {
      padding: 12,
    },
    messageBubble: {
      maxWidth: '75%',
      padding: 12,
      borderRadius: 16,
      marginBottom: 8,
    },
    ownMessage: {
      alignSelf: 'flex-end',
      backgroundColor: '#2196F3',
      borderBottomRightRadius: 4,
    },
    otherMessage: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.outlineVariant,
      borderBottomLeftRadius: 4,
    },
    messageText: {
      fontSize: 16,
      color: '#000',
    },
    messageFooter: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginTop: 4,
    },
    messageTime: {
      fontSize: 11,
      color: theme.colors.onSurfaceVariant,
      marginRight: 4,
    },
    messageStatus: {
      fontSize: 11,
      color: theme.colors.onSurfaceVariant,
    },
    typingContainer: {
      padding: 8,
      paddingLeft: 16,
      backgroundColor: '#FFF',
      borderTopWidth: 1,
      borderTopColor: theme.colors.outlineVariant,
    },
    typingText: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      fontStyle: 'italic',
    },
    inputContainer: {
      padding: 12,
      backgroundColor: '#FFF',
      borderTopWidth: 1,
      borderTopColor: theme.colors.outlineVariant,
    },
    textInput: {
      backgroundColor: '#FFF',
      maxHeight: 100,
    },
    queuedMessage: {
      opacity: 0.7,
    },
    snackbar: {
      marginBottom: 80,
    },
  });
