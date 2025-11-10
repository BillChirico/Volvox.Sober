/**
 * NoMatchesEmptyState Component
 * Empty state with profile completion tips for better matches
 * Feature: 002-app-screens
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../core/theme/ThemeContext';

export interface NoMatchesEmptyStateProps {
  /** Callback when improve profile button is pressed */
  onImproveProfile: () => void;
  /** Profile completion percentage (0-100) */
  completionPercentage?: number;
  /** Missing profile fields */
  missingFields?: string[];
}

/**
 * Empty state with actionable profile completion tips
 */
export const NoMatchesEmptyState: React.FC<NoMatchesEmptyStateProps> = ({
  onImproveProfile,
  completionPercentage = 0,
  missingFields = [],
}) => {
  const { theme } = useAppTheme();

  const defaultMissingFields =
    missingFields.length > 0
      ? missingFields
      : ['Recovery Program', 'Availability', 'Location', 'Bio'];

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="account-search"
        size={80}
        color={theme.colors.onSurfaceVariant}
        style={styles.icon}
      />

      <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
        No Matches Yet
      </Text>

      <Text
        variant="bodyLarge"
        style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
        Complete your profile to start seeing potential matches
      </Text>

      {/* Profile Completion Card */}
      <Card style={styles.completionCard}>
        <Card.Content>
          <View style={styles.completionHeader}>
            <MaterialCommunityIcons name="account-check" size={24} color={theme.colors.primary} />
            <Text
              variant="titleMedium"
              style={[styles.completionTitle, { color: theme.colors.onSurface }]}>
              Profile Completion
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${completionPercentage}%`,
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              />
            </View>
            <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
              {completionPercentage}%
            </Text>
          </View>

          <Divider style={styles.divider} />

          {/* Missing Fields */}
          <Text variant="titleSmall" style={[styles.tipsTitle, { color: theme.colors.onSurface }]}>
            To improve your matches, add:
          </Text>

          {defaultMissingFields.map((field, index) => (
            <View key={index} style={styles.tipItem}>
              <MaterialCommunityIcons
                name="checkbox-blank-circle"
                size={8}
                color={theme.colors.primary}
                style={styles.bullet}
              />
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {field}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Tips Card */}
      <Card style={styles.tipsCard}>
        <Card.Content>
          <View style={styles.tipRow}>
            <MaterialCommunityIcons name="lightbulb-on" size={20} color={theme.colors.tertiary} />
            <Text
              variant="bodyMedium"
              style={[styles.tipText, { color: theme.colors.onSurfaceVariant }]}>
              <Text style={{ fontWeight: '600' }}>Tip:</Text> A complete profile increases your
              chances of finding compatible matches by 3x
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Action Button */}
      <Button
        mode="contained"
        onPress={onImproveProfile}
        icon="account-edit"
        style={styles.button}
        accessibilityLabel="Improve your profile"
        accessibilityHint="Navigate to profile screen to complete your information">
        Improve Profile
      </Button>

      {/* Additional Info */}
      <Text
        variant="bodySmall"
        style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>
        Once your profile is complete, we'll suggest matches based on your recovery program,
        location, and availability
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    marginBottom: 16,
    opacity: 0.6,
  },
  title: {
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  completionCard: {
    width: '100%',
    marginBottom: 16,
  },
  completionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  completionTitle: {
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  divider: {
    marginVertical: 16,
  },
  tipsTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bullet: {
    marginRight: 12,
  },
  tipsCard: {
    width: '100%',
    marginBottom: 24,
    backgroundColor: 'rgba(33, 150, 243, 0.08)',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipText: {
    flex: 1,
    lineHeight: 20,
  },
  button: {
    marginBottom: 16,
    minWidth: 200,
  },
  footerText: {
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },
});
