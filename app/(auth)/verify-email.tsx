import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import authService from '../../src/services/authService';

/**
 * Email Verification Screen
 *
 * Handles email verification via deep link magic links.
 * Parses verification token from URL and verifies with Supabase Auth.
 *
 * States:
 * - Loading: Verifying token with Supabase
 * - Success: Email verified successfully
 * - Error: Invalid, expired, or already verified token
 *
 * Features:
 * - Deep link token handling
 * - Token verification with Supabase Auth (FR-004)
 * - Success/failure messaging (SC-009)
 * - Auto-redirect to login after verification
 * - Accessibility support (WCAG 2.1 AA)
 */
export default function VerifyEmailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    verifyEmail();
  }, []);

  const verifyEmail = async () => {
    try {
      // Extract token from URL parameters
      const token = params.token as string;
      const type = params.type as string;

      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token found.');
        return;
      }

      if (type !== 'signup' && type !== 'email_change') {
        setStatus('error');
        setMessage('Invalid verification type.');
        return;
      }

      // Supabase automatically handles token verification through the deep link
      // We just need to check the session status
      const { session, error } = await authService.getSession();

      if (error) {
        // Check for specific error types
        if (error.message.includes('expired')) {
          setStatus('error');
          setMessage(
            'This verification link has expired. Please sign up again to receive a new verification email.'
          );
        } else if (error.message.includes('already')) {
          setStatus('error');
          setMessage(
            'This email has already been verified. You can now log in to your account.'
          );
        } else {
          setStatus('error');
          setMessage(
            'Unable to verify your email. The link may be invalid or expired. Please try signing up again.'
          );
        }
        return;
      }

      // Check if session exists and email is verified
      if (session && session.user?.email_confirmed_at) {
        setStatus('success');
        setMessage('Your email has been verified successfully! Redirecting to login...');

        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage('Unable to verify your email. Please try again or contact support.');
      }
    } catch (err) {
      console.error('Email verification error:', err);
      setStatus('error');
      setMessage('An unexpected error occurred. Please try again.');
    }
  };

  const handleGoToLogin = () => {
    router.replace('/(auth)/login');
  };

  const handleGoToSignup = () => {
    router.replace('/(auth)/signup');
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      testID="verify-email-screen"
      accessibilityLabel="Email verification screen"
    >
      <View style={styles.content}>
        {status === 'loading' && (
          <>
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
              style={styles.loader}
              accessibilityLabel="Verifying your email"
            />
            <Text
              variant="headlineSmall"
              style={[styles.title, { color: theme.colors.onBackground }]}
            >
              Verifying Your Email
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
            >
              Please wait while we verify your email address...
            </Text>
          </>
        )}

        {status === 'success' && (
          <>
            <Text
              variant="displaySmall"
              style={[styles.icon, { color: theme.colors.primary }]}
              accessibilityLabel="Success"
            >
              ✓
            </Text>
            <Text
              variant="headlineSmall"
              style={[styles.title, { color: theme.colors.onBackground }]}
              accessibilityRole="header"
            >
              Email Verified!
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
              accessibilityLiveRegion="polite"
            >
              {message}
            </Text>
            <Button
              mode="contained"
              onPress={handleGoToLogin}
              style={styles.button}
              testID="go-to-login-button"
              accessibilityRole="button"
              accessibilityLabel="Go to login"
              accessibilityHint="Navigate to login screen"
            >
              Go to Login
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <Text
              variant="displaySmall"
              style={[styles.icon, { color: theme.colors.error }]}
              accessibilityLabel="Error"
            >
              ✕
            </Text>
            <Text
              variant="headlineSmall"
              style={[styles.title, { color: theme.colors.onBackground }]}
              accessibilityRole="header"
            >
              Verification Failed
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
              accessibilityLiveRegion="polite"
              accessibilityRole="alert"
            >
              {message}
            </Text>
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={handleGoToLogin}
                style={styles.button}
                testID="go-to-login-button"
                accessibilityRole="button"
                accessibilityLabel="Go to login"
              >
                Go to Login
              </Button>
              <Button
                mode="outlined"
                onPress={handleGoToSignup}
                style={styles.button}
                testID="go-to-signup-button"
                accessibilityRole="button"
                accessibilityLabel="Sign up again"
              >
                Sign Up Again
              </Button>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loader: {
    marginBottom: 24,
  },
  icon: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    width: '100%',
  },
});
