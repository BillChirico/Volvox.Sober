/**
 * Sobriety Dashboard Screen
 * WP06: T091 - Display current streak, next milestone, and progress
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Card,
  ProgressBar,
  Button,
  useTheme,
  ActivityIndicator,
  Surface,
  Divider,
} from 'react-native-paper';
import { useGetSobrietyStatsQuery } from '../../store/api/sobrietyApi';
import { MILESTONE_THRESHOLDS, MILESTONE_DISPLAY_TEXT } from '@volvox-sober/types/sobriety';
import type { MilestoneType } from '@volvox-sober/types/sobriety';

export const SobrietyDashboardScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const { data: stats, isLoading, error } = useGetSobrietyStatsQuery();

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading your sobriety stats...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Failed to load sobriety stats</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.emptyTitle}>Start Your Sobriety Journey</Text>
        <Text style={styles.emptySubtitle}>
          Set your sobriety date to begin tracking your progress and milestones.
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('SetSobrietyDate')}
          style={styles.startButton}
        >
          Set Sobriety Date
        </Button>
      </View>
    );
  }

  const progress =
    stats.days_until_next_milestone !== null && stats.next_milestone_days !== null
      ? (stats.current_streak_days / stats.next_milestone_days)
      : 1.0;

  const renderMilestones = () => {
    const milestones: MilestoneType[] = ['30_days', '60_days', '90_days', '180_days', '1_year'];

    return milestones.map((milestone) => {
      const achieved = stats.milestones_achieved.includes(milestone);
      const days = MILESTONE_THRESHOLDS[milestone];
      const displayText = MILESTONE_DISPLAY_TEXT[milestone];

      return (
        <Surface
          key={milestone}
          style={[
            styles.milestoneItem,
            achieved && { backgroundColor: theme.colors.primaryContainer },
          ]}
          elevation={1}
        >
          <View style={styles.milestoneContent}>
            <Text
              variant="titleMedium"
              style={[
                styles.milestoneText,
                achieved && { color: theme.colors.primary },
              ]}
            >
              {displayText}
            </Text>
            <Text
              variant="bodySmall"
              style={[
                styles.milestoneDays,
                achieved && { color: theme.colors.primary },
              ]}
            >
              {days} days
            </Text>
          </View>
          {achieved && (
            <Text style={styles.achievedBadge}>✓</Text>
          )}
        </Surface>
      );
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.streakCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.streakLabel}>
            Current Streak
          </Text>
          <Text variant="displayLarge" style={styles.streakNumber}>
            {stats.current_streak_days}
          </Text>
          <Text variant="titleMedium" style={styles.streakDays}>
            {stats.current_streak_days === 1 ? 'Day' : 'Days'}
          </Text>

          <Divider style={styles.divider} />

          <Text variant="bodyMedium" style={styles.startDateLabel}>
            Sobriety Start Date
          </Text>
          <Text variant="titleMedium">
            {new Date(stats.start_date).toLocaleDateString()}
          </Text>

          <Text variant="bodyMedium" style={styles.substanceLabel}>
            Substance Type
          </Text>
          <Text variant="titleMedium">{stats.substance_type}</Text>
        </Card.Content>
      </Card>

      {stats.next_milestone_days !== null && (
        <Card style={styles.progressCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.nextMilestoneTitle}>
              Next Milestone: {MILESTONE_DISPLAY_TEXT[
                Object.entries(MILESTONE_THRESHOLDS).find(
                  ([_, days]) => days === stats.next_milestone_days
                )?.[0] as MilestoneType || '30_days'
              ]}
            </Text>
            <View style={styles.progressContainer}>
              <ProgressBar
                progress={progress}
                color={theme.colors.primary}
                style={styles.progressBar}
              />
              <Text variant="bodyMedium" style={styles.progressText}>
                {stats.days_until_next_milestone} days to go
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.milestonesCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.milestonesTitle}>
            Milestones
          </Text>
          <View style={styles.milestonesList}>
            {renderMilestones()}
          </View>
        </Card.Content>
      </Card>

      {stats.total_relapses > 0 && (
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.statsTitle}>
              Recovery Statistics
            </Text>
            <View style={styles.statsRow}>
              <Text variant="bodyLarge">Total Relapses:</Text>
              <Text variant="bodyLarge" style={styles.statsValue}>
                {stats.total_relapses}
              </Text>
            </View>
            {stats.last_relapse_date && (
              <View style={styles.statsRow}>
                <Text variant="bodyLarge">Last Relapse:</Text>
                <Text variant="bodyLarge" style={styles.statsValue}>
                  {new Date(stats.last_relapse_date).toLocaleDateString()}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('SetSobrietyDate')}
          style={styles.actionButton}
        >
          Update Sobriety Date
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('LogRelapse')}
          style={styles.actionButton}
        >
          Log Relapse
        </Button>
        <Button
          mode="text"
          onPress={() => navigation.navigate('RelapseHistory')}
          style={styles.actionButton}
        >
          View Relapse History
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  startButton: {
    marginTop: 16,
  },
  streakCard: {
    marginBottom: 16,
  },
  streakLabel: {
    textAlign: 'center',
    marginBottom: 8,
  },
  streakNumber: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  streakDays: {
    textAlign: 'center',
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  startDateLabel: {
    marginTop: 8,
    marginBottom: 4,
  },
  substanceLabel: {
    marginTop: 16,
    marginBottom: 4,
  },
  progressCard: {
    marginBottom: 16,
  },
  nextMilestoneTitle: {
    marginBottom: 12,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    marginTop: 8,
    textAlign: 'center',
  },
  milestonesCard: {
    marginBottom: 16,
  },
  milestonesTitle: {
    marginBottom: 16,
  },
  milestonesList: {
    gap: 12,
  },
  milestoneItem: {
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneText: {
    fontWeight: 'bold',
  },
  milestoneDays: {
    marginTop: 4,
  },
  achievedBadge: {
    fontSize: 24,
    color: 'green',
  },
  statsCard: {
    marginBottom: 16,
  },
  statsTitle: {
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  statsValue: {
    fontWeight: 'bold',
  },
  actions: {
    marginTop: 8,
    marginBottom: 32,
  },
  actionButton: {
    marginBottom: 12,
  },
});
