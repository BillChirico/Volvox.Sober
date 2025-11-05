/**
 * Step Work Form Screen - Dynamic question rendering with auto-save (T103)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Button, ActivityIndicator, useTheme } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import debounce from 'lodash.debounce';
import {
  useGetStepWorkQuery,
  useGetAllStepsQuery,
  useSaveStepWorkMutation,
  useSubmitStepWorkMutation,
  StepWorkResponse,
} from '../services/stepsApi';
import { QuestionRenderer } from '../components/QuestionRenderer';
import { draftManager } from '../utils/draftManager';

interface RouteParams {
  stepId: string;
}

export const StepWorkScreen: React.FC = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const route = useRoute();
  const navigation = useNavigation();
  const { stepId } = route.params as RouteParams;

  const { data: steps } = useGetAllStepsQuery();
  const { data: stepWork, isLoading: workLoading } = useGetStepWorkQuery(stepId);
  const [saveStepWork, { isLoading: isSaving }] = useSaveStepWorkMutation();
  const [submitStepWork, { isLoading: isSubmitting }] = useSubmitStepWorkMutation();

  const step = steps?.find((s) => s.id === stepId);
  const questions = step?.default_questions || [];

  // Local state for responses
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'offline'>('saved');
  const hasUnsavedChanges = useRef(false);

  // Load existing step work or draft on mount
  useEffect(() => {
    const loadInitialData = async () => {
      if (stepWork?.responses) {
        // Load from server
        const responseMap: Record<number, string> = {};
        stepWork.responses.forEach((r) => {
          responseMap[r.question_id] = r.answer_text;
        });
        setResponses(responseMap);
      } else {
        // Load from draft
        const draft = await draftManager.loadDraft(stepId);
        if (draft) {
          setResponses(draft);
        }
      }
    };

    loadInitialData();
  }, [stepId, stepWork]);

  // Auto-save with 30s debounce
  const saveToServer = useCallback(
    async (currentResponses: Record<number, string>) => {
      try {
        setSaveStatus('saving');

        const responsesArray: StepWorkResponse[] = Object.entries(currentResponses).map(
          ([qid, answer]) => {
            const question = questions.find((q) => q.id === parseInt(qid));
            return {
              question_id: parseInt(qid),
              question_text: question?.text || '',
              answer_text: answer,
            };
          }
        );

        await saveStepWork({
          stepId,
          responses: responsesArray,
          status: 'in_progress',
        }).unwrap();

        // Clear draft after successful save
        await draftManager.clearDraft(stepId);
        setSaveStatus('saved');
        hasUnsavedChanges.current = false;
      } catch (error) {
        console.error('Auto-save failed:', error);
        setSaveStatus('offline');
        // Save to draft as fallback
        await draftManager.saveDraft(stepId, currentResponses);
      }
    },
    [stepId, questions, saveStepWork]
  );

  const debouncedSave = useRef(
    debounce((currentResponses: Record<number, string>) => {
      saveToServer(currentResponses);
    }, 30000) // 30 seconds
  ).current;

  // Handle response changes
  const handleResponseChange = useCallback(
    (questionId: number, value: string) => {
      setResponses((prev) => {
        const updated = { ...prev, [questionId]: value };
        hasUnsavedChanges.current = true;
        setSaveStatus('saving');

        // Save to draft immediately
        draftManager.saveDraft(stepId, updated);

        // Trigger debounced server save
        debouncedSave(updated);

        return updated;
      });
    },
    [stepId, debouncedSave]
  );

  // Manual save
  const handleManualSave = async () => {
    debouncedSave.cancel(); // Cancel debounced save
    await saveToServer(responses);
  };

  // Submit for review
  const handleSubmit = async () => {
    // Cancel any pending auto-saves
    debouncedSave.cancel();

    // Validate all questions answered
    const unansweredQuestions = questions.filter((q) => !responses[q.id]?.trim());
    if (unansweredQuestions.length > 0) {
      Alert.alert(
        'Incomplete Step Work',
        'Please answer all questions before submitting for review.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const responsesArray: StepWorkResponse[] = Object.entries(responses).map(
        ([qid, answer]) => {
          const question = questions.find((q) => q.id === parseInt(qid));
          return {
            question_id: parseInt(qid),
            question_text: question?.text || '',
            answer_text: answer,
          };
        }
      );

      await submitStepWork({
        stepId,
        responses: responsesArray,
      }).unwrap();

      // Clear draft after submission
      await draftManager.clearDraft(stepId);

      Alert.alert(
        'Step Work Submitted',
        'Your step work has been submitted to your sponsor for review.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Submission Failed', 'Please try again later.', [{ text: 'OK' }]);
    }
  };

  // Discard draft
  const handleDiscardDraft = () => {
    Alert.alert(
      'Discard Draft',
      'Are you sure you want to discard all unsaved changes?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: async () => {
            await draftManager.clearDraft(stepId);
            setResponses({});
            hasUnsavedChanges.current = false;
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (workLoading || !step) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const isReadOnly = stepWork?.status === 'submitted' || stepWork?.status === 'reviewed';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.title}>
          Step {step.step_number}: {step.step_title}
        </Text>
        <Text variant="bodySmall" style={styles.description}>
          {step.step_description}
        </Text>

        {/* Save status indicator */}
        <View style={styles.statusContainer}>
          <Text
            variant="bodySmall"
            style={[
              styles.statusText,
              saveStatus === 'saved' && styles.statusSaved,
              saveStatus === 'saving' && styles.statusSaving,
              saveStatus === 'offline' && styles.statusOffline,
            ]}
          >
            {saveStatus === 'saved' && '✓ Saved'}
            {saveStatus === 'saving' && '⋯ Saving...'}
            {saveStatus === 'offline' && '⚠ Offline - saved locally'}
          </Text>
        </View>
      </View>

      {/* Questions */}
      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContainer}>
        {questions.map((question) => (
          <QuestionRenderer
            key={question.id}
            question={question}
            value={responses[question.id] || ''}
            onChange={(value) => handleResponseChange(question.id, value)}
          />
        ))}
      </ScrollView>

      {/* Actions */}
      {!isReadOnly && (
        <View style={styles.actions}>
          <Button mode="outlined" onPress={handleDiscardDraft} style={styles.actionButton}>
            Discard Draft
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSaving || isSubmitting}
            style={styles.actionButton}
          >
            Submit for Review
          </Button>
        </View>
      )}

      {isReadOnly && (
        <View style={styles.readOnlyBanner}>
          <Text style={styles.readOnlyText}>
            {stepWork?.status === 'submitted' && 'Submitted - awaiting sponsor review'}
            {stepWork?.status === 'reviewed' && 'Reviewed by sponsor'}
          </Text>
        </View>
      )}
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
  header: {
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  statusContainer: {
    marginTop: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusSaved: {
    color: theme.colors.tertiary, // Green for success
  },
  statusSaving: {
    color: theme.colors.secondary, // Teal for in-progress
  },
  statusOffline: {
    color: theme.colors.error, // Red for offline/error
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
  },
  actionButton: {
    flex: 1,
  },
  readOnlyBanner: {
    padding: 16,
    backgroundColor: theme.colors.primaryContainer,
    alignItems: 'center',
  },
  readOnlyText: {
    color: theme.colors.onPrimaryContainer,
    fontWeight: '600',
  },
});
