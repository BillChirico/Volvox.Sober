/**
 * Sponsee Profile Setup Screen
 * Profile form for users with sponsee role
 * Feature: 002-app-screens
 */

import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ProfileForm } from '../../src/components/onboarding/ProfileForm';
import { useOnboarding } from '../../src/hooks/useOnboarding';
import { useProfile } from '../../src/hooks/useProfile';
import { useAuth } from '../../src/hooks/useAuth';
import { useAppTheme } from '../../src/core/theme/ThemeContext';
import type { ProfileFormData } from '../../src/types/profile';

export default function SponseeProfileScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { completeStep, complete, isSaving } = useOnboarding();
  const { create, isSaving: isProfileSaving, error: profileError } = useProfile();

  const handleSubmit = async (data: ProfileFormData) => {
    if (!user?.id) {
      console.error('No user ID found');
      Alert.alert('Error', 'No user session found. Please log in again.');
      return;
    }

    console.log('Starting profile creation for user:', user.id);
    console.log('Profile data:', JSON.stringify(data, null, 2));

    try {
      // Create profile with form data
      console.log('Calling create() function...');
      const result = await create(user.id, data);
      console.log('Create result:', result);

      // Check if the async thunk was rejected
      if (result.type && result.type.endsWith('/rejected')) {
        const errorMessage = (result.payload as string) || profileError || 'Unknown error';
        console.error('Profile creation error:', errorMessage);
        Alert.alert('Profile Creation Failed', `Error: ${errorMessage}`, [{ text: 'OK' }]);
        return;
      }

      console.log('Profile created successfully');

      // Mark profile form step as complete
      console.log('Completing onboarding step...');
      await completeStep(user.id, 'sponsee_profile');

      // Mark onboarding as complete
      console.log('Marking onboarding complete...');
      await complete(user.id);

      console.log('Navigating to main app...');
      // Navigate to main app (sobriety tab)
      router.replace('/(tabs)/sobriety');
    } catch (error) {
      console.error('Error saving sponsee profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Failed to save your profile: ${errorMessage}`, [{ text: 'OK' }]);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ProfileForm
        role="sponsee"
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
