# Technical Research: All Application Screens

**Feature**: 002-app-screens
**Date**: 2025-11-05
**Status**: Complete

This document contains research findings and technical decisions for implementing all main application screens in Volvox.Sober.

---

## 1. Expo Router Navigation Patterns

### Decision: File-Based Routing with Route Groups

**Chosen Approach**: Expo Router 4.x file-based routing with route groups for logical organization

**Rationale**:

- Expo Router provides type-safe navigation with zero configuration
- File-based routing maps directly to URL structure (critical for web support)
- Route groups `(tabs)`, `(onboarding)`, `(auth)` provide logical organization without affecting URLs
- Built-in support for layouts, nested navigation, and deep linking
- Native tab bar integration with automatic state preservation

**Implementation Details**:

```typescript
// Route structure
app/
├── (tabs)/          // Main app navigation - requires auth + onboarding complete
│   ├── _layout.tsx  // Bottom tab navigator
│   └── *.tsx        // Tab screens
├── (onboarding)/    // Onboarding flow - requires auth only
│   ├── _layout.tsx  // Stack navigator
│   └── *.tsx        // Onboarding steps
├── (auth)/          // Auth screens - public
│   ├── _layout.tsx  // Stack navigator
│   └── *.tsx        // Auth screens
├── _layout.tsx      // Root layout with providers
└── index.tsx        // Entry point with redirect logic
```

**Protected Routes Implementation**:

```typescript
// app/_layout.tsx (Root layout)
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Redirect, Slot } from 'expo-router';

export default function RootLayout() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isComplete, isLoading: onboardingLoading } = useOnboarding();

  if (authLoading || onboardingLoading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      <ReduxProvider>
        <Slot />
      </ReduxProvider>
    </ThemeProvider>
  );
}

// app/index.tsx (Entry point with routing logic)
export default function Index() {
  const { isAuthenticated } = useAuth();
  const { isComplete } = useOnboarding();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!isComplete) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return <Redirect href="/(tabs)/sobriety" />;
}
```

**Notification Badges**:

Use React Navigation's built-in badge system with Expo Router:

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { useUnreadCount } from '@/hooks/useMessages';
import { usePendingCount } from '@/hooks/useConnections';

export default function TabLayout() {
  const unreadMessages = useUnreadCount();
  const pendingConnections = usePendingCount();

  return (
    <Tabs>
      <Tabs.Screen
        name="messages"
        options={{
          tabBarBadge: unreadMessages > 0 ? unreadMessages : undefined,
        }}
      />
      <Tabs.Screen
        name="connections"
        options={{
          tabBarBadge: pendingConnections > 0 ? pendingConnections : undefined,
        }}
      />
    </Tabs>
  );
}
```

**Deep Linking**:

Expo Router automatically handles deep links based on file structure:

- `volvoxsober://sobriety` → `app/(tabs)/sobriety.tsx`
- `volvoxsober://messages/thread-123` → `app/(tabs)/messages/[id].tsx`

**Alternatives Considered**:

- ❌ React Navigation manual setup: More boilerplate, no type safety
- ❌ Custom navigation solution: Reinventing the wheel, poor web support

**References**:

- https://docs.expo.dev/router/introduction/
- https://docs.expo.dev/router/advanced/tabs/

---

## 2. Supabase Realtime for Messaging

### Decision: Broadcast with Private Channels + Redux Normalization

**Chosen Approach**: Use Supabase Realtime Broadcast (not Postgres Changes) with private channels and RLS authorization

**Rationale**:

- **Broadcast over Postgres Changes**: Broadcast scales better and doesn't require WAL consumption per client
- **Private Channels**: RLS policies on `realtime.messages` table provide row-level security
- **Redux Integration**: Normalize messages in Redux for offline support and optimistic updates
- **Delivery Status**: Track sent/delivered/read status in database, broadcast state changes

**Architecture**:

```typescript
// Message flow
1. User sends message → Optimistic update in Redux
2. Insert into database → Triggers broadcast via database function
3. Broadcast received → Update Redux with server-confirmed message
4. Read receipt → Update message status, broadcast to sender
```

