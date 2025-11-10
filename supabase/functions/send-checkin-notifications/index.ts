/**
 * Send Check-in Notifications Edge Function (T126)
 *
 * Cron job that runs every 5 minutes to send check-in reminders
 * Triggers: scheduled check-ins where next_scheduled_at <= NOW()
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface Checkin {
  id: string;
  connection_id: string;
  questions: Array<{ question_id: number; question_text: string }>;
  next_scheduled_at: string;
  recurrence: 'daily' | 'weekly' | 'custom';
  custom_interval_days: number | null;
  timezone: string;
  connections: {
    sponsee_id: string;
    users: {
      id: string;
      full_name: string;
    };
  };
}

serve(async req => {
  try {
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all active check-ins that are due
    const now = new Date().toISOString();
    const { data: checkins, error: checkinsError } = await supabase
      .from('checkins')
      .select(
        `
        id,
        connection_id,
        questions,
        next_scheduled_at,
        recurrence,
        custom_interval_days,
        timezone,
        connections!inner(
          sponsee_id,
          users!connections_sponsee_id_fkey(id, full_name)
        )
      `,
      )
      .eq('active', true)
      .lte('next_scheduled_at', now);

    if (checkinsError) {
      console.error('Error fetching checkins:', checkinsError);
      return new Response(JSON.stringify({ error: checkinsError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!checkins || checkins.length === 0) {
      return new Response(JSON.stringify({ message: 'No check-ins due', processed: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Send notifications for each due check-in
    const results = await Promise.allSettled(
      (checkins as unknown as Checkin[]).map(async checkin => {
        // Get first question as prompt text
        const promptText = checkin.questions[0]?.question_text || 'Time for your check-in';

        // Send notification via send-notification Edge Function
        const notificationResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            user_id: checkin.connections.sponsee_id,
            type: 'check_in_reminder',
            title: 'Time for your daily check-in',
            body: promptText,
            data: {
              entity_id: checkin.id,
            },
          }),
        });

        if (!notificationResponse.ok) {
          throw new Error(`Notification failed: ${await notificationResponse.text()}`);
        }

        // Calculate next scheduled time
        const currentScheduled = new Date(checkin.next_scheduled_at);
        let nextScheduled = new Date(currentScheduled);

        switch (checkin.recurrence) {
          case 'daily':
            nextScheduled.setDate(nextScheduled.getDate() + 1);
            break;
          case 'weekly':
            nextScheduled.setDate(nextScheduled.getDate() + 7);
            break;
          case 'custom':
            if (checkin.custom_interval_days) {
              nextScheduled.setDate(nextScheduled.getDate() + checkin.custom_interval_days);
            }
            break;
        }

        // Update next_scheduled_at
        const { error: updateError } = await supabase
          .from('checkins')
          .update({ next_scheduled_at: nextScheduled.toISOString() })
          .eq('id', checkin.id);

        if (updateError) {
          throw new Error(`Update failed: ${updateError.message}`);
        }

        return {
          checkin_id: checkin.id,
          user_id: checkin.connections.sponsee_id,
          sent: true,
        };
      }),
    );

    // Count successes and failures
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    // Log failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Check-in notification failed for index ${index}:`, result.reason);
      }
    });

    return new Response(
      JSON.stringify({
        message: 'Check-in notifications processed',
        processed: checkins.length,
        successful,
        failed,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Check-in notification error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
