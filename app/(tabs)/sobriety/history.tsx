/**
 * Relapse History Screen
 * WP06: Display user's relapse history with private notes
 */

import React from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import {
  Text,
  Card,
  useTheme,
  ActivityIndicator,
  Button,
  Chip,
  Divider,
} from 'react-native-paper';
import { useGetSobrietyStatsQuery, useGetMyRelapsesQuery } from '../../../src/store/api/sobrietyApi';
import { TRIGGER_CONTEXT_OPTIONS } from '@volvox-sober/shared/types/src/sobriety';
import type { Relapse } from '@volvox-sober/shared/types/src/sobriety';

export const RelapseHistoryScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { data: stats } = useGetSobrietyStatsQuery();
  const { data: relapses, isLoading, error } = useGetMyRelapsesQuery(
    stats?.id || '',
    { skip: !stats?.id }
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading relapse history...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Failed to load relapse history</Text>
        <Button mode="contained" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.emptyTitle}>No Sobriety Date Set</Text>
        <Text style={styles.emptySubtitle}>
          Set your sobriety date to begin tracking your recovery journey.
        </Text>
        <Button
          mode="contained"
          onPress={() => router.push('SetSobrietyDate')}
          style={styles.actionButton}
        >
          Set Sobriety Date
        </Button>
      </View>
    );
  }

  if (!relapses || relapses.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.emptyTitle}>No Relapses Recorded</Text>
        <Text style={styles.emptySubtitle}>
          Your recovery journey has no recorded relapses. Keep up the great work!
        </Text>
        <Button mode="contained" onPress={() => router.back()} style={styles.actionButton}>
          Back to Dashboard
        </Button>
      </View>
    );
  }

  const getTriggerLabel = (triggerContext?: string) => {
    if (!triggerContext) return null;
    const option = TRIGGER_CONTEXT_OPTIONS.find((opt) => opt.value === triggerContext);
    return option?.label;
  };

  const renderRelapseItem = ({ item }: { item: Relapse }) => {
    const triggerLabel = getTriggerLabel(item.trigger_context);

    return (
      <Card style={styles.relapseCard}>
        <Card.Content>
          <View style={styles.relapseHeader}>
            <Text variant="titleMedium" style={styles.relapseDate}>
              {new Date(item.relapse_date).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
            {triggerLabel && (
              <Chip mode="outlined" style={styles.triggerChip}>
                {triggerLabel}
              </Chip>
            )}
          </View>

          {item.private_note && (
            <>
              <Divider style={styles.divider} />
              <Text variant="labelMedium" style={styles.noteLabel}>
                Private Note:
              </Text>
              <Text variant="bodyMedium" style={styles.noteText}>
                {item.private_note}
              </Text>
            </>
          )}

          <Text variant="bodySmall" style={styles.timestamp}>
            Recorded on {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.summaryTitle}>
            Recovery Summary
          </Text>
          <View style={styles.summaryRow}>
            <Text variant="bodyLarge">Total Relapses:</Text>
            <Text variant="bodyLarge" style={styles.summaryValue}>
              {relapses.length}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text variant="bodyLarge">Current Streak:</Text>
            <Text variant="bodyLarge" style={styles.summaryValue}>
              {stats.current_streak_days} days
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Text variant="titleMedium" style={styles.historyTitle}>
        Relapse History
      </Text>

      <FlatList
        data={relapses}
        keyExtractor={(item) => item.id}
        renderItem={renderRelapseItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
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
    color: theme.colors.error,
    marginBottom: 16,
    fontSize: 16,
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
  actionButton: {
    marginTop: 16,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryTitle: {
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  summaryValue: {
    fontWeight: 'bold',
  },
  historyTitle: {
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 16,
  },
  separator: {
    height: 12,
  },
  relapseCard: {
    marginBottom: 8,
  },
  relapseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  relapseDate: {
    flex: 1,
    fontWeight: 'bold',
  },
  triggerChip: {
    marginLeft: 8,
  },
  divider: {
    marginVertical: 12,
  },
  noteLabel: {
    marginBottom: 4,
    color: theme.colors.onSurfaceVariant,
  },
  noteText: {
    marginBottom: 8,
    lineHeight: 20,
  },
  timestamp: {
    marginTop: 8,
    color: '#999',
  },
});

export default RelapseHistoryScreen;
