import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useRouter, useLocalSearchParams, Link } from 'expo-router';
import ForgotPasswordForm from '@/features/auth';

/**
 * Forgot Password Screen
 *
 * Handles both password reset request and password update flows.
 * - Without token: Shows email input to request reset link
 * - With token from deep link: Shows new password inputs
 *
 * Features:
 * - Email validation for reset requests
 * - Password strength indicator for new passwords
 * - Generic success messages (security - FR-011)
 * - Token validation and expiration handling (FR-009)
 * - Accessibility support (WCAG 2.1 AA)
 * - Deep link handling for magic links
 */
export default function ForgotPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Extract token from deep link parameters
  const resetToken = params.token as string | undefined;

  const handleResetRequestSuccess = () => {
    // After successful reset request, redirect to login
    router.push('/(auth)/login');
  };

  const handlePasswordUpdateSuccess = () => {
    // After successful password update, redirect to login
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <ForgotPasswordForm
        resetToken={resetToken}
        onResetRequestSuccess={handleResetRequestSuccess}
        onPasswordUpdateSuccess={handlePasswordUpdateSuccess}
      />

      <View style={styles.footer}>
        <Link href="/(auth)/login" asChild>
          <Button
            mode="text"
            testID="back-to-login-link"
            accessibilityRole="link"
            accessibilityLabel="Back to login">
            Back to Login
          </Button>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
});
