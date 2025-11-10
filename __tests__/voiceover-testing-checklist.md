# VoiceOver Testing Checklist (T134)

Manual testing guide for iOS VoiceOver accessibility on critical user flows.

## Setup Instructions

1. **Enable VoiceOver on iOS Device**:
   - Settings → Accessibility → VoiceOver → Toggle ON
   - Or use Accessibility Shortcut: Triple-click side/home button

2. **VoiceOver Gestures**:
   - Swipe right: Move to next element
   - Swipe left: Move to previous element
   - Double-tap: Activate element
   - Three-finger swipe left/right: Navigate between pages
   - Rotor: Rotate two fingers to change navigation mode

## Critical Flow 1: Authentication (Login)

### Test Steps:

- [ ] Open app to login screen
- [ ] Enable VoiceOver
- [ ] Navigate to email input field
  - **Expected**: Announces "Email, text field" with clear label
- [ ] Double-tap to focus, enter email
  - **Expected**: Keyboard appears, text entry is announced
- [ ] Navigate to password input
  - **Expected**: Announces "Password, secure text field"
- [ ] Double-tap to focus, enter password
  - **Expected**: Secure entry (no password spoken)
- [ ] Navigate to "Login" button
  - **Expected**: Announces "Login, button"
- [ ] Double-tap to activate
  - **Expected**: Action announced, navigation to next screen
- [ ] Verify error messages are announced
  - **Expected**: Validation errors read aloud immediately

### Pass Criteria:

- All form fields have clear, descriptive labels
- Buttons announce their purpose
- Error messages are announced via VoiceOver
- Navigation between fields is logical and sequential

## Critical Flow 2: Registration & Onboarding

### Test Steps:

- [ ] Navigate to "Sign Up" link
  - **Expected**: Announces "Sign up, link" or "Sign up, button"
- [ ] Complete registration form
  - **Expected**: Each field announces label and type
- [ ] Test password strength feedback
  - **Expected**: Password strength announced as it changes
- [ ] Submit registration
  - **Expected**: Success/error feedback announced
- [ ] Navigate role selection screen
  - **Expected**: Each role option clearly labeled
- [ ] Select sponsor/sponsee role
  - **Expected**: Selection state announced
- [ ] Complete profile setup
  - **Expected**: All fields and instructions announced

### Pass Criteria:

- Multi-step process progress is announced
- Radio buttons/checkboxes announce selection state
- File upload (photos) is accessible
- "Continue" and "Skip" buttons are clearly labeled

## Critical Flow 3: Matches Discovery

### Test Steps:

- [ ] Navigate to Matches tab
  - **Expected**: Tab announces "Matches, tab, 1 of 5"
- [ ] Navigate through match cards
  - **Expected**: Each card announces user name, compatibility score, key info
- [ ] Test filter buttons
  - **Expected**: Filter options announced, selection state clear
- [ ] Navigate to match details
  - **Expected**: All profile information announced logically
- [ ] Test "Connect" button
  - **Expected**: Button purpose and action announced

### Pass Criteria:

- Match cards are navigable as distinct items
- Compatibility scores are announced with context
- Profile information read in logical order
- Images have meaningful alt text

## Critical Flow 4: Connections Management

### Test Steps:

- [ ] Navigate to Connections tab
  - **Expected**: Tab announces "Connections, tab, 2 of 5"
- [ ] Navigate connection list
  - **Expected**: Each connection card announces name and status
- [ ] Test pending requests
  - **Expected**: "Accept" and "Decline" buttons clearly labeled
- [ ] Navigate to connection profile
  - **Expected**: Profile details announced logically

### Pass Criteria:

- Connection status (active, pending) is announced
- Action buttons are clearly labeled
- List navigation is smooth and logical

## Critical Flow 5: Messaging

### Test Steps:

- [ ] Navigate to Messages tab
  - **Expected**: Tab announces "Messages, tab, 3 of 5"
