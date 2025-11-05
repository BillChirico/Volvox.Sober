/**
 * ConversationScreen
 * Full chat interface with FlatList virtualization and pagination
 */

import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import {
  getMessages,
  sendMessage,
  markAllMessagesAsRead,
  getPartnerUserId,
} from '../services/messageService'
import { getCurrentUserId } from '../services/supabase'
import { subscribeToConversation } from '../services/realtimeService'
import type { RealtimeSubscription } from '../services/realtimeService'
import { MessageBubble } from '../components/MessageBubble'
import { MessageInput } from '../components/MessageInput'
import { ConnectionStatusIndicator } from '../components/ConnectionStatusIndicator'
import type { Message } from '../types'

interface ConversationScreenProps {
  connectionId: string
  partnerName: string
}

const MESSAGES_PER_PAGE = 50

export const ConversationScreen: React.FC<ConversationScreenProps> = ({
  connectionId,
  partnerName,
}) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string>()
  const [currentUserId, setCurrentUserId] = useState<string>()
  const [partnerUserId, setPartnerUserId] = useState<string>()
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)

  const flatListRef = useRef<FlatList>(null)
  const pageRef = useRef(0)
  const subscriptionRef = useRef<{
    messageSubscription: RealtimeSubscription
    readReceiptSubscription: RealtimeSubscription
    unsubscribeAll: () => Promise<void>
  } | null>(null)

  // Initialize current user ID and partner ID
  useEffect(() => {
    const init = async () => {
      try {
        const userId = await getCurrentUserId()
        const partnerId = await getPartnerUserId(connectionId)
        setCurrentUserId(userId)
        setPartnerUserId(partnerId)
      } catch (err) {
        console.error('Failed to initialize conversation:', err)
        setError('Failed to load conversation')
      }
    }
    init()
  }, [connectionId])

  // Load initial messages
  const loadMessages = useCallback(async () => {
    try {
      setError(undefined)
      const result = await getMessages(connectionId, MESSAGES_PER_PAGE, 0)

      // Reverse messages so newest are at bottom
      setMessages(result.data.reverse())
      setHasMore(result.hasMore)
      pageRef.current = 1

      // Mark all as read
      await markAllMessagesAsRead(connectionId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages')
      console.error('Error loading messages:', err)
    } finally {
      setLoading(false)
    }
  }, [connectionId])

  useEffect(() => {
    if (currentUserId && partnerUserId) {
      loadMessages()
    }
  }, [currentUserId, partnerUserId, loadMessages])

  // Set up realtime subscriptions
  useEffect(() => {
    if (!currentUserId || !partnerUserId) return

    const setupRealtime = async () => {
      try {
        const subscription = await subscribeToConversation(connectionId, {
          onMessage: (messageRow) => {
            // New message received - add to bottom of list
            const newMessage: Message = {
              ...messageRow,
              sender: undefined, // Will be populated by UI if needed
              recipient: undefined,
            }
            setMessages((prev) => [...prev, newMessage])

            // Auto-scroll to bottom when new message arrives
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true })
            }, 100)

            // Mark as read immediately if screen is focused
            markAllMessagesAsRead(connectionId).catch(console.error)
          },
          onReadReceipt: (messageId, readAt) => {
            // Update read receipt for sent message
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === messageId ? { ...msg, read_at: readAt } : msg
              )
            )
          },
          onConnected: () => {
            setIsRealtimeConnected(true)
          },
          onDisconnected: () => {
            setIsRealtimeConnected(false)
          },
          onError: (error) => {
            console.error('Realtime subscription error:', error)
          },
        })

        subscriptionRef.current = subscription
      } catch (err) {
        console.error('Failed to setup realtime subscriptions:', err)
      }
    }

    setupRealtime()

    // Cleanup subscriptions on unmount
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribeAll().catch(console.error)
      }
    }
  }, [connectionId, currentUserId, partnerUserId])

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || loadingMore) return

    try {
      setLoadingMore(true)
      const offset = pageRef.current * MESSAGES_PER_PAGE
      const result = await getMessages(connectionId, MESSAGES_PER_PAGE, offset)

      // Prepend older messages (they're already reversed from API)
      setMessages((prev) => [...result.data.reverse(), ...prev])
      setHasMore(result.hasMore)
      pageRef.current += 1
    } catch (err) {
      console.error('Error loading more messages:', err)
    } finally {
      setLoadingMore(false)
    }
  }, [connectionId, hasMore, loadingMore])

  // Send a new message
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!partnerUserId) {
        throw new Error('Partner user ID not loaded')
      }

      try {
        const newMessage = await sendMessage(connectionId, partnerUserId, text)

        // Optimistic update - add message to list
        setMessages((prev) => [...prev, newMessage])

        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true })
        }, 100)
      } catch (err) {
        console.error('Failed to send message:', err)
        throw err // Re-throw so MessageInput can handle it
      }
    },
    [connectionId, partnerUserId]
  )

  // Render a single message
  const renderMessage = useCallback(
    ({ item }: { item: Message }) => (
      <MessageBubble
        message={item}
        isCurrentUser={item.sender_id === currentUserId}
      />
    ),
    [currentUserId]
  )

  // Render loading indicator for pagination
  const renderFooter = () => {
    if (!loadingMore) return null
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    )
  }

  // Handle when user scrolls to top (load more messages)
  const handleEndReached = () => {
    if (hasMore && !loadingMore) {
      loadMoreMessages()
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading conversation...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ConnectionStatusIndicator isConnected={isRealtimeConnected} />

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        inverted={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 100,
        }}
      />

      <MessageInput onSend={handleSendMessage} />
    </KeyboardAvoidingView>
  )
}

// ============================================================
// Styles
// ============================================================

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.surface,
  },
  messageList: {
    paddingVertical: 12,
  },
  loadingMore: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
})
