---
work_package_id: 'WP09'
subtasks:
  - 'T130'
  - 'T131'
  - 'T132'
  - 'T133'
  - 'T134'
  - 'T135'
  - 'T136'
  - 'T137'
  - 'T138'
  - 'T139'
  - 'T140'
  - 'T141'
  - 'T142'
title: 'Push Notifications & Real-Time Updates'
phase: 'Phase 2 - Core Features'
lane: "doing"
assignee: ''
agent: "claude"
shell_pid: "15009"
history:
  - timestamp: '2025-11-03'
    lane: 'planned'
    agent: 'system'
    shell_pid: ''
    action: 'Prompt generated via /spec-kitty.tasks'
---

# Work Package Prompt: WP09 – Push Notifications & Real-Time Updates

## Objectives & Success Criteria

**Primary Objective**: Implement Firebase Cloud Messaging (FCM) for push notifications and comprehensive Supabase Realtime integration.

**Success Criteria**:

- Push notifications deliver to iOS and Android with 90%+ success rate
- Notification types: new_message, connection_request, check_in_reminder, milestone_achieved
- Deep linking: notifications open relevant screens
- Realtime subscriptions for messages, connection requests, step work comments
- Notification preferences: users can enable/disable per category
- Background sync: update data when notifications received while app closed

## Context & Constraints

**Related Documents**:

- Constitution: Performance (90% delivery success), UX Consistency
- Platform Requirements: iOS APNs certificates, Android FCM configuration

**Technical Stack**:

- Firebase Cloud Messaging (FCM) for both iOS and Android
- Supabase Realtime for WebSocket subscriptions
- React Native Push Notification library (@react-native-firebase/messaging)

## Subtasks & Detailed Guidance

### FCM Setup (T130-T133)

**T130: Firebase project configuration**

- Create Firebase project at console.firebase.google.com
- Register iOS app: bundle ID from `ios/mobile/Info.plist`
- Register Android app: package name from `android/app/build.gradle`
- Download google-services.json (Android) and GoogleService-Info.plist (iOS)

**T131: iOS APNs certificate setup**

- Generate APNs certificate in Apple Developer portal
- Upload APNs certificate to Firebase Console (Project Settings → Cloud Messaging)
- Update Xcode: enable Push Notifications capability

**T132: Install FCM dependencies**

- Install: `pnpm add @react-native-firebase/app @react-native-firebase/messaging`
- iOS: `cd ios && pod install`
- Android: add google-services plugin to `android/app/build.gradle`

**T133: FCM token registration**

- Request notification permission on app start:
  ```typescript
  await messaging().requestPermission();
  const token = await messaging().getToken();
  ```
- Store token in users table: `device_tokens` JSONB array
- Update token on refresh: `messaging().onTokenRefresh(token => updateToken(token))`

### Notification Handling (T134-T137)

**T134: Notification dispatch Edge Function**

- Create: `supabase/functions/send-notification/index.ts`
- Input: user_id, notification_type, payload
- Query device_tokens from users table
- Send via FCM Admin SDK:
  ```typescript
  await admin.messaging().send({
    token: deviceToken,
    notification: { title, body },
    data: { type, entity_id },
  });
  ```

**T135: Foreground notification handler**

- Handle notifications when app is open:
  ```typescript
  messaging().onMessage(async remoteMessage => {
    // Show in-app notification banner
    showInAppNotification(remoteMessage);
  });
  ```
- Display banner at top of screen with dismiss button

**T136: Background notification handler**

- Handle notifications when app is closed:
  ```typescript
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    // Trigger background data sync
    await syncData(remoteMessage.data.type);
  });
  ```

**T137: Deep linking navigation**

- Parse notification data to determine target screen:
  - new_message → Message thread screen
  - connection_request → Connection requests screen
  - check_in_reminder → Check-in response screen
  - milestone_achieved → Sobriety dashboard
- Use React Navigation linking configuration

### Notification Types (T138-T141)

**T138: New message notifications**

- Trigger: database trigger on messages INSERT
- Title: "[Sender] sent you a message"
- Body: First 50 chars of message content
- Deep link: connection_id

**T139: Connection request notifications**

- Trigger: database trigger on connection_requests INSERT
- Title: "New connection request"
- Body: "[Sponsee] wants to connect with you"
- Deep link: connection_request_id

**T140: Check-in reminder notifications**

- Trigger: Edge Function cron job (WP08)
- Title: "Time for your daily check-in"
- Body: Prompt text from checkin template
- Deep link: checkin_id

**T141: Milestone achievement notifications**

- Trigger: Edge Function cron job (WP06)
- Title: "Congratulations! 🎉"
- Body: "You've reached [X] days sober"
- Deep link: sobriety dashboard

### Notification Preferences (T142)

**T142: Notification settings screen**

- Toggle switches for each notification type:
  - Messages (default: on)
  - Connection requests (default: on)
  - Check-in reminders (default: on)
  - Milestone achievements (default: on)
- Store preferences in users.notification_preferences (JSONB)
- Filter notifications server-side based on preferences

## Test Strategy

**Unit Tests**:

- FCM token refresh: verify token updates in database
- Notification payload parsing: verify deep link construction

**Integration Tests**:

- End-to-end notification flow: trigger → FCM send → device receives
- Deep linking: verify navigation to correct screens
- Notification preferences: verify filtering works

**E2E Tests**:

- Send message → verify recipient receives push notification
- Accept connection request → verify notification triggers
- Disable message notifications → verify no push received

## Risks & Mitigations

**Risk**: FCM token becomes stale, notifications fail silently

- **Mitigation**: Refresh token on app launch, handle token invalidation errors

**Risk**: iOS notification permissions denied by user

- **Mitigation**: Educational screen explaining benefits, in-app fallback

**Risk**: Background sync fails when app killed by system

- **Mitigation**: Next app open triggers full sync, show "syncing" indicator

## Definition of Done Checklist

- [ ] All 13 subtasks (T130-T142) completed
- [ ] FCM configured for iOS and Android
- [ ] Push notifications tested on physical devices
- [ ] Deep linking navigates to correct screens
- [ ] Notification preferences functional
- [ ] Background sync updates data when notifications received
- [ ] 90%+ delivery success rate verified
- [ ] Constitution compliance: performance, UX consistency

## Review Guidance

**Key Review Points**:

- FCM token management handles refresh and invalidation
- Notification UI is clear and actionable
- Deep linking works for all notification types
- Background sync is reliable but doesn't drain battery

## Activity Log

- 2025-11-03 – system – lane=planned – Prompt created via /spec-kitty.tasks
- 2025-11-04T20:18:32Z – claude – shell_pid=15009 – lane=doing – Started implementation of Push Notifications (unblocks WP07 & WP08)
