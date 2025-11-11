/**
 * Timeline Component
 * Displays chronological list of reflections
 * Feature: 002-app-screens
 */

import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../../theme/ThemeContext';
import type { SobrietyReflection } from '../../../types/sobriety';

export interface TimelineProps {
  /** List of reflections to display */
  reflections: SobrietyReflection[];
  /** Whether data is loading */
  isLoading?: boolean;
  /** Message when no reflections exist */
  emptyMessage?: string;
}

interface TimelineItemProps {
  reflection: SobrietyReflection;
  isLast: boolean;
}

/**
 * Format reflection date for display
 */
function formatReflectionDate(date: string): string {
  try {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if today
    if (d.toDateString() === today.toDateString()) {
      return 'Today';
    }

    // Check if yesterday
    if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    // Otherwise, show full date
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return date;
  }
}

/**
 * Timeline item component
 */
const TimelineItem: React.FC<TimelineItemProps> = ({ reflection, isLast }) => {
  const { theme } = useAppTheme();

  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineMarker}>
        <View style={[styles.markerDot, { backgroundColor: theme.colors.primary }]} />
        {!isLast && (
          <View style={[styles.markerLine, { backgroundColor: theme.colors.outlineVariant }]} />
        )}
      </View>

      <Card style={styles.reflectionCard} elevation={1}>
        <Card.Content>
          <View style={styles.reflectionHeader}>
            <Text
              variant="titleSmall"
              style={[styles.reflectionDate, { color: theme.colors.primary }]}>
              {formatReflectionDate(reflection.date)}
            </Text>
            <MaterialCommunityIcons
              name="note-text"
              size={16}
              color={theme.colors.onSurfaceVariant}
            />
          </View>
          <Text
            variant="bodyMedium"
            style={[styles.reflectionText, { color: theme.colors.onSurface }]}>
            {reflection.text}
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
};

/**
 * Timeline component for reflection history
 */
export const Timeline: React.FC<TimelineProps> = ({
  reflections,
  isLoading = false,
  emptyMessage = 'No reflections yet. Start by adding your first reflection above!',
}) => {
  const { theme } = useAppTheme();

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
          Loading reflections...
        </Text>
      </View>
    );
  }

  if (reflections.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons
          name="timeline-text-outline"
          size={64}
          color={theme.colors.onSurfaceVariant}
          style={styles.emptyIcon}
        />
        <Text variant="titleMedium" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
          No Reflections Yet
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.emptyMessage, { color: theme.colors.onSurfaceVariant }]}>
          {emptyMessage}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.timelineHeader}>
        <MaterialCommunityIcons name="timeline-clock" size={24} color={theme.colors.primary} />
        <Text
          variant="titleMedium"
          style={[styles.timelineTitle, { color: theme.colors.onSurface }]}>
          Your Journey
        </Text>
      </View>

      <FlatList
        data={reflections}
        renderItem={({ item, index }) => (
          <TimelineItem reflection={item} isLast={index === reflections.length - 1} />
        )}
        keyExtractor={(item, index) => `reflection-${item.date}-${index}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        accessibilityLabel="Reflection timeline"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingLeft: 4,
  },
  timelineTitle: {
    marginLeft: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 24,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineMarker: {
    width: 32,
    alignItems: 'center',
    paddingTop: 4,
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  markerLine: {
    width: 2,
    flex: 1,
  },
  reflectionCard: {
    flex: 1,
    marginLeft: 16,
  },
  reflectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reflectionDate: {
    fontWeight: '600',
  },
  reflectionText: {
    lineHeight: 22,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    textAlign: 'center',
    lineHeight: 22,
  },
});
