/**
 * ErrorBoundary Component
 * React error boundary with fallback UI
 * Feature: 002-app-screens
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';

export interface ErrorBoundaryProps {
  /**
   * Child components to render
   */
  children: ReactNode;

  /**
   * Optional fallback UI to render on error
   */
  fallback?: (error: Error, resetError: () => void) => ReactNode;

  /**
   * Optional error handler callback
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // Default fallback UI
      return (
        <View
          style={styles.container}
          testID="error-boundary-fallback"
          accessible={true}
          accessibilityRole="alert"
          accessibilityLabel="Error occurred">
          <View style={styles.content}>
            <Text variant="headlineMedium" style={styles.title}>
              Something went wrong
            </Text>

            <Text variant="bodyMedium" style={styles.message}>
              {this.state.error.message || 'An unexpected error occurred'}
            </Text>

            {__DEV__ && (
              <View style={styles.debugInfo}>
                <Text variant="bodySmall" style={styles.debugText}>
                  {this.state.error.stack}
                </Text>
              </View>
            )}

            <Button
              mode="contained"
              onPress={this.resetError}
              style={styles.button}
              testID="error-boundary-reset-button"
              accessible={true}
              accessibilityLabel="Try again"
              accessibilityHint="Resets the error and reloads the component">
              Try Again
            </Button>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB', // gray-50
    padding: 24,
  },
  content: {
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    color: '#111827', // gray-900
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    color: '#6B7280', // gray-500
    marginBottom: 24,
    textAlign: 'center',
  },
  debugInfo: {
    backgroundColor: '#FEF2F2', // red-50
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    maxWidth: '100%',
  },
  debugText: {
    color: '#DC2626', // red-600
    fontFamily: 'monospace',
    fontSize: 11,
  },
  button: {
    minWidth: 200,
  },
});
