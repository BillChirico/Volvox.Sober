---
work_package_id: "WP08"
subtasks:
  - "T040"
  - "T041"
  - "T042"
  - "T043"
  - "T044"
  - "T045"
title: "Theme & Polish"
phase: "Phase 3 - Polish & Launch Prep"
lane: "planned"
assignee: ""
agent: ""
shell_pid: ""
history:
  - timestamp: "2025-11-03"
    lane: "planned"
    agent: "system"
    shell_pid: ""
    action: "Prompt generated via /spec-kitty.tasks"
---

# Work Package Prompt: WP08 – Theme & Polish

## Objectives & Success Criteria

**Goal**: Dark/light mode, accessibility compliance, performance optimization, production deployment

**Success Criteria**:
- Theme switches instantly with no visual glitches
- All text meets WCAG AA contrast standards (4.5:1 ratio)
- App launches in < 2 seconds on mid-range devices
- Offline mode works gracefully for cached data
- Production Supabase running with proper backups and monitoring

## Context & Constraints

**Prerequisites**: All previous work packages (WP01-WP07)

**Key Docs**: [spec.md](../../spec.md) - User Story 7 (theme support)

**Architecture**: System preference detection, persistent theme storage, app store requirements

**Constraints**:
- Accessibility issues may require UI redesigns
- Performance bottlenecks surface only under production load
- App store review process unpredictable (1-7 days)

## Subtasks

### T040 – Implement dark/light theme switching

**Theme Provider Enhancement** (extends WP01 T004):
```typescript
// mobile/src/theme/ThemeProvider.tsx
import AsyncStorage from '@react-native-async-storage/async-storage'

export const ThemeProvider: React.FC = ({ children }) => {
  const systemTheme = useColorScheme()
  const [mode, setMode] = useState<ThemeMode>('system')

  useEffect(() => {
    // Load saved preference
    loadThemePreference()
  }, [])

  const loadThemePreference = async () => {
    const saved = await AsyncStorage.getItem('theme_preference')
    if (saved) setMode(saved as ThemeMode)
  }

  const setAndSaveMode = async (newMode: ThemeMode) => {
    setMode(newMode)
    await AsyncStorage.setItem('theme_preference', newMode)

    // Sync to database
    await supabase
      .from('users')
      .update({ theme_preference: newMode })
      .eq('id', currentUserId)
  }

  const currentTheme = mode === 'system'
    ? colors[systemTheme || 'light']
    : colors[mode]

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, mode, setMode: setAndSaveMode }}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      {children}
    </ThemeContext.Provider>
  )
}
```

**Settings Screen**:
- Theme toggle: Light / Dark / System
- Instant preview on selection
- Persist across app restarts

**Test All Screens**:
- Verify all components respect theme context
- Check for hard-coded colors (should use theme tokens)
- Test smooth transitions (no flash on theme change)

### T041 – Accessibility audit (WCAG 2.1 Level AA)

**Audit Checklist**:
1. **Color Contrast**:
   - All text meets 4.5:1 contrast ratio (use contrast checker tools)
   - Interactive elements meet 3:1 contrast ratio
   - Test both light and dark themes

2. **Screen Reader Support**:
   - All images have `accessibilityLabel`
   - Buttons have descriptive labels (not "button" or "tap here")
   - Form inputs have associated labels
   - Meaningful focus order

3. **Keyboard Navigation**:
   - All interactive elements reachable via keyboard
   - Focus indicators visible
   - Tab order logical

4. **Touch Targets**:
   - Minimum 44x44pt touch target size
   - Adequate spacing between interactive elements

**Tools**:
- Use `jest-axe` for automated accessibility testing
- Manual testing with VoiceOver (iOS) and TalkBack (Android)

