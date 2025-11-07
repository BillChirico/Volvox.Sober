/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * Logs errors and displays fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Card, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Base Error Boundary Component
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (__DEV__) {
      console.error('Error Boundary caught error:', error);
      console.error('Error Info:', errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    this.setState({
      errorInfo,
    });

    // In production, you might want to log to a service like Sentry
    // logErrorToService(error, errorInfo)
  }

  componentDidUpdate(prevProps: Props): void {
    // Reset error boundary if reset keys change
    if (
      this.props.resetKeys &&
      prevProps.resetKeys &&
      this.props.resetKeys.some((key, index) => key !== prevProps.resetKeys?.[index])
    ) {
      this.resetErrorBoundary();
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = async (): Promise<void> => {
    try {
      // Check for updates and reload if available
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      } else {
        // Just reload the app
        await Updates.reloadAsync();
      }
    } catch (error) {
      console.error('Failed to reload app:', error);
      this.resetErrorBoundary();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.resetErrorBoundary}
          onReload={this.handleReload}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Default Error Fallback UI
 */
interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
  onReload: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, errorInfo, onReset, onReload }) => {
  const theme = useTheme();
  const [showDetails, setShowDetails] = React.useState(__DEV__);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={80}
          color={theme.colors.error}
          style={styles.icon}
        />

        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
          Something went wrong
        </Text>

        <Text
          variant="bodyLarge"
          style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>
          We apologize for the inconvenience. The app encountered an unexpected error.
        </Text>

        {showDetails && error && (
          <Card style={styles.errorCard}>
            <Card.Content>
              <Text variant="labelLarge" style={{ color: theme.colors.error, marginBottom: 8 }}>
                Error Details:
              </Text>
              <Text
                variant="bodySmall"
                style={{ fontFamily: 'monospace', color: theme.colors.onSurface }}>
                {error.toString()}
              </Text>
              {errorInfo && (
                <>
                  <Text
                    variant="labelLarge"
                    style={{ color: theme.colors.error, marginTop: 12, marginBottom: 8 }}>
                    Component Stack:
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={{ fontFamily: 'monospace', color: theme.colors.onSurface }}>
                    {errorInfo.componentStack}
                  </Text>
                </>
              )}
            </Card.Content>
          </Card>
        )}

        <View style={styles.actions}>
          <Button mode="contained" onPress={onReset} style={styles.button} icon="refresh">
            Try Again
          </Button>

          <Button mode="outlined" onPress={onReload} style={styles.button} icon="reload">
            Reload App
          </Button>

          {!showDetails && __DEV__ && (
            <Button mode="text" onPress={() => setShowDetails(true)} style={styles.button}>
              Show Details
            </Button>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

/**
 * Screen-specific Error Boundaries
 */

export const AuthErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      console.error('Auth Error:', error, errorInfo);
      // Log to auth-specific error tracking
    }}>
    {children}
  </ErrorBoundary>
);

export const OnboardingErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      console.error('Onboarding Error:', error, errorInfo);
      // Log to onboarding-specific error tracking
    }}>
    {children}
  </ErrorBoundary>
);

export const TabsErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      console.error('Tabs Error:', error, errorInfo);
      // Log to main app error tracking
    }}>
    {children}
  </ErrorBoundary>
);

export const SobrietyErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      console.error('Sobriety Error:', error, errorInfo);
    }}>
    {children}
  </ErrorBoundary>
);

export const MatchesErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      console.error('Matches Error:', error, errorInfo);
    }}>
    {children}
  </ErrorBoundary>
);

export const ConnectionsErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      console.error('Connections Error:', error, errorInfo);
    }}>
    {children}
  </ErrorBoundary>
);

export const MessagesErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      console.error('Messages Error:', error, errorInfo);
    }}>
    {children}
  </ErrorBoundary>
);

export const ProfileErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      console.error('Profile Error:', error, errorInfo);
    }}>
    {children}
  </ErrorBoundary>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  message: {
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  errorCard: {
    width: '100%',
    marginBottom: 24,
    maxHeight: 300,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  button: {
    marginVertical: 4,
  },
});