**Implementation Pattern**:

```typescript
// services/messageService.ts
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export class MessageService {
  private channels: Map<string, RealtimeChannel> = new Map();

  // Subscribe to connection's message thread
  async subscribeToThread(connectionId: string, callback: (message: Message) => void) {
    await supabase.realtime.setAuth(); // Required for RLS

    const channel = supabase
      .channel(`connection:${connectionId}`, {
        config: { private: true }, // Enable RLS authorization
      })
      .on('broadcast', { event: 'new_message' }, payload => {
        callback(payload.payload as Message);
      })
      .on('broadcast', { event: 'message_read' }, payload => {
        // Update read status in Redux
      })
      .subscribe();

    this.channels.set(connectionId, channel);
    return channel;
  }

  // Send message with optimistic update
  async sendMessage(connectionId: string, text: string) {
    const optimisticMessage = {
      id: crypto.randomUUID(),
      connectionId,
      senderId: (await supabase.auth.getUser()).data.user!.id,
      text,
      createdAt: new Date().toISOString(),
      status: 'sending' as const,
    };

    // Optimistic update (handled by Redux thunk)
    return optimisticMessage;
  }

  // Cleanup on unmount
  unsubscribeFromThread(connectionId: string) {
    const channel = this.channels.get(connectionId);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(connectionId);
    }
  }
}
```

**Database Trigger for Broadcast**:

```sql
-- Function to broadcast new messages
CREATE OR REPLACE FUNCTION public.broadcast_new_message()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'connection:' || NEW.connection_id::text,
    'new_message',
    'INSERT',
    'messages',
    'public',
    NEW,
    NULL
  );
  RETURN NEW;
END;
$$;

-- Trigger on message insert
CREATE TRIGGER broadcast_message_trigger
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION broadcast_new_message();
```

**Reconnection Handling**:

```typescript
// Automatic reconnection with backoff
channel.subscribe((status, err) => {
  if (status === 'CHANNEL_ERROR') {
    console.error('Channel error:', err);
    // Expo Router auto-retries with exponential backoff
  }

  if (status === 'TIMED_OUT') {
    console.warn('Subscription timed out, retrying...');
  }

  if (status === 'SUBSCRIBED') {
    // Fetch missed messages since last_seen_at
    fetchMissedMessages();
  }
});
```

**Offline Queue**:

Use Redux Persist to queue messages while offline, sync when online:

```typescript
// store/messages/messagesSlice.ts
const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    byId: {},
    offlineQueue: [], // Messages waiting to be sent
  },
  reducers: {
    queueMessage: (state, action) => {
      state.offlineQueue.push(action.payload);
    },
    flushQueue: state => {
      // Triggered when network returns
      state.offlineQueue.forEach(msg => {
        // Send via messageService
      });
      state.offlineQueue = [];
    },
  },
});
```

**Alternatives Considered**:

- ❌ Postgres Changes: Doesn't scale well, consumes WAL for each client
- ❌ WebSockets without Supabase: Custom infrastructure, no built-in auth/RLS
- ❌ HTTP polling: High latency, poor UX, unnecessary server load

**References**:

- Supabase Realtime Broadcast docs (loaded via MCP)
- https://supabase.com/docs/guides/realtime/authorization

---

## 3. Matching Algorithm Design

### Decision: Weighted Scoring with Filtering + Edge Function

**Chosen Approach**: Multi-criteria weighted compatibility scoring executed in Supabase Edge Function

**Rationale**:

- **Server-Side Execution**: Prevents gaming the algorithm, reduces client bundle size
- **Filtering First**: Eliminate incompatible matches before scoring (performance)
- **Weighted Scores**: Different criteria have different importance levels
- **Spam Prevention**: 30-day decline cooldown, request rate limiting

**Compatibility Scoring Formula**:

