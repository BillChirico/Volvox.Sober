import { Link, Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useAppTheme } from '../src/core/theme/ThemeContext';

export default function NotFoundScreen() {
  const { theme } = useAppTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found' }} />
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text
          variant="headlineMedium"
          style={{ color: theme.colors.onBackground, marginBottom: 16 }}>
          Page Not Found
        </Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.onBackground, marginBottom: 24 }}>
          The page you're looking for doesn't exist.
        </Text>
        <Link href="/" asChild>
          <Button mode="contained">Go to Home</Button>
        </Link>
      </View>
    </>
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