- [ ] Navigate conversation list
  - **Expected**: Each thread announces contact name, last message, time
- [ ] Open a conversation
  - **Expected**: Messages announced in chronological order
- [ ] Navigate to message input
  - **Expected**: Announces "Message, text field"
- [ ] Enter and send message
  - **Expected**: Keyboard and send action announced
- [ ] Test message delivery status
  - **Expected**: "Sending", "Sent", "Delivered" states announced

### Pass Criteria:

- Message history is navigable
- Sent vs received messages are distinguishable
- Message input is clearly labeled
- Send button is accessible

## Critical Flow 6: Sobriety Tracking

### Test Steps:

- [ ] Navigate to Sobriety tab
  - **Expected**: Tab announces "Sobriety, tab, 4 of 5"
- [ ] Navigate sobriety counter
  - **Expected**: Announces current days/months/years sober
- [ ] Test "Log Relapse" button (if present)
  - **Expected**: Button clearly labeled with warning
- [ ] Navigate milestone celebrations
  - **Expected**: Milestones announced with context

### Pass Criteria:

- Time counters are announced with units (days, months, years)
- Buttons for logging events are clearly labeled
- Milestone notifications are accessible

## Critical Flow 7: Profile Management

### Test Steps:

- [ ] Navigate to Profile tab
  - **Expected**: Tab announces "Profile, tab, 5 of 5"
- [ ] Navigate profile information
  - **Expected**: All fields announced with labels
- [ ] Test "Edit Profile" button
  - **Expected**: Button announces purpose
- [ ] Navigate edit screen
  - **Expected**: All editable fields announced
- [ ] Test photo upload
  - **Expected**: "Choose photo" or "Take photo" options announced
- [ ] Test "Save" button
  - **Expected**: Save action and result announced

### Pass Criteria:

- All profile fields have clear labels
- Edit mode is clearly announced
- Photo selection is accessible
- Save/cancel actions are clear

## Critical Flow 8: Navigation

### Test Steps:

- [ ] Test bottom tab bar navigation
  - **Expected**: Each tab announces name and position (1 of 5, etc.)
- [ ] Test back navigation
  - **Expected**: Back button announces destination
- [ ] Test drawer/menu (if present)
  - **Expected**: Menu items announced clearly
- [ ] Test settings navigation
  - **Expected**: All settings options announced

### Pass Criteria:

- Tab bar navigation is smooth and clear
- Current tab is indicated
- Back navigation announces destination
- Nested navigation is logical

## General Accessibility Checks

### Headings & Structure:

- [ ] Screen titles are announced as headings
- [ ] Content sections have logical hierarchy
- [ ] Lists are announced as lists with item counts

### Dynamic Content:

- [ ] Loading states are announced
- [ ] Error messages appear as alerts
- [ ] Success confirmations are announced
- [ ] Modal dialogs announce properly

### Interactive Elements:

- [ ] All buttons have descriptive labels
- [ ] Links indicate destination
- [ ] Form fields have labels and types
- [ ] Checkboxes/radio buttons announce state

### Images & Icons:

- [ ] Profile photos have meaningful alt text
- [ ] Decorative images are hidden from VoiceOver
- [ ] Icon buttons have text labels
- [ ] Charts/graphs have text alternatives

## Issues Template

For any issues found, document:

**Issue**: [Description]
**Location**: [Screen/Component]
**Expected**: [What should happen]
**Actual**: [What actually happens]
**Severity**: [Critical/High/Medium/Low]
**Steps to Reproduce**: [Detailed steps]

## Sign-Off

- [ ] All critical flows tested
- [ ] All issues documented
- [ ] Testing completed by: **\*\***\_**\*\***
- [ ] Date: **\*\***\_**\*\***
- [ ] Device: **\*\***\_**\*\***
- [ ] iOS Version: **\*\***\_**\*\***
- [ ] App Version: **\*\***\_**\*\***