```typescript
// Weight distribution (must sum to 1.0)
const weights = {
  recoveryProgram: 0.35,    // Same program is critical
  availability: 0.25,       // Schedule compatibility
  location: 0.20,           // Geographic proximity
  experienceLevel: 0.15,    // Matching experience to needs
  preferences: 0.05,        // Optional preference match
};

// Scoring functions
function scorePro program(user: Profile, candidate: Profile): number {
  return user.recoveryProgram === candidate.recoveryProgram ? 1.0 : 0.0;
}

function scoreAvailability(user: Profile, candidate: Profile): number {
  const overlap = user.availability.filter(
    slot => candidate.availability.includes(slot)
  );
  return overlap.length / Math.max(user.availability.length, candidate.availability.length);
}

function scoreLocation(user: Profile, candidate: Profile): number {
  if (user.city === candidate.city && user.state === candidate.state) return 1.0;
  if (user.state === candidate.state) return 0.5;
  return 0.0;
}

function scoreExperience(sponsee: Profile, sponsor: Profile): number {
  const sobrietyDaysNeeded = 365; // Minimum 1 year sober to sponsor
  const sponsorDays = calculateDaysSober(sponsor.sobrietyStartDate);
  return Math.min(sponsorDays / sobrietyDaysNeeded, 1.0);
}

// Final compatibility score (0-100)
function calculateCompatibility(user: Profile, candidate: Profile): number {
  const score =
    weights.recoveryProgram * scoreRecoveryProgram(user, candidate) +
    weights.availability * scoreAvailability(user, candidate) +
    weights.location * scoreLocation(user, candidate) +
    weights.experienceLevel * scoreExperience(user, candidate) +
    weights.preferences * scorePreferences(user, candidate);

  return Math.round(score * 100);
}
```

**Edge Function Implementation**:

```typescript
// supabase/functions/calculate-match-score/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { userId } = await req.json();

  // Get user profile
  const { data: user } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  // Filter candidates by role (sponsors for sponsees, vice versa)
  const oppositeRole = user.role === 'sponsor' ? 'sponsee' : 'sponsor';

  // Get candidates (filtered, not declined in last 30 days)
  const { data: candidates } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', oppositeRole)
    .not('id', 'in', `(
      SELECT candidate_id FROM matches
      WHERE user_id = '${userId}'
      AND status = 'declined'
      AND declined_at > NOW() - INTERVAL '30 days'
    )`);

  // Calculate scores
  const scored Matches = candidates.map(candidate => ({
    ...candidate,
    compatibilityScore: calculateCompatibility(user, candidate),
  }));

  // Sort by score, insert into matches table
  const topMatches = scoredMatches
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, 20); // Top 20 matches

  return new Response(JSON.stringify({ matches: topMatches }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

**Spam Prevention**:

```sql
-- RLS policy to enforce 30-day decline cooldown
CREATE POLICY "Users cannot see declined matches within 30 days"
ON matches
FOR SELECT
USING (
  auth.uid() = user_id
  AND (
    status != 'declined'
    OR declined_at < NOW() - INTERVAL '30 days'
  )
);

-- Rate limit on connection requests (max 5 per day)
CREATE OR REPLACE FUNCTION check_connection_request_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (
    SELECT COUNT(*)
    FROM connections
    WHERE sponsor_id = NEW.sponsor_id
    AND sponsee_id = NEW.sponsee_id
    AND created_at > NOW() - INTERVAL '1 day'
  ) >= 5 THEN
    RAISE EXCEPTION 'Connection request limit exceeded (5 per day)';
  END IF;
  RETURN NEW;
END;
$$;
```

**Client-Side Filtering**:

```typescript
// Additional filtering on client side
const filteredMatches = matches
  .filter(match => match.compatibilityScore >= 50) // Minimum 50% compatibility
  .filter(match => {
    // Apply user's specific filters
    if (filters.program && match.recoveryProgram !== filters.program) return false;
    if (filters.availability && !hasAvailabilityOverlap(match, filters.availability)) return false;
    return true;
  });