**Example Test**:
```typescript
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

test('Button component has no accessibility violations', async () => {
  const { container } = render(<Button title="Submit" onPress={() => {}} />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

**Remediation**:
- Fix all critical and serious violations
- Document minor violations with mitigation plans

### T042 – Performance optimization

**Optimization Areas**:

1. **Lazy Loading**:
   ```typescript
   // Lazy load non-critical screens
   const ProfileScreen = lazy(() => import('./screens/profile/ProfileScreen'))
   const StepWorksheetScreen = lazy(() => import('./screens/steps/StepWorksheetScreen'))
   ```

2. **Image Optimization**:
   - Compress profile photos to 1024x1024 @ 80% quality
   - Use `FastImage` for caching and progressive loading
   - Implement image placeholders (blur-up)

3. **Bundle Splitting**:
   ```bash
   # Analyze bundle size
   npx react-native-bundle-visualizer
   ```
   - Code-split large libraries (moment.js → date-fns)
   - Remove unused dependencies
   - Enable Hermes engine for JavaScript performance

4. **Query Optimization**:
   - Add indexes to frequently queried tables
   - Use React Query for caching and deduplication
   - Implement pagination for large lists

5. **Startup Performance**:
   - Measure with `react-native-performance`
   - Optimize splash screen duration
   - Defer non-critical initializations

**Performance Budget**:
- App launch: < 2 seconds
- Screen navigation: < 300ms
- API requests: < 1 second (p95)
- Bundle size: < 15MB

**Test**: Run performance profiler on mid-range device (iPhone 11, Pixel 4a)

### T043 – Error handling and offline UX

**Error Handling**:
```typescript
// Global error boundary
export class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error tracking service (Sentry, Bugsnag)
    logError(error, errorInfo)

    // Show user-friendly error screen
    this.setState({ hasError: true })
  }

  render() {
    if (this.state.hasError) {
      return <ErrorScreen onRetry={() => this.setState({ hasError: false })} />
    }
    return this.props.children
  }
}
```

**Offline Support**:
- Detect network status with `@react-native-community/netinfo`
- Show offline banner when disconnected
- Queue writes for retry when online
- Cache read queries with React Query

**User-Friendly Messages**:
- Replace technical errors with plain language
- Provide actionable retry/help options
- Add "Contact Support" button for persistent errors

### T044 – Production Supabase deployment

**Deployment Steps**:
1. Create Supabase production project
2. Run all migrations:
   ```bash
   supabase db push --db-url postgresql://[prod-connection-string]
   ```
3. Seed production data (12 steps, sample users)
4. Configure environment variables:
   ```
   SUPABASE_URL=[prod-url]
   SUPABASE_ANON_KEY=[prod-anon-key]
   FCM_SERVER_KEY=[prod-fcm-key]
   ```
5. Set up backups (daily automated backups)
6. Configure monitoring:
   - Supabase Dashboard alerts
   - Set up error tracking (Sentry)
   - Monitor RLS policy performance

**Security Checklist**:
- Verify all RLS policies in production
- Rotate service_role key (don't use in mobile app)
- Enable 2FA for Supabase account
- Review CORS settings
- Test auth flows end-to-end

**Performance Tuning**:
- Enable connection pooling (pgBouncer)
- Configure read replicas if needed
- Set up CDN for static assets (profile photos)

### T045 – App Store and Google Play submission

**iOS App Store**:
1. **Xcode Configuration**:
   - Set bundle identifier: `com.volvox.sober`
   - Configure signing certificates
   - Increment build number

2. **App Store Connect**:
   - Create app listing
   - Upload app icon (1024x1024)
   - Write app description (emphasizing privacy, recovery support)
   - Add screenshots (6.5" and 5.5" required)
   - Set privacy policy URL
   - Select age rating (17+ for recovery content)

3. **Submission**:
   - Archive and upload via Xcode
   - Submit for review
   - Address reviewer feedback

**Google Play Store**:
1. **Android Configuration**:
   - Set `applicationId` in `build.gradle`: `com.volvox.sober`
   - Increment `versionCode`
   - Generate signed APK/AAB

2. **Google Play Console**:
   - Create app listing
   - Upload app icon (512x512)
   - Write short and full descriptions
   - Add screenshots (phone and tablet)
   - Set content rating (use rating questionnaire)
   - Configure pricing (free)

3. **Submission**:
   - Upload AAB via Play Console
   - Complete store listing
   - Submit for review

**Required Assets**:
- App icon (adaptive for Android, standard for iOS)
- Screenshots (5-8 per device size)
- Privacy policy (hosted on website)
- Terms of service
- Support email address

**App Store Optimization**:
- Keywords: sobriety, recovery, sponsor, AA, 12-step
- Localization (English only for MVP)

## Test Strategy

- Manual: Test theme switching on all screens
- Automated: Run accessibility tests with jest-axe
- Performance: Profile app on real devices
- Production: Smoke test all critical user flows in production environment

## Risks & Mitigations

**Risk**: Accessibility issues require UI redesigns
- Mitigation: Audit early in Phase 3, allocate time for fixes
- Mitigation: Prioritize critical violations first

**Risk**: Performance bottlenecks under production load
- Mitigation: Load test with realistic user counts (1000+ concurrent)
- Mitigation: Monitor APM metrics in first week of launch

**Risk**: App store review delays or rejections
- Mitigation: Follow guidelines strictly (privacy policy, age rating)
- Mitigation: Respond promptly to reviewer feedback
- Fallback: TestFlight (iOS) and Open Testing (Android) for early users

## Definition of Done

- [ ] Theme switching works across all screens
- [ ] Accessibility audit complete with violations addressed
- [ ] Performance meets budget (< 2s launch, < 300ms navigation)
- [ ] Error handling and offline UX implemented
- [ ] Production Supabase deployed with monitoring
- [ ] iOS and Android apps submitted to stores
- [ ] App store assets complete (icons, screenshots, descriptions)
- [ ] Privacy policy and terms of service published

## Review Guidance

**Critical Checks**:
1. Test theme switching on every screen (no hard-coded colors)
2. Run contrast checker on all text elements
3. Test with screen reader (VoiceOver/TalkBack)
4. Verify production environment security (RLS policies)
5. Review app store listings for accuracy and appeal

**Launch Readiness**:
- All P1 and P2 features complete and tested
- Production database stable under load
- Error tracking and monitoring operational
- Support email monitored and responsive

## Activity Log

- 2025-11-03 – system – lane=planned – Prompt created

---

**Next**: `/spec-kitty.implement WP08` (after WP01-WP07 complete)

**🚀 After WP08**: Ready for production launch!
