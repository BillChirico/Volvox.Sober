/**
 * Forgot Password Screen
 * Password reset request
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useResetPasswordMutation } from '../../store/api/authApi';

export const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [resetPassword, { isLoading, error }] = useResetPasswordMutation();

  const handleResetPassword = async () => {
    try {
      await resetPassword({ email }).unwrap();
      setSubmitted(true);
    } catch (err) {
      console.error('Password reset failed:', err);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const canSubmit = email && isValidEmail(email);

  if (submitted) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text variant="headlineMedium" style={styles.title}>
            Check Your Email
          </Text>
          <Text variant="bodyMedium" style={styles.message}>
            We've sent password reset instructions to {email}
          </Text>
          <Text variant="bodySmall" style={styles.note}>
            If you don't see the email, check your spam folder.
          </Text>
          <Button
            mode="contained"
            onPress={() => console.log('Navigate back to login')}
            style={styles.button}
          >
            Back to Login
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Forgot Password?
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Enter your email and we'll send you instructions to reset your password
        </Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          style={styles.input}
          error={!isValidEmail(email) && email.length > 0}
        />
        <HelperText type="error" visible={!isValidEmail(email) && email.length > 0}>
          Please enter a valid email address
        </HelperText>

        {error ? (
          <HelperText type="error" visible={true}>
            {(error as any)?.message || 'Failed to send reset email. Please try again.'}
          </HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={handleResetPassword}
          loading={isLoading}
          disabled={!canSubmit || isLoading}
          style={styles.button}
        >
          Send Reset Instructions
        </Button>

        <Button mode="text" onPress={() => console.log('Navigate back to login')}>
          Back to Login
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  message: {
    textAlign: 'center',
    marginBottom: 16,
  },
  note: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.6,
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
    marginBottom: 8,
  },
});
