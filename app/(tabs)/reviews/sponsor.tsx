/**
 * Sponsor Review Screen - View and comment on sponsee step work (T105)
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import {
  Text,
  Card,
  TextInput,
  Button,
  ActivityIndicator,
  Divider,
  useTheme,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  useGetStepWorkQuery,
  useGetAllStepsQuery,
  useAddSponsorCommentMutation,
  useMarkAsReviewedMutation,
  StepWorkResponse,
  SponsorComment,
} from '../../../src/services/stepsApi';

export const SponsorReviewScreen: React.FC = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const params = useLocalSearchParams<{ stepWorkId: string; sponseeId: string }>();
  const router = useRouter();
  const { stepWorkId, sponseeId: _sponseeId } = params;

  const { data: steps } = useGetAllStepsQuery();
  const { data: stepWork, isLoading: workLoading } = useGetStepWorkQuery(stepWorkId);
  const [addComment, { isLoading: isAddingComment }] = useAddSponsorCommentMutation();
  const [markAsReviewed, { isLoading: isMarking }] = useMarkAsReviewedMutation();

  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});

  const step = steps?.find((s) => s.id === stepWork?.step_id);

  const handleAddComment = async (questionId: number) => {
    const commentText = commentInputs[questionId]?.trim();
    if (!commentText) {
      return;
    }

    try {
      await addComment({
        stepWorkId,
        questionId,
        commentText,
      }).unwrap();

      // Clear input after successful comment
      setCommentInputs((prev) => ({ ...prev, [questionId]: '' }));

      Alert.alert('Comment Added', 'Your comment has been saved.', [{ text: 'OK' }]);
    } catch (_error) {
      Alert.alert('Failed to Add Comment', 'Please try again later.', [{ text: 'OK' }]);
    }
  };

  const handleMarkAsReviewed = () => {
    Alert.alert(
      'Mark as Reviewed',
      'Are you sure you want to mark this step work as reviewed? This will notify the sponsee.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Reviewed',
          onPress: async () => {
            try {
              await markAsReviewed({ stepWorkId }).unwrap();

              Alert.alert(
                'Step Work Reviewed',
                'This step work has been marked as reviewed and the sponsee has been notified.',
                [
                  {
                    text: 'OK',
                    onPress: () => router.back(),
                  },
                ]
              );
            } catch (_error) {
              Alert.alert('Failed to Mark as Reviewed', 'Please try again later.', [
                { text: 'OK' },
              ]);
            }
          },
        },
      ]
    );
  };

  const getCommentsForQuestion = (questionId: number): SponsorComment[] => {
    if (!stepWork?.sponsor_comments) {
      return [];
    }
    return stepWork.sponsor_comments.filter((c) => c.question_id === questionId);
  };

  if (workLoading || !stepWork || !step) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const isReviewed = stepWork.status === 'reviewed';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.title}>
          Step {step.step_number}: {step.step_title}
        </Text>
        <Text variant="bodySmall" style={styles.metadata}>
          Submitted:{' '}
          {stepWork.submitted_at
            ? new Date(stepWork.submitted_at).toLocaleDateString()
            : 'N/A'}
        </Text>
        {stepWork.reviewed_at && (
          <Text variant="bodySmall" style={styles.metadata}>
            Reviewed: {new Date(stepWork.reviewed_at).toLocaleDateString()}
          </Text>
        )}
      </View>

      {/* Responses */}
      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContainer}>
        {stepWork.responses?.map((response: StepWorkResponse) => {
          const comments = getCommentsForQuestion(response.question_id);

          return (
            <Card key={response.question_id} style={styles.questionCard}>
              <Card.Content>
                {/* Question */}
                <Text variant="titleMedium" style={styles.questionText}>
                  {response.question_text}
                </Text>

                {/* Answer */}
                <View style={styles.answerContainer}>
                  <Text variant="bodyMedium" style={styles.answerText}>
                    {response.answer_text}
                  </Text>
                </View>

                <Divider style={styles.divider} />

                {/* Existing Comments */}
                {comments.length > 0 && (
                  <View style={styles.commentsSection}>
                    <Text variant="labelLarge" style={styles.commentsLabel}>
                      Your Comments:
                    </Text>
                    {comments.map((comment, index) => (
                      <View key={index} style={styles.commentItem}>
                        <Text variant="bodySmall" style={styles.commentTimestamp}>
                          {new Date(comment.timestamp).toLocaleDateString()} at{' '}
                          {new Date(comment.timestamp).toLocaleTimeString()}
                        </Text>
                        <Text variant="bodyMedium" style={styles.commentText}>
                          {comment.text}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Add Comment Input */}
                {!isReviewed && (
                  <View style={styles.commentInputContainer}>
                    <TextInput
                      mode="outlined"
                      multiline
                      numberOfLines={3}
                      value={commentInputs[response.question_id] || ''}
                      onChangeText={(text) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [response.question_id]: text,
                        }))
                      }
                      placeholder="Add your feedback or guidance..."
                      style={styles.commentInput}
                    />
                    <Button
                      mode="contained"
                      onPress={() => handleAddComment(response.question_id)}
                      loading={isAddingComment}
                      disabled={
                        isAddingComment || !commentInputs[response.question_id]?.trim()
                      }
                      style={styles.commentButton}
                    >
                      Add Comment
                    </Button>
                  </View>
                )}
              </Card.Content>
            </Card>
          );
        })}
      </ScrollView>

      {/* Actions */}
      {!isReviewed && (
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleMarkAsReviewed}
            loading={isMarking}
            disabled={isAddingComment || isMarking}
            style={styles.actionButton}
          >
            Mark as Reviewed
          </Button>
        </View>
      )}

      {isReviewed && (
        <View style={styles.reviewedBanner}>
          <Text style={styles.reviewedText}>✓ Reviewed on {new Date(stepWork.reviewed_at!).toLocaleDateString()}</Text>
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
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  metadata: {
    color: theme.colors.onSurfaceVariant,
    marginTop: 4,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
  },
  questionCard: {
    marginBottom: 16,
    elevation: 2,
  },
  questionText: {
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 22,
  },
  answerContainer: {
    backgroundColor: theme.colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  answerText: {
    lineHeight: 20,
  },
  divider: {
    marginVertical: 12,
  },
  commentsSection: {
    marginBottom: 12,
  },
  commentsLabel: {
    marginBottom: 8,
    color: theme.colors.onSurfaceVariant,
  },
  commentItem: {
    marginBottom: 12,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  commentTimestamp: {
    color: '#999',
    marginBottom: 4,
  },
  commentText: {
    lineHeight: 20,
  },
  commentInputContainer: {
    marginTop: 8,
  },
  commentInput: {
    marginBottom: 8,
  },
  commentButton: {
    alignSelf: 'flex-end',
  },
  actions: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    width: '100%',
  },
  reviewedBanner: {
    padding: 16,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
  },
  reviewedText: {
    color: '#2E7D32',
    fontWeight: '600',
  },
});

export default SponsorReviewScreen;
