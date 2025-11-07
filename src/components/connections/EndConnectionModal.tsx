/**
 * EndConnectionModal Component
 * Modal for ending a connection with optional feedback
 * Feature: 002-app-screens (T102)
 */

import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import {
  Modal,
  Portal,
  Text,
  Button,
  TextInput,
  Divider,
  IconButton,
  Surface,
  RadioButton,
} from 'react-native-paper';
import { useAppTheme } from '../../theme/ThemeContext';

interface EndConnectionModalProps {
  visible: boolean;
  connectionName: string;
  onDismiss: () => void;
  onConfirm: (feedback?: string, reason?: string) => Promise<void>;
  isLoading?: boolean;
}

const END_REASONS = [
  { value: 'completed_program', label: 'Completed program together' },
  { value: 'personal_reasons', label: 'Personal reasons' },
  { value: 'not_compatible', label: 'Not a good match' },
  { value: 'relapse', label: 'Relapse situation' },
  { value: 'other', label: 'Other' },
];

export function EndConnectionModal({
  visible,
  connectionName,
  onDismiss,
  onConfirm,
  isLoading = false,
}: EndConnectionModalProps): JSX.Element {
  const { theme } = useAppTheme();
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  // Reset state when modal closes
  const handleDismiss = () => {
    setSelectedReason('');
    setFeedback('');
    setError('');
    onDismiss();
  };

  // Handle confirmation
  const handleConfirm = async () => {
    // Validate if "other" is selected, feedback is required
    if (selectedReason === 'other' && !feedback.trim()) {
      setError('Please provide a reason when selecting "Other"');
      return;
    }

    try {
      const reasonLabel = END_REASONS.find(r => r.value === selectedReason)?.label;
      const finalFeedback = feedback.trim()
        ? `${reasonLabel ? reasonLabel + ': ' : ''}${feedback.trim()}`
        : reasonLabel || '';

      await onConfirm(finalFeedback, selectedReason);
      handleDismiss();
    } catch (_err) {
      setError('Failed to end connection. Please try again.');
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={[
          styles.modalContent,
          {
            backgroundColor: theme.colors.surface,
            maxHeight: Platform.OS === 'web' ? '90vh' : undefined,
          },
        ]}>
        {/* Close Button */}
        <IconButton
          icon="close"
          size={24}
          onPress={handleDismiss}
          style={styles.closeButton}
          accessibilityLabel="Close modal"
        />

        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            End Connection
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Are you sure you want to end your connection with {connectionName}?
          </Text>
        </View>

        <Divider style={styles.divider} />

        {/* Reason Selection */}
        <Surface style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Reason (Optional)
          </Text>
          <Text
            variant="bodySmall"
            style={[styles.helperText, { color: theme.colors.onSurfaceVariant }]}>
            This information helps us improve the matching experience
          </Text>

          <RadioButton.Group onValueChange={setSelectedReason} value={selectedReason}>
            {END_REASONS.map(reason => (
              <View key={reason.value} style={styles.radioItem}>
                <RadioButton.Item
                  label={reason.label}
                  value={reason.value}
                  position="leading"
                  labelStyle={styles.radioLabel}
                  style={styles.radioButton}
                />
              </View>
            ))}
          </RadioButton.Group>
        </Surface>

        {/* Feedback Input */}
        <Surface style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Additional Feedback (Optional)
          </Text>
          <TextInput
            mode="outlined"
            placeholder="Share any additional thoughts or feedback..."
            value={feedback}
            onChangeText={text => {
              setFeedback(text);
              setError(''); // Clear error when user types
            }}
            multiline
            numberOfLines={4}
            maxLength={500}
            style={styles.textInput}
            error={!!error}
            disabled={isLoading}
            accessibilityLabel="Feedback input"
          />
          {error ? (
            <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
              {error}
            </Text>
          ) : (
            <Text
              variant="bodySmall"
              style={[styles.helperText, { color: theme.colors.onSurfaceVariant }]}>
              {feedback.length}/500 characters
            </Text>
          )}
        </Surface>

        {/* Warning Notice */}
        <Surface style={[styles.warningBox, { backgroundColor: theme.colors.errorContainer }]}>
          <Text variant="bodySmall" style={{ color: theme.colors.onErrorContainer }}>
            ⚠️ This action cannot be undone. Your connection will be moved to "Past Connections" and
            you will no longer be able to send messages.
          </Text>
        </Surface>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={handleDismiss}
            style={styles.button}
            disabled={isLoading}
            accessibilityLabel="Cancel">
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleConfirm}
            style={styles.button}
            buttonColor={theme.colors.error}
            loading={isLoading}
            disabled={isLoading}
            accessibilityLabel="Confirm end connection">
            End Connection
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    marginHorizontal: 20,
    marginVertical: 40,
    borderRadius: 16,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
    ...Platform.select({
      web: {
        overflow: 'auto',
      },
      default: {
        maxHeight: '90%',
      },
    }),
  },
  closeButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    lineHeight: 20,
  },
  divider: {
    marginBottom: 16,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  helperText: {
    marginBottom: 12,
    fontSize: 12,
  },
  radioItem: {
    marginVertical: 0,
  },
  radioButton: {
    paddingVertical: 4,
  },
  radioLabel: {
    fontSize: 15,
  },
  textInput: {
    marginTop: 8,
    minHeight: 100,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
  },
  warningBox: {
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  button: {
    flex: 1,
  },
});
