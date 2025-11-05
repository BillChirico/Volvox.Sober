import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, TextInput, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { signupThunk } from '../../store/auth/authThunks';
import { signupSchema } from '../../services/validationSchemas';
import { clearError } from '../../store/auth/authSlice';
import PasswordInput from './PasswordInput';
import PasswordStrength from './PasswordStrength';
import AuthErrorMessage from './AuthErrorMessage';
import type { ValidationError } from 'yup';

export interface SignupFormProps {
  onSuccess?: () => void;
}

/**
 * SignupForm component for user registration
 *
 * Features:
 * - Email and password input with validation
 * - Real-time password strength indicator
 * - Form validation using Yup schema
 * - Redux integration for signup flow
 * - Accessible error messages and loading states
 * - Success message for email verification
 *
 * @example
 * ```tsx
 * <SignupForm onSuccess={() => router.push('/(tabs)/matches')} />
 * ```
 */
const SignupForm: React.FC<SignupFormProps> = ({ onSuccess }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const { loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Clear Redux error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Clear form state when navigating away for security (FR-014)
  useFocusEffect(
    useCallback(() => {
      // Cleanup function runs when screen loses focus
      return () => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setValidationErrors({});
        setShowSuccess(false);
        dispatch(clearError());
      };
    }, [dispatch])
  );

  const validateForm = async (): Promise<boolean> => {
    try {
      await signupSchema.validate(
        { email, password, confirmPassword },
        { abortEarly: false }
      );
      setValidationErrors({});
      return true;
    } catch (err) {
      const validationError = err as ValidationError;
      const errors: Record<string, string> = {};

      validationError.inner.forEach((error) => {
        if (error.path) {
          errors[error.path] = error.message;
        }
      });

      setValidationErrors(errors);
      return false;
    }
  };

  const handleSubmit = async (): Promise<void> => {
    // Clear previous errors
    dispatch(clearError());
    setValidationErrors({});

    // Validate form
    const isValid = await validateForm();
    if (!isValid) {
      return;
    }

    // Dispatch signup thunk
    const result = await dispatch(signupThunk({ email, password }));

    // Handle success
    if ((result.payload as { success: boolean })?.success) {
      setShowSuccess(true);
      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      // Call onSuccess callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    }
  };

  if (showSuccess) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        testID="signup-success-message"
        accessibilityRole="alert"
        accessibilityLabel="Account created successfully. Check your email for verification."
      >
        <View style={styles.successContainer}>
          <Text
            variant="headlineSmall"
            style={[styles.successTitle, { color: theme.colors.primary }]}
          >
            Check Your Email
          </Text>
          <Text
            variant="bodyLarge"
            style={[styles.successMessage, { color: theme.colors.onBackground }]}
          >
            We've sent a verification link to {email}. Please check your email and click the link
            to verify your account.
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.successHint, { color: theme.colors.onSurfaceVariant }]}
          >
            Don't forget to check your spam folder if you don't see it.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.formContainer}>
        {/* Display Redux error */}
        {error && (
          <AuthErrorMessage
            message={error}
            dismissible
            onDismiss={() => dispatch(clearError())}
          />
        )}

        {/* Email Input */}
        <TextInput
          testID="signup-email-input"
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          mode="outlined"
          error={!!validationErrors.email}
          disabled={loading}
          accessibilityLabel="Email address"
          accessibilityHint="Enter your email address"
          style={styles.input}
        />
        {validationErrors.email && (
          <Text
            variant="bodySmall"
            style={[styles.errorText, { color: theme.colors.error }]}
          >
            {validationErrors.email}
          </Text>
        )}

        {/* Password Input */}
        <PasswordInput
          testID="signup-password-input"
          label="Password"
          value={password}
          onChangeText={setPassword}
          error={!!validationErrors.password}
          helperText={validationErrors.password}
          disabled={loading}
        />

        {/* Password Strength Indicator */}
        <PasswordStrength password={password} visible={password.length > 0} />

        {/* Confirm Password Input */}
        <PasswordInput
          testID="signup-confirm-password-input"
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          error={!!validationErrors.confirmPassword}
          helperText={validationErrors.confirmPassword}
          disabled={loading}
        />

        {/* Submit Button */}
        <Button
          testID="signup-submit-button"
          mode="contained"
          onPress={handleSubmit}
          disabled={loading}
          loading={loading}
          style={styles.submitButton}
          accessibilityLabel="Sign up"
          accessibilityHint="Creates your account and sends verification email"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </Button>

        {loading && (
          <View testID="signup-loading" accessibilityLiveRegion="polite">
            <Text
              variant="bodySmall"
              style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}
            >
              Creating your account...
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  input: {
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 8,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    textAlign: 'center',
    marginBottom: 16,
  },
  successHint: {
    textAlign: 'center',
    fontSize: 14,
  },
});

export default SignupForm;
