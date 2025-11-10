/**
 * WelcomeCard Component
 * Welcome message and introduction for new users
 * Feature: 002-app-screens
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../core/theme/ThemeContext';

export interface WelcomeCardProps {
  /** Callback when user is ready to continue */
  onContinue: () => void;
  /** Whether the continue button is loading */
  isLoading?: boolean;
}

/**
 * Welcome card component for onboarding
 */
export const WelcomeCard: React.FC<WelcomeCardProps> = ({ onContinue, isLoading = false }) => {
  const { theme } = useAppTheme();

  return (
    <Card style={styles.card} elevation={2}>
      <Card.Content>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="hand-wave-outline" size={64} color={theme.colors.primary} />
        </View>

        <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
          Welcome to Volvox.Sober
        </Text>

        <Text
          variant="bodyLarge"
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Your journey to recovery starts here
        </Text>

        <View style={styles.featuresContainer}>
          <FeatureItem
            icon="account-heart"
            title="Connect with Support"
            description="Find sponsors or sponsees who understand your journey"
          />
          <FeatureItem
            icon="calendar-check"
            title="Track Your Progress"
            description="Celebrate milestones and stay motivated each day"
          />
          <FeatureItem
            icon="message"
            title="Stay Accountable"
            description="Share reflections and get support when you need it"
          />
        </View>

        <Button
          mode="contained"
          onPress={onContinue}
          loading={isLoading}
          disabled={isLoading}
          style={styles.button}
          contentStyle={styles.buttonContent}
          accessibilityLabel="Continue to profile setup"
          accessibilityHint="Proceed to set up your profile">
          Get Started
        </Button>
      </Card.Content>
    </Card>
  );
};

interface FeatureItemProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description }) => {
  const { theme } = useAppTheme();

  return (
    <View style={styles.featureItem}>
      <MaterialCommunityIcons
        name={icon}
        size={24}
        color={theme.colors.primary}
        style={styles.featureIcon}
      />
      <View style={styles.featureText}>
        <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginBottom: 4 }}>
          {title}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {description}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  featureIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
  },
  button: {
    marginTop: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
