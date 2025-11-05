/**
 * CheckInResponseScreen
 * Sponsee interface for responding to check-in questions
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  getCheckInById,
  submitCheckInResponse,
  getCheckInResponses,
} from '../services/checkInService';
import { QuestionResponseInput } from '../components/QuestionResponseInput';
import type { CheckIn, CheckInResponse } from '../types';

interface CheckInResponseScreenProps {
  checkInId: string;
  onSubmitSuccess?: () => void;
  onCancel?: () => void;
}

export const CheckInResponseScreen: React.FC<CheckInResponseScreenProps> = ({
  checkInId,
  onSubmitSuccess,
  onCancel,
}) => {
  // Check-in data
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  // Form state
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Response history
  const [recentResponses, setRecentResponses] = useState<CheckInResponse[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load check-in data
  useEffect(() => {
    const loadCheckIn = async () => {
      try {
        setLoading(true);
        setError(undefined);
        const data = await getCheckInById(checkInId);
        setCheckIn(data);

        // Initialize answers object
        const initialAnswers: Record<string, string> = {};
        data.questions.forEach(q => {
          initialAnswers[q] = '';
        });
        setAnswers(initialAnswers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load check-in');
        console.error('Failed to load check-in:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCheckIn();
  }, [checkInId]);

  // Load recent responses for history view
  const loadRecentResponses = useCallback(async () => {
    try {
      const result = await getCheckInResponses(checkInId, 5, 0);
      setRecentResponses(result.data);
    } catch (err) {
      console.error('Failed to load response history:', err);
    }
  }, [checkInId]);

  useEffect(() => {
    if (showHistory) {
      loadRecentResponses();
    }
  }, [showHistory, loadRecentResponses]);

  // Handle answer change
  const handleAnswerChange = (question: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [question]: answer }));
  };

  // Validate form
  const isFormValid = (): boolean => {
    if (!checkIn) return false;

    // Check if all questions have non-empty answers
    const unansweredQuestions = checkIn.questions.filter(
      q => !answers[q] || answers[q].trim().length === 0,
    );

    return unansweredQuestions.length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!isFormValid()) {
      Alert.alert('Incomplete Response', 'Please answer all questions before submitting.');
      return;
    }

    Alert.alert('Submit Check-In', 'Are you ready to submit your check-in response?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Submit',
        onPress: async () => {
          try {
            setSubmitting(true);
            await submitCheckInResponse(checkInId, answers);
            Alert.alert('Success', 'Your check-in has been submitted successfully!', [
              { text: 'OK', onPress: onSubmitSuccess },
            ]);
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to submit response';
            Alert.alert('Error', errorMessage);
            console.error('Failed to submit check-in:', err);
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading check-in...</Text>
      </View>
    );
  }

  if (error || !checkIn) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Check-in not found'}</Text>
        {onCancel && (
          <TouchableOpacity style={styles.button} onPress={onCancel}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Daily Check-In</Text>
          <Text style={styles.subtitle}>
            {checkIn.recurrence.charAt(0).toUpperCase() + checkIn.recurrence.slice(1)} check-in
          </Text>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(Object.values(answers).filter(a => a.trim().length > 0).length / checkIn.questions.length) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Object.values(answers).filter(a => a.trim().length > 0).length} of{' '}
            {checkIn.questions.length} answered
          </Text>
        </View>

        {/* Questions */}
        <View style={styles.questionsSection}>
          {checkIn.questions.map((question, index) => (
            <QuestionResponseInput
              key={index}
              questionNumber={index + 1}
              question={question}
              answer={answers[question] || ''}
              onAnswerChange={answer => handleAnswerChange(question, answer)}
            />
          ))}
        </View>

        {/* History Toggle */}
        <TouchableOpacity style={styles.historyToggle} onPress={() => setShowHistory(!showHistory)}>
          <Text style={styles.historyToggleText}>
            {showHistory ? 'Hide' : 'View'} Previous Responses
          </Text>
          <Text style={styles.historyChevron}>{showHistory ? '▼' : '▶'}</Text>
        </TouchableOpacity>

        {/* History Section */}
        {showHistory && recentResponses.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historySectionTitle}>Recent Check-Ins</Text>
            {recentResponses.map(response => (
              <View key={response.id} style={styles.historyItem}>
                <View style={styles.historyItemHeader}>
                  <Text style={styles.historyItemDate}>
                    {formatDate(response.completed_at || response.scheduled_for)}
                  </Text>
                  <View
                    style={[
                      styles.historyItemStatus,
                      response.status === 'completed'
                        ? styles.historyItemStatusCompleted
                        : styles.historyItemStatusMissed,
                    ]}>
                    <Text style={styles.historyItemStatusText}>
                      {response.status === 'completed' ? '✓ Completed' : '✗ Missed'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {onCancel && (
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={onCancel}
              disabled={submitting}>
              <Text style={styles.buttonSecondaryText}>Cancel</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary, !isFormValid() && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!isFormValid() || submitting}>
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonPrimaryText}>Submit Check-In</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ============================================================
// Styles
// ============================================================

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    scrollContainer: {
      flex: 1,
    },
    content: {
      padding: 20,
      paddingBottom: 40,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: theme.colors.surface,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
    },
    progressContainer: {
      marginBottom: 32,
    },
    progressBar: {
      height: 8,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 8,
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 4,
    },
    progressText: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
    },
    questionsSection: {
      marginBottom: 32,
    },
    historyToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      marginBottom: 16,
    },
    historyToggleText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#007AFF',
    },
    historyChevron: {
      fontSize: 12,
      color: '#007AFF',
    },
    historySection: {
      marginBottom: 32,
    },
    historySectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 12,
    },
    historyItem: {
      padding: 16,
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      marginBottom: 8,
    },
    historyItemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    historyItemDate: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    historyItemStatus: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    historyItemStatusCompleted: {
      backgroundColor: '#34C759',
    },
    historyItemStatusMissed: {
      backgroundColor: '#FF3B30',
    },
    historyItemStatusText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.onPrimary,
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
    },
    button: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 52,
    },
    buttonPrimary: {
      backgroundColor: theme.colors.primary,
    },
    buttonSecondary: {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: '#E5E5E5',
    },
    buttonDisabled: {
      backgroundColor: '#8E8E93',
      opacity: 0.5,
    },
    buttonPrimaryText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onPrimary,
    },
    buttonSecondaryText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#007AFF',
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
    },
    errorText: {
      fontSize: 16,
      color: '#FF3B30',
      textAlign: 'center',
      marginBottom: 20,
    },
  });
