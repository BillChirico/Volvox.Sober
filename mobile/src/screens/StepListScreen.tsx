/**
 * Step List Screen - Display all 12 steps with progress indicators (T102)
 */

import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, ProgressBar, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useGetAllStepsQuery, useGetMyStepWorkQuery } from '../services/stepsApi';

export const StepListScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  const { data: steps, isLoading: stepsLoading } = useGetAllStepsQuery();
  const { data: stepWork, isLoading: workLoading } = useGetMyStepWorkQuery();

  const getStepStatus = (stepId: string) => {
    const work = stepWork?.find(w => w.step_id === stepId);
    return work?.status || 'not_started';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reviewed': return theme.colors.primary;
      case 'submitted': return theme.colors.secondary;
      case 'in_progress': return '#FFA500';
      case 'not_started': return '#CCCCCC';
      default: return '#CCCCCC';
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
              onPress={() => navigation.navigate('StepWork', { stepId: item.id })}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
    marginBottom: 12,
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
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  stepTitle: {
    marginBottom: 8,
    lineHeight: 20,
  },
  stepDescription: {
    color: '#666',
    lineHeight: 18,
  },
});
