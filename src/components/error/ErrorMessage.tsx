/**
 * Error Message Components
 * User-friendly error displays with retry actions
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Button, Text, Card, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface ErrorMessageProps {
  title?: string;
  message: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onRetry?: () => void | Promise<void>;
  onDismiss?: () => void;
  retryLabel?: string;
  dismissLabel?: string;
  style?: ViewStyle;
  variant?: 'inline' | 'card' | 'full';
}

/**
 * Generic Error Message Component
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Something went wrong',
  message,
  icon = 'alert-circle-outline',
  onRetry,
  onDismiss,
  retryLabel = 'Try Again',
  dismissLabel = 'Dismiss',
  style,
  variant = 'card',
}) => {
  const theme = useTheme();
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;

    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  if (variant === 'inline') {
    return (
      <View style={[styles.inlineContainer, style]}>
        <MaterialCommunityIcons name={icon} size={20} color={theme.colors.error} />
        <Text variant="bodyMedium" style={[styles.inlineText, { color: theme.colors.error }]}>
          {message}
        </Text>
        {onRetry && (
          <Button
            mode="text"
            onPress={handleRetry}
            loading={isRetrying}
            compact
            textColor={theme.colors.error}>
            {retryLabel}
          </Button>
        )}
      </View>
    );
  }

  if (variant === 'full') {
    return (
      <View style={[styles.fullContainer, { backgroundColor: theme.colors.background }, style]}>
        <MaterialCommunityIcons name={icon} size={64} color={theme.colors.error} />
        <Text
          variant="headlineSmall"
          style={[styles.fullTitle, { color: theme.colors.onBackground }]}>
          {title}
        </Text>
        <Text
          variant="bodyLarge"
          style={[styles.fullMessage, { color: theme.colors.onSurfaceVariant }]}>
          {message}
        </Text>
        <View style={styles.fullActions}>
          {onRetry && (
            <Button
              mode="contained"
              onPress={handleRetry}
              loading={isRetrying}
              icon="refresh"
              style={styles.fullButton}>
              {retryLabel}
            </Button>
          )}
          {onDismiss && (
            <Button mode="outlined" onPress={onDismiss} style={styles.fullButton}>
              {dismissLabel}
            </Button>
          )}
        </View>
      </View>
    );
  }

  // Card variant (default)
  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.errorContainer }, style]}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name={icon} size={24} color={theme.colors.error} />
          <Text variant="titleMedium" style={[styles.cardTitle, { color: theme.colors.error }]}>
            {title}
          </Text>
        </View>
        <Text variant="bodyMedium" style={{ color: theme.colors.onErrorContainer }}>
          {message}
        </Text>
        {(onRetry || onDismiss) && (
          <View style={styles.cardActions}>
            {onRetry && (
              <Button
                mode="contained"
                onPress={handleRetry}
                loading={isRetrying}
                compact
                style={styles.cardButton}>
                {retryLabel}
              </Button>
            )}
            {onDismiss && (
              <Button mode="text" onPress={onDismiss} compact>
                {dismissLabel}
              </Button>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

/**
 * Network Error Message
 */
export const NetworkError: React.FC<
  Omit<ErrorMessageProps, 'title' | 'message' | 'icon'>
> = props => (
  <ErrorMessage
    title="No Internet Connection"
    message="Please check your connection and try again. Some features may not be available offline."
    icon="wifi-off"
    {...props}
  />
);

/**
 * Server Error Message
 */
export const ServerError: React.FC<
  Omit<ErrorMessageProps, 'title' | 'message' | 'icon'>
> = props => (
  <ErrorMessage
    title="Server Error"
    message="We're having trouble connecting to our servers. Please try again in a moment."
    icon="server-off"
    {...props}
  />
);

/**
 * Not Found Error Message
 */
export const NotFoundError: React.FC<
  Omit<ErrorMessageProps, 'title' | 'message' | 'icon'>
> = props => (
  <ErrorMessage
    title="Not Found"
    message="The content you're looking for could not be found. It may have been removed or is no longer available."
    icon="file-question-outline"
    {...props}
  />
);

/**
 * Permission Error Message
 */
export const PermissionError: React.FC<
  Omit<ErrorMessageProps, 'title' | 'message' | 'icon'>
> = props => (
  <ErrorMessage
    title="Permission Denied"
    message="You don't have permission to access this content. Please contact support if you believe this is an error."
    icon="lock-outline"
    {...props}
  />
);

/**
 * Timeout Error Message
 */
export const TimeoutError: React.FC<
  Omit<ErrorMessageProps, 'title' | 'message' | 'icon'>
> = props => (
  <ErrorMessage
    title="Request Timeout"
    message="The request took too long to complete. Please check your connection and try again."
    icon="clock-alert-outline"
    {...props}
  />
);

/**
 * Validation Error Message
 */
export const ValidationError: React.FC<{
  errors: string[];
  onDismiss?: () => void;
  style?: ViewStyle;
}> = ({ errors, onDismiss, style }) => {
  const theme = useTheme();

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.errorContainer }, style]}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="alert-outline" size={24} color={theme.colors.error} />
          <Text variant="titleMedium" style={[styles.cardTitle, { color: theme.colors.error }]}>
            Please fix the following errors:
          </Text>
        </View>
        <View style={styles.errorList}>
          {errors.map((error, index) => (
            <View key={index} style={styles.errorItem}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onErrorContainer }}>
                • {error}
              </Text>
            </View>
          ))}
        </View>
        {onDismiss && (
          <Button mode="text" onPress={onDismiss} compact>
            Dismiss
          </Button>
        )}
      </Card.Content>
    </Card>
  );
};

/**
 * Error Toast (for brief notifications)
 */
export const useErrorToast = () => {
  const [visible, setVisible] = React.useState(false);
  const [error, setError] = React.useState<{
    message: string;
    onRetry?: () => void;
  } | null>(null);

  const showError = React.useCallback((message: string, onRetry?: () => void) => {
    setError({ message, onRetry });
    setVisible(true);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setVisible(false);
    }, 5000);
  }, []);

  const hideError = React.useCallback(() => {
    setVisible(false);
    setTimeout(() => setError(null), 300); // Clear after animation
  }, []);

  const ErrorToast = React.useCallback(() => {
    if (!visible || !error) return null;

    return (
      <View style={styles.toastContainer}>
        <ErrorMessage
          message={error.message}
          variant="inline"
          onRetry={error.onRetry}
          onDismiss={hideError}
          dismissLabel="✕"
        />
      </View>
    );
  }, [visible, error, hideError]);

  return {
    showError,
    hideError,
    ErrorToast,
  };
};

const styles = StyleSheet.create({
  // Inline variant
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  inlineText: {
    flex: 1,
  },

  // Card variant
  card: {
    margin: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  cardButton: {
    flex: 1,
  },

  // Full variant
  fullContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  fullTitle: {
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  fullMessage: {
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  fullActions: {
    width: '100%',
    gap: 12,
  },
  fullButton: {
    marginVertical: 4,
  },

  // Validation errors
  errorList: {
    marginTop: 8,
  },
  errorItem: {
    marginVertical: 4,
  },

  // Toast
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
});
