# Matching Flow Test Plan (T091)

**Feature**: User Story 3 - Browse Potential Matches
**Date**: 2025-11-05
**Status**: Ready for Testing

## Overview

This test plan validates the complete matching flow from viewing matches to sending connection requests, including filtering, detail views, rate limiting, and decline functionality.

## Prerequisites

- User must be authenticated
- User must have a profile with role set (sponsor/sponsee)
- Test database should have sample match records
- User should have <5 connection requests sent today for rate limit testing

## Test Scenarios

### 1. View Matches List

**Objective**: Verify matches display correctly with all information

**Steps**:

1. Navigate to Matches tab
2. Observe loading state appears
3. Wait for matches to load

**Expected Results**:

- ✅ Loading spinner shows "Finding your matches..."
- ✅ Matches list displays with profile cards
- ✅ Each card shows:
  - Profile photo or default avatar
  - Name
  - Location (city, state)
  - Recovery program
  - Bio preview (first 3 lines)
  - Availability chips (up to 3, with "+N more" if applicable)
  - Compatibility badge with score and color
  - "Send Connection Request" button
- ✅ Cards are tappable
- ✅ List is scrollable if >3 matches

**Pass Criteria**: All match information displays correctly with proper formatting

---

### 2. Empty State - No Matches

**Objective**: Verify empty state with profile completion tips

**Steps**:

1. Test with user who has no matches
2. Navigate to Matches tab
3. Observe empty state display

**Expected Results**:

- ✅ Empty state icon (account-search) displays
- ✅ "No Matches Yet" title shows
- ✅ Profile completion card shows:
  - Completion percentage (calculated)
  - Progress bar (visual)
  - List of missing fields
- ✅ Tips card with lightbulb icon
- ✅ "Improve Profile" button present
- ✅ Footer text explains matching criteria

**Pass Criteria**: Empty state provides clear, actionable guidance

---

### 3. Filter Matches - Recovery Program

**Objective**: Verify recovery program filtering works correctly

**Steps**:

1. View matches list with multiple recovery programs
2. Tap "Recovery Program" filter chip
3. Select one or more programs (e.g., "AA", "NA")
4. Observe filter application

**Expected Results**:

- ✅ Filter menu opens with all recovery programs listed
- ✅ Selected programs show checkbox-marked icon
- ✅ Filter chip updates with count: "Recovery Program (2)"
- ✅ Active filter chip appears below with program name
- ✅ Matches list filters to show only selected programs
- ✅ Filter application is instant (300ms delay for visual feedback)

**Pass Criteria**: Only matches with selected programs display

---

### 4. Filter Matches - Availability

**Objective**: Verify availability filtering works correctly

**Steps**:

1. View matches list
2. Tap "Availability" filter chip
3. Select one or more availability slots (e.g., "Weekday Evenings")
4. Observe filter application

**Expected Results**:

- ✅ Filter menu opens with all availability options
- ✅ Selected options show checkbox-marked icon
- ✅ Filter chip updates with count: "Availability (1)"
- ✅ Active filter chip appears below
- ✅ Matches filter to show only those with matching availability
- ✅ Matches with ANY of the selected slots display

**Pass Criteria**: Only matches with selected availability display

---

### 5. Combined Filters

**Objective**: Verify multiple filters work together

**Steps**:

1. Apply both recovery program AND availability filters
2. Observe results

**Expected Results**:

- ✅ Both filter types apply simultaneously (AND logic)
- ✅ Multiple active chips display for each filter type
- ✅ Matches must match ALL filter criteria
- ✅ "Clear All" button appears when filters active

**Pass Criteria**: Combined filters correctly narrow results

---

### 6. Clear Filters

**Objective**: Verify filter clearing works correctly

**Steps**:

1. Apply multiple filters
2. Click "Clear All" button OR
3. Click X on individual active filter chips

**Expected Results**:

- ✅ "Clear All" removes all filters at once
- ✅ Individual chip X removes only that filter
- ✅ Matches list updates immediately
- ✅ Filter chips reset to default state
- ✅ All matches display again

**Pass Criteria**: Filters clear correctly and matches restore

---

### 7. Empty Filter Results

**Objective**: Verify empty state when no matches pass filters

**Steps**:

1. Apply very specific filters with no matches
2. Observe empty state

**Expected Results**:

- ✅ Filter-off icon displays
- ✅ "No Matches Found" title
- ✅ "Try adjusting your filters" message
- ✅ "Clear Filters" button present
- ✅ Clicking button restores all matches

**Pass Criteria**: Helpful empty state for filtered results

---

### 8. Pull to Refresh

**Objective**: Verify refresh functionality works

**Steps**:

1. View matches list
2. Pull down from top of list
3. Release to trigger refresh

**Expected Results**:

- ✅ Refresh spinner appears during pull
- ✅ Matches reload from database
- ✅ Loading indicator shows during refresh
- ✅ List updates with latest data
- ✅ Scroll position resets to top
- ✅ Error alert shows if refresh fails

**Pass Criteria**: Matches refresh successfully

---

### 9. View Match Details

**Objective**: Verify detail modal displays complete information

**Steps**:

1. Tap any match card
2. Observe modal opens
3. Review all displayed information
4. Scroll through modal content

**Expected Results**:

- ✅ Modal opens with smooth animation
- ✅ Close button (X) in top-right
- ✅ Profile section shows:
  - Large avatar (96px)
  - Name
  - Location (city, state, country)
- ✅ Large compatibility badge displays
- ✅ "About" section with full bio
- ✅ Recovery program with heart-pulse icon
- ✅ Sobriety journey with calendar icon (days count)
- ✅ All availability slots with chips
- ✅ Role badge (sponsor/sponsee) with icon
- ✅ Action buttons at bottom:
  - "Decline" (outlined, left, 1/3 width)
  - "Connect" (contained, right, 2/3 width)
- ✅ Modal is scrollable for long content

**Pass Criteria**: All profile information displays correctly

---

### 10. Send Connection Request - From Card

**Objective**: Verify connection request from match card

**Steps**:

1. View matches list
2. Click "Send Connection Request" on any card
3. Observe confirmation dialog
4. Click "Send"

**Expected Results**:

- ✅ Confirmation dialog appears: "Send a connection request to [Name]?"
- ✅ Dialog has "Cancel" and "Send" buttons
- ✅ Button shows loading state during request
- ✅ Success alert: "Connection request sent!"
- ✅ Match moves from suggested to requested list
- ✅ Card updates or disappears from suggested view

**Pass Criteria**: Connection request sends successfully

---

### 11. Send Connection Request - From Detail Modal

**Objective**: Verify connection request from detail view

**Steps**:

1. Open match detail modal
2. Click "Connect" button
3. Observe request processing

**Expected Results**:

- ✅ "Connect" button shows loading spinner
- ✅ Modal closes after success
- ✅ Success alert: "Connection request sent!"
- ✅ Match no longer appears in suggested list
- ✅ Both "Connect" and "Decline" buttons disabled during loading

**Pass Criteria**: Connection request sends from modal

---

### 12. Rate Limiting - Within Limit

**Objective**: Verify rate limit counter tracks correctly

**Steps**:

1. Send 4 connection requests (under limit)
2. Attempt to send 5th request
3. Observe success

**Expected Results**:

- ✅ All 5 requests succeed (within daily limit)
- ✅ No rate limit error message
- ✅ Each request counts toward daily limit

**Pass Criteria**: 5 requests allowed per day

---

### 13. Rate Limiting - Exceeded

**Objective**: Verify rate limit enforcement

**Steps**:

1. Send 5 connection requests (reach limit)
2. Attempt to send 6th request
3. Observe rate limit error

**Expected Results**:

- ✅ 6th request fails immediately
- ✅ Error alert displays: "Daily connection request limit reached (5/5). Please try again tomorrow."
- ✅ Button returns to normal state (not loading)
- ✅ Match remains in suggested list
- ✅ No database change occurs

**Pass Criteria**: Rate limit blocks 6th request with clear message

---

### 14. Decline Match - Confirmation

**Objective**: Verify decline confirmation dialog

**Steps**:

1. Open match detail modal
2. Click "Decline" button
3. Observe confirmation dialog
4. Click "Cancel"

**Expected Results**:

- ✅ Confirmation dialog appears with warning text
- ✅ Dialog states 30-day cooldown period
- ✅ "Cancel" and "Decline" buttons present
- ✅ "Decline" button styled as destructive (red)
- ✅ Clicking "Cancel" closes dialog
- ✅ Match remains in suggested list
- ✅ No database change occurs

**Pass Criteria**: Decline requires confirmation

---

### 15. Decline Match - Confirmed

**Objective**: Verify decline action works correctly

**Steps**:

1. Open match detail modal
2. Click "Decline" button
3. Confirm decline in dialog

**Expected Results**:

- ✅ "Decline" button shows loading state
- ✅ Modal closes after processing
- ✅ Alert: "Match Declined. You will not see this match for 30 days."
- ✅ Match moves to declined list
- ✅ Match removed from suggested list
- ✅ declined_at timestamp set in database

**Pass Criteria**: Match declines successfully with cooldown

---

### 16. Accessibility - Screen Reader

**Objective**: Verify screen reader compatibility

**Steps**:

1. Enable screen reader (iOS VoiceOver or Android TalkBack)
2. Navigate through matches screen
3. Test all interactive elements

**Expected Results**:

- ✅ All elements have proper accessibility labels
- ✅ Match cards announce: "Match with [Name]"
- ✅ Compatibility badges announce: "Compatibility score: X out of 100, [Quality] match"
- ✅ Buttons announce their action
- ✅ Filter chips announce selected state
- ✅ Modal elements properly labeled
- ✅ Navigation order is logical

**Pass Criteria**: All elements accessible via screen reader

---

### 17. Error Handling - Network Failure

**Objective**: Verify graceful error handling

**Steps**:

1. Disable network connection
2. Try to send connection request
3. Observe error handling

**Expected Results**:

- ✅ Error alert displays: "Failed to send connection request. Please try again."
- ✅ Button returns to normal state
- ✅ No UI crashes or hangs
- ✅ User can retry after restoring connection
- ✅ Error message is user-friendly

**Pass Criteria**: Errors handled gracefully with clear messages

---

### 18. Performance - Large Match List

**Objective**: Verify performance with many matches

**Steps**:

1. Load matches list with 20+ matches
2. Scroll through entire list
3. Apply filters
4. Open multiple detail modals

**Expected Results**:

- ✅ List renders smoothly without lag
- ✅ Scrolling is smooth (60 FPS)
- ✅ Images load progressively
- ✅ Filter application is instant
- ✅ Modal opens without delay
- ✅ Memory usage remains stable

**Pass Criteria**: Smooth performance with many matches

---

## Test Data Requirements

### Sample Matches

**Match 1 - High Compatibility**:

- Name: "John D."
- Location: "Boston, MA"
- Recovery Program: "Alcoholics Anonymous (AA)"
- Availability: ["Weekday Evenings", "Weekend Mornings"]
- Bio: "5 years sober, love hiking and meditation..."
- Compatibility Score: 92
- Role: sponsor

**Match 2 - Medium Compatibility**:

- Name: "Sarah M."
- Location: "Boston, MA"
- Recovery Program: "SMART Recovery"
- Availability: ["Weekday Mornings", "Flexible"]
- Bio: "Working on my recovery one day at a time..."
- Compatibility Score: 68
- Role: sponsee

**Match 3 - Low Compatibility**:

- Name: "Mike T."
- Location: "Cambridge, MA"
- Recovery Program: "Narcotics Anonymous (NA)"
- Availability: ["Weekend Evenings"]
- Bio: "New to recovery, seeking support..."
- Compatibility Score: 45
- Role: sponsor

## Defect Reporting

If a test fails, document:

1. Test scenario number
2. Expected vs actual behavior
3. Screenshots (if applicable)
4. Console errors (if any)
5. Reproduction steps
6. Device/platform information

## Sign-Off

**Tester**: **\*\*\*\***\_**\*\*\*\***
**Date**: **\*\*\*\***\_**\*\*\*\***
**Result**: ☐ Pass ☐ Fail ☐ Partial
**Notes**: **\*\*\*\***\_**\*\*\*\***

---

## Automation Notes (Future)

Tests suitable for automation:

- T091.1: View matches list rendering
- T091.3-7: Filter functionality
- T091.8: Pull to refresh
- T091.12-13: Rate limiting logic
- T091.15: Decline action

Tests requiring manual verification:

- T091.2: Empty state visual design
- T091.9: Detail modal scrolling experience
- T091.16: Screen reader navigation
- T091.18: Performance/smoothness
