# send-check-ins Edge Function

Automated check-in notification system that runs every 5 minutes via pg_cron.

## Purpose

This Edge Function handles the complete check-in lifecycle:

1. **Send Notifications**: Finds check-ins due and sends FCM push notifications to sponsees
2. **Update Scheduling**: Calculates and updates next scheduled time based on recurrence
3. **Track Missed**: Creates missed check-in records after 24-hour grace period
4. **Alert Sponsors**: Notifies sponsors after 3 consecutive missed check-ins

## Architecture

```
pg_cron (*/5 * * * *) → invoke_send_check_ins() → Edge Function
                                                        ↓
                                                  1. Query check_ins
                                                        ↓
                                                  2. Send FCM notifications
                                                        ↓
                                                  3. Update next_scheduled_at
                                                        ↓
                                                  4. Track missed (24h grace)
                                                        ↓
                                                  5. Alert sponsors (3+ misses)
```

## Environment Variables

Required environment variables (set in Supabase Dashboard > Edge Functions):

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for admin operations
- `FCM_SERVER_KEY`: Firebase Cloud Messaging server key

## Configuration Constants

```typescript
GRACE_PERIOD_HOURS = 24; // Time before marking check-in as missed
ALERT_THRESHOLD_MISSES = 3; // Consecutive misses before alerting sponsor
```

## Setup Instructions

### 1. Deploy Edge Function

```bash
supabase functions deploy send-check-ins --no-verify-jwt
```

### 2. Set Environment Variables

In Supabase Dashboard > Edge Functions > send-check-ins > Settings:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FCM_SERVER_KEY=your-fcm-server-key
```

### 3. Run Migration

```bash
supabase db push
```

This sets up:

- FCM token columns in users table
- `invoke_send_check_ins()` function
- pg_cron job running every 5 minutes

### 4. Verify Cron Job

```sql
-- Check job exists
SELECT * FROM cron.job WHERE jobname = 'send-check-ins-job';

-- View recent runs
SELECT * FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-check-ins-job')
ORDER BY start_time DESC
LIMIT 10;
```

## Testing

### Manual Trigger

```sql
-- Trigger function manually for testing
SELECT invoke_send_check_ins();
```

### Test Notification Flow

1. Create a check-in schedule with `next_scheduled_at` in the past
2. Ensure sponsee has valid FCM token in users table
3. Run manual trigger
4. Check mobile device for notification

### View Logs

```bash
supabase functions logs send-check-ins
```

## Notification Payloads

### Check-In Reminder (to Sponsee)

```json
{
  "notification": {
    "title": "Daily Check-In Reminder",
    "body": "Time to complete your check-in with X questions"
  },
  "data": {
    "type": "check-in",
    "checkInId": "uuid",
    "deepLink": "volvoxsober://check-in-response?checkInId=uuid"
  }
}
```

### Missed Check-In Alert (to Sponsor)

```json
{
  "notification": {
    "title": "Check-In Alert",
    "body": "John Doe has missed 3 consecutive check-ins"
  },
  "data": {
    "type": "missed-check-in-alert",
    "checkInId": "uuid",
    "consecutiveMisses": "3"
  }
}
}
```

## Database Operations

### Check-Ins Query

```sql
SELECT * FROM check_ins
WHERE is_active = true
  AND next_scheduled_at <= NOW();
```

### Missed Tracking

```sql
-- Creates missed record after 24h grace period
INSERT INTO check_in_responses (check_in_id, scheduled_for, status)
VALUES (check_in_id, next_scheduled_at, 'missed');
```

### Consecutive Miss Count

```sql
-- Counts consecutive misses from most recent
SELECT status FROM check_in_responses
WHERE check_in_id = $1
ORDER BY scheduled_for DESC
LIMIT 10;
```

## Error Handling

The function handles errors gracefully:

- **No FCM Token**: Skips notification, logs warning
- **FCM Failure**: Logs error, continues with other check-ins
- **Database Error**: Logs error, returns 500 response
- **Partial Success**: Continues processing remaining items

## Monitoring

### Key Metrics

- Check-ins due per run
- Notifications sent successfully
- Missed check-ins tracked
- Sponsor alerts sent

### Response Format

```json
{
  "success": true,
  "checkInsDue": 5,
  "notificationsSent": 4,
  "missedTracked": 2,
  "sponsorAlerts": 1
}
```

## Troubleshooting

### Notifications Not Sending

1. Check FCM token exists: `SELECT fcm_token FROM users WHERE id = 'user-id'`
2. Verify FCM_SERVER_KEY is correct
3. Check Edge Function logs for FCM errors
4. Test FCM token validity with Firebase console

### Cron Job Not Running

1. Verify job exists: `SELECT * FROM cron.job WHERE jobname = 'send-check-ins-job'`
2. Check recent runs: `SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5`
3. Ensure pg_cron extension is enabled
4. Check database logs for errors

### Check-Ins Not Triggering

1. Verify `next_scheduled_at` is in the past
2. Check `is_active = true`
3. Verify sponsee has FCM token
4. Run manual trigger to test

## Performance

- **Expected Load**: ~100-1000 check-ins per run
- **Execution Time**: ~1-5 seconds per 100 check-ins
- **FCM Rate Limits**: 1M messages/minute (ample headroom)
- **Database Impact**: Read-heavy, minimal writes

## Future Enhancements

- [ ] Retry logic for failed FCM sends
- [ ] Notification delivery confirmation
- [ ] Timezone-aware scheduling (currently uses UTC)
- [ ] Batch FCM sends for performance
- [ ] Analytics dashboard for check-in completion rates
