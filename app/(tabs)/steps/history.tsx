/**
 * Step Work History Screen - View all submitted step work with history (T106)
 */

import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useGetMyStepWorkQuery, useGetAllStepsQuery } from '../../../src/services/stepsApi';

export const StepWorkHistoryScreen: React.FC = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();

  const { data: steps, isLoading: stepsLoading } = useGetAllStepsQuery();
  const { data: stepWork, isLoading: workLoading } = useGetMyStepWorkQuery();

  // Filter submitted or reviewed step work
  const history = stepWork?.filter(
    (work) => work.status === 'submitted' || work.status === 'reviewed'
  );

  const getStepInfo = (stepId: string) => {
    return steps?.find((s) => s.id === stepId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reviewed':
        return theme.colors.primary;
      case 'submitted':
        return theme.colors.secondary;
      default:
        return '#CCCCCC';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'reviewed':
        return 'Reviewed ✓';
      case 'submitted':
        return 'Submitted';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewStepWork = (stepId: string) => {
    router.push('StepWork', { stepId });
  };

  if (stepsLoading || workLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!history || history.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="bodyLarge" style={styles.emptyText}>
          No submitted step work yet
        </Text>
        <Text variant="bodySmall" style={styles.emptySubtext}>
          Complete and submit step work to see your history here
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.title}>
          Step Work History
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {history.length} {history.length === 1 ? 'step' : 'steps'} submitted
        </Text>
      </View>

      {/* History List */}
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const step = getStepInfo(item.step_id);
          if (!step) return null;

          return (
            <TouchableOpacity onPress={() => handleViewStepWork(item.step_id)}>
              <Card style={styles.historyCard}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Text variant="titleMedium" style={styles.stepNumber}>
                      Step {step.step_number}
                    </Text>
                    <Chip
                      style={[
                        styles.statusChip,
                        { backgroundColor: getStatusColor(item.status) },
                      ]}
                      textStyle={styles.statusChipText}
                    >
                      {getStatusLabel(item.status)}
                    </Chip>
                  </View>

                  <Text variant="bodyMedium" style={styles.stepTitle}>
                    {step.step_title}
                  </Text>

                  <View style={styles.metadata}>
                    <View style={styles.metadataRow}>
                      <Text variant="bodySmall" style={styles.metadataLabel}>
                        Started:
                      </Text>
                      <Text variant="bodySmall" style={styles.metadataValue}>
                        {formatDate(item.started_at)}
                      </Text>
                    </View>

                    <View style={styles.metadataRow}>
                      <Text variant="bodySmall" style={styles.metadataLabel}>
                        Submitted:
                      </Text>
                      <Text variant="bodySmall" style={styles.metadataValue}>
                        {formatDate(item.submitted_at)}
                      </Text>
                    </View>

                    {item.reviewed_at && (
                      <View style={styles.metadataRow}>
                        <Text variant="bodySmall" style={styles.metadataLabel}>
                          Reviewed:
                        </Text>
                        <Text variant="bodySmall" style={styles.metadataValue}>
                          {formatDate(item.reviewed_at)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {item.sponsor_comments && item.sponsor_comments.length > 0 && (
                    <View style={styles.commentsIndicator}>
                      <Text variant="bodySmall" style={styles.commentsText}>
                        💬 {item.sponsor_comments.length}{' '}
                        {item.sponsor_comments.length === 1 ? 'comment' : 'comments'}
                      </Text>
                    </View>
                  )}

                  <Text variant="bodySmall" style={styles.viewPrompt}>
                    Tap to view details →
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
    padding: 20,
  },
  emptyText: {
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: theme.colors.onSurfaceVariant,
  },
  listContent: {
    padding: 16,
  },
  historyCard: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    fontWeight: 'bold',
    color: '#333',
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    color: theme.colors.onPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  stepTitle: {
    marginBottom: 12,
    lineHeight: 20,
  },
  metadata: {
    marginBottom: 12,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metadataLabel: {
    color: theme.colors.onSurfaceVariant,
    fontWeight: '600',
  },
  metadataValue: {
    color: '#333',
  },
  commentsIndicator: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    marginBottom: 8,
  },
  commentsText: {
    color: '#1976D2',
    fontWeight: '600',
  },
  viewPrompt: {
    color: '#2196F3',
    textAlign: 'right',
    marginTop: 8,
  },
});

export default StepWorkHistoryScreen;
