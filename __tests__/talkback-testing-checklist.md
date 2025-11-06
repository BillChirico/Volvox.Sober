# TalkBack Testing Checklist (T135)

Manual testing guide for Android TalkBack accessibility on critical user flows.

## Setup Instructions

1. **Enable TalkBack on Android Device**:
   - Settings → Accessibility → TalkBack → Toggle ON
   - Or use Volume Keys Shortcut: Press both volume keys for 3 seconds

2. **TalkBack Gestures**:
   - Swipe right: Move to next element
   - Swipe left: Move to previous element
   - Double-tap: Activate element
   - Swipe down then right: Read from top
   - Swipe up then down: Read from current position
   - Two-finger swipe: Scroll
   - Local Context Menu: Swipe up then right

## Critical Flow 1: Authentication (Login)

### Test Steps:
- [ ] Open app to login screen
- [ ] Enable TalkBack
- [ ] Navigate to email input field
  - **Expected**: Announces "Email, edit box" with clear label
- [ ] Double-tap to focus, enter email
  - **Expected**: Keyboard appears, text entry is announced character by character
- [ ] Navigate to password input
  - **Expected**: Announces "Password, edit box for password"
- [ ] Double-tap to focus, enter password
  - **Expected**: Announces "Dot" for each character (secure entry)
- [ ] Navigate to "Login" button
  - **Expected**: Announces "Login, button"
- [ ] Double-tap to activate
  - **Expected**: Action announced, navigation to next screen
- [ ] Verify error messages are announced
  - **Expected**: Validation errors read aloud immediately with alert sound

### Pass Criteria:
- All EditText fields have contentDescription or hint
- Buttons announce their purpose and type
- Error messages trigger announcements
- Navigation between fields is logical
- Keyboard dismissal is announced

## Critical Flow 2: Registration & Onboarding

### Test Steps:
- [ ] Navigate to "Sign Up" link/button
  - **Expected**: Announces "Sign up, button" or similar
- [ ] Complete registration form
  - **Expected**: Each field announces label, type, and current value
- [ ] Test password strength indicator
  - **Expected**: Password strength changes announced
- [ ] Submit registration
  - **Expected**: Loading state and result announced
- [ ] Navigate role selection screen
  - **Expected**: RadioButton options with labels and selection state
- [ ] Select sponsor/sponsee role
  - **Expected**: "Selected" or "Not selected" announced
- [ ] Complete profile setup
  - **Expected**: All fields and instructions announced clearly

### Pass Criteria:
- Form validation errors are announced immediately
- Required field indicators are announced
- Progress through steps is announced
- RadioGroup selection state is clear
- File picker is accessible

## Critical Flow 3: Matches Discovery

### Test Steps:
- [ ] Navigate to Matches tab
  - **Expected**: Tab announces "Matches, tab, 1 of 5, selected"
- [ ] Navigate through match cards using swipe gestures
  - **Expected**: Each card announces as "Card" with user info
- [ ] Test RecyclerView/FlatList navigation
  - **Expected**: Smooth navigation between list items
- [ ] Navigate to match details
  - **Expected**: All information announced in logical order
- [ ] Test filter buttons
  - **Expected**: Filter options and states announced
- [ ] Test "Connect" button
  - **Expected**: "Connect, button" with current state

### Pass Criteria:
- RecyclerView items are distinct
- Card structure is announced logically
- Images have contentDescription
- Buttons within cards are accessible
- Scrolling announces position

## Critical Flow 4: Connections Management

### Test Steps:
- [ ] Navigate to Connections tab
  - **Expected**: "Connections, tab, 2 of 5, selected"
- [ ] Navigate connection list
  - **Expected**: Each item announces name and status
- [ ] Test pending request actions
  - **Expected**: "Accept, button" and "Decline, button" clearly labeled
- [ ] Navigate to connection profile
  - **Expected**: Profile information announced in order

### Pass Criteria:
- List items have proper contentDescription
- Action buttons are clearly labeled
- Connection status is announced
- Empty state is announced

## Critical Flow 5: Messaging

### Test Steps:
- [ ] Navigate to Messages tab
  - **Expected**: "Messages, tab, 3 of 5, selected"
- [ ] Navigate conversation list
  - **Expected**: Each item announces contact, preview, time
- [ ] Open a conversation
  - **Expected**: Screen title announces contact name
- [ ] Navigate message history
  - **Expected**: Each message announces sender and content
- [ ] Navigate to message input
  - **Expected**: "Message, edit box" announced
- [ ] Enter and send message
  - **Expected**: Keyboard, text entry, and send action announced
- [ ] Test message status icons
  - **Expected**: Sending/sent/delivered states announced

### Pass Criteria:
- Message bubbles have speaker identification
- Sent vs received messages distinguishable
- Input field is clearly labeled
- Send button is accessible
- Timestamps are announced

## Critical Flow 6: Sobriety Tracking

