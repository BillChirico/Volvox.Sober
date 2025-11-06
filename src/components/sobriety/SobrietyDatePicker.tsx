/**
 * Sobriety Date Picker Component
 * Modal date picker for setting sobriety start date with validation
 * Feature: 002-app-screens (T079)
 */

import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Modal, Portal, Button, Text } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppTheme } from '../../theme/ThemeContext';
import type { DatePickerEvent } from '../../types/sobriety';

interface SobrietyDatePickerProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: (date: Date) => void;
  initialDate?: Date;
}

export function SobrietyDatePicker({
  visible,
  onDismiss,
  onConfirm,
  initialDate,
}: SobrietyDatePickerProps): JSX.Element {
  const { theme } = useAppTheme();
  const [selectedDate, setSelectedDate] = useState<Date>(
    initialDate || new Date()
  );
  const [error, setError] = useState<string | null>(null);

  const handleDateChange = (event: DatePickerEvent, date?: Date): void => {
    if (event.type === 'dismissed') {
      return;
    }

    if (date) {
      // Validate: no future dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (date > today) {
        setError('Sobriety start date cannot be in the future');
        return;
      }

      // Validate: not before 1900 (reasonable limit)
      const minDate = new Date(1900, 0, 1);
      if (date < minDate) {
        setError('Please select a date after 1900');
        return;
      }

      setError(null);
      setSelectedDate(date);
    }
  };

  const handleConfirm = (): void => {
    if (error) {
      return;
    }

    onConfirm(selectedDate);
    onDismiss();
  };

  const maxDate = new Date(); // Today
  maxDate.setHours(23, 59, 59, 999);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modal,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <Text variant="headlineSmall" style={styles.title}>
          Set Sobriety Start Date
        </Text>

        <Text variant="bodyMedium" style={styles.description}>
          Choose the date you began your sobriety journey. This cannot be a
          future date.
        </Text>

        <View style={styles.datePickerContainer}>
          {Platform.OS === 'web' ? (
            // Web: Use HTML5 date input
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              max={maxDate.toISOString().split('T')[0]}
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                handleDateChange({ type: 'set' }, newDate);
              }}
              style={{
                padding: 12,
                fontSize: 16,
                borderRadius: 8,
                border: `1px solid ${theme.colors.outline}`,
                backgroundColor: theme.colors.background,
                color: theme.colors.onBackground,
              }}
            />
          ) : (
            // iOS/Android: Use native date picker
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
              onChange={handleDateChange}
              maximumDate={maxDate}
              minimumDate={new Date(1900, 0, 1)}
              textColor={theme.colors.onBackground}
              accentColor={theme.colors.primary}
            />
          )}
        </View>

        {error && (
          <Text
            variant="bodySmall"
            style={[styles.error, { color: theme.colors.error }]}
          >
            {error}
          </Text>
        )}

        <View style={styles.actions}>
          <Button mode="text" onPress={onDismiss} style={styles.button}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleConfirm}
            disabled={!!error}
            style={styles.button}
          >
            Confirm
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 20,
    padding: 24,
    borderRadius: 16,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 24,
    opacity: 0.7,
  },
  datePickerContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  error: {
    marginBottom: 16,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    minWidth: 80,
  },
});
