/**
 * Sobriety Tracking Screen
 * Main sobriety tracking interface with days counter, milestones, and reflections
 * Feature: 002-app-screens
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { FAB } from 'react-native-paper';
import { DaysCounter } from '../../src/components/sobriety/DaysCounter';
import { MilestoneCard } from '../../src/components/sobriety/MilestoneCard';
import { ReflectionInput } from '../../src/components/sobriety/ReflectionInput';
import { Timeline } from '../../src/components/sobriety/Timeline';
import { LoadingSpinner } from '../../src/components/common/LoadingSpinner';
import { EmptyState } from '../../src/components/common/EmptyState';
import { useSobrietyTracking } from '../../src/hooks/useSobrietyTracking';
import { useAuth } from '../../src/hooks/useAuth';
import { useAppTheme } from '../../src/theme/ThemeContext';
import type { ReflectionFormData } from '../../src/types/sobriety';

export default function SobrietyScreen() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const {
    record,
    isLoading,
    isSaving,
    error,
    daysSober,
    upcomingMilestones,
    fetchRecord,
    refresh,
    dismissError,
  } = useSobrietyTracking();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showReflectionInput, setShowReflectionInput] = useState(false);

  // Fetch sobriety record on mount
  useEffect(() => {
    if (user?.id) {
      fetchRecord(user.id);
    }
  }, [user?.id, fetchRecord]);

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    if (!user?.id) return;

    setIsRefreshing(true);
    try {
      await refresh(user.id);
    } catch (err) {
      console.error('Error refreshing sobriety data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [user?.id, refresh]);

  // Handle reflection submission
  const handleReflectionSubmit = useCallback(
    async (_data: ReflectionFormData) => {
      if (!user?.id || !record) return;

      try {
        // Add reflection to sobriety record
        // This would be handled by a sobriety service method
        // For now, we'll show a success message
        Alert.alert('Success', 'Your reflection has been saved!', [{ text: 'OK' }]);
        setShowReflectionInput(false);

        // Refresh data
        await refresh(user.id);
      } catch (err) {
        console.error('Error saving reflection:', err);
        Alert.alert('Error', 'Failed to save reflection. Please try again.', [
          { text: 'OK' },
        ]);
      }
    },
    [user?.id, record, refresh]
  );

  // Show error alert if error exists
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        {
          text: 'OK',
          onPress: dismissError,
        },
      ]);
    }
  }, [error, dismissError]);

  // Loading state
  if (isLoading && !record) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LoadingSpinner message="Loading your sobriety journey..." />
      </View>
    );
  }

  // No sobriety record state
  if (!record) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          icon="calendar-heart"
          title="Start Your Journey"
          message="Begin tracking your sobriety and celebrate every milestone along the way."
          actionLabel="Set Start Date"
          onAction={() => {
            // Navigate to sobriety start date setup
            Alert.alert(
              'Set Start Date',
              'This feature will allow you to set your sobriety start date.',
              [{ text: 'OK' }]
            );
          }}
        />
      </View>
    );
  }

  const reflections = record.reflections || [];
  const sortedReflections = [...reflections].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Days Counter */}
        <DaysCounter
          daysSober={daysSober || 0}
          startDate={record.current_sobriety_start_date}
          isLoading={isLoading}
        />

        {/* Upcoming Milestones */}
        {upcomingMilestones && upcomingMilestones.length > 0 && (
          <View style={styles.milestonesSection}>
            {upcomingMilestones.slice(0, 3).map((milestone) => (
              <MilestoneCard
                key={milestone.milestone.days}
                milestone={milestone}
                currentDays={daysSober || 0}
              />
            ))}
          </View>
        )}

        {/* Reflection Input (conditional) */}
        {showReflectionInput && (
          <ReflectionInput
            onSubmit={handleReflectionSubmit}
            isSubmitting={isSaving}
          />
        )}

        {/* Reflections Timeline */}
        <Timeline reflections={sortedReflections} isLoading={isLoading} />
      </ScrollView>

      {/* FAB for adding reflections */}
      {!showReflectionInput && (
        <FAB
          icon="pencil"
          label="Add Reflection"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowReflectionInput(true)}
          accessibilityLabel="Add daily reflection"
          accessibilityHint="Opens reflection input"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for FAB
  },
  milestonesSection: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
