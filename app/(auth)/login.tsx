import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useRouter, Link } from 'expo-router';
import LoginForm from '../../src/components/auth/LoginForm';

/**
 * Login Screen
 *
 * Renders the user login form with email and password inputs.
 * On successful login, redirects to main app (replaces navigation stack).
 * Handles unverified users by showing resend verification option.
 *
 * Features:
 * - Email and password validation
 * - Supabase Auth integration via Redux
 * - Session persistence via Redux Persist
 * - Error handling (wrong password, unverified email)
 * - Accessibility support (WCAG 2.1 AA)
 * - Links to signup and password reset screens
 */
export default function LoginScreen() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    // Navigate to main app - replace navigation stack
    // Email verification is non-blocking (users can access app without verification)
    router.replace('/(tabs)/sobriety');
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  return (
    <View style={styles.container}>
      <LoginForm
        onSuccess={handleLoginSuccess}
        onForgotPassword={handleForgotPassword}
      />

      <View style={styles.footer}>
        <Link href="/(auth)/signup" asChild>
          <Button
            mode="text"
            testID="signup-link"
            accessibilityRole="link"
            accessibilityLabel="Don't have an account? Sign up"
          >
            Don't have an account? Sign up
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
