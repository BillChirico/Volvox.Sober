/**
 * MilestoneCard Component
 * Displays milestone achievements and progress
 * Feature: 002-app-screens
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../core/theme/ThemeContext';
import type { MilestoneStatus, MilestoneDay } from '../../types/sobriety';

export interface MilestoneCardProps {
  /** Milestone status information */
  milestone: MilestoneStatus;
  /** Current days sober */
  currentDays: number;
}

/**
 * Get icon name for milestone
 */
function getMilestoneIcon(days: MilestoneDay): keyof typeof MaterialCommunityIcons.glyphMap {
  const iconMap: Record<MilestoneDay, keyof typeof MaterialCommunityIcons.glyphMap> = {
    1: 'numeric-1-circle',
    7: 'numeric-7-circle',
    30: 'calendar-month',
    60: 'calendar-today',
    90: 'calendar-star',
    180: 'calendar-check',
    365: 'trophy',
    730: 'trophy-award',
    1825: 'trophy-variant',
    3650: 'star-circle',
  };
  return iconMap[days] || 'calendar';
}

/**
 * Format milestone date
 */
function formatMilestoneDate(date: string): string {
  try {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return date;
  }
}

/**
 * Milestone card component
 */
export const MilestoneCard: React.FC<MilestoneCardProps> = ({ milestone, currentDays }) => {
  const { theme } = useAppTheme();

  const progress = milestone.isAchieved ? 1 : Math.min(currentDays / milestone.milestone.days, 1);

  const daysRemaining = milestone.daysUntilAchievement || 0;

  return (
    <Card
      style={[
        styles.card,
        milestone.isAchieved && {
          borderColor: theme.colors.primary,
          borderWidth: 2,
          backgroundColor: theme.colors.primaryContainer,
        },
      ]}
      elevation={milestone.isAchieved ? 3 : 1}
      accessibilityLabel={`${milestone.milestone.title} milestone, ${milestone.isAchieved ? 'achieved' : `${daysRemaining} days remaining`}`}
      accessibilityRole="text">
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={getMilestoneIcon(milestone.milestone.days)}
              size={40}
              color={milestone.isAchieved ? theme.colors.primary : theme.colors.onSurfaceVariant}
            />
            {milestone.isAchieved && (
              <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                <MaterialCommunityIcons name="check" size={16} color={theme.colors.onPrimary} />
              </View>
            )}
          </View>

          <View style={styles.contentContainer}>
            <Text
              variant="titleLarge"
              style={[
                styles.title,
                {
                  color: milestone.isAchieved
                    ? theme.colors.onPrimaryContainer
                    : theme.colors.onSurface,
                },
              ]}>
              {milestone.milestone.title}
            </Text>
            <Text
              variant="bodyMedium"
              style={[
                styles.description,
                {
                  color: milestone.isAchieved
                    ? theme.colors.onPrimaryContainer
                    : theme.colors.onSurfaceVariant,
                },
              ]}>
              {milestone.milestone.description}
            </Text>
          </View>
        </View>

        {!milestone.isAchieved && (
          <>
            <ProgressBar
              progress={progress}
              color={theme.colors.primary}
              style={styles.progressBar}
            />
            <View style={styles.progressInfo}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {currentDays} / {milestone.milestone.days} days
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: '600' }}>
                {daysRemaining === 1 ? '1 day to go!' : `${daysRemaining} days to go`}
              </Text>
            </View>
          </>
        )}

        {milestone.isAchieved && milestone.achievedAt && (
          <View style={styles.achievementInfo}>
            <MaterialCommunityIcons
              name="calendar-check"
              size={16}
              color={theme.colors.onPrimaryContainer}
              style={styles.achievementIcon}
            />
            <Text
              variant="bodySmall"
              style={[styles.achievementText, { color: theme.colors.onPrimaryContainer }]}>
              Achieved on {formatMilestoneDate(milestone.achievedAt)}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    position: 'relative',
    marginRight: 16,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    lineHeight: 20,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  achievementInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  achievementIcon: {
    marginRight: 6,
  },
  achievementText: {
    fontWeight: '500',
  },
});
