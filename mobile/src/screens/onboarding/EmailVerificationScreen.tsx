import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Surface, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { supabaseClient } from '../../services/supabase';

const EmailVerificationScreen: React.FC = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState<string>('');
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Get user email from auth session
    const getEmail = async () => {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();
      if (session?.user?.email) {
        setEmail(session.user.email);
      }
    };
    getEmail();

    // Poll for verification status every 5 seconds
    const pollInterval = setInterval(async () => {
      await checkVerificationStatus();
    }, 5000);

    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    // Countdown timer for resend button
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsResendDisabled(false);
    }
  }, [resendCountdown]);

  const checkVerificationStatus = async () => {
    setIsVerifying(true);
    try {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      if (session?.user?.email_confirmed_at) {
        // Email is verified, navigate to dashboard
        navigation.navigate('Dashboard' as never);
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      if (session?.user?.email) {
        const { error } = await supabaseClient.auth.resend({
          type: 'signup',
          email: session.user.email,
        });

        if (error) {
          console.error('Error resending verification email:', error);
        } else {
          // Disable resend button for 60 seconds
          setIsResendDisabled(true);
          setResendCountdown(60);
        }
      }
    } catch (error) {
      console.error('Error resending email:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.surface}>
        <Text variant="headlineMedium" style={styles.title}>
          Verify Your Email
        </Text>

        <Text variant="bodyLarge" style={styles.message}>
          Check your email at{' '}
          <Text style={styles.email}>{email}</Text> to verify your account.
        </Text>

        <Text variant="bodyMedium" style={styles.instructions}>
          Click the verification link in the email to complete your registration.
          You'll be automatically redirected once verified.
        </Text>

        {isVerifying && (
          <View style={styles.verifyingContainer}>
            <ActivityIndicator animating={true} />
            <Text variant="bodyMedium" style={styles.verifyingText}>
              Checking verification status...
            </Text>
          </View>
        )}

        <Button
          mode="outlined"
          onPress={handleResendEmail}
          disabled={isResendDisabled}
          style={styles.resendButton}
        >
          {isResendDisabled
            ? `Resend Email (${resendCountdown}s)`
            : 'Resend Verification Email'}
        </Button>

        <Button
          mode="text"
          onPress={() => supabaseClient.auth.signOut()}
          style={styles.cancelButton}
        >
          Cancel and Sign Out
        </Button>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  surface: {
    margin: 16,
    padding: 24,
    borderRadius: 8,
    elevation: 2,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  message: {
    marginBottom: 16,
    textAlign: 'center',
  },
  email: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  instructions: {
    marginBottom: 24,
    textAlign: 'center',
    color: '#666',
  },
  verifyingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  verifyingText: {
    marginLeft: 8,
    color: '#666',
  },
  resendButton: {
    marginBottom: 12,
  },
  cancelButton: {
    marginTop: 8,
  },
});

export default EmailVerificationScreen;
