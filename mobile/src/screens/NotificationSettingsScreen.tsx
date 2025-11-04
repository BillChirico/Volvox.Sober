/**
 * Notification Settings Screen (T142)
 *
 * Allows users to manage notification preferences by category
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Switch, List, Divider, ActivityIndicator, useTheme } from 'react-native-paper';
import { supabase } from '../services/supabase';

interface NotificationPreferences {
  newmessage: boolean;
  connectionrequest: boolean;
  checkinreminder: boolean;
  milestoneachieved: boolean;
  stepworkcomment: boolean;
  stepworksubmitted: boolean;
  stepworkreviewed: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  newmessage: true,
  connectionrequest: true,
  checkinreminder: true,
  milestoneachieved: true,
  stepworkcomment: true,
  stepworksubmitted: true,
  stepworkreviewed: true,
};

export const NotificationSettingsScreen: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Error', 'Not authenticated');
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('notification_preferences')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data?.notification_preferences) {
        setPreferences({ ...DEFAULT_PREFERENCES, ...data.notification_preferences });
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
      Alert.alert('Error', 'Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    try {
      setSaving(true);

      const updatedPreferences = { ...preferences, [key]: value };
      setPreferences(updatedPreferences);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('users')
        .update({ notification_preferences: updatedPreferences })
        .eq('id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update preference:', error);
      Alert.alert('Error', 'Failed to update notification setting');
      // Revert the change
      setPreferences(prev => ({ ...prev, [key]: !value }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.title}>
          Notification Preferences
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Choose which notifications you want to receive
        </Text>
      </View>

      {/* Messaging Notifications */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Messaging
        </Text>

        <List.Item
          title="New Messages"
          description="Receive notifications when someone sends you a message"
          left={() => <List.Icon icon="message-text" />}
          right={() => (
            <Switch
              value={preferences.newmessage}
              onValueChange={(value) => updatePreference('newmessage', value)}
              disabled={saving}
            />
          )}
        />
      </View>

      <Divider />

      {/* Connection Notifications */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Connections
        </Text>

        <List.Item
          title="Connection Requests"
          description="Receive notifications for new connection requests"
          left={() => <List.Icon icon="account-multiple-plus" />}
          right={() => (
            <Switch
              value={preferences.connectionrequest}
              onValueChange={(value) => updatePreference('connectionrequest', value)}
              disabled={saving}
            />
          )}
        />
      </View>

      <Divider />

      {/* Check-in Notifications */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Check-Ins
        </Text>

        <List.Item
          title="Check-In Reminders"
          description="Receive reminders for scheduled check-ins"
          left={() => <List.Icon icon="calendar-check" />}
          right={() => (
            <Switch
              value={preferences.checkinreminder}
              onValueChange={(value) => updatePreference('checkinreminder', value)}
              disabled={saving}
            />
          )}
        />
      </View>

      <Divider />

      {/* Milestone Notifications */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Sobriety Milestones
        </Text>

        <List.Item
          title="Milestone Achievements"
          description="Receive congratulations for reaching sobriety milestones"
          left={() => <List.Icon icon="trophy" />}
          right={() => (
            <Switch
              value={preferences.milestoneachieved}
              onValueChange={(value) => updatePreference('milestoneachieved', value)}
              disabled={saving}
            />
          )}
        />
      </View>

      <Divider />

      {/* Step Work Notifications */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          12-Step Program
        </Text>

        <List.Item
          title="Step Work Comments"
          description="Receive notifications when your sponsor comments on your step work"
          left={() => <List.Icon icon="comment" />}
          right={() => (
            <Switch
              value={preferences.stepworkcomment}
              onValueChange={(value) => updatePreference('stepworkcomment', value)}
              disabled={saving}
            />
          )}
        />

        <List.Item
          title="Step Work Submissions"
          description="Receive notifications when a sponsee submits step work (sponsors only)"
          left={() => <List.Icon icon="file-upload" />}
          right={() => (
            <Switch
              value={preferences.stepworksubmitted}
              onValueChange={(value) => updatePreference('stepworksubmitted', value)}
              disabled={saving}
            />
          )}
        />

        <List.Item
          title="Step Work Reviews"
          description="Receive notifications when your step work is reviewed"
          left={() => <List.Icon icon="check-circle" />}
          right={() => (
            <Switch
              value={preferences.stepworkreviewed}
              onValueChange={(value) => updatePreference('stepworkreviewed', value)}
              disabled={saving}
            />
          )}
        />
      </View>

      {/* Help Text */}
      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.helpText}>
          You can change these preferences at any time. Some notifications may still appear
          in-app even if push notifications are disabled.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    lineHeight: 20,
  },
  section: {
    backgroundColor: 'white',
    paddingVertical: 12,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontWeight: '600',
    color: '#333',
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 16,
  },
  helpText: {
    color: '#666',
    lineHeight: 18,
    textAlign: 'center',
  },
});
