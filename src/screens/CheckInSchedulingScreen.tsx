/**
 * CheckInSchedulingScreen
 * Sponsor-only screen for creating and managing check-in schedules
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
  Switch,
} from 'react-native';
import {
  createCheckIn,
  updateCheckIn,
  getCheckInsForConnection,
  deleteCheckIn,
  toggleCheckInStatus,
  isUserSponsor,
} from '../services/checkInService';
import { RecurrenceSelector } from '../components/RecurrenceSelector';
import { TimePickerInput } from '../components/TimePickerInput';
import { QuestionBuilder } from '../components/QuestionBuilder';
import type { CheckIn } from '../types';

interface CheckInSchedulingScreenProps {
  connectionId: string;
  partnerName: string;
  onSave?: () => void;
  onCancel?: () => void;
}

export const CheckInSchedulingScreen: React.FC<CheckInSchedulingScreenProps> = ({
  connectionId,
  partnerName,
  onSave,
  onCancel,
}) => {
  // Form state
  const [recurrence, setRecurrence] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [customIntervalDays, setCustomIntervalDays] = useState(7);
  const [scheduledTime, setScheduledTime] = useState('09:00'); // Default 9:00 AM
  const [timezone, setTimezone] = useState('America/New_York'); // TODO: Get from device
  const [questions, setQuestions] = useState<string[]>(['How are you feeling today?']);

  // Existing check-ins
  const [existingCheckIns, setExistingCheckIns] = useState<CheckIn[]>([]);
  const [editingCheckInId, setEditingCheckInId] = useState<string | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingCheckIns, setLoadingCheckIns] = useState(true);
  const [isSponsor, setIsSponsor] = useState(false);
  const [error, setError] = useState<string>();

  // Check sponsor permission
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const sponsor = await isUserSponsor(connectionId);
        setIsSponsor(sponsor);
        if (!sponsor) {
          setError('Only sponsors can manage check-in schedules');
        }
      } catch (err) {
        setError('Failed to verify permissions');
      }
    };
    checkPermission();
  }, [connectionId]);

  // Load existing check-ins
  const loadCheckIns = useCallback(async () => {
    try {
      setLoadingCheckIns(true);
      const checkIns = await getCheckInsForConnection(connectionId);
      setExistingCheckIns(checkIns);
    } catch (err) {
      console.error('Failed to load check-ins:', err);
    } finally {
      setLoadingCheckIns(false);
    }
  }, [connectionId]);

  useEffect(() => {
    loadCheckIns();
  }, [loadCheckIns]);

  // Validate form
  const isFormValid = (): boolean => {
    if (questions.length === 0) {
      Alert.alert('Invalid Form', 'At least one question is required');
      return false;
    }

    const hasEmptyQuestions = questions.some(q => q.trim().length === 0);
    if (hasEmptyQuestions) {
      Alert.alert('Invalid Form', 'All questions must have text');
      return false;
    }

    return true;
  };

  // Handle save
  const handleSave = async () => {
    if (!isFormValid()) return;

    try {
      setLoading(true);
      setError(undefined);

      if (editingCheckInId) {
        // Update existing check-in
        await updateCheckIn(editingCheckInId, {
          recurrence,
          scheduledTime,
          timezone,
          questions,
          customIntervalDays: recurrence === 'custom' ? customIntervalDays : undefined,
        });
        Alert.alert('Success', 'Check-in schedule updated successfully');
      } else {
        // Create new check-in
        await createCheckIn(
          connectionId,
          recurrence,
          scheduledTime,
          timezone,
          questions,
          recurrence === 'custom' ? customIntervalDays : undefined,
        );
        Alert.alert('Success', 'Check-in schedule created successfully');
      }

      // Reload check-ins
      await loadCheckIns();

      // Reset form
      setEditingCheckInId(null);
      setRecurrence('daily');
      setCustomIntervalDays(7);
      setScheduledTime('09:00');
      setQuestions(['How are you feeling today?']);

      onSave?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save check-in');
      Alert.alert('Error', error || 'Failed to save check-in schedule');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (checkIn: CheckIn) => {
    setEditingCheckInId(checkIn.id);
    setRecurrence(checkIn.recurrence as 'daily' | 'weekly' | 'custom');
    setCustomIntervalDays(checkIn.custom_interval_days || 7);
    setScheduledTime(checkIn.scheduled_time);
    setTimezone(checkIn.timezone);
    setQuestions(checkIn.questions);
  };

  // Handle delete
  const handleDelete = (checkInId: string) => {
    Alert.alert('Delete Check-In', 'Are you sure you want to delete this check-in schedule?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCheckIn(checkInId);
            await loadCheckIns();
            Alert.alert('Success', 'Check-in schedule deleted');
          } catch (err) {
            Alert.alert('Error', 'Failed to delete check-in schedule');
          }
        },
      },
    ]);
  };

  // Handle toggle active status
  const handleToggleStatus = async (checkInId: string, isActive: boolean) => {
    try {
      await toggleCheckInStatus(checkInId, !isActive);
      await loadCheckIns();
    } catch (err) {
      Alert.alert('Error', 'Failed to update check-in status');
    }
  };

  // Handle recurrence change
  const handleRecurrenceChange = (
    newRecurrence: 'daily' | 'weekly' | 'custom',
    customDays?: number,
  ) => {
    setRecurrence(newRecurrence);
    if (customDays !== undefined) {
      setCustomIntervalDays(customDays);
    }
  };

  if (!isSponsor && error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{editingCheckInId ? 'Edit' : 'Create'} Check-In Schedule</Text>
        <Text style={styles.subtitle}>for {partnerName}</Text>
      </View>

      {/* Existing Check-Ins */}
      {!loadingCheckIns && existingCheckIns.length > 0 && (
        <View style={styles.existingSection}>
          <Text style={styles.sectionTitle}>Existing Check-Ins</Text>
          {existingCheckIns.map(checkIn => (
            <View key={checkIn.id} style={styles.existingCheckIn}>
              <View style={styles.existingCheckInHeader}>
                <View style={styles.existingCheckInInfo}>
                  <Text style={styles.existingCheckInRecurrence}>
                    {checkIn.recurrence.charAt(0).toUpperCase() + checkIn.recurrence.slice(1)}
                  </Text>
                  <Text style={styles.existingCheckInTime}>{checkIn.scheduled_time}</Text>
                </View>
                <Switch
                  value={checkIn.is_active}
                  onValueChange={() => handleToggleStatus(checkIn.id, checkIn.is_active)}
                />
              </View>
              <Text style={styles.existingCheckInQuestions}>
                {checkIn.questions.length}{' '}
                {checkIn.questions.length === 1 ? 'question' : 'questions'}
              </Text>
              <View style={styles.existingCheckInActions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(checkIn)}>
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonDelete]}
                  onPress={() => handleDelete(checkIn.id)}>
                  <Text style={[styles.actionButtonText, styles.actionButtonDeleteText]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Form */}
      <View style={styles.form}>
        <RecurrenceSelector
          recurrence={recurrence}
          customIntervalDays={customIntervalDays}
          onChange={handleRecurrenceChange}
        />

        <TimePickerInput time={scheduledTime} timezone={timezone} onChange={setScheduledTime} />

        <QuestionBuilder questions={questions} onChange={setQuestions} />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {onCancel && (
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={onCancel}
            disabled={loading}>
            <Text style={styles.buttonSecondaryText}>Cancel</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={handleSave}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonPrimaryText}>
              {editingCheckInId ? 'Update' : 'Create'} Check-In
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    content: {
      padding: 20,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
    },
    existingSection: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 12,
    },
    existingCheckIn: {
      padding: 16,
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      marginBottom: 12,
    },
    existingCheckInHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    existingCheckInInfo: {
      flex: 1,
    },
    existingCheckInRecurrence: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 4,
    },
    existingCheckInTime: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    existingCheckInQuestions: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 12,
    },
    existingCheckInActions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      flex: 1,
      padding: 12,
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      alignItems: 'center',
    },
    actionButtonDelete: {
      backgroundColor: '#FF3B30',
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onPrimary,
    },
    actionButtonDeleteText: {
      color: theme.colors.onPrimary,
    },
    form: {
      marginBottom: 24,
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 40,
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
    errorText: {
      fontSize: 16,
      color: '#FF3B30',
      textAlign: 'center',
    },
  });
