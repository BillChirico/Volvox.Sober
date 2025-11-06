/**
 * Log Relapse Screen
 * WP06: T093 - Form for logging relapse with date, private note, and trigger context
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  useTheme,
  HelperText,
  Menu,
  Divider,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLogRelapseMutation, useGetSobrietyStatsQuery } from '../../../src/store/api/sobrietyApi';
import { TRIGGER_CONTEXT_OPTIONS } from '@volvox-sober/shared/types/src/sobriety';
import type { TriggerContext } from '@volvox-sober/shared/types/src/sobriety';

export const LogRelapseScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { data: stats } = useGetSobrietyStatsQuery();
  const [logRelapse, { isLoading }] = useLogRelapseMutation();

  const [relapseDate, setRelapseDate] = useState<Date>(new Date());
  const [privateNote, setPrivateNote] = useState('');
  const [triggerContext, setTriggerContext] = useState<TriggerContext | ''>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTriggerMenu, setShowTriggerMenu] = useState(false);
  const [error, setError] = useState('');

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const now = new Date();
      if (selectedDate > now) {
        setError('Relapse date cannot be in the future');
        return;
      }
      setRelapseDate(selectedDate);
      setError('');
    }
  };

  const showConfirmation = () => {
    Alert.alert(
      'Confirm Relapse Entry',
      'Are you sure? This will reset your streak and update your sobriety start date to the day after the relapse.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: handleSubmit,
        },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!stats?.id) {
      setError('No active sobriety date found. Please set a sobriety date first.');
      return;
    }

    const now = new Date();
    if (relapseDate > now) {
      setError('Relapse date cannot be in the future');
      return;
    }

    try {
      await logRelapse({
        sobriety_date_id: stats.id,
        relapse_date: relapseDate.toISOString(),
        private_note: privateNote.trim() || undefined,
        trigger_context: triggerContext || undefined,
      }).unwrap();

      Alert.alert(
        'Relapse Logged',
        'Your relapse has been recorded. Remember, recovery is a journey. Keep moving forward.',
        [
          {
            text: 'OK',
            onPress: () => router.push('SobrietyDashboard'),
          },
        ]
      );
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to log relapse');
    }
  };

  const getTriggerLabel = () => {
    if (!triggerContext) return 'Select trigger (optional)';
    const option = TRIGGER_CONTEXT_OPTIONS.find((opt) => opt.value === triggerContext);
    return option?.label || 'Select trigger (optional)';
  };

  if (!stats) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>No active sobriety date found</Text>
        <Text style={styles.errorSubtext}>
          Please set a sobriety date before logging a relapse.
        </Text>
        <Button
          mode="contained"
          onPress={() => router.push('SetSobrietyDate')}
          style={styles.actionButton}
        >
          Set Sobriety Date
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            Log Relapse
          </Text>

          <Text variant="bodyMedium" style={styles.description}>
            Recording relapses helps you identify patterns and triggers in your recovery journey.
          </Text>

          <Card style={styles.privacyCard}>
            <Card.Content>
              <Text variant="labelLarge" style={styles.privacyTitle}>
                🔒 Privacy Notice
              </Text>
              <Text variant="bodySmall" style={styles.privacyText}>
                Your private note is only visible to you. Sponsors and other connected users will
                only see the relapse date and trigger context (if provided).
              </Text>
            </Card.Content>
          </Card>

          <Text variant="labelLarge" style={styles.fieldLabel}>
            Relapse Date *
          </Text>

          <Button
            mode="outlined"
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
            icon="calendar"
          >
            {relapseDate.toLocaleDateString()}
          </Button>

          {showDatePicker && (
            <DateTimePicker
              value={relapseDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          <HelperText type="info" visible={true} style={styles.helperText}>
            Date cannot be in the future
          </HelperText>

          <Text variant="labelLarge" style={styles.fieldLabel}>
            Trigger Context (Optional)
          </Text>

          <Menu
            visible={showTriggerMenu}
            onDismiss={() => setShowTriggerMenu(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setShowTriggerMenu(true)}
                style={styles.menuButton}
                icon="chevron-down"
                contentStyle={styles.menuButtonContent}
              >
                {getTriggerLabel()}
              </Button>
            }
          >
            {TRIGGER_CONTEXT_OPTIONS.map((option) => (
              <Menu.Item
                key={option.value}
                onPress={() => {
                  setTriggerContext(option.value);
                  setShowTriggerMenu(false);
                }}
                title={option.label}
              />
            ))}
            <Divider />
            <Menu.Item
              onPress={() => {
                setTriggerContext('');
                setShowTriggerMenu(false);
              }}
              title="Clear selection"
            />
          </Menu>

          <HelperText type="info" visible={true} style={styles.helperText}>
            Identifying triggers helps recognize patterns in your recovery
          </HelperText>

          <Text variant="labelLarge" style={styles.fieldLabel}>
            Private Note (Optional)
          </Text>

          <TextInput
            label="Your private thoughts"
            value={privateNote}
            onChangeText={setPrivateNote}
            mode="outlined"
            multiline
            numberOfLines={6}
            style={styles.noteInput}
            placeholder="How are you feeling? What led to this moment?"
            maxLength={500}
          />

          <HelperText type="info" visible={true}>
            {privateNote.length}/500 characters
          </HelperText>

          {error ? (
            <HelperText type="error" visible={true}>
              {error}
            </HelperText>
          ) : null}

          <Card style={styles.warningCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.warningTitle}>
                ⚠️ Important
              </Text>
              <Text variant="bodyMedium" style={styles.warningText}>
                Logging this relapse will:
              </Text>
              <Text variant="bodySmall" style={styles.warningBullet}>
                • Reset your current streak to 0 days
              </Text>
              <Text variant="bodySmall" style={styles.warningBullet}>
                • Update your sobriety start date to{' '}
                {new Date(relapseDate.getTime() + 86400000).toLocaleDateString()}
              </Text>
              <Text variant="bodySmall" style={styles.warningBullet}>
                • Add this relapse to your history
              </Text>
            </Card.Content>
          </Card>

          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={showConfirmation}
              loading={isLoading}
              disabled={isLoading}
              style={styles.submitButton}
              buttonColor={theme.colors.error}
            >
              Log Relapse
            </Button>

            <Button mode="text" onPress={() => router.back()} disabled={isLoading}>
              Cancel
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginTop: 16,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
  },
  privacyCard: {
    marginBottom: 24,
    backgroundColor: '#e3f2fd',
  },
  privacyTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  privacyText: {
    lineHeight: 20,
  },
  fieldLabel: {
    marginBottom: 8,
  },
  dateButton: {
    marginBottom: 4,
  },
  menuButton: {
    marginBottom: 4,
  },
  menuButtonContent: {
    flexDirection: 'row-reverse',
  },
  helperText: {
    marginBottom: 16,
  },
  noteInput: {
    marginBottom: 4,
  },
  warningCard: {
    marginTop: 24,
    marginBottom: 24,
    backgroundColor: '#fff3e0',
  },
  warningTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  warningText: {
    marginBottom: 8,
  },
  warningBullet: {
    marginLeft: 8,
    marginVertical: 4,
  },
  actions: {
    marginTop: 8,
  },
  submitButton: {
    marginBottom: 12,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  actionButton: {
    marginTop: 16,
  },
});

export default LogRelapseScreen;
