/**
 * MessageInput Component
 * Text input with send button for composing messages
 */

import React, { useState } from 'react'
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'

interface MessageInputProps {
  onSend: (text: string) => Promise<void>
  placeholder?: string
  maxLength?: number
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  placeholder = 'Type a message...',
  maxLength = 2000,
}) => {
  const [text, setText] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSend = async () => {
    const trimmedText = text.trim()
    if (!trimmedText || isSending) return

    try {
      setIsSending(true)
      await onSend(trimmedText)
      setText('') // Clear input after successful send
    } catch (error) {
      console.error('Failed to send message:', error)
      // Don't clear text on error so user can retry
    } finally {
      setIsSending(false)
    }
  }

  const canSend = text.trim().length > 0 && !isSending

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor="#8E8E93"
            multiline
            maxLength={maxLength}
            editable={!isSending}
            returnKeyType="default"
            blurOnSubmit={false}
          />
        </View>

        <TouchableOpacity
          style={[styles.sendButton, canSend && styles.sendButtonActive]}
          onPress={handleSend}
          disabled={!canSend}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <SendIcon />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

// ============================================================
// Send Icon Component
// ============================================================

const SendIcon: React.FC = () => (
  <View style={styles.sendIcon}>
    <View style={styles.sendIconArrow} />
  </View>
)

// ============================================================
// Styles
// ============================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  inputContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
    maxHeight: 100,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    color: '#000000',
    maxHeight: 84, // ~4 lines
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8E8E93',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: '#007AFF',
  },
  sendIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIconArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
    transform: [{ rotate: '90deg' }],
  },
})
