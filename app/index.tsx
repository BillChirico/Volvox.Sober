import { Redirect } from 'expo-router';
import { useAppSelector } from '../src/store/hooks';

export default function Index() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Redirect to appropriate screen based on auth state
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Check if user needs to complete onboarding
  if (user && !user.onboarding_completed) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  // User is authenticated and onboarded, go to main app
  return <Redirect href="/(tabs)/connections" />;
}
