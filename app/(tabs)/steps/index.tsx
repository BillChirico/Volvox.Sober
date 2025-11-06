/**
 * Step List Screen - Display all 12 steps with progress indicators (T102)
 */

import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, ProgressBar, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useGetAllStepsQuery, useGetMyStepWorkQuery } from '../../../src/services/stepsApi';

export const StepListScreen: React.FC = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();

  const { data: steps, isLoading: stepsLoading } = useGetAllStepsQuery();
  const { data: stepWork, isLoading: workLoading } = useGetMyStepWorkQuery();

  const getStepStatus = (stepId: string) => {
    const work = stepWork?.find(w => w.step_id === stepId);
    return work?.status || 'not_started';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reviewed': return theme.colors.tertiary; // Green
      case 'submitted': return theme.colors.primary; // Blue
      case 'in_progress': return theme.colors.secondary; // Teal
      case 'not_started': return theme.colors.outlineVariant; // Gray
      default: return theme.colors.outlineVariant;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'reviewed': return 'Reviewed ✓';
      case 'submitted': return 'Submitted';
      case 'in_progress': return 'In Progress';
      case 'not_started': return 'Not Started';
      default: return 'Not Started';
    }
  };

  const completedCount = stepWork?.filter(w => w.status === 'reviewed').length || 0;
  const progressValue = completedCount / 12;

  if (stepsLoading || workLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading steps...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress Header */}
      <View style={styles.progressContainer}>
        <Text variant="titleLarge" style={styles.title}>
          12-Step Program
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {completedCount}/12 steps completed
        </Text>
        <ProgressBar
          progress={progressValue}
          color={theme.colors.primary}
          style={styles.progressBar}
        />
      </View>

      {/* Step List */}
      <FlatList
        data={steps}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const status = getStepStatus(item.id);
          return (
            <TouchableOpacity
              onPress={() => router.push('StepWork', { stepId: item.id })}
            >
              <Card style={styles.stepCard}>
                <Card.Content>
                  <View style={styles.stepHeader}>
                    <Text variant="titleMedium" style={styles.stepNumber}>
                      Step {item.step_number}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(status) },
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {getStatusLabel(status)}
                      </Text>
                    </View>
                  </View>
                  <Text variant="bodyMedium" style={styles.stepTitle}>
                    {item.step_title}
                  </Text>
                  <Text variant="bodySmall" style={styles.stepDescription}>
                    {item.step_description.substring(0, 120)}...
                  </Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#666',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  listContent: {
    padding: 16,
  },
  stepCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: theme.colors.surface,
    elevation: 2,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: theme.colors.onPrimary, // White on colored backgrounds
    fontSize: 12,
    fontWeight: '600',
  },
  stepTitle: {
    marginBottom: 8,
    lineHeight: 20,
  },
  stepDescription: {
    color: theme.colors.onSurfaceVariant,
    lineHeight: 18,
  },
  completedBadge: {
    marginTop: 8,
  },
  completedText: {
    color: theme.colors.onSurface,
  },
  checkIcon: {
    marginLeft: 8,
  },
  description: {
    marginTop: 4,
    color: theme.colors.onSurfaceVariant,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: theme.colors.onSurfaceVariant,
  },
});
export default StepListScreen;
