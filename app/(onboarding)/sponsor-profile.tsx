/**
 * Sponsor Profile Setup Screen
 * Profile form for users with sponsor role
 * Feature: 002-app-screens
 */

import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ProfileForm } from '../../src/components/onboarding/ProfileForm';
import { useOnboarding } from '../../src/hooks/useOnboarding';
import { useProfile } from '../../src/hooks/useProfile';
import { useAuth } from '../../src/hooks/useAuth';
import { useAppTheme } from '../../src/theme/ThemeContext';
import type { ProfileFormData } from '../../src/types/profile';

export default function SponsorProfileScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { completeStep, complete, isSaving } = useOnboarding();
  const { update, isSaving: isProfileSaving, error: profileError } = useProfile();

  const handleSubmit = async (data: ProfileFormData) => {
    if (!user?.id) return;

    try {
      // Update profile with form data
      await update(user.id, data);

      // Mark profile form step as complete
      await completeStep(user.id, 'sponsor_profile');

      // Mark onboarding as complete
      await complete(user.id);

      // Navigate to main app (sobriety tab)
      router.replace('/(tabs)/sobriety');
    } catch (error) {
      console.error('Error saving sponsor profile:', error);
      Alert.alert(
        'Error',
        'Failed to save your profile. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ProfileForm
        role="sponsor"
        onSubmit={handleSubmit}
        isSubmitting={isProfileSaving || isSaving}
        errors={profileError ? { form: profileError } : {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});