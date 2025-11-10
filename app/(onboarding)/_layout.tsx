import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAppTheme } from '../../src/core/theme/ThemeContext';
import { useAppSelector } from '../../src/store/hooks';
import { selectOnboardingCompleted } from '../../src/store/onboarding/onboardingSelectors';

export default function OnboardingLayout() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const onboardingCompleted = useAppSelector(selectOnboardingCompleted);

  // Guard: Redirect onboarded users to main app
  useEffect(() => {
    if (onboardingCompleted) {
      console.log('[OnboardingLayout] User already onboarded, redirecting to main app');
      router.replace('/(tabs)/sobriety');
    }
  }, [onboardingCompleted, router]);

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
