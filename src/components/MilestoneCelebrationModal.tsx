/**
 * Milestone Celebration Modal
 * WP06: T095 - Modal that displays when user achieves a milestone
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Text, Button, Card, useTheme } from 'react-native-paper';
import { MILESTONE_DISPLAY_TEXT, MILESTONE_THRESHOLDS } from '@volvox-sober/shared/types/src/sobriety';
import type { MilestoneType } from '@volvox-sober/shared/types/src/sobriety';

interface MilestoneCelebrationModalProps {
  visible: boolean;
  milestone: MilestoneType;
  currentDays: number;
  onDismiss: () => void;
  onShare?: () => void;
}

export const MilestoneCelebrationModal: React.FC<MilestoneCelebrationModalProps> = ({
  visible,
  milestone,
  currentDays,
  onDismiss,
  onShare,
}) => {
  const theme = useTheme();

  const getMilestoneEmoji = (milestoneType: MilestoneType): string => {
    switch (milestoneType) {
      case '30_days':
        return '🎉';
      case '60_days':
        return '💪';
      case '90_days':
        return '⭐';
      case '180_days':
        return '🎊';
      case '1_year':
        return '🏆';
      default:
        return '🎉';
    }
  };

  const getMilestoneMessage = (milestoneType: MilestoneType): string => {
    switch (milestoneType) {
      case '30_days':
        return "You've completed your first month! This is a significant achievement in your recovery journey.";
      case '60_days':
        return "Two months of strength and perseverance! You're building powerful momentum.";
      case '90_days':
        return "Three months is a major milestone! You've proven your commitment to recovery.";
      case '180_days':
        return 'Half a year of sobriety! Your dedication and hard work are truly inspiring.';
      case '1_year':
        return 'One year of recovery! This is a monumental achievement. Celebrate this victory!';
      default:
        return 'Congratulations on reaching this milestone!';
    }
  };

  const milestoneThreshold = MILESTONE_THRESHOLDS[milestone];
  const displayText = MILESTONE_DISPLAY_TEXT[milestone];
  const emoji = getMilestoneEmoji(milestone);
  const message = getMilestoneMessage(milestone);

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.emojiContainer}>
              <Text style={styles.emoji}>{emoji}</Text>
            </View>

            <Text variant="headlineMedium" style={styles.title}>
              Congratulations!
            </Text>

            <Text variant="titleLarge" style={styles.milestoneTitle}>
              {displayText}
            </Text>

            <View style={styles.daysContainer}>
              <Text variant="displayMedium" style={styles.daysNumber}>
                {currentDays}
              </Text>
              <Text variant="titleMedium" style={styles.daysLabel}>
                {currentDays === 1 ? 'Day' : 'Days'} Sober
              </Text>
            </View>

            <Text variant="bodyLarge" style={styles.message}>
              {message}
            </Text>

            <Card style={styles.encouragementCard}>
              <Card.Content>
                <Text variant="bodyMedium" style={styles.encouragement}>
                  "Recovery is not a race. You don't have to feel guilty if it takes you longer than
                  you thought it would. Keep going, you're doing great."
                </Text>
              </Card.Content>
            </Card>

            <View style={styles.actions}>
              {onShare && (
                <Button
                  mode="contained"
                  onPress={onShare}
                  style={styles.shareButton}
                  icon="share-variant">
                  Share with Sponsor
                </Button>
              )}

              <Button mode="outlined" onPress={onDismiss} style={styles.closeButton}>
                Close
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    padding: 20,
  },
  card: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  emojiContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  emoji: {
    fontSize: 80,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  milestoneTitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#1976d2',
  },
  daysContainer: {
    alignItems: 'center',
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
  },
  daysNumber: {
    fontWeight: 'bold',
    color: '#1976d2',
  },
  daysLabel: {
    marginTop: 4,
    color: '#1976d2',
  },
  message: {
    textAlign: 'center',
    marginVertical: 16,
    lineHeight: 24,
  },
  encouragementCard: {
    marginVertical: 16,
    backgroundColor: '#fff3e0',
  },
  encouragement: {
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    marginTop: 16,
  },
  shareButton: {
    marginBottom: 12,
  },
  closeButton: {
    marginBottom: 8,
  },
});
