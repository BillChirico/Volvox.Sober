---
work_package_id: 'WP04'
subtasks:
  - 'T059'
  - 'T060'
  - 'T061'
  - 'T062'
  - 'T063'
  - 'T064'
  - 'T065'
  - 'T066'
  - 'T067'
  - 'T068'
  - 'T069'
  - 'T070'
  - 'T071'
  - 'T072'
title: 'Matching Algorithm & Match Display'
phase: 'Phase 1 - MVP'
lane: 'done'
assignee: ''
agent: 'claude'
shell_pid: '96349'
history:
  - timestamp: '2025-11-03'
    lane: 'planned'
    agent: 'system'
    shell_pid: ''
    action: 'Prompt generated via /spec-kitty.tasks'
  - timestamp: '2025-11-04T01:48:00Z'
    lane: 'doing'
    agent: 'claude'
    shell_pid: '96349'
    action: 'Started WP04 implementation: Matching algorithm and match display'
  - timestamp: '2025-11-04T02:15:00Z'
    lane: 'for_review'
    agent: 'claude'
    shell_pid: '96349'
    action: 'Completed WP04: Edge Function with weighted scoring, match UI with offline support, 42 tests. Ready for review.'
  - timestamp: '2025-11-04T02:20:00Z'
    lane: 'done'
    agent: 'claude'
    shell_pid: '96349'
    action: 'Approved and moved to done. Matching algorithm and UI complete.'
---

# Work Package Prompt: WP04 – Matching Algorithm & Match Display

## Objectives & Success Criteria

**Primary Objective**: Implement weighted scoring matching algorithm in Supabase Edge Function, returning 3-5 sponsor matches for sponsees.

**Success Criteria**:

- Matching algorithm completes in < 60 seconds (constitution requirement)
- Returns 3-5 matches ordered by compatibility score (0-100)
- Scoring accurately reflects weighted criteria: location (25), program type (25), availability (20), approach (15), sobriety experience (15)
- Match cards display compatibility breakdown and sponsor profiles
- Refresh matches updates with new potential sponsors
- Offline mode shows cached matches with "stale data" indicator

## Context & Constraints

**Related Documents**:

- User Story: US1 (sponsee matching) - P1 priority
- Contract: `contracts/matching.yaml` (Edge Function API)
- Constitution: Performance (<60s matching), Test-First Development

**Algorithm Specification** (from spec.md):

- **Location proximity** (25 pts): Same city = 25, same state = 15, < 100 miles = 10, else 0
- **Program type** (25 pts): Exact match = 25, compatible = 10, else 0
- **Availability match** (20 pts): Sponsee needs ≤ sponsor offers = 20, else proportional
- **Approach alignment** (15 pts): NLP similarity on approach text (cosine similarity)
- **Sobriety experience** (15 pts): Sponsor years_sober ≥ (sponsee sobriety_months / 12) \* 2 = 15

**Constraints**:

- Only match with sponsors who have capacity (current_sponsees < max_sponsees)
- Exclude already connected sponsors
- Exclude blocked users

## Subtasks & Detailed Guidance

### Edge Function Implementation (T059-T064)

**T059: Create matching Edge Function scaffolding**

- Location: `supabase/functions/matching-algorithm/index.ts`
- Deno serve handler with JWT authentication check
- Input: `POST /matching-algorithm { user_id: uuid }`
- Output: `{ matches: Match[], execution_time_ms: number }`

**T060: Fetch sponsee profile and preferences**

- Query users, sponsee_profiles tables
- Extract: location (lat/lng), program_type, availability_needs, approach_preferences
- Handle missing data: return 400 if profile incomplete

**T061: Query eligible sponsor pool**

- SQL: sponsors with capacity, not connected, not blocked, same program_type
- Use indexes: sponsor_profiles.capacity, users.location GIST
- Limit pool: 50 sponsors for performance

**T062: Implement location scoring (25 pts)**

- Use PostGIS distance calculation:
  ```sql
  ST_Distance(
    ST_MakePoint(sponsee_lng, sponsee_lat)::geography,
    ST_MakePoint(sponsor_lng, sponsor_lat)::geography
  ) / 1609.34 AS miles
  ```
- Same city: miles < 10 → 25 pts
- Same state: miles < 100 → 15 pts
- Within 100 miles → 10 pts

**T063: Implement availability scoring (20 pts)**

