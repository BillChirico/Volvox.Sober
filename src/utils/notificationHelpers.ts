/**
 * Notification Helper Functions (T138-T141)
 *
 * Utility functions to trigger specific notification types
 */

import { supabase } from '../services/supabase';

interface SendNotificationParams {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Send notification via Edge Function
 */
async function sendNotification(params: SendNotificationParams): Promise<void> {
  try {
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: {
        user_id: params.userId,
        type: params.type,
        title: params.title,
        body: params.body,
        data: params.data,
      },
    });

    if (error) {
      console.error('Notification send error:', error);
      throw error;
    }

    console.log('Notification sent:', data);
  } catch (error) {
    console.error('Failed to send notification:', error);
    // Don't throw - notifications are non-critical
  }
}

/**
 * Send new message notification (T138)
 */
export async function sendNewMessageNotification(
  recipientId: string,
  senderName: string,
  messageContent: string,
  connectionId: string,
): Promise<void> {
  await sendNotification({
    userId: recipientId,
    type: 'new_message',
    title: `${senderName} sent you a message`,
    body: messageContent.length > 50 ? `${messageContent.substring(0, 50)}...` : messageContent,
    data: {
      connection_id: connectionId,
    },
  });
}

/**
 * Send connection request notification (T139)
 */
export async function sendConnectionRequestNotification(
  recipientId: string,
  requesterName: string,
  connectionRequestId: string,
): Promise<void> {
  await sendNotification({
    userId: recipientId,
    type: 'connection_request',
    title: 'New connection request',
    body: `${requesterName} wants to connect with you`,
    data: {
      entity_id: connectionRequestId,
    },
  });
}

/**
 * Send check-in reminder notification (T140)
 */
export async function sendCheckInReminderNotification(
  userId: string,
  promptText: string,
  checkinId: string,
): Promise<void> {
  await sendNotification({
    userId: userId,
    type: 'check_in_reminder',
    title: 'Time for your daily check-in',
    body: promptText,
    data: {
      entity_id: checkinId,
    },
  });
}

/**
 * Send milestone achievement notification (T141)
 */
export async function sendMilestoneAchievedNotification(
  userId: string,
  daysCount: number,
): Promise<void> {
  await sendNotification({
    userId: userId,
    type: 'milestone_achieved',
    title: 'Congratulations! 🎉',
    body: `You've reached ${daysCount} days sober`,
    data: {},
  });
}

/**
 * Send step work comment notification (WP07 T108)
 */
export async function sendStepWorkCommentNotification(
  sponseeId: string,
  stepNumber: number,
  stepId: string,
): Promise<void> {
  await sendNotification({
    userId: sponseeId,
    type: 'step_work_comment',
    title: `New comment on Step ${stepNumber}`,
    body: 'Your sponsor commented on your step work',
    data: {
      step_id: stepId,
    },
  });
}

/**
 * Send step work submission notification (WP07 T109)
 */
export async function sendStepWorkSubmittedNotification(
  sponsorId: string,
  sponseeName: string,
  stepNumber: number,
  stepId: string,
  stepWorkId: string,
): Promise<void> {
  await sendNotification({
    userId: sponsorId,
    type: 'step_work_submitted',
    title: 'Step work submitted for review',
    body: `${sponseeName} submitted Step ${stepNumber}`,
    data: {
      step_id: stepId,
      entity_id: stepWorkId,
    },
  });
}

/**
 * Send step work reviewed notification (WP07 T110)
 */
export async function sendStepWorkReviewedNotification(
  sponseeId: string,
  stepNumber: number,
  stepId: string,
): Promise<void> {
  await sendNotification({
    userId: sponseeId,
    type: 'step_work_reviewed',
    title: 'Step work reviewed',
    body: `Your Step ${stepNumber} has been reviewed by your sponsor`,
    data: {
      step_id: stepId,
    },
  });
}
