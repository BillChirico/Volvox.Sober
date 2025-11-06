/**
 * Email Verification Screen
 * Prompt users to verify their email address
 * Feature: 002-app-screens
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuthRedirect';
import { useAppTheme } from '../../src/theme/ThemeContext';

export default function EmailVerificationScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const { user, resendVerificationEmail } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Check if email is already verified
  useEffect(() => {
    if (user?.email_confirmed_at) {
      // Email is verified, proceed to role selection
      router.replace('/(onboarding)/role-selection');
    }
  }, [user?.email_confirmed_at, router]);

  const handleResendEmail = async () => {
    setIsSending(true);
    try {
      await resendVerificationEmail();
      setEmailSent(true);
    } catch (error) {
      console.error('Error resending verification email:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleContinue = () => {
    // In MVP, allow users to skip email verification
    router.push('/(onboarding)/role-selection');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card} elevation={2}>
        <Card.Content>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="email-check-outline"
              size={64}
              color={theme.colors.primary}
            />
          </View>

          <Text
            variant="headlineMedium"
            style={[styles.title, { color: theme.colors.onSurface }]}
          >
            Verify Your Email
          </Text>

          <Text
            variant="bodyLarge"
            style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
          >
            We've sent a verification email to:
          </Text>

          <Text
            variant="bodyLarge"
            style={[styles.email, { color: theme.colors.onSurface }]}
          >
            {user?.email}
          </Text>

          <Text
            variant="bodyMedium"
            style={[styles.instructions, { color: theme.colors.onSurfaceVariant }]}
          >
            Please check your inbox and click the verification link to continue.
          </Text>

          {emailSent && (
            <Text
              variant="bodyMedium"
              style={[styles.success, { color: theme.colors.primary }]}
            >
              ✓ Verification email sent!
            </Text>
          )}

          <Button
            mode="outlined"
            onPress={handleResendEmail}
            loading={isSending}
            disabled={isSending || emailSent}
            style={styles.resendButton}
            contentStyle={styles.buttonContent}
            accessibilityLabel="Resend verification email"
          >
            Resend Email
          </Button>

          <Button
            mode="contained"
            onPress={handleContinue}
            style={styles.continueButton}
            contentStyle={styles.buttonContent}
            accessibilityLabel="Continue to profile setup"
            accessibilityHint="Skip email verification for now"
          >
            Continue Anyway
          </Button>

          <Text
            variant="bodySmall"
            style={[styles.note, { color: theme.colors.onSurfaceVariant }]}
          >
            You can verify your email later in settings
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    padding: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  message: {
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  instructions: {
    textAlign: 'center',
    marginBottom: 24,
  },
  success: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  resendButton: {
    marginBottom: 12,
  },
  continueButton: {
    marginBottom: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  note: {
    textAlign: 'center',
    marginTop: 8,
  },
});