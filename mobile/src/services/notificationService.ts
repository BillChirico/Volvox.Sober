/**
 * Notification Service
 * Handles push notification registration and FCM token management
 *
 * Note: This is a placeholder implementation. Full FCM integration
 * will be completed in T039 with the Edge Function for sending notifications.
 */

import { Platform } from 'react-native'
import messaging from '@react-native-firebase/messaging'
import { supabase } from './supabase'
import { getCurrentUserId } from './supabase'

// ============================================================
// FCM Token Management
// ============================================================

/**
 * Request notification permissions
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const authStatus = await messaging().requestPermission()
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL

    if (enabled) {
      console.log('Notification permission granted:', authStatus)
    }

    return enabled
  } catch (error) {
    console.error('Failed to request notification permission:', error)
    return false
  }
}

/**
 * Get FCM token for this device
 */
export const getFCMToken = async (): Promise<string | null> => {
  try {
    // Check permission first
    const hasPermission = await messaging().hasPermission()
    if (!hasPermission) {
      const granted = await requestNotificationPermission()
      if (!granted) {
        return null
      }
    }

    // Get token
    const token = await messaging().getToken()
    console.log('FCM Token:', token)
    return token
  } catch (error) {
    console.error('Failed to get FCM token:', error)
    return null
  }
}

/**
 * Store FCM token in user profile for server-side notifications
 */
export const registerFCMToken = async (): Promise<void> => {
  try {
    const token = await getFCMToken()
    if (!token) {
      console.warn('No FCM token available')
      return
    }

    const userId = await getCurrentUserId()

    // Store token in users table
    const { error } = await supabase
      .from('users')
      .update({
        fcm_token: token,
        fcm_token_updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      throw error
    }

    console.log('FCM token registered successfully')
  } catch (error) {
    console.error('Failed to register FCM token:', error)
  }
}

/**
 * Clear FCM token (on logout)
 */
export const clearFCMToken = async (): Promise<void> => {
  try {
    const userId = await getCurrentUserId()

    const { error } = await supabase
      .from('users')
      .update({
        fcm_token: null,
        fcm_token_updated_at: null,
      })
      .eq('id', userId)

    if (error) {
      throw error
    }

    // Delete token from FCM
    await messaging().deleteToken()

    console.log('FCM token cleared successfully')
  } catch (error) {
    console.error('Failed to clear FCM token:', error)
  }
}

// ============================================================
// Notification Handlers
// ============================================================

/**
 * Set up foreground notification handler
 * Called when app is open and notification arrives
 */
export const setupForegroundNotificationHandler = (
  onNotification: (notification: any) => void
) => {
  return messaging().onMessage(async (remoteMessage) => {
    console.log('Foreground notification received:', remoteMessage)
    onNotification(remoteMessage)
  })
}

/**
 * Set up background notification handler
 * Called when app is in background and notification is tapped
 */
export const setupBackgroundNotificationHandler = (
  onNotificationOpen: (notification: any) => void
) => {
  return messaging().onNotificationOpenedApp(async (remoteMessage) => {
    console.log('Background notification opened:', remoteMessage)
    onNotificationOpen(remoteMessage)
  })
}

/**
 * Check if app was opened from a notification (cold start)
 */
export const checkInitialNotification = async (): Promise<any | null> => {
  try {
    const remoteMessage = await messaging().getInitialNotification()
    if (remoteMessage) {
      console.log('App opened from notification:', remoteMessage)
      return remoteMessage
    }
    return null
  } catch (error) {
    console.error('Failed to check initial notification:', error)
    return null
  }
}

/**
 * Set up notification badge count (iOS)
 */
export const setBadgeCount = async (count: number): Promise<void> => {
  if (Platform.OS === 'ios') {
    try {
      await messaging().setApplicationBadge(count)
    } catch (error) {
      console.error('Failed to set badge count:', error)
    }
  }
}

/**
 * Clear all notifications
 */
export const clearAllNotifications = async (): Promise<void> => {
  try {
    if (Platform.OS === 'ios') {
      await messaging().setApplicationBadge(0)
    }
    // Android notification clearing would go here
  } catch (error) {
    console.error('Failed to clear notifications:', error)
  }
}

// ============================================================
// Notification Payload Builders (for Edge Function)
// ============================================================

/**
 * Build notification payload for check-in reminder
 * This structure will be used by the Edge Function in T039
 */
export const buildCheckInNotificationPayload = (
  fcmToken: string,
  checkInId: string,
  sponseeName: string,
  questions: string[]
) => {
  return {
    token: fcmToken,
    notification: {
      title: 'Daily Check-In Reminder',
      body: `Time to complete your check-in with ${questions.length} ${questions.length === 1 ? 'question' : 'questions'}`,
    },
    data: {
      type: 'check-in',
      checkInId,
      deepLink: `volvoxsober://check-in-response?checkInId=${checkInId}`,
    },
    android: {
      priority: 'high',
      notification: {
        channelId: 'check-ins',
        sound: 'default',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
    },
  }
}

/**
 * Build notification payload for missed check-in alert (to sponsor)
 * This structure will be used by the Edge Function in T039
 */
export const buildMissedCheckInNotificationPayload = (
  fcmToken: string,
  sponseeName: string,
  consecutiveMisses: number
) => {
  return {
    token: fcmToken,
    notification: {
      title: 'Check-In Alert',
      body: `${sponseeName} has missed ${consecutiveMisses} consecutive check-ins`,
    },
    data: {
      type: 'missed-check-in-alert',
      sponseeName,
      consecutiveMisses: consecutiveMisses.toString(),
    },
    android: {
      priority: 'high',
      notification: {
        channelId: 'alerts',
        sound: 'default',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
          'interruption-level': 'time-sensitive',
        },
      },
    },
  }
}
