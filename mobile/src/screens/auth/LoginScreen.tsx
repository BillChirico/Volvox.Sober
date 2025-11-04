/**
 * Login Screen
 * Email/password authentication
 */

import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useSignInMutation } from '../../store/api/authApi';
import { useAppDispatch } from '../../store/hooks';
import { setSession } from '../../store/slices/authSlice';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const [signIn, { isLoading, error }] = useSignInMutation();
  const dispatch = useAppDispatch();

  const handleLogin = async () => {
    try {
      const result = await signIn({ email, password }).unwrap();
      if (result.data.session) {
        dispatch(setSession(result.data.session));
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const canSubmit = email && password && isValidEmail(email);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Welcome Back
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Sign in to continue your recovery journey
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

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry={secureTextEntry}
          right={
            <TextInput.Icon
              icon={secureTextEntry ? 'eye-off' : 'eye'}
              onPress={() => setSecureTextEntry(!secureTextEntry)}
            />
          }
          style={styles.input}
        />

        {error ? (
          <HelperText type="error" visible={true}>
            {(error as any)?.message || 'Login failed. Please try again.'}
          </HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={isLoading}
          disabled={!canSubmit || isLoading}
          style={styles.button}
        >
          Sign In
        </Button>

        <Button mode="text" onPress={() => console.log('Navigate to forgot password')}>
          Forgot Password?
        </Button>

        <View style={styles.footer}>
          <Text variant="bodyMedium">Don't have an account? </Text>
          <Button mode="text" onPress={() => console.log('Navigate to register')}>
            Sign Up
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
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
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
});
