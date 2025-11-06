/**
 * NotificationSettings Component
 * Manages notification preferences for the user
 * Feature: 002-app-screens (T118)
 */

import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Alert } from 'react-native'
import { Text, ActivityIndicator } from 'react-native-paper'
import { SettingsSection, type SettingsItem } from './SettingsSection'
import { useAppTheme } from '../../theme/ThemeContext'
import supabaseClient from '../../services/supabase'

interface NotificationPreferences {
  id?: string
  user_id: string
  email_notifications: boolean
  push_notifications: boolean
  message_notifications: boolean
  connection_request_notifications: boolean
  milestone_notifications: boolean
  check_in_reminders: boolean
  created_at?: string
  updated_at?: string
}

interface NotificationSettingsProps {
  userId: string
  onPreferencesChange?: (preferences: NotificationPreferences) => void
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  userId,
  onPreferencesChange,
}) => {
  const { theme } = useAppTheme()
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    user_id: userId,
    email_notifications: true,
    push_notifications: true,
    message_notifications: true,
    connection_request_notifications: true,
    milestone_notifications: true,
    check_in_reminders: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch preferences on mount
  useEffect(() => {
    fetchPreferences()
  }, [userId])

  const fetchPreferences = async () => {
    try {
      setIsLoading(true)

      const { data, error } = await supabaseClient
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        throw error
      }

      if (data) {
        setPreferences(data)
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error)
      Alert.alert('Error', 'Failed to load notification preferences')
    } finally {
      setIsLoading(false)
    }
  }

  const updatePreference = async (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    try {
      setIsSaving(true)

      const updatedPreferences = {
        ...preferences,
        [key]: value,
      }

      // Upsert preferences (insert or update)
      const { data, error } = await supabaseClient
        .from('notification_preferences')
        .upsert(
          {
            user_id: userId,
            ...updatedPreferences,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
          }
        )
        .select()
        .single()

      if (error) {
        throw error
      }

      setPreferences(data)

      if (onPreferencesChange) {
        onPreferencesChange(data)
      }
    } catch (error) {
      console.error('Error updating notification preference:', error)
      Alert.alert('Error', 'Failed to update notification preference')
      // Revert on error
      setPreferences((prev) => ({
        ...prev,
        [key]: !value,
      }))
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12, color: theme.colors.onSurfaceVariant }}>
          Loading notification settings...
        </Text>
      </View>
    )
  }

  const generalNotifications: SettingsItem[] = [
    {
      key: 'email_notifications',
      type: 'toggle',
      label: 'Email Notifications',
      description: 'Receive important updates via email',
      icon: 'email-outline',
      value: preferences.email_notifications,
      onValueChange: (value) => updatePreference('email_notifications', value),
      disabled: isSaving,
    },
    {
      key: 'push_notifications',
      type: 'toggle',
      label: 'Push Notifications',
      description: 'Receive push notifications on your device',
      icon: 'cellphone',
      value: preferences.push_notifications,
      onValueChange: (value) => updatePreference('push_notifications', value),
      disabled: isSaving,
    },
  ]

  const activityNotifications: SettingsItem[] = [
    {
      key: 'message_notifications',
      type: 'toggle',
      label: 'Messages',
      description: 'Get notified when you receive new messages',
      icon: 'message-text-outline',
      value: preferences.message_notifications,
      onValueChange: (value) => updatePreference('message_notifications', value),
      disabled: isSaving || !preferences.push_notifications,
    },
    {
      key: 'connection_request_notifications',
      type: 'toggle',
      label: 'Connection Requests',
      description: 'Get notified about new connection requests',
      icon: 'account-multiple-plus-outline',
      value: preferences.connection_request_notifications,
      onValueChange: (value) =>
        updatePreference('connection_request_notifications', value),
      disabled: isSaving || !preferences.push_notifications,
    },
  ]

  const recoveryNotifications: SettingsItem[] = [
    {
      key: 'milestone_notifications',
      type: 'toggle',
      label: 'Milestone Celebrations',
      description: 'Celebrate sobriety milestones (30, 60, 90 days, etc.)',
      icon: 'trophy-outline',
      value: preferences.milestone_notifications,
      onValueChange: (value) => updatePreference('milestone_notifications', value),
      disabled: isSaving || !preferences.push_notifications,
    },
    {
      key: 'check_in_reminders',
      type: 'toggle',
      label: 'Check-In Reminders',
      description: 'Reminders for daily check-ins with connections',
      icon: 'bell-check-outline',
      value: preferences.check_in_reminders,
      onValueChange: (value) => updatePreference('check_in_reminders', value),
      disabled: isSaving || !preferences.push_notifications,
    },
  ]

  return (
    <View style={styles.container}>
      <SettingsSection title="General" items={generalNotifications} />

      <SettingsSection title="Activity" items={activityNotifications} />

      <SettingsSection title="Recovery" items={recoveryNotifications} />

      {!preferences.push_notifications && (
        <Text
          variant="bodySmall"
          style={[styles.disclaimer, { color: theme.colors.onSurfaceVariant }]}
        >
          💡 Enable push notifications to receive activity and recovery alerts
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  disclaimer: {
    textAlign: 'center',
    padding: 16,
    marginTop: 8,
  },
})
