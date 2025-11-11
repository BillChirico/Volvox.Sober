import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../hooks/useAppDispatch';
import { loginThunk } from '../../../store/auth/authThunks';
import { clearError } from '../../../store/auth/authSlice';
import { loginSchema } from '../../../services/validationSchemas';
import { ValidationError } from 'yup';
import PasswordInput from './PasswordInput';
import AuthErrorMessage from './AuthErrorMessage';

interface LoginFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
}

/**
 * LoginForm Component
 *
 * Provides email and password inputs for user authentication.
 * Integrates with Redux for state management and Supabase Auth for authentication.
 *
 * Features:
 * - Email and password validation (Yup schema)
 * - Password visibility toggle via PasswordInput component
 * - Error display via AuthErrorMessage component
 * - Loading state management
 * - Accessibility support (WCAG 2.1 AA)
 * - Wrong password error handling (FR-013)
 * - Unverified email error handling (FR-005)
 *
 * @param onSuccess - Callback function called after successful login
 * @param onForgotPassword - Callback function called when "Forgot Password?" is clicked
 */
const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onForgotPassword }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const { loading, error } = useAppSelector(state => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  // Ref for password input to enable focus on Enter
  const passwordInputRef = useRef<RNTextInput>(null);

  // Clear Redux error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Check if error indicates unverified email
  useEffect(() => {
    if (error && (error.includes('Email not confirmed') || error.includes('not verified'))) {
      setShowResendVerification(true);
    } else {
      setShowResendVerification(false);
    }
  }, [error]);

  // Clear form state when navigating away for security (FR-014)
  useFocusEffect(
    useCallback(() => {
      // Cleanup function runs when screen loses focus
      return () => {
        setEmail('');
        setPassword('');
        setValidationErrors({});
        setShowResendVerification(false);
        setResendMessage('');
        dispatch(clearError());
      };
    }, [dispatch]),
  );

  const validateForm = async (): Promise<boolean> => {
    try {
      await loginSchema.validate({ email, password }, { abortEarly: false });
      setValidationErrors({});
      return true;
    } catch (err) {
      const validationError = err as ValidationError;
      const errors: Record<string, string> = {};

      validationError.inner.forEach(error => {
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

    // Dispatch login thunk
    const result = await dispatch(loginThunk({ email, password }));

    // Handle success
    if ((result.payload as { success: boolean })?.success) {
      // Clear form
      setEmail('');
      setPassword('');

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  const handleResendVerification = async (): Promise<void> => {
    if (!email) {
      setResendMessage('Please enter your email address');
      return;
    }

    setResendLoading(true);
    setResendMessage('');

    try {
      const authService = (await import('../../services/authService')).default;
      const { error } = await authService.resendVerification(email);

      if (error) {
        setResendMessage(`Error: ${error.message}`);
      } else {
        setResendMessage('Verification email sent! Please check your inbox.');
        setShowResendVerification(false);
      }
    } catch (_err) {
      setResendMessage('Failed to resend verification email');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      testID="login-form"
      accessibilityLabel="Login form">
      <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.onBackground }]}>
        Welcome Back
      </Text>

      {/* Display error message if present */}
      {error && <AuthErrorMessage message={error} style={styles.errorMessage} />}

      {/* Resend verification option for unverified users */}
      {showResendVerification && (
        <View style={styles.resendContainer}>
          <Text
            variant="bodyMedium"
            style={[styles.resendText, { color: theme.colors.onSurfaceVariant }]}>
            Your email is not verified. Please check your inbox for the verification email.
          </Text>
          <Button
            mode="outlined"
            onPress={handleResendVerification}
            loading={resendLoading}
            disabled={resendLoading}
            style={styles.resendButton}
            testID="resend-verification-button"
            accessibilityRole="button"
            accessibilityLabel="Resend verification email"
            accessibilityHint="Send a new verification email to your inbox">
            Resend Verification Email
          </Button>
          {resendMessage && (
            <Text
              variant="bodySmall"
              style={[
                styles.resendMessage,
                {
                  color: resendMessage.includes('Error')
                    ? theme.colors.error
                    : theme.colors.primary,
                },
              ]}
              accessibilityLiveRegion="polite"
              accessibilityRole="alert">
              {resendMessage}
            </Text>
          )}
        </View>
      )}

      {/* Email Input */}
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        onBlur={() => validateForm()}
        onSubmitEditing={() => passwordInputRef.current?.focus()}
        returnKeyType="next"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        mode="outlined"
        error={!!validationErrors.email}
        disabled={loading}
        style={styles.input}
        testID="login-email-input"
        accessibilityLabel="Email address"
        accessibilityHint="Enter your email address"
      />
      {validationErrors.email && (
        <Text
          variant="bodySmall"
          style={[styles.validationError, { color: theme.colors.error }]}
          accessibilityLiveRegion="polite"
          accessibilityRole="alert">
          {validationErrors.email}
        </Text>
      )}

      {/* Password Input */}
      <PasswordInput
        ref={passwordInputRef}
        label="Password"
        value={password}
        onChangeText={setPassword}
        onBlur={() => validateForm()}
        onSubmitEditing={handleSubmit}
        returnKeyType="done"
        error={!!validationErrors.password}
        disabled={loading}
        style={styles.input}
        testID="login-password-input"
        accessibilityLabel="Password"
        accessibilityHint="Enter your password"
      />
      {validationErrors.password && (
        <Text
          variant="bodySmall"
          style={[styles.validationError, { color: theme.colors.error }]}
          accessibilityLiveRegion="polite"
          accessibilityRole="alert">
          {validationErrors.password}
        </Text>
      )}

      {/* Forgot Password Link */}
      {onForgotPassword && (
        <Button
          mode="text"
          onPress={onForgotPassword}
          style={styles.forgotPassword}
          testID="forgot-password-link"
          accessibilityRole="link"
          accessibilityLabel="Forgot password?"
          accessibilityHint="Navigate to password reset screen">
          Forgot Password?
        </Button>
      )}

      {/* Login Button */}
      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        style={styles.submitButton}
        testID="login-submit-button"
        accessibilityRole="button"
        accessibilityLabel="Login"
        accessibilityHint="Submit login credentials"
        accessibilityState={{ disabled: loading }}>
        Login
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    marginBottom: 4,
  },
  validationError: {
    marginBottom: 12,
    marginLeft: 12,
  },
  errorMessage: {
    marginBottom: 16,
  },
  resendContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  resendText: {
    marginBottom: 12,
  },
  resendButton: {
    marginBottom: 8,
  },
  resendMessage: {
    textAlign: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
  },
});

export default LoginForm;