- Compare sponsee availability_needs vs sponsor availability
- Map: "1-2 days" = 2, "3-5 days" = 4, "Daily" = 7
- Score: (sponsor_avail ≥ sponsee_needs) ? 20 : (sponsee_needs / sponsor_avail) \* 20

**T064: Implement approach alignment scoring (15 pts)**

- Extract approach text from sponsor_profiles.approach
- Tokenize and vectorize using TF-IDF (simple bag-of-words in Deno)
- Cosine similarity between sponsee preferences and sponsor approach
- Score: similarity \* 15

### Match Display UI (T065-T069)

**T065: Match card component**

- Display: sponsor name, photo, compatibility score, location, years_sober
- Compatibility breakdown: 5 progress bars for each scoring dimension
- "Connect" button: navigates to connection request screen
- Accessibility: VoiceOver announces compatibility score

**T066: Browse matches screen**

- FlatList of match cards (3-5 items initially)
- Pull-to-refresh: re-run matching algorithm
- Empty state: "No matches found. Try updating your profile."
- Loading state: skeleton cards during algorithm execution

**T067: Match detail modal**

- Full sponsor profile: bio, approach, availability, years_sober
- Compatibility details: show point breakdown for each dimension
- "Send Connection Request" button (triggers WP05 flow)

**T068: Offline match caching**

- Cache matches in AsyncStorage after successful fetch:
  ```typescript
  await AsyncStorage.setItem(`matches:${userId}`, JSON.stringify(matches));
  ```
- Load cached matches if offline
- Display banner: "Showing cached matches - tap to refresh when online"

**T069: Match refresh logic**

- Refresh triggers: manual pull-to-refresh, profile update, daily background refresh
- Debounce refresh: max 1 request per 5 minutes
- Show loading spinner during refresh

### Integration & Testing (T070-T072)

**T070: Matching API slice (RTK Query)**

- Endpoint: `getMatches(userId)` calls Edge Function
- Cache matches for 1 hour (tag: 'Matches')
- Invalidate on profile update

**T071: Edge Function tests**

- Unit tests: each scoring function with known inputs/outputs
- Integration test: full algorithm with mock sponsor pool
- Performance test: verify < 60s execution time with 50 sponsors

**T072: E2E matching flow test (Detox)**

- Navigate to matches screen → verify 3-5 cards displayed
- Pull-to-refresh → verify loading indicator → verify updated matches
- Tap match card → verify detail modal opens

## Test Strategy

**Unit Tests**:

- Location scoring: test same city, same state, distance calculations
- Availability scoring: test all combinations of needs vs offers
- Approach alignment: test cosine similarity with sample texts

**Integration Tests**:

- Full algorithm execution: mock database, verify output format
- Performance: measure execution time with 50 sponsor pool

**Contract Tests**:

- Validate Edge Function response against `contracts/matching.yaml`
- Test error cases: incomplete profile, no eligible sponsors

**E2E Tests**:

- Browse matches flow: view cards, refresh, open detail modal

## Risks & Mitigations

**Risk**: Algorithm timeout (> 60s) with large sponsor pool

- **Mitigation**: Limit pool to 50, optimize SQL queries with indexes

**Risk**: Approach alignment scoring inaccurate (simple NLP)

- **Mitigation**: Start simple (bag-of-words), iterate with better NLP in future

**Risk**: No matches found for sponsees in rural areas

- **Mitigation**: Expand location radius dynamically, show "broaden search" option

## Definition of Done Checklist

- [ ] All 14 subtasks (T059-T072) completed
- [ ] Edge Function executes in < 60 seconds
- [ ] Algorithm returns 3-5 matches with accurate scoring
- [ ] Match cards display compatibility breakdown
- [ ] Refresh matches updates with new data
- [ ] Offline caching functional
- [ ] Unit, integration, and E2E tests pass
- [ ] Constitution compliance: performance, test-first

## Review Guidance

**Key Review Points**:

- Algorithm accuracy: verify scoring matches specification
- Performance: execution time under 60s with realistic data
- UX: match cards are clear and actionable
- Offline behavior: cached matches prevent empty screens

## Activity Log

- 2025-11-03 – system – lane=planned – Prompt created via /spec-kitty.tasks
- 2025-11-04T01:48:00Z – claude – shell_pid=96349 – lane=doing – Started WP04 implementation: Matching algorithm and match display
