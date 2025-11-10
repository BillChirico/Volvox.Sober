/**
 * MessageInput Component
 * Text input for composing messages with character count
 * Feature: 002-app-screens (T106)
 */

import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, IconButton, Text, HelperText } from 'react-native-paper';
import { useAppTheme } from '../../core/theme/ThemeContext';
import { MESSAGE_CONSTRAINTS } from '../../types/message';

export interface MessageInputProps {
  /** Callback when send button is pressed */
  onSend: (text: string) => void | Promise<void>;
  /** Whether message is currently sending */
  isSending?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Whether to auto-focus input on mount */
  autoFocus?: boolean;
  /** Initial text value */
  initialValue?: string;
}

/**
 * Message input component with character count and validation
 */
export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  isSending = false,
  placeholder = 'Type a message...',
  autoFocus = false,
  initialValue = '',
}) => {
  const { theme } = useAppTheme();
  const [text, setText] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validate message text
   */
  const validateMessage = (message: string): { isValid: boolean; error?: string } => {
    if (message.trim().length < MESSAGE_CONSTRAINTS.MIN_LENGTH) {
      return { isValid: false, error: 'Message cannot be empty' };
    }
    if (message.length > MESSAGE_CONSTRAINTS.MAX_LENGTH) {
      return {
        isValid: false,
        error: `Message exceeds ${MESSAGE_CONSTRAINTS.MAX_LENGTH} characters`,
      };
    }
    return { isValid: true };
  };

  /**
   * Handle send button press
   */
  const handleSend = async () => {
    const validation = validateMessage(text);

    if (!validation.isValid) {
      setError(validation.error || 'Invalid message');
      return;
    }

    try {
      setError(null);
      await onSend(text.trim());
      setText(''); // Clear input after successful send
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Error sending message:', err);
    }
  };

  /**
   * Handle text change
   */
  const handleChangeText = (newText: string) => {
    setText(newText);
    // Clear error when user starts typing again
    if (error) {
      setError(null);
    }
  };

  /**
   * Check if send button should be enabled
   */
  const canSend =
    !isSending &&
    text.trim().length >= MESSAGE_CONSTRAINTS.MIN_LENGTH &&
    text.length <= MESSAGE_CONSTRAINTS.MAX_LENGTH;

  /**
   * Get character count color
   */
  const getCharCountColor = (): string => {
    const remaining = MESSAGE_CONSTRAINTS.MAX_LENGTH - text.length;
    if (remaining < 0) return theme.colors.error;
    if (remaining < 100) return theme.colors.tertiary;
    return theme.colors.onSurfaceVariant;
  };

  /**
   * Format character count text
   */
  const formatCharCount = (): string => {
    const remaining = MESSAGE_CONSTRAINTS.MAX_LENGTH - text.length;
    if (remaining < 0) {
      return `${Math.abs(remaining)} over limit`;
    }
    if (text.length > 0) {
      return `${text.length} / ${MESSAGE_CONSTRAINTS.MAX_LENGTH}`;
    }
    return '';
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background, borderTopColor: theme.colors.outline },
        ]}>
        {/* Character count (shown above input when typing) */}
        {text.length > 0 && (
          <View style={styles.charCountContainer}>
            <Text variant="labelSmall" style={[styles.charCount, { color: getCharCountColor() }]}>
              {formatCharCount()}
            </Text>
          </View>
        )}

        {/* Input row */}
        <View style={styles.inputRow}>
          {/* Text input */}
          <TextInput
            mode="outlined"
            value={text}
            onChangeText={handleChangeText}
            placeholder={placeholder}
            multiline
            maxLength={MESSAGE_CONSTRAINTS.MAX_LENGTH + 100} // Allow slight overflow for error display
            autoFocus={autoFocus}
            style={styles.input}
            contentStyle={styles.inputContent}
            outlineStyle={styles.inputOutline}
            disabled={isSending}
            error={!!error}
            accessibilityLabel="Message input"
            accessibilityHint="Type your message here"
          />

          {/* Send button */}
          <IconButton
            icon="send"
            size={24}
            onPress={handleSend}
            disabled={!canSend}
            loading={isSending}
            mode="contained"
            containerColor={canSend ? theme.colors.primary : theme.colors.surfaceVariant}
            iconColor={canSend ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
            style={styles.sendButton}
            accessibilityLabel="Send message"
            accessibilityHint={
              canSend ? 'Tap to send message' : 'Disabled - enter a valid message first'
            }
          />
        </View>

        {/* Error message */}
        {error && (
          <HelperText type="error" visible={true} style={styles.errorText}>
            {error}
          </HelperText>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  charCountContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  charCount: {
    fontSize: 11,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 48,
  },
  inputContent: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  inputOutline: {
    borderRadius: 24,
  },
  sendButton: {
    marginBottom: 4,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 8,
  },
});