### Test Steps:
- [ ] Navigate to Sobriety tab
  - **Expected**: "Sobriety, tab, 4 of 5, selected"
- [ ] Navigate sobriety counter
  - **Expected**: Announces duration with units
- [ ] Test date picker (if present)
  - **Expected**: Date picker is fully accessible
- [ ] Test "Log Relapse" button
  - **Expected**: Button label includes warning/context
- [ ] Navigate milestone cards
  - **Expected**: Milestone info announced completely

### Pass Criteria:
- Counters announce with units and context
- Date pickers are accessible
- Action buttons have clear labels
- Charts have text alternatives
- Achievements are announced

## Critical Flow 7: Profile Management

### Test Steps:
- [ ] Navigate to Profile tab
  - **Expected**: "Profile, tab, 5 of 5, selected"
- [ ] Navigate profile information
  - **Expected**: All fields announced with labels
- [ ] Test "Edit Profile" button
  - **Expected**: "Edit profile, button"
- [ ] Navigate edit mode
  - **Expected**: Editable fields announced as "Edit box"
- [ ] Test image picker
  - **Expected**: "Choose image, button" or similar
- [ ] Test "Save" button
  - **Expected**: "Save, button" and action result announced

### Pass Criteria:
- All TextViews have text or contentDescription
- Edit mode change is announced
- Image selection is accessible
- Save/cancel actions are clear
- Validation is announced

## Critical Flow 8: Navigation

### Test Steps:
- [ ] Test bottom navigation bar
  - **Expected**: Each tab announces name, position, and selection state
- [ ] Test "Up" button (back navigation)
  - **Expected**: "Navigate up, button" or similar
- [ ] Test drawer navigation (if present)
  - **Expected**: Drawer open/close announced, items listed
- [ ] Test settings navigation
  - **Expected**: Settings items announced clearly
- [ ] Test nested navigation
  - **Expected**: Screen transitions announced

### Pass Criteria:
- Navigation bar has proper accessibility
- Back button is announced
- Current location is indicated
- Screen titles are announced
- Transitions are smooth

## Android-Specific Checks

### Material Design Components:
- [ ] FloatingActionButtons have contentDescription
- [ ] Chips announce label and dismiss action
- [ ] Snackbars are announced as alerts
- [ ] Bottom sheets announce open/close state
- [ ] Dialogs announce title and content

### Input Controls:
- [ ] Switches announce state (on/off)
- [ ] Sliders announce value and range
- [ ] CheckBoxes announce checked/unchecked
- [ ] RadioButtons announce selected state
- [ ] Spinners announce current selection

### Scrolling & Lists:
- [ ] RecyclerView scrolling is smooth
- [ ] List position is announced ("Item 1 of 10")
- [ ] Pull-to-refresh is announced
- [ ] Infinite scroll announces loading
- [ ] Empty states are announced

### Dynamic Content:
- [ ] Loading spinners announce status
- [ ] Progress bars announce progress
- [ ] Toasts are announced
- [ ] Live regions update announcements
- [ ] Modal changes focus appropriately

## Performance Checks

- [ ] No lag when swiping between elements
- [ ] Screen changes announced promptly
- [ ] No duplicate announcements
- [ ] Focus doesn't jump unexpectedly
- [ ] Scrolling performance is smooth

## Localization Checks (if applicable)

- [ ] Announcements in correct language
- [ ] Numbers formatted correctly
- [ ] Dates formatted correctly
- [ ] Currency formatted correctly

## General Accessibility Checks

### Content Grouping:
- [ ] Related items grouped logically
- [ ] Headings announce as headings
- [ ] Lists announce item counts
- [ ] Cards announce as containers

### Focus Management:
- [ ] Focus moves logically
- [ ] Focus doesn't get trapped
- [ ] Focus visible on keyboard navigation
- [ ] Focus restored after dialogs

### Touch Target Sizes:
- [ ] All targets at least 48dp × 48dp
- [ ] Adequate spacing between targets
- [ ] Touch feedback is provided
- [ ] Gestures work with TalkBack

## Issues Template

For any issues found, document:

**Issue**: [Description]
**Location**: [Screen/Component]
**Expected**: [What should happen]
**Actual**: [What actually happens]
**Severity**: [Critical/High/Medium/Low]
**Android Version**: [e.g., Android 12]
**TalkBack Version**: [Version number]
**Steps to Reproduce**: [Detailed steps]

## Sign-Off

- [ ] All critical flows tested
- [ ] All issues documented
- [ ] Testing completed by: _____________
- [ ] Date: _____________
- [ ] Device: _____________
- [ ] Android Version: _____________
- [ ] TalkBack Version: _____________
- [ ] App Version: _____________

## Additional Resources

- [Android Accessibility Guidelines](https://developer.android.com/guide/topics/ui/accessibility)
- [TalkBack Gestures](https://support.google.com/accessibility/android/answer/6151827)
- [Material Accessibility](https://material.io/design/usability/accessibility.html)