```

**Alternatives Considered**:

- ❌ Client-side scoring: Exposes algorithm, can be gamed
- ❌ Machine learning: Overkill for MVP, requires training data
- ❌ Simple random matching: Poor user experience, low engagement

**References**:

- Collaborative filtering algorithms
- Content-based recommendation systems

---

## 4. Offline-First Architecture

### Decision: Redux Persist + Optimistic Updates + Background Sync

**Chosen Approach**: Three-tier offline strategy with Redux Persist, optimistic UI updates, and background sync queue

**Rationale**:

- **Redux Persist**: Automatic state hydration on app restart
- **Optimistic Updates**: Immediate UI feedback, rollback on failure
- **Background Sync**: Queue mutations while offline, sync when network returns
- **Granular Persistence**: Only persist necessary slices (not ephemeral UI state)

**Redux Persist Configuration**:

```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Persist config
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['profile', 'sobriety', 'matches', 'connections', 'messages'], // Persist these
  blacklist: ['auth', 'ui'], // Don't persist ephemeral state
  version: 1,
  migrate: state => {
    // Handle version migrations
    return Promise.resolve(state);
  },
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
```

**Optimistic Update Pattern**:

```typescript
// store/messages/messagesThunks.ts
export const sendMessage = createAsyncThunk(
  'messages/send',
  async ({ connectionId, text }: SendMessageArgs, { dispatch, rejectWithValue }) => {
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      connectionId,
      senderId: getCurrentUserId(),
      text,
      createdAt: new Date().toISOString(),
      status: 'sending',
    };

    // Add optimistic message immediately
    dispatch(messagesSlice.actions.addOptimisticMessage(optimisticMessage));

    try {
      // Attempt to send to server
      const { data, error } = await supabase
        .from('messages')
        .insert({ connection_id: connectionId, text })
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic message with server-confirmed one
      dispatch(
        messagesSlice.actions.replaceOptimisticMessage({
          tempId: optimisticMessage.id,
          message: data,
        }),
      );

      return data;
    } catch (error) {
      // Rollback optimistic update, show error
      dispatch(messagesSlice.actions.removeOptimisticMessage(optimisticMessage.id));
      return rejectWithValue(error.message);
    }
  },
);
```

**Background Sync Queue**:

```typescript
// store/syncQueue/syncQueueSlice.ts
const syncQueueSlice = createSlice({
  name: 'syncQueue',
  initialState: {
    pendingActions: [] as PendingAction[],
    isSyncing: false,
  },
  reducers: {
    enqueueMutation: (state, action) => {
      state.pendingActions.push({
        id: crypto.randomUUID(),
        type: action.payload.type,
        data: action.payload.data,
        timestamp: Date.now(),
      });
    },
    processSyncQueue: state => {
      state.isSyncing = true;
    },
    completeSyncAction: (state, action) => {
      state.pendingActions = state.pendingActions.filter(a => a.id !== action.payload.id);
    },
    completeSyncQueue: state => {
      state.isSyncing = false;
    },
  },
});

// Middleware to process queue when network returns
export const syncMiddleware: Middleware = store => next => action => {
  if (action.type === 'network/online') {
    store.dispatch(processSyncQueue());
  }
  return next(action);
};
```

**Network Status Detection**:

```typescript
// hooks/useNetworkStatus.ts
import NetInfo from '@react-native-community/netinfo';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

