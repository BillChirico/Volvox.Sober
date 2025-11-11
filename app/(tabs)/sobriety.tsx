/**
 * Sobriety Tracking Screen
 * Main sobriety tracking interface with days counter, milestones, and reflections
 * Feature: 002-app-screens
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { FAB } from 'react-native-paper';
import { DaysCounter } from '@/features/sobriety';
import { MilestoneCard } from '@/features/sobriety';
import { ReflectionInput } from '@/features/sobriety';
import { Timeline } from '@/features/sobriety';
import { SobrietyDatePicker } from '@/features/sobriety';
import { LoadingSpinner } from '../../src/components/common/LoadingSpinner';
import { EmptyState } from '../../src/components/common/EmptyState';
import { useSobrietyTracking } from '@/features/sobriety';
import { useAuth } from '@/features/auth';
import { useAppTheme } from '../../src/theme/ThemeContext';
import { isMilestone, getMilestoneForDays } from '../../src/utils/dateCalculations';
import { sobrietyService } from '@/features/sobriety';
import type { ReflectionFormData } from '@/features/sobriety';

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
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  // Handle sobriety date confirmation
  const handleDateConfirm = useCallback(
    async (date: Date) => {
      if (!user?.id) return;

      try {
        const dateString = date.toISOString().split('T')[0];

        // Check if record exists
        if (!record) {
          // Create new sobriety record
          await sobrietyService.createSobrietyRecord(user.id, dateString);
        } else {
          // Update existing sobriety record
          await sobrietyService.updateSobrietyDate(user.id, dateString);
        }

        Alert.alert('Success', 'Your sobriety start date has been set!', [{ text: 'OK' }]);

        // Refresh data
        await refresh(user.id);
      } catch (err) {
        console.error('Error setting sobriety date:', err);
        Alert.alert('Error', 'Failed to set start date. Please try again.', [{ text: 'OK' }]);
      }
    },
    [user?.id, record, refresh],
  );

  // Handle reflection submission
  const handleReflectionSubmit = useCallback(
    async (data: ReflectionFormData) => {
      if (!user?.id || !record) return;

      try {
        const reflection = {
          date: new Date().toISOString().split('T')[0],
          text: data.text,
          created_at: new Date().toISOString(),
        };

        // Add reflection to sobriety record
        await sobrietyService.addReflection(user.id, reflection);

        Alert.alert('Success', 'Your reflection has been saved!', [{ text: 'OK' }]);
        setShowReflectionInput(false);

        // Refresh data
        await refresh(user.id);
      } catch (err) {
        console.error('Error saving reflection:', err);
        Alert.alert('Error', 'Failed to save reflection. Please try again.', [{ text: 'OK' }]);
      }
    },
    [user?.id, record, refresh],
  );

  // T080: Milestone detection and notification
  useEffect(() => {
    if (daysSober !== null && daysSober !== undefined && isMilestone(daysSober)) {
      const milestone = getMilestoneForDays(daysSober);

      if (milestone) {
        Alert.alert(`🎉 ${milestone.name}!`, milestone.description, [
          {
            text: 'Share',
            onPress: () => {
              // TODO: Implement share functionality
              console.log('Share milestone:', milestone);
            },
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ]);
      }
    }
  }, [daysSober]);

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
        <LoadingSpinner text="Loading your sobriety journey..." />
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
          description="Begin tracking your sobriety and celebrate every milestone along the way."
          actionText="Set Start Date"
          onAction={() => setShowDatePicker(true)}
        />
        <SobrietyDatePicker
          visible={showDatePicker}
          onDismiss={() => setShowDatePicker(false)}
          onConfirm={handleDateConfirm}
        />
      </View>
    );
  }

  const reflections = record.reflections || [];
  const sortedReflections = [...reflections].sort((a, b) => b.date.localeCompare(a.date));

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
        showsVerticalScrollIndicator={false}>
        {/* Days Counter */}
        <DaysCounter
          daysSober={daysSober || 0}
          startDate={record.current_sobriety_start_date}
          isLoading={isLoading}
        />

        {/* Upcoming Milestones */}
        {upcomingMilestones && upcomingMilestones.length > 0 && (
          <View style={styles.milestonesSection}>
            {upcomingMilestones.slice(0, 3).map(milestone => (
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
          <ReflectionInput onSubmit={handleReflectionSubmit} isSubmitting={isSaving} />
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
