# Firebase Cloud Messaging Setup Instructions

## Important Note: Expo Managed Workflow

This project uses Expo managed workflow. For push notifications with Expo:
- **Recommended**: Use Expo's push notification service (easier, no FCM setup needed)
- **Alternative**: Eject to bare workflow to use @react-native-firebase/messaging

**Current implementation uses Expo Notifications API**, which handles FCM/APNs automatically.

## Expo Push Notifications Setup (Recommended)

### 1. Install Expo Notifications
```bash
cd mobile
pnpm add expo-notifications
```

### 2. Configure app.json
Add to `mobile/app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/icon.png",
          "color": "#ffffff"
        }
      ]
    ],
    "notification": {
      "icon": "./assets/icon.png",
      "color": "#ffffff",
      "androidMode": "default",
      "iosDisplayInForeground": true
    }
  }
}
```

### 3. Get Expo Push Token
```typescript
import * as Notifications from 'expo-notifications';

const token = (await Notifications.getExpoPushTokenAsync()).data;
// Store token in database
```

### 4. Send Notifications via Expo API
```typescript
await fetch('https://exp.host/--/api/v2/push/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: expoPushToken,
    title: 'Title',
    body: 'Message',
    data: { type: 'new_message', entity_id: '123' }
  })
});
```

---

## Alternative: Firebase FCM Setup (Requires Bare Workflow)

If you need to use Firebase directly, you must eject from Expo:
```bash
npx expo prebuild
```

## T130: Firebase Project Configuration

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Enter project name: `Volvox Sober Recovery`
4. Accept terms and click "Create Project"

### 2. Register iOS App
1. In Firebase Console, click "Add app" → iOS
2. Get bundle ID from: `mobile/ios/mobile/Info.plist`
   - Look for `CFBundleIdentifier` value
3. Download `GoogleService-Info.plist`
4. Place file in: `mobile/ios/mobile/GoogleService-Info.plist`
5. In Xcode, right-click on project → "Add Files to [project]"
6. Select `GoogleService-Info.plist` and check "Copy items if needed"

### 3. Register Android App
1. In Firebase Console, click "Add app" → Android
2. Get package name from: `mobile/android/app/build.gradle`
   - Look for `applicationId` in `defaultConfig`
3. Download `google-services.json`
4. Place file in: `mobile/android/app/google-services.json`

## T131: iOS APNs Certificate Setup

### 1. Generate APNs Certificate
1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Navigate to: Certificates, Identifiers & Profiles → Identifiers
3. Select your app's bundle ID
4. Enable "Push Notifications" capability
5. Click "Edit" → "Create Certificate" for Production APNs
6. Follow CSR generation instructions
7. Download the certificate (.p8 key file recommended)

### 2. Upload to Firebase
1. In Firebase Console, go to: Project Settings → Cloud Messaging
2. Under "Apple app configuration", upload:
   - **Option A** (Recommended): APNs Authentication Key (.p8)
     - Upload key file
     - Enter Key ID and Team ID
   - **Option B**: APNs Certificate (.p12)
     - Export certificate from Keychain as .p12
     - Upload with password

### 3. Xcode Configuration
1. Open `mobile/ios/mobile.xcworkspace` in Xcode
2. Select project in navigator → Target → Signing & Capabilities
3. Click "+ Capability" → Add "Push Notifications"
4. Click "+ Capability" → Add "Background Modes"
5. Check "Remote notifications" under Background Modes

## T132: Install FCM Dependencies

Dependencies will be installed via npm/pnpm. After installation:

### iOS Post-Install
```bash
cd mobile/ios
pod install
cd ..
```

### Android Configuration
1. Add Google Services plugin to `android/app/build.gradle`:
```gradle
// At top of file
apply plugin: 'com.google.gms.google-services'
```

2. Add dependency to `android/build.gradle`:
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

## Verification

### Test iOS Push Notifications
```bash
# From Firebase Console → Cloud Messaging → Send test message
# Or use FCM API:
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "DEVICE_TOKEN",
    "notification": {
      "title": "Test",
      "body": "Test notification"
    }
  }'
```

### Test Android Push Notifications
Same as iOS, use Firebase Console or FCM API.

## Environment Variables

Add to `.env`:
```bash
# FCM Server Key (from Firebase Console → Project Settings → Cloud Messaging)
FCM_SERVER_KEY=your_fcm_server_key_here
```

Add to Supabase Edge Function secrets:
```bash
supabase secrets set FCM_SERVER_KEY=your_fcm_server_key_here
```

## Troubleshooting

### iOS: "No APNs certificate uploaded"
- Verify certificate is uploaded in Firebase Console
- Ensure certificate matches your app's bundle ID
- Try regenerating certificate and re-uploading

### Android: "google-services.json not found"
- Verify file is in `android/app/google-services.json`
- Run `./gradlew clean` and rebuild

### Notifications not received
- Check device token is registered in database
- Verify user notification preferences allow the notification type
- Check Firebase Console → Cloud Messaging logs for errors
- Ensure app has notification permissions enabled

## Security Notes

- **Never commit** `GoogleService-Info.plist` or `google-services.json` to git
- Add to `.gitignore`:
```
mobile/ios/mobile/GoogleService-Info.plist
mobile/android/app/google-services.json
```
- Store FCM Server Key in Supabase secrets, not in codebase
- APNs certificates should be stored securely in Firebase Console only
