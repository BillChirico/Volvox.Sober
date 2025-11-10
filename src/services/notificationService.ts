/**
 * Notification Service - Expo Notifications integration and handlers (T133, T135-T137)
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import { NavigationContainerRef } from '@react-navigation/native';

export type NotificationType =
  | 'new_message'
  | 'connection_request'
  | 'check_in_reminder'
  | 'milestone_achieved'
  | 'step_work_comment'
  | 'step_work_submitted'
  | 'step_work_reviewed';

interface NotificationData {
  type: NotificationType;
  entity_id?: string;
  connection_id?: string;
  step_id?: string;
  [key: string]: string | undefined;
}

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  private navigationRef: NavigationContainerRef<any> | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  /**
   * Initialize notification service
   */
  async initialize(navigationRef: NavigationContainerRef<any>) {
    this.navigationRef = navigationRef;

    // Request permission (T133)
    await this.requestPermission();

    // Get and register Expo push token
    await this.registerToken();

    // Setup foreground notification handler (T135)
    this.notificationListener = Notifications.addNotificationReceivedListener(
      this.handleForegroundNotification,
    );

    // Setup notification response handler (T137 - Deep linking)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      this.handleNotificationResponse,
    );
  }

  /**
   * Request notification permission (T133)
   */
  private async requestPermission(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permission denied');
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return true;
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }

  /**
   * Register Expo push token with Supabase (T133)
   */
  private async registerToken(): Promise<void> {
    try {
      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;

      if (!token) {
        console.warn('No Expo push token available');
        return;
      }

      await this.updateToken(token);
    } catch (error) {
      console.error('Token registration error:', error);
    }
  }

  /**
   * Update push token in database
   */
  private async updateToken(token: string): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.warn('No authenticated user for token update');
        return;
      }

      // Get current device tokens
      const { data: userData } = await supabase
        .from('users')
        .select('device_tokens')
        .eq('id', user.id)
        .single();

      const existingTokens: string[] = userData?.device_tokens || [];

      // Add new token if not already present
      if (!existingTokens.includes(token)) {
        const updatedTokens = [...existingTokens, token];

        await supabase.from('users').update({ device_tokens: updatedTokens }).eq('id', user.id);

        console.log('Expo push token registered:', token);
      }
    } catch (error) {
      console.error('Token update error:', error);
    }
  }

  /**
   * Handle foreground notifications (T135)
   */
  private handleForegroundNotification = async (
    notification: Notifications.Notification,
  ): Promise<void> => {
    console.log('Foreground notification:', notification);

    // Notification will be displayed automatically by Expo
    // We can add custom behavior here if needed
  };

  /**
   * Handle notification tap/open (T137 - Deep linking)
   */
  private handleNotificationResponse = (response: Notifications.NotificationResponse): void => {
    const data = response.notification.request.content.data as NotificationData;

    if (!this.navigationRef || !data.type) {
      console.warn('Cannot navigate: missing navigation ref or type');
      return;
    }

    // Navigate based on notification type
    this.navigateToScreen(data);
  };

  /**
   * Navigate to appropriate screen based on notification type
   */
  private navigateToScreen(data: NotificationData): void {
    if (!this.navigationRef) return;

    switch (data.type) {
      case 'new_message':
        if (data.connection_id) {
          this.navigationRef.navigate('/(tabs)/messages/[id]', {
            id: data.connection_id,
          });
        }
        break;

      case 'connection_request':
        this.navigationRef.navigate('/(tabs)/connections/pending');
        break;

      case 'check_in_reminder':
        if (data.entity_id) {
          this.navigationRef.navigate('/(tabs)/check-ins/response', {
            checkinId: data.entity_id,
          });
        }
        break;

      case 'milestone_achieved':
        this.navigationRef.navigate('/(tabs)/sobriety');
        break;

      case 'step_work_comment':
      case 'step_work_reviewed':
        if (data.step_id) {
          this.navigationRef.navigate('/(tabs)/steps/work/[id]', {
            id: data.step_id,
          });
        }
        break;

      case 'step_work_submitted':
        if (data.step_id && data.entity_id) {
          this.navigationRef.navigate('/(tabs)/reviews/sponsor', {
            stepWorkId: data.entity_id,
            sponseeId: data.connection_id || '',
          });
        }
        break;

      default:
        console.warn('Unknown notification type for navigation:', data.type);
    }
  }

  /**
   * Schedule a local notification (for testing)
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    data: NotificationData,
    seconds: number = 1,
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: {
        seconds,
      },
    });
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Cleanup notification listeners
   */
  cleanup(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
