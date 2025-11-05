import { Redirect } from 'expo-router';
import { useAppSelector } from '../src/store/hooks';
import { selectIsAuthenticated, selectUser } from '../src/store/auth/authSelectors';

export default function Index() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  // Redirect to appropriate screen based on auth state
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Check if user needs to complete onboarding
  if (user && !user.user_metadata?.onboarding_completed) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  // User is authenticated and onboarded, go to main app
  return <Redirect href="/(tabs)/connections" />;
}
