import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Link } from 'expo-router';
import { useAppTheme } from '../../src/theme/ThemeContext';

export default function LoginScreen() {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineLarge" style={{ color: theme.colors.onBackground, marginBottom: 32 }}>
        Volvox.Sober
      </Text>
      <Text variant="headlineSmall" style={{ color: theme.colors.onBackground, marginBottom: 24 }}>
        Welcome Back
      </Text>

      {/* Login form will be added here */}
      <Text variant="bodyMedium" style={{ color: theme.colors.onBackground, marginBottom: 16 }}>
        Login form coming soon
      </Text>

      <View style={styles.footer}>
        <Link href="/(auth)/register" asChild>
          <Button mode="text">Don't have an account? Sign up</Button>
        </Link>
        <Link href="/(auth)/forgot-password" asChild>
          <Button mode="text">Forgot Password?</Button>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  footer: {
    marginTop: 24,
    gap: 8,
  },
});
