/**
 * Role Selection Screen
 * Let users choose their role in the recovery community
 * Feature: 002-app-screens
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { RoleSelector } from '@/features/onboarding';
import { useOnboarding } from '@/features/onboarding';
import { useProfile } from '@/features/profile';
import { useAuth } from '@/features/auth';
import { useAppTheme } from '../../src/theme/ThemeContext';
import type { UserRole } from '@/features/profile';

export default function RoleSelectionScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { completeStep, isSaving } = useOnboarding();
  const { update } = useProfile();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleContinue = async () => {
    if (!selectedRole || !user?.id) return;

    try {
      // Update profile with selected role
      await update(user.id, { role: selectedRole });

      // Mark role selection step as complete
      await completeStep(user.id, 'role_selection');

      // Navigate to appropriate profile form
      if (selectedRole === 'sponsor') {
        router.push('/(onboarding)/sponsor-profile');
      } else if (selectedRole === 'sponsee') {
        router.push('/(onboarding)/sponsee-profile');
      } else {
        // For 'both', default to sponsor profile first
        router.push('/(onboarding)/sponsor-profile');
      }
    } catch (error) {
      console.error('Error selecting role:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <RoleSelector selectedRole={selectedRole} onRoleSelect={setSelectedRole} />

      <Button
        mode="contained"
        onPress={handleContinue}
        loading={isSaving}
        disabled={!selectedRole || isSaving}
        style={styles.button}
        contentStyle={styles.buttonContent}
        accessibilityLabel="Continue to profile setup"
        accessibilityHint="Proceed with selected role">
        Continue
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
