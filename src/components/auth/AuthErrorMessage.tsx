import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';

export interface AuthErrorMessageProps {
  message: string | string[] | null | undefined;
  dismissible?: boolean;
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * AuthErrorMessage component with accessibility support
 *
 * Features:
 * - Displays authentication error messages
 * - accessibilityLiveRegion for screen reader announcements
 * - Optional dismiss button
 * - Theme-aware error styling
 * - Supports single or multiple error messages
 *
 * @example
 * ```tsx
 * <AuthErrorMessage
 *   message="Invalid email or password"
 *   dismissible
 *   onDismiss={() => setError(null)}
 * />
 * ```
 */
const AuthErrorMessage: React.FC<AuthErrorMessageProps> = ({
  message,
  dismissible = false,
  onDismiss,
  style,
}) => {
  const theme = useTheme();

  // Don't render if no message
  if (!message || (Array.isArray(message) && message.length === 0)) {
    return null;
  }

  // Normalize message to array for consistent handling
  const messages = Array.isArray(message) ? message : [message];

  // Filter out empty messages
  const validMessages = messages.filter(
    (msg) => msg && typeof msg === 'string' && msg.trim().length > 0
  );

  if (validMessages.length === 0) {
    return null;
  }

  return (
    <View
      testID="auth-error-message"
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.errorContainer,
          borderColor: theme.colors.error,
        },
        style,
      ]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      accessible={true}
    >
      {/* Error icon */}
      <View style={styles.iconContainer} testID="error-icon">
        <Text style={{ color: theme.colors.error, fontSize: 20 }}>⚠️</Text>
      </View>

      {/* Error messages */}
      <View style={styles.messageContainer}>
        {validMessages.map((msg, index) => (
          <Text
            key={index}
            style={[
              styles.messageText,
              { color: theme.colors.onErrorContainer },
            ]}
            variant="bodyMedium"
          >
            {msg}
          </Text>
        ))}
      </View>

      {/* Dismiss button */}
      {dismissible && onDismiss && (
        <IconButton
          testID="error-dismiss-button"
          icon="close"
          size={20}
          onPress={onDismiss}
          accessibilityLabel="Dismiss error message"
          accessibilityRole="button"
          iconColor={theme.colors.onErrorContainer}
          style={styles.dismissButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 8,
    width: '100%',
  },
  iconContainer: {
    marginRight: 8,
    marginTop: 2,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  dismissButton: {
    margin: 0,
    marginLeft: 4,
  },
});

export default AuthErrorMessage;
