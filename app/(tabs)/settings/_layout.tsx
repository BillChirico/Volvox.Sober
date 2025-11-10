/**
 * Settings Stack Layout
 * Provides Stack navigation for settings screens
 * Feature: 002-app-screens
 */

import { Stack } from 'expo-router';
import { useAppTheme } from '../../../src/theme/ThemeContext';

export default function SettingsLayout() {
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
        headerShadowVisible: false,
      }}>
      <Stack.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="theme"
        options={{
          title: 'Theme',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="account"
        options={{
          title: 'Account Settings',
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