export function useNetworkStatus() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        dispatch({ type: 'network/online' });
      } else {
        dispatch({ type: 'network/offline' });
      }
    });

    return unsubscribe;
  }, [dispatch]);
}
```

**Stale-While-Revalidate Pattern**:

```typescript
// Show cached data immediately, fetch fresh data in background
export const fetchSobrietyRecord = createAsyncThunk(
  'sobriety/fetch',
  async (userId: string, { getState }) => {
    const state = getState() as RootState;
    const cached = state.sobriety.records[userId];

    // Return cached immediately if exists
    if (cached) {
      // Dispatch action to show cached data
      dispatch(sobrietySlice.actions.showCachedData(cached));
    }

    // Fetch fresh data in background
    const { data } = await supabase
      .from('sobriety_records')
      .select('*')
      .eq('user_id', userId)
      .single();

    return data;
  },
);
```

**Alternatives Considered**:

- ❌ No offline support: Poor UX in spotty networks
- ❌ Full local database (SQLite): Complexity overkill for this app
- ❌ Service Workers (web-only): Doesn't help native apps

**References**:

- https://redux-toolkit.js.org/usage/usage-guide#use-with-redux-persist
- https://github.com/rt2zz/redux-persist

---

## 5. Cross-Platform Image Optimization

### Decision: Expo Image + WebP with JPEG Fallback + Lazy Loading

**Chosen Approach**: Use Expo's `expo-image` library with WebP format, JPEG fallbacks, and lazy loading

**Rationale**:

- **Expo Image**: Built-in caching, placeholder blurs, lazy loading
- **WebP Format**: 25-35% smaller than JPEG at same quality
- **JPEG Fallback**: Older Android/iOS versions don't support WebP
- **Responsive Sizes**: Generate multiple sizes for different screen densities
- **Lazy Loading**: Only load images when they enter viewport

**Implementation**:

```typescript
// components/common/OptimizedImage.tsx
import { Image, ImageSource } from 'expo-image';
import { StyleSheet } from 'react-native';

interface OptimizedImageProps {
  source: string | ImageSource;
  alt: string;
  width: number;
  height: number;
  priority?: 'low' | 'normal' | 'high';
}

export function OptimizedImage({ source, alt, width, height, priority = 'normal' }: OptimizedImageProps) {
  // Generate responsive source set
  const sources = typeof source === 'string'
    ? [
        { uri: `${source}?w=${width}&f=webp`, width },
        { uri: `${source}?w=${width * 2}&f=webp`, width: width * 2 }, // @2x for Retina
        { uri: `${source}?w=${width * 3}&f=webp`, width: width * 3 }, // @3x for high-DPI
      ]
    : source;

  return (
    <Image
      source={sources}
      style={[styles.image, { width, height }]}
      contentFit="cover"
      placeholder={{ blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.' }} // Blurhash placeholder
      priority={priority}
      accessibilityLabel={alt}
      transition={200} // Fade-in animation
    />
  );
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 8,
  },
});
```

**Image Upload & Processing** (Out of scope for this feature, but documented):

```typescript
// For future image upload feature
// Use Supabase Storage with transformation API

const uploadProfilePhoto = async (file: File) => {
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(`${userId}/profile.jpg`, file, {
      cacheControl: '3600',
      upsert: true,
    });

  // Generate WebP versions via Supabase Transform API
  const webpUrl = supabase.storage.from('avatars').getPublicUrl(`${userId}/profile.jpg`, {
    transform: {
      width: 200,
      height: 200,
      format: 'webp',
      quality: 80,
    },
  });

  return webpUrl.data.publicUrl;
};
```

**Lazy Loading with Intersection Observer**:

```typescript
// components/matches/MatchList.tsx
import { FlashList } from '@shopify/flash-list';

export function MatchList({ matches }: { matches: Match[] }) {
  return (
    <FlashList
      data={matches}
      renderItem={({ item }) => <MatchCard match={item} />}
      estimatedItemSize={120}
      // FlashList handles lazy rendering automatically
      removeClippedSubviews={true}
    />
  );
}
```

**Image Caching Strategy**:

```typescript
// Expo Image auto-caches images in memory and disk
// Configure cache behavior
import { Image } from 'expo-image';

