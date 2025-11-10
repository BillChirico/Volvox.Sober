/**
 * DaysCounter Component
 * Displays prominent days sober counter
 * Feature: 002-app-screens
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../core/theme/ThemeContext';

export interface DaysCounterProps {
  /** Number of days sober */
  daysSober: number;
  /** Sobriety start date */
  startDate: string;
  /** Whether data is loading */
  isLoading?: boolean;
}

/**
 * Days counter component with prominent display
 */
export const DaysCounter: React.FC<DaysCounterProps> = ({
  daysSober,
  startDate,
  isLoading = false,
}) => {
  const { theme } = useAppTheme();

  const formatStartDate = (date: string): string => {
    try {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return date;
    }
  };

  const getDaysLabel = (days: number): string => {
    if (days === 0) return 'Today is Day 1!';
    if (days === 1) return 'Day';
    return 'Days';
  };

  if (isLoading) {
    return (
      <Card style={styles.card} elevation={3}>
        <Card.Content style={styles.content}>
          <View style={styles.loadingContainer}>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
              Loading...
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card
      style={[styles.card, { backgroundColor: theme.colors.primaryContainer }]}
      elevation={3}
      accessibilityLabel={`${daysSober} days sober since ${formatStartDate(startDate)}`}
      accessibilityRole="text">
      <Card.Content style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="trophy-variant" size={48} color={theme.colors.primary} />
        </View>

        <View style={styles.counterContainer}>
          <Text
            variant="displayLarge"
            style={[styles.daysNumber, { color: theme.colors.onPrimaryContainer }]}>
            {daysSober}
          </Text>
          <Text
            variant="headlineMedium"
            style={[styles.daysLabel, { color: theme.colors.onPrimaryContainer }]}>
            {getDaysLabel(daysSober)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metadataContainer}>
          <MaterialCommunityIcons
            name="calendar-start"
            size={20}
            color={theme.colors.onPrimaryContainer}
            style={styles.metadataIcon}
          />
          <Text
            variant="bodyMedium"
            style={[styles.metadataText, { color: theme.colors.onPrimaryContainer }]}>
            Sober since {formatStartDate(startDate)}
          </Text>
        </View>

        {daysSober > 0 && (
          <View style={styles.encouragementContainer}>
            <Text
              variant="titleMedium"
              style={[styles.encouragementText, { color: theme.colors.primary }]}>
              {getEncouragementMessage(daysSober)}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

/**
 * Get encouraging message based on days sober
 */
function getEncouragementMessage(days: number): string {
  if (days === 0) return 'Your journey begins today!';
  if (days < 7) return 'One day at a time!';
  if (days < 30) return "You're doing great!";
  if (days < 90) return 'Keep up the amazing work!';
  if (days < 365) return 'Your strength is inspiring!';
  return 'Incredible dedication!';
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  loadingContainer: {
    paddingVertical: 40,
  },
  iconContainer: {
    marginBottom: 16,
  },
  counterContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  daysNumber: {
    fontWeight: '700',
    fontSize: 80,
    lineHeight: 88,
  },
  daysLabel: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  divider: {
    height: 1,
    width: '80%',
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    marginVertical: 16,
  },
  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metadataIcon: {
    marginRight: 8,
  },
  metadataText: {
    fontWeight: '500',
  },
  encouragementContainer: {
    paddingTop: 8,
  },
  encouragementText: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
