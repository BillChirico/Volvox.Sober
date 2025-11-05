/**
 * Register Screen
 * User registration with profile information
 */

import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText, SegmentedButtons } from 'react-native-paper';
import { useSignUpMutation } from '../../store/api/authApi';
import { useAppDispatch } from '../../store/hooks';
import { setSession } from '../../store/slices/authSlice';

export const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [role, setRole] = useState<'sponsor' | 'sponsee' | 'both'>('sponsee');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmEntry, setSecureConfirmEntry] = useState(true);

  const [signUp, { isLoading, error }] = useSignUpMutation();
  const dispatch = useAppDispatch();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      return;
    }

    try {
      const result = await signUp({
        email,
        password,
        name,
        age: parseInt(age, 10),
        role,
      }).unwrap();

      if (result.data.session) {
        dispatch(setSession(result.data.session));
      }
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPassword = (password: string) => {
    return password.length >= 6;
  };

  const isValidAge = (age: string) => {
    const ageNum = parseInt(age, 10);
    return !isNaN(ageNum) && ageNum >= 13 && ageNum <= 120;
  };

  const passwordsMatch = password === confirmPassword;
  const canSubmit =
    email &&
    password &&
    confirmPassword &&
    name &&
    age &&
    isValidEmail(email) &&
    isValidPassword(password) &&
    passwordsMatch &&
    isValidAge(age);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text variant="headlineMedium" style={styles.title}>
            Create Account
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Join the recovery community
          </Text>

          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            autoCapitalize="words"
            style={styles.input}
          />

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
            label="Age"
            value={age}
            onChangeText={setAge}
            mode="outlined"
            keyboardType="number-pad"
            style={styles.input}
            error={!isValidAge(age) && age.length > 0}
          />
          <HelperText type="error" visible={!isValidAge(age) && age.length > 0}>
            Age must be between 13 and 120
          </HelperText>

          <Text variant="labelLarge" style={styles.roleLabel}>
            I want to be a:
          </Text>
          <SegmentedButtons
            value={role}
            onValueChange={(value) => setRole(value as 'sponsor' | 'sponsee' | 'both')}
            buttons={[
              { value: 'sponsee', label: 'Sponsee' },
              { value: 'sponsor', label: 'Sponsor' },
              { value: 'both', label: 'Both' },
            ]}
            style={styles.segmentedButtons}
          />

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
            error={!isValidPassword(password) && password.length > 0}
          />
          <HelperText type="error" visible={!isValidPassword(password) && password.length > 0}>
            Password must be at least 6 characters
          </HelperText>

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry={secureConfirmEntry}
            right={
              <TextInput.Icon
                icon={secureConfirmEntry ? 'eye-off' : 'eye'}
                onPress={() => setSecureConfirmEntry(!secureConfirmEntry)}
              />
            }
            style={styles.input}
            error={!passwordsMatch && confirmPassword.length > 0}
          />
          <HelperText type="error" visible={!passwordsMatch && confirmPassword.length > 0}>
            Passwords do not match
          </HelperText>

          {error ? (
            <HelperText type="error" visible={true}>
              {(error as any)?.message || 'Registration failed. Please try again.'}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={isLoading}
            disabled={!canSubmit || isLoading}
            style={styles.button}
          >
            Create Account
          </Button>

          <View style={styles.footer}>
            <Text variant="bodyMedium">Already have an account? </Text>
            <Button mode="text" onPress={() => console.log('Navigate to login')}>
              Sign In
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 24,
  },
  title: {
    textAlign: 'center',
    marginTop: 24,
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
  roleLabel: {
    marginTop: 16,
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 16,
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
    marginBottom: 24,
  },
});
