/**
 * Set Sobriety Date Screen
 * WP06: T092 - Date picker for setting/updating sobriety start date
 */

import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  useTheme,
  HelperText,
} from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSetSobrietyDateMutation } from '../../../src/store/api/sobrietyApi';

export const SetSobrietyDateScreen = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const params = useLocalSearchParams<{ sobrietyData?: string }>();
  const [setSobrietyDate, { isLoading }] = useSetSobrietyDateMutation();

  const existingData = params?.sobrietyData ? JSON.parse(params.sobrietyData) : null;
  const [startDate, setStartDate] = useState<Date>(
    existingData?.start_date ? new Date(existingData.start_date) : new Date()
  );
  const [substanceType, setSubstanceType] = useState(
    existingData?.substance_type || ''
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState('');

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const now = new Date();
      if (selectedDate > now) {
        setError('Sobriety date cannot be in the future');
        return;
      }
      setStartDate(selectedDate);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!substanceType.trim()) {
      setError('Please enter a substance type');
      return;
    }

    const now = new Date();
    if (startDate > now) {
      setError('Sobriety date cannot be in the future');
      return;
    }

    try {
      await setSobrietyDate({
        substance_type: substanceType.trim(),
        start_date: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
      }).unwrap();

      router.push('/(tabs)/sobriety');
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to set sobriety date');
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            {existingData ? 'Update Sobriety Date' : 'Set Your Sobriety Date'}
          </Text>

          <Text variant="bodyMedium" style={styles.description}>
            {existingData
              ? 'Update your sobriety journey details below.'
              : 'Begin tracking your recovery journey by setting your sobriety start date.'}
          </Text>

          <TextInput
            label="Substance Type *"
            value={substanceType}
            onChangeText={(text) => {
              setSubstanceType(text);
              setError('');
            }}
            mode="outlined"
            style={styles.input}
            placeholder="e.g., Alcohol, Nicotine, etc."
            maxLength={100}
          />

          <Text variant="labelLarge" style={styles.dateLabel}>
            Sobriety Start Date *
          </Text>

          <Button
            mode="outlined"
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
            icon="calendar"
          >
            {startDate.toLocaleDateString()}
          </Button>

          {showDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          <HelperText type="info" visible={true} style={styles.helperText}>
            * Date cannot be in the future
          </HelperText>

          {error ? (
            <HelperText type="error" visible={true}>
              {error}
            </HelperText>
          ) : null}

          <Card style={styles.confirmationCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.confirmationTitle}>
                Your sobriety journey {existingData ? 'will be updated to' : 'starts'}:
              </Text>
              <Text variant="bodyLarge" style={styles.confirmationDate}>
                {startDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              {substanceType.trim() && (
                <Text variant="bodyMedium" style={styles.confirmationSubstance}>
                  Tracking: {substanceType.trim()}
                </Text>
              )}
            </Card.Content>
          </Card>

          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading || !substanceType.trim()}
              style={styles.submitButton}
            >
              {existingData ? 'Update Sobriety Date' : 'Set Sobriety Date'}
            </Button>

            <Button
              mode="text"
              onPress={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

const createStyles = (_theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginTop: 16,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  dateLabel: {
    marginBottom: 8,
  },
  dateButton: {
    marginBottom: 8,
  },
  helperText: {
    marginBottom: 16,
  },
  confirmationCard: {
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: '#f0f8ff',
  },
  confirmationTitle: {
    marginBottom: 8,
  },
  confirmationDate: {
    fontWeight: 'bold',
    color: '#1976d2',
  },
  confirmationSubstance: {
    marginTop: 8,
  },
  actions: {
    marginTop: 8,
  },
  submitButton: {
    marginBottom: 12,
  },
});

export default SetSobrietyDateScreen;
