import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { passwordResetSchema, updatePasswordSchema } from '../../services/validationSchemas';
import { ValidationError } from 'yup';
import authService from '../../services/authService';
import PasswordInput from './PasswordInput';
import AuthErrorMessage from './AuthErrorMessage';
import PasswordStrength from './PasswordStrength';

interface ForgotPasswordFormProps {
  resetToken?: string | null;
  onResetRequestSuccess?: () => void;
  onPasswordUpdateSuccess?: () => void;
}

/**
 * ForgotPasswordForm Component
 *
 * Handles both password reset request and password update flows.
 * - Without token: Shows email input to request reset link
 * - With token: Shows new password inputs to update password
 *
 * Features:
 * - Email validation for reset requests
 * - Password strength indicator for new passwords
 * - Generic success messages (security - FR-011)
 * - Token validation with Supabase
 * - Expired token handling (FR-009)
 * - Accessibility support (WCAG 2.1 AA)
 *
 * @param resetToken - Optional token from deep link for password update
 * @param onResetRequestSuccess - Callback after successful reset request
 * @param onPasswordUpdateSuccess - Callback after successful password update
 */
const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  resetToken,
  onResetRequestSuccess,
  onPasswordUpdateSuccess,
}) => {
  const theme = useTheme();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Determine if we're in reset request mode or password update mode
  const isPasswordUpdateMode = !!resetToken;

  useEffect(() => {
    // Clear errors when switching modes
    setError('');
    setSuccess('');
    setValidationErrors({});
  }, [resetToken]);

  // Clear form state when navigating away for security (FR-014)
  useFocusEffect(
    useCallback(() => {
      // Cleanup function runs when screen loses focus
      return () => {
        setEmail('');
        setNewPassword('');
        setConfirmPassword('');
        setValidationErrors({});
        setError('');
        setSuccess('');
      };
    }, []),
  );

  const validateEmailForm = async (): Promise<boolean> => {
    try {
      await passwordResetSchema.validate({ email }, { abortEarly: false });
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

  const validatePasswordForm = async (): Promise<boolean> => {
    try {
      await updatePasswordSchema.validate(
        { newPassword, confirmNewPassword: confirmPassword },
        { abortEarly: false },
      );
      setValidationErrors({});
      return true;
    } catch (err) {
      const validationError = err as ValidationError;
      const errors: Record<string, string> = {};

      validationError.inner.forEach(error => {
        if (error.path) {
          // Map confirmNewPassword back to confirmPassword for consistency
          const path = error.path === 'confirmNewPassword' ? 'confirmPassword' : error.path;
          errors[path] = error.message;
        }
      });

      setValidationErrors(errors);
      return false;
    }
  };

  const handleResetRequest = async (): Promise<void> => {
    setError('');
    setSuccess('');

    const isValid = await validateEmailForm();
    if (!isValid) return;

    setLoading(true);

    try {
      const { error: resetError } = await authService.resetPasswordRequest(email);

      if (resetError) {
        // Generic error message for security (FR-011)
        setError('Unable to process password reset request. Please try again.');
      } else {
        // Generic success message (FR-011) - don't reveal if email exists
        setSuccess(
          'If an account exists with this email, you will receive a password reset link shortly. Please check your inbox and spam folder.',
        );
        setEmail('');

        if (onResetRequestSuccess) {
          setTimeout(() => {
            onResetRequestSuccess();
          }, 3000);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (): Promise<void> => {
    setError('');
    setSuccess('');

    const isValid = await validatePasswordForm();
    if (!isValid) return;

    setLoading(true);

    try {
      // Update password using the token
      const { error: updateError } = await authService.updatePassword(newPassword);

      if (updateError) {
        // Check for expired token (case-insensitive)
        const errorMessage = updateError.message.toLowerCase();
        if (errorMessage.includes('expired') || errorMessage.includes('invalid')) {
          setError(
            'This reset link has expired or is invalid. Please request a new password reset link.',
          );
        } else {
          setError('Unable to update password. Please try again.');
        }
      } else {
        setSuccess('Your password has been updated successfully! Redirecting to login...');
        setNewPassword('');
        setConfirmPassword('');

        if (onPasswordUpdateSuccess) {
          setTimeout(() => {
            onPasswordUpdateSuccess();
          }, 2000);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      testID="forgot-password-form"
      accessibilityLabel={
        isPasswordUpdateMode ? 'Update password form' : 'Password reset request form'
      }>
      <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.onBackground }]}>
        {isPasswordUpdateMode ? 'Set New Password' : 'Reset Password'}
      </Text>

      <Text
        variant="bodyMedium"
        style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
        {isPasswordUpdateMode
          ? 'Enter your new password below.'
          : "Enter your email address and we'll send you a link to reset your password."}
      </Text>

      {/* Display error message */}
      {error && <AuthErrorMessage message={error} style={styles.errorMessage} />}

      {/* Display success message */}
      {success && (
        <View style={[styles.successContainer, { backgroundColor: theme.colors.primaryContainer }]}>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onPrimaryContainer }}
            accessibilityLiveRegion="polite"
            accessibilityRole="alert">
            {success}
          </Text>
        </View>
      )}

      {!isPasswordUpdateMode ? (
        // Reset Request Mode
        <>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            onBlur={() => validateEmailForm()}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            mode="outlined"
            error={!!validationErrors.email}
            disabled={loading || !!success}
            style={styles.input}
            testID="reset-email-input"
            accessibilityLabel="Email address"
            accessibilityHint="Enter your email to receive a password reset link"
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

          <Button
            mode="contained"
            onPress={handleResetRequest}
            loading={loading}
            disabled={loading || !!success}
            style={styles.submitButton}
            testID="reset-request-button"
            accessibilityRole="button"
            accessibilityLabel="Send reset link"
            accessibilityHint="Request a password reset email">
            Send Reset Link
          </Button>
        </>
      ) : (
        // Password Update Mode
        <>
          <PasswordInput
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            onBlur={() => validatePasswordForm()}
            error={!!validationErrors.newPassword}
            disabled={loading || !!success}
            style={styles.input}
            testID="new-password-input"
            accessibilityLabel="New Password"
            accessibilityHint="Enter your new password"
          />
          {validationErrors.newPassword && (
            <Text
              variant="bodySmall"
              style={[styles.validationError, { color: theme.colors.error }]}
              accessibilityLiveRegion="polite"
              accessibilityRole="alert">
              {validationErrors.newPassword}
            </Text>
          )}

          {/* Password Strength Indicator */}
          <PasswordStrength password={newPassword} style={styles.passwordStrength} />

          <PasswordInput
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onBlur={() => validatePasswordForm()}
            error={!!validationErrors.confirmPassword}
            disabled={loading || !!success}
            style={styles.input}
            testID="confirm-password-input"
            accessibilityLabel="Confirm New Password"
            accessibilityHint="Re-enter your new password"
          />
          {validationErrors.confirmPassword && (
            <Text
              variant="bodySmall"
              style={[styles.validationError, { color: theme.colors.error }]}
              accessibilityLiveRegion="polite"
              accessibilityRole="alert">
              {validationErrors.confirmPassword}
            </Text>
          )}

          <Button
            mode="contained"
            onPress={handlePasswordUpdate}
            loading={loading}
            disabled={loading || !!success}
            style={styles.submitButton}
            testID="update-password-button"
            accessibilityRole="button"
            accessibilityLabel="Update password"
            accessibilityHint="Save your new password">
            Update Password
          </Button>
        </>
      )}
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
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    marginBottom: 24,
    textAlign: 'center',
  },
  errorMessage: {
    marginBottom: 16,
  },
  successContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  input: {
    marginBottom: 4,
  },
  validationError: {
    marginBottom: 12,
    marginLeft: 12,
  },
  passwordStrength: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 16,
  },
});

export default ForgotPasswordForm;
