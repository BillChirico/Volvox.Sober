/**
 * Edge Function: send-check-ins
 *
 * Runs every 5 minutes via pg_cron to:
 * 1. Find check-ins due for notification
 * 2. Send FCM push notifications to sponsees
 * 3. Update next_scheduled_at for sent check-ins
 * 4. Track missed check-ins (24h grace period)
 * 5. Alert sponsors after 3 consecutive misses
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ============================================================
// Configuration
// ============================================================

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const FCM_SERVER_KEY = Deno.env.get('FCM_SERVER_KEY')!

const GRACE_PERIOD_HOURS = 24
const ALERT_THRESHOLD_MISSES = 3

// ============================================================
// Types
// ============================================================

interface CheckInDue {
  id: string
  connection_id: string
  recurrence: 'daily' | 'weekly' | 'custom'
  scheduled_time: string
  timezone: string
  questions: string[]
  next_scheduled_at: string
  custom_interval_days: number | null
  connection: {
    sponsee_id: string
    sponsor_id: string
    sponsee: {
      id: string
      full_name: string
      fcm_token: string | null
    }
    sponsor: {
      id: string
      full_name: string
      fcm_token: string | null
    }
  }
}

// ============================================================
// Main Handler
// ============================================================

serve(async (req) => {
  try {
    // Initialize Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    console.log('Starting check-in notification job...')

    // Step 1: Find check-ins due for notification
    const checkInsDue = await findCheckInsDue(supabase)
    console.log(`Found ${checkInsDue.length} check-ins due for notification`)

    // Step 2: Send notifications
    const sentNotifications = await sendCheckInNotifications(checkInsDue)
    console.log(`Sent ${sentNotifications.length} notifications`)

    // Step 3: Update next scheduled times
    await updateNextScheduledTimes(supabase, sentNotifications)

    // Step 4: Track missed check-ins (24h grace period)
    const missedCheckIns = await trackMissedCheckIns(supabase)
    console.log(`Tracked ${missedCheckIns.length} missed check-ins`)

    // Step 5: Alert sponsors for consecutive misses
    const sponsorAlerts = await sendSponsorAlerts(supabase, missedCheckIns)
    console.log(`Sent ${sponsorAlerts.length} sponsor alerts`)

    return new Response(
      JSON.stringify({
        success: true,
        checkInsDue: checkInsDue.length,
        notificationsSent: sentNotifications.length,
        missedTracked: missedCheckIns.length,
        sponsorAlerts: sponsorAlerts.length,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in send-check-ins function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

// ============================================================
// Step 1: Find Check-Ins Due
// ============================================================

async function findCheckInsDue(supabase: any): Promise<CheckInDue[]> {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('check_ins')
    .select(`
      *,
      connection:connections!inner (
        sponsee_id,
        sponsor_id,
        sponsee:users!connections_sponsee_id_fkey (
          id,
          full_name,
          fcm_token
        ),
        sponsor:users!connections_sponsor_id_fkey (
          id,
          full_name,
          fcm_token
        )
      )
    `)
    .eq('is_active', true)
    .lte('next_scheduled_at', now)

  if (error) {
    console.error('Error fetching check-ins due:', error)
    throw error
  }

  return data || []
}

// ============================================================
// Step 2: Send Notifications
// ============================================================

async function sendCheckInNotifications(
  checkInsDue: CheckInDue[]
): Promise<CheckInDue[]> {
  const sentNotifications: CheckInDue[] = []

  for (const checkIn of checkInsDue) {
    const fcmToken = checkIn.connection.sponsee.fcm_token

    if (!fcmToken) {
      console.log(`No FCM token for sponsee: ${checkIn.connection.sponsee.full_name}`)
      continue
    }

    try {
      await sendFCMNotification({
        token: fcmToken,
        title: 'Daily Check-In Reminder',
        body: `Time to complete your check-in with ${checkIn.questions.length} ${checkIn.questions.length === 1 ? 'question' : 'questions'}`,
        data: {
          type: 'check-in',
          checkInId: checkIn.id,
          deepLink: `volvoxsober://check-in-response?checkInId=${checkIn.id}`,
        },
      })

      sentNotifications.push(checkIn)
      console.log(`Sent notification for check-in: ${checkIn.id}`)
    } catch (error) {
      console.error(`Failed to send notification for check-in ${checkIn.id}:`, error)
    }
  }

  return sentNotifications
}

async function sendFCMNotification(payload: {
  token: string
  title: string
  body: string
  data: Record<string, string>
}): Promise<void> {
  const response = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `key=${FCM_SERVER_KEY}`,
    },
    body: JSON.stringify({
      to: payload.token,
      notification: {
        title: payload.title,
        body: payload.body,
        sound: 'default',
      },
      data: payload.data,
      priority: 'high',
      content_available: true,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`FCM request failed: ${error}`)
  }
}

// ============================================================
// Step 3: Update Next Scheduled Times
// ============================================================

async function updateNextScheduledTimes(
  supabase: any,
  sentNotifications: CheckInDue[]
): Promise<void> {
  for (const checkIn of sentNotifications) {
    const nextScheduled = calculateNextScheduledTime(
      checkIn.recurrence,
      checkIn.scheduled_time,
      checkIn.custom_interval_days
    )

    const { error } = await supabase
      .from('check_ins')
      .update({ next_scheduled_at: nextScheduled })
      .eq('id', checkIn.id)

    if (error) {
      console.error(`Failed to update next_scheduled_at for check-in ${checkIn.id}:`, error)
    }
  }
}

function calculateNextScheduledTime(
  recurrence: 'daily' | 'weekly' | 'custom',
  scheduledTime: string,
  customIntervalDays: number | null
): string {
  const [hours, minutes] = scheduledTime.split(':').map(Number)
  const next = new Date()
  next.setHours(hours, minutes, 0, 0)

  // Calculate days to add
  let daysToAdd = 1 // default for daily
  if (recurrence === 'weekly') {
    daysToAdd = 7
  } else if (recurrence === 'custom' && customIntervalDays) {
    daysToAdd = customIntervalDays
  }

  next.setDate(next.getDate() + daysToAdd)
  return next.toISOString()
}

// ============================================================
// Step 4: Track Missed Check-Ins
// ============================================================

async function trackMissedCheckIns(supabase: any): Promise<any[]> {
  const gracePeriodAgo = new Date()
  gracePeriodAgo.setHours(gracePeriodAgo.getHours() - GRACE_PERIOD_HOURS)

  // Find check-ins that should have been completed but weren't
  const { data: overdueCheckIns, error } = await supabase
    .from('check_ins')
    .select(`
      id,
      next_scheduled_at,
      connection_id
    `)
    .eq('is_active', true)
    .lt('next_scheduled_at', gracePeriodAgo.toISOString())

  if (error) {
    console.error('Error fetching overdue check-ins:', error)
    return []
  }

  const missedCheckIns = []

  for (const checkIn of overdueCheckIns || []) {
    // Check if there's already a response for this scheduled time
    const { data: existingResponse } = await supabase
      .from('check_in_responses')
      .select('id')
      .eq('check_in_id', checkIn.id)
      .eq('scheduled_for', checkIn.next_scheduled_at)
      .single()

    if (!existingResponse) {
      // Insert missed check-in record
      const { error: insertError } = await supabase
        .from('check_in_responses')
        .insert({
          check_in_id: checkIn.id,
          scheduled_for: checkIn.next_scheduled_at,
          status: 'missed',
          response_data: null,
        })

      if (!insertError) {
        missedCheckIns.push(checkIn)
        console.log(`Tracked missed check-in: ${checkIn.id}`)
      } else {
        console.error(`Failed to track missed check-in ${checkIn.id}:`, insertError)
      }
    }
  }

  return missedCheckIns
}

// ============================================================
// Step 5: Send Sponsor Alerts
// ============================================================

async function sendSponsorAlerts(
  supabase: any,
  missedCheckIns: any[]
): Promise<any[]> {
  const sponsorAlerts = []

  for (const missedCheckIn of missedCheckIns) {
    // Get consecutive miss count
    const { data: responses } = await supabase
      .from('check_in_responses')
      .select('status')
      .eq('check_in_id', missedCheckIn.id)
      .order('scheduled_for', { ascending: false })
      .limit(10)

    if (!responses) continue

    // Count consecutive misses from most recent
    let consecutiveMisses = 0
    for (const response of responses) {
      if (response.status === 'missed') {
        consecutiveMisses++
      } else {
        break
      }
    }

    // Alert sponsor if threshold reached
    if (consecutiveMisses >= ALERT_THRESHOLD_MISSES) {
      const { data: checkIn } = await supabase
        .from('check_ins')
        .select(`
          connection:connections!inner (
            sponsee:users!connections_sponsee_id_fkey (
              full_name
            ),
            sponsor:users!connections_sponsor_id_fkey (
              fcm_token
            )
          )
        `)
        .eq('id', missedCheckIn.id)
        .single()

      if (checkIn?.connection.sponsor.fcm_token) {
        try {
          await sendFCMNotification({
            token: checkIn.connection.sponsor.fcm_token,
            title: 'Check-In Alert',
            body: `${checkIn.connection.sponsee.full_name} has missed ${consecutiveMisses} consecutive check-ins`,
            data: {
              type: 'missed-check-in-alert',
              checkInId: missedCheckIn.id,
              consecutiveMisses: consecutiveMisses.toString(),
            },
          })

          sponsorAlerts.push(missedCheckIn)
          console.log(`Sent sponsor alert for ${consecutiveMisses} consecutive misses`)
        } catch (error) {
          console.error('Failed to send sponsor alert:', error)
        }
      }
    }
  }

  return sponsorAlerts
}
