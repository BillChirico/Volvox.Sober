import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../src/theme/ThemeContext';

export default function WelcomeScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineLarge" style={{ color: theme.colors.onBackground, marginBottom: 16 }}>
        Welcome to Volvox.Sober
      </Text>
      <Text variant="bodyLarge" style={{ color: theme.colors.onBackground, marginBottom: 32, textAlign: 'center' }}>
        Your journey to sobriety starts here
      </Text>

      <Button
        mode="contained"
        onPress={() => router.push('/(onboarding)/email-verification')}
        style={{ marginBottom: 16 }}
      >
        Get Started
      </Button>
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
});