// Clear cache on app update
export async function clearImageCacheOnUpdate() {
  const currentVersion = await getAppVersion();
  const cachedVersion = await AsyncStorage.getItem('app-version');

  if (currentVersion !== cachedVersion) {
    await Image.clearDiskCache();
    await Image.clearMemoryCache();
    await AsyncStorage.setItem('app-version', currentVersion);
  }
}
```

**Bundle Size Impact**:

- `expo-image`: ~50KB (gzipped)
- WebP support: Native (iOS 14+, Android 5+)
- JPEG fallback: Automatic via `<picture>` element on web

**Alternatives Considered**:

- ❌ React Native Image: No lazy loading, poor caching, no WebP support
- ❌ react-native-fast-image: Native module complexity, web support issues
- ❌ Custom image component: Reinventing the wheel

**References**:

- https://docs.expo.dev/versions/latest/sdk/image/
- https://developers.google.com/speed/webp

---

## 6. Accessibility Testing Setup

### Decision: Playwright Accessibility Testing + Manual Screen Reader Validation

**Chosen Approach**: Automated WCAG 2.1 AA testing with Playwright + manual VoiceOver/TalkBack testing

**Rationale**:

- **Playwright**: Built-in accessibility testing via `axe-core` integration
- **Automated Coverage**: Catches 40-60% of accessibility issues automatically
- **Manual Testing**: Required for screen reader flow validation (Playwright can't fully test)
- **CI Integration**: Run accessibility tests on every PR

**Playwright Accessibility Test Setup**:

```typescript
// __tests__/accessibility/onboarding.spec.ts
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Onboarding Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:19006/(onboarding)/welcome');
    await injectAxe(page);
  });

  test('Welcome screen meets WCAG 2.1 AA', async ({ page }) => {
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });
  });

  test('Has accessible labels on interactive elements', async ({ page }) => {
    const nextButton = page.getByRole('button', { name: /next/i });
    await expect(nextButton).toBeVisible();
    await expect(nextButton).toHaveAccessibleName('Next: Select your role');
  });

  test('Color contrast meets WCAG AA standards', async ({ page }) => {
    await checkA11y(page, null, {
      rules: {
        'color-contrast': { enabled: true },
      },
    });
  });

  test('Touch targets are minimum 44x44 points', async ({ page }) => {
    const buttons = await page.getByRole('button').all();

    for (const button of buttons) {
      const box = await button.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('Keyboard navigation works', async ({ page }) => {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBe('BUTTON');
  });
});
```

**React Native Accessibility Props**:

```typescript
// components/common/AccessibleButton.tsx
import { Pressable, Text } from 'react-native';

interface AccessibleButtonProps {
  label: string;
  onPress: () => void;
  hint?: string;
  disabled?: boolean;
}

export function AccessibleButton({ label, onPress, hint, disabled }: AccessibleButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled }}
      style={({ pressed }) => ({
        minWidth: 44,
        minHeight: 44,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text>{label}</Text>
    </Pressable>
  );
}
```

**Manual Screen Reader Test Checklist**:

```markdown
# Screen Reader Testing Checklist

## iOS VoiceOver

- [ ] Enable VoiceOver: Settings → Accessibility → VoiceOver
- [ ] Test navigation: Swipe right/left to move between elements
- [ ] Test actions: Double-tap to activate, swipe up/down for actions
- [ ] Verify custom labels are announced correctly
- [ ] Test form input: Ensure keyboard appears and input is announced

## Android TalkBack

- [ ] Enable TalkBack: Settings → Accessibility → TalkBack
- [ ] Test navigation: Swipe right/left to move between elements
- [ ] Test actions: Double-tap to activate
- [ ] Verify focus order makes logical sense
- [ ] Test custom actions are available in local context menu

## Common Issues to Check

- [ ] Images have meaningful alt text (not "image")
- [ ] Buttons announce their action (not just "button")
- [ ] Form errors are announced when they occur
- [ ] Loading states are announced ("Loading matches...")
- [ ] Dynamic content changes are announced
- [ ] Skip links work (e.g., "Skip to main content")
```

**CI Integration**:

```yaml
# .github/workflows/accessibility.yml
name: Accessibility Tests

on: [pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm start:web & # Start Expo web dev server
      - run: pnpm test:a11y # Run Playwright accessibility tests
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: a11y-violations
          path: playwright-report/
```

**Accessibility Utilities**:

```typescript
// utils/accessibility.ts

// Check if screen reader is active
import { AccessibilityInfo } from 'react-native';

export async function isScreenReaderEnabled(): Promise<boolean> {
  return await AccessibilityInfo.isScreenReaderEnabled();
}

// Announce important changes to screen reader
export function announce(message: string) {
  AccessibilityInfo.announceForAccessibility(message);
}

// Example usage
export function useMilestoneAnnouncement(days: number) {
  useEffect(() => {
    if (days % 30 === 0) {
      // Milestone reached
      announce(`Congratulations! You've reached ${days} days sober.`);
    }
  }, [days]);
}
```

**Alternatives Considered**:

- ❌ Manual testing only: Doesn't scale, misses issues in CI
- ❌ axe DevTools browser extension: Not automated, doesn't test native apps
- ❌ Pa11y: Web-only, no React Native support

**References**:

- https://playwright.dev/docs/accessibility-testing
- https://reactnative.dev/docs/accessibility
- https://www.w3.org/WAI/standards-guidelines/wcag/

---

## 7. State Management Patterns

### Decision: Redux Toolkit with Normalized State + Entity Adapters

**Chosen Approach**: Redux Toolkit with normalized data structure, entity adapters for collections, and async thunks for API calls

**Rationale**:

- **Normalized State**: Avoids duplication, makes updates efficient (especially for messages/connections)
- **Entity Adapters**: Provides CRUD operations (add/remove/update) with performance optimizations
- **Async Thunks**: Handle loading/error states consistently across all API calls
- **Selectors with Reselect**: Memoize derived data to prevent unnecessary re-renders
- **Redux DevTools**: Time-travel debugging, state inspection

**Normalized State Structure**:

```typescript
// store/messages/messagesSlice.ts
import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';

export interface Message {
  id: string;
  connectionId: string;
  senderId: string;
  text: string;
  createdAt: string;
  readAt?: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

// Entity adapter for normalized storage
const messagesAdapter = createEntityAdapter<Message>({
  selectId: message => message.id,
  sortComparer: (a, b) => a.createdAt.localeCompare(b.createdAt),
});

const initialState = messagesAdapter.getInitialState({
  threadsByConnection: {} as Record<string, string[]>, // connectionId -> messageIds
  loading: false,
  error: null as string | null,
});

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    messageReceived: (state, action: PayloadAction<Message>) => {
      // Add to entities
      messagesAdapter.addOne(state, action.payload);

      // Update thread index
      const connectionId = action.payload.connectionId;
      if (!state.threadsByConnection[connectionId]) {
        state.threadsByConnection[connectionId] = [];
      }
      state.threadsByConnection[connectionId].push(action.payload.id);
    },

    messageRead: (state, action: PayloadAction<{ messageId: string }>) => {
      messagesAdapter.updateOne(state, {
        id: action.payload.messageId,
        changes: {
          status: 'read',
          readAt: new Date().toISOString(),
        },
      });
    },
  },
});

