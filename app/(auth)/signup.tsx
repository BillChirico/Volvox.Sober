import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useRouter, Link } from 'expo-router';
import SignupForm from '../../src/components/auth/SignupForm';

/**
 * Signup Screen
 *
 * Renders the user registration form with email and password inputs.
 * On successful signup, shows "Check Your Email" message inline,
 * then navigates to login screen after 2 seconds.
 *
 * Features:
 * - Email and password validation
 * - Password strength indicator
 * - Supabase Auth integration via Redux
 * - Success message with email verification instructions
 * - Error handling and display
 * - Accessibility support (WCAG 2.1 AA)
 * - Navigation link to login screen
 */
export default function SignupScreen() {
  const router = useRouter();

  const handleSignupSuccess = () => {
    // Navigate to login screen after successful signup
    // User will need to verify their email before logging in
    router.push('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <SignupForm onSuccess={handleSignupSuccess} />

      <View style={styles.footer}>
        <Link href="/(auth)/login" asChild>
          <Button
            mode="text"
            testID="login-link"
            accessibilityRole="link"
            accessibilityLabel="Already have an account? Login">
            Already have an account? Login
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
