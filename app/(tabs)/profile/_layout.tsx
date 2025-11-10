/**
 * Profile Stack Layout
 * Provides Stack navigation for profile-related screens
 * Feature: 002-app-screens
 */

import { Stack } from 'expo-router';
import { useAppTheme } from '../../../src/theme/ThemeContext';

export default function ProfileLayout() {
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
        name="index"
        options={{
          headerShown: false, // Hide header for main profile tab
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: 'Edit Profile',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="view"
        options={{
          title: 'View Profile',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="change-role"
        options={{
          title: 'Change Role',
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
