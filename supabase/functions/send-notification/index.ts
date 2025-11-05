/**
 * Send Notification Edge Function (T134)
 *
 * Sends push notifications via Expo Push Notification Service
 * Handles multiple device tokens per user
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const EXPO_ACCESS_TOKEN = Deno.env.get('EXPO_ACCESS_TOKEN'); // Optional

interface NotificationRequest {
  user_id: string;
  type: 'new_message' | 'connection_request' | 'check_in_reminder' | 'milestone_achieved' | 'step_work_comment' | 'step_work_submitted' | 'step_work_reviewed';
  title: string;
  body: string;
  data?: Record<string, string>;
}

interface ExpoMessage {
  to: string;
  sound: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  priority?: string;
  channelId?: string;
}

interface ExpoResponse {
  data: {
    status: string;
    id?: string;
    message?: string;
    details?: any;
  }[];
}

serve(async (req) => {
  try {
    // Parse request body
    const payload: NotificationRequest = await req.json();
    const { user_id, type, title, body, data = {} } = payload;

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user's device tokens and notification preferences
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('device_tokens, notification_preferences')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check notification preferences
    const preferences = user.notification_preferences || {};
    const typeKey = type.replace(/_/g, '');

    if (preferences[typeKey] === false) {
      return new Response(
        JSON.stringify({ message: 'Notification disabled by user preferences' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get device tokens (Expo push tokens)
    const deviceTokens: string[] = user.device_tokens || [];

    if (deviceTokens.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No device tokens registered' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Send notifications to all devices
    const results = await Promise.allSettled(
      deviceTokens.map(token => sendExpoNotification(token, title, body, { ...data, type }))
    );

    // Count successful sends
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.filter(r => r.status === 'rejected').length;

    // Clean up invalid tokens
    const invalidTokens: string[] = [];
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const reason = result.reason?.message || '';
        if (reason.includes('DeviceNotRegistered') || reason.includes('InvalidCredentials')) {
          invalidTokens.push(deviceTokens[index]);
        }
      }
    });

    if (invalidTokens.length > 0) {
      const validTokens = deviceTokens.filter(t => !invalidTokens.includes(t));
      await supabase
        .from('users')
        .update({ device_tokens: validTokens })
        .eq('id', user_id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failureCount,
        invalidTokensRemoved: invalidTokens.length,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Notification error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Send Expo push notification using HTTP API
 */
async function sendExpoNotification(
  token: string,
  title: string,
  body: string,
  data: Record<string, string>
): Promise<void> {
  const message: ExpoMessage = {
    to: token,
    sound: 'default',
    title,
    body,
    data,
    priority: 'high',
    channelId: 'default',
  };

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Accept-encoding': 'gzip, deflate',
    'Content-Type': 'application/json',
  };

  // Add access token if available (optional, increases rate limits)
  if (EXPO_ACCESS_TOKEN) {
    headers['Authorization'] = `Bearer ${EXPO_ACCESS_TOKEN}`;
  }

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers,
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Expo send failed: ${error}`);
  }

  const result: ExpoResponse = await response.json();

  // Check for errors in response
  if (result.data && result.data[0]) {
    const { status, message: errorMessage, details } = result.data[0];
    if (status === 'error') {
      throw new Error(`Expo error: ${errorMessage} - ${JSON.stringify(details)}`);
    }
  }
}
