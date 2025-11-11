/**
 * Welcome Screen
 * Initial onboarding screen with welcome message and features
 * Feature: 002-app-screens
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { WelcomeCard } from '../../src/components/onboarding/WelcomeCard';
import { useOnboarding } from '../../src/hooks/useOnboarding';
import { useAuth } from '@/features/auth';
import { useAppTheme } from '../../src/theme/ThemeContext';

export default function WelcomeScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { completeStep, isSaving } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Mark welcome step as complete
      await completeStep(user.id, 'welcome');

      // Navigate to role selection
      router.push('/(onboarding)/role-selection');
    } catch (error) {
      console.error('Error completing welcome step:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <WelcomeCard onContinue={handleGetStarted} isLoading={isLoading || isSaving} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});
