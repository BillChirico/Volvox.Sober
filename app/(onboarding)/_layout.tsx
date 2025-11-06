import { Stack } from 'expo-router';
import { useAppTheme } from '../../src/theme/ThemeContext';

export default function OnboardingLayout() {
  const { theme } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}>
      <Stack.Screen
        name="welcome"
        options={{
          title: 'Welcome',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="role-selection"
        options={{
          title: 'Choose Your Role',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="email-verification"
        options={{
          title: 'Verify Email',
        }}
      />
      <Stack.Screen
        name="sponsor-profile"
        options={{
          title: 'Sponsor Profile',
        }}
      />
      <Stack.Screen
        name="sponsee-profile"
        options={{
          title: 'Sponsee Profile',
        }}
      />
    </Stack>
  );
}