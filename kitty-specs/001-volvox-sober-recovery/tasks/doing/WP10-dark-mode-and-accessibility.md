---
work_package_id: 'WP10'
subtasks:
  - 'T143'
  - 'T144'
  - 'T145'
  - 'T146'
  - 'T147'
  - 'T148'
  - 'T149'
  - 'T150'
  - 'T151'
  - 'T152'
  - 'T153'
  - 'T154'
  - 'T155'
  - 'T156'
  - 'T157'
  - 'T158'
  - 'T159'
  - 'T160'
title: 'Dark Mode & Accessibility'
phase: 'Phase 3 - Enhancements'
lane: "doing"
assignee: ''
agent: "claude"
shell_pid: "68650"
history:
  - timestamp: '2025-11-03'
    lane: 'planned'
    agent: 'system'
    shell_pid: ''
    action: 'Prompt generated via /spec-kitty.tasks'
---

# Work Package Prompt: WP10 – Dark Mode & Accessibility

## Objectives & Success Criteria

**Primary Objective**: Implement dark mode with WCAG AA compliance and comprehensive accessibility features.

**Success Criteria**:

- Dark mode toggles in < 1 second with no visual glitches (constitution requirement)
- All text meets WCAG AA contrast ratios (4.5:1 minimum)
- VoiceOver (iOS) and TalkBack (Android) support for all screens
- Touch targets meet minimum size requirements (44x44pt iOS, 48x48dp Android)
- Keyboard navigation functional for all interactive elements
- Font scaling supports Dynamic Type (iOS) and system font size (Android)

## Context & Constraints

**Related Documents**:

- User Story: US7 (dark mode) - P3 priority
- Constitution: UX Consistency (WCAG AA, theme-aware typography), Performance (<1s theme switching)

**Technical Requirements**:

- React Native Paper theming system
- AsyncStorage for theme persistence
- No hard-coded colors or font sizes

## Subtasks & Detailed Guidance

### Theme System (T143-T147)

**T143: React Native Paper theme configuration**

- Define light theme:
  ```typescript
  const lightTheme = {
    ...MD3LightTheme,
    colors: {
      primary: '#007AFF',
      background: '#FFFFFF',
      text: '#000000',
      // ... all color tokens
    },
  };
  ```
- Define dark theme:
  ```typescript
  const darkTheme = {
    ...MD3DarkTheme,
    colors: {
      primary: '#0A84FF',
      background: '#000000',
      text: '#FFFFFF',
      // ... all color tokens
    },
  };
  ```

**T144: Verify WCAG AA contrast ratios**

- Use WebAIM Contrast Checker for all text/background combinations
- Minimum ratio: 4.5:1 for normal text, 3:1 for large text (18pt+)
- Adjust colors if failing: lighten dark backgrounds, darken light backgrounds

**T145: Theme context provider**

- Create ThemeContext with toggleTheme function
- Wrap app in PaperProvider with current theme
- Persist theme preference in AsyncStorage: `userSettings:theme`

**T146: Theme toggle UI**

- Settings screen: toggle switch "Dark Mode"
- Show current theme with preview (light/dark icon)
- Apply theme change immediately (no app restart required)

**T147: Eliminate hard-coded colors**

- Search codebase for hex colors: `grep -r "#[0-9A-Fa-f]{6}" src/`
- Replace all with theme tokens: `theme.colors.primary`
- Use `useTheme()` hook in all components

### Accessibility Features (T148-T153)

**T148: VoiceOver/TalkBack labels**

- Add `accessibilityLabel` to all interactive elements:
  ```typescript
  <Button accessibilityLabel="Send connection request">
  ```
- Describe button actions, not just text (e.g., "Send message" not "Send")

**T149: Touch target sizing**

- Verify all buttons, links, inputs meet minimum size:
  - iOS: 44x44pt
  - Android: 48x48dp
- Add padding to small icons to meet requirements

**T150: Focus indicators**

- Style focused elements with border/highlight
- Ensure keyboard navigation shows focus state clearly
- Test with external keyboard on iOS/Android

**T151: Heading hierarchy**

- Use `accessibilityRole="header"` for screen titles
- Define hierarchy: header → text → button
- Screen readers announce structure correctly

**T152: Dynamic Type and font scaling**

- Use Paper typography components: `<Text variant="bodyLarge">`
- Never hard-code font sizes
- Test with iOS Dynamic Type (Settings → Accessibility → Display & Text Size)
- Test with Android system font size (Settings → Display → Font size)

**T153: Form accessibility**

- Label all inputs: `<TextInput label="Email" accessibilityLabel="Enter your email">`
- Announce validation errors: `accessibilityLiveRegion="polite"`
- Group related fields: `accessibilityRole="group"`

### Accessibility Testing (T154-T158)

**T154: VoiceOver testing (iOS)**

- Enable VoiceOver: Settings → Accessibility → VoiceOver
- Navigate all screens with swipe gestures
- Verify all elements announced correctly
- Test form submission, error handling

**T155: TalkBack testing (Android)**

- Enable TalkBack: Settings → Accessibility → TalkBack
- Navigate all screens with swipe gestures
- Verify all elements announced correctly
- Test form submission, error handling

**T156: Contrast ratio validation**

- Run automated tool: axe DevTools or Accessibility Inspector
- Manually verify all text/background combinations
- Document exceptions (decorative elements, disabled states)

**T157: Keyboard navigation testing**

- Connect external keyboard to device
- Tab through all interactive elements
- Verify focus indicators visible
- Test form submission with Enter key

**T158: Font scaling testing**

- iOS: test at largest Dynamic Type setting
- Android: test at largest system font size
- Verify no text truncation, layout overflow

### Documentation & Polish (T159-T160)

**T159: Accessibility documentation**

- Document all accessibility features in README
- Include testing instructions (VoiceOver, TalkBack, font scaling)
- List WCAG AA compliance status per screen

**T160: Theme transition animation**

- Add smooth fade animation on theme change (200ms duration)
- Prevent "flash" during switch
- Use React Native Reanimated for performant transitions

## Test Strategy

**Manual Testing**:

- VoiceOver/TalkBack: navigate all screens, verify announcements
- Contrast ratios: verify all text meets WCAG AA
- Touch targets: verify all interactive elements meet minimum size
- Font scaling: verify layouts adapt to large text sizes

**Automated Testing**:

- Use @testing-library/react-native for accessibility queries
- Test `getByRole`, `getByLabelText` for all interactive elements

**E2E Testing** (Detox):

- Toggle dark mode → verify theme changes in < 1s
- Enable VoiceOver → verify screen reader announces elements

## Risks & Mitigations

**Risk**: Theme toggle causes layout shifts

- **Mitigation**: Test all screens with dark theme during development

**Risk**: Contrast ratios fail on certain backgrounds

- **Mitigation**: Use color contrast checker in design phase

**Risk**: VoiceOver announcements too verbose or confusing

- **Mitigation**: User testing with screen reader users

## Definition of Done Checklist

- [ ] All 18 subtasks (T143-T160) completed
- [ ] Dark mode toggles in < 1 second
- [ ] All text meets WCAG AA contrast ratios
- [ ] VoiceOver/TalkBack tested on all screens
- [ ] Touch targets meet minimum size requirements
- [ ] Font scaling tested at largest sizes
- [ ] No hard-coded colors or font sizes remain
- [ ] Accessibility documentation complete
- [ ] Constitution compliance: WCAG AA, performance

## Review Guidance

**Key Review Points**:

- Contrast ratios verified with automated tools
- VoiceOver/TalkBack tested by accessibility expert (if possible)
- Font scaling tested at largest system settings
- Theme toggle is smooth and performant

## Activity Log

- 2025-11-03 – system – lane=planned – Prompt created via /spec-kitty.tasks
- 2025-11-04T20:44:24Z – claude – shell_pid=68650 – lane=doing – Started implementation of Dark Mode & Accessibility