// Export selectors
export const messagesSelectors = messagesAdapter.getSelectors((state: RootState) => state.messages);

// Custom selectors
export const selectThreadMessages = (connectionId: string) => (state: RootState) => {
  const messageIds = state.messages.threadsByConnection[connectionId] || [];
  return messageIds.map(id => state.messages.entities[id]).filter(Boolean);
};
```

**Async Thunk Pattern**:

```typescript
// store/connections/connectionsThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { connectionService } from '@/services/connectionService';

export const fetchConnections = createAsyncThunk(
  'connections/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const connections = await connectionService.getAll();
      return connections;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const acceptConnectionRequest = createAsyncThunk(
  'connections/accept',
  async (connectionId: string, { rejectWithValue }) => {
    try {
      const connection = await connectionService.accept(connectionId);
      return connection;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Handle in slice
extraReducers: builder => {
  builder
    .addCase(fetchConnections.pending, state => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchConnections.fulfilled, (state, action) => {
      state.loading = false;
      connectionsAdapter.setAll(state, action.payload);
    })
    .addCase(fetchConnections.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
};
```

**Memoized Selectors with Reselect**:

```typescript
// store/connections/connectionsSelectors.ts
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Base selectors
const selectConnectionsState = (state: RootState) => state.connections;

// Memoized selectors (recalculate only when inputs change)
export const selectPendingRequests = createSelector([selectConnectionsState], connections => {
  return Object.values(connections.entities)
    .filter(c => c?.status === 'pending')
    .sort((a, b) => b!.createdAt.localeCompare(a!.createdAt));
});

export const selectActiveConnections = createSelector([selectConnectionsState], connections => {
  return Object.values(connections.entities)
    .filter(c => c?.status === 'active')
    .sort((a, b) => b!.lastInteractionAt.localeCompare(a!.lastInteractionAt));
});

export const selectConnectionById = (id: string) =>
  createSelector([selectConnectionsState], connections => connections.entities[id]);
```

**Redux Integration with Supabase Realtime**:

```typescript
// store/realtimeMiddleware.ts
import { Middleware } from '@reduxjs/toolkit';
import { messageService } from '@/services/messageService';

export const realtimeMiddleware: Middleware = store => next => action => {
  // Subscribe to realtime when messages screen mounts
  if (action.type === 'messages/subscribeToThread') {
    const { connectionId } = action.payload;

    messageService.subscribeToThread(connectionId, message => {
      store.dispatch({ type: 'messages/messageReceived', payload: message });
    });
  }

  // Unsubscribe when unmounting
  if (action.type === 'messages/unsubscribeFromThread') {
    const { connectionId } = action.payload;
    messageService.unsubscribeFromThread(connectionId);
  }

  return next(action);
};
```

**Store Configuration**:

```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { realtimeMiddleware } from './realtimeMiddleware';
import { syncMiddleware } from './syncMiddleware';

const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    onboarding: onboardingReducer,
    sobriety: sobrietyReducer,
    matches: matchesReducer,
    connections: connectionsReducer,
    messages: messagesReducer,
    syncQueue: syncQueueReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(realtimeMiddleware, syncMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**Hook Patterns**:

```typescript
// hooks/useAppSelector.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Example usage in component
export function ConnectionsList() {
  const dispatch = useAppDispatch();
  const pending = useAppSelector(selectPendingRequests);
  const active = useAppSelector(selectActiveConnections);

  useEffect(() => {
    dispatch(fetchConnections());
  }, [dispatch]);

  return (
    <View>
      <PendingSection requests={pending} />
      <ActiveSection connections={active} />
    </View>
  );
}
```

**Alternatives Considered**:

- ❌ Context API: Poor performance with frequent updates (messages, connections)
- ❌ Zustand: Less ecosystem support, no DevTools, manual normalization
- ❌ MobX: Observable-based patterns don't fit React Native's architecture well
- ❌ Jotai/Recoil: Atomic state doesn't fit well with normalized collections

**References**:

- https://redux-toolkit.js.org/usage/usage-guide
- https://redux.js.org/usage/structuring-reducers/normalizing-state-shape
- https://redux-toolkit.js.org/api/createEntityAdapter

---

## Summary of Decisions

| Area                  | Decision                              | Rationale                                           |
| --------------------- | ------------------------------------- | --------------------------------------------------- |
| Navigation            | Expo Router 4.x with route groups     | Type-safe, file-based, web support, deep linking    |
| Real-time Messaging   | Supabase Broadcast + Private Channels | Scalable, RLS authorization, offline queue          |
| Matching Algorithm    | Weighted scoring in Edge Function     | Server-side execution, spam prevention, filtering   |
| Offline Support       | Redux Persist + Optimistic Updates    | Auto-hydration, immediate feedback, background sync |
| Image Optimization    | Expo Image + WebP/JPEG fallback       | Built-in caching, lazy loading, responsive sizes    |
| Accessibility Testing | Playwright + Manual screen reader     | Automated WCAG checks, manual flow validation       |
| State Management      | Redux Toolkit + Entity Adapters       | Normalized state, memoized selectors, DevTools      |

All decisions align with the project constitution requirements for TypeScript strict mode, TDD, cross-platform consistency, performance standards, component architecture, and security/privacy.

---

**Next Phase**: Generate `data-model.md`, `contracts/`, and `quickstart.md` (Phase 1)
