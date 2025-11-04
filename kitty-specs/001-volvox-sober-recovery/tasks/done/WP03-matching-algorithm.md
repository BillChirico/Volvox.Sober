---
work_package_id: "WP03"
subtasks:
  - "T011"
  - "T012"
  - "T013"
  - "T014"
  - "T015"
title: "Sponsor Matching Algorithm"
phase: "Phase 1 - MVP Core"
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

# Work Package Prompt: WP03 – Sponsor Matching Algorithm

## Objectives & Success Criteria

**Goal**: Implement SQL-based compatibility scoring and match generation for sponsees

**Success Criteria**:
- Matching query returns results in < 200ms for 1000+ users
- Compatibility scores range from 0-100 with clear reasoning
- Sponsees see 3-5 diverse matches (not just closest geographically)
- Match list updates when profile preferences change

## Context & Constraints

**Prerequisites**: WP01 (database), WP02 (user profiles with bio and location)

**Key Docs**: [data-model.md](../../data-model.md#12-match) - Match entity and scoring algorithm

**Architecture**: SQL-based weighted scoring using PostgreSQL full-text search, trigram similarity, and geographic distance

**Constraints**:
- Matching quality depends on sufficient user data (need seed data)
- Performance critical (must refresh hourly via pg_cron)
- Materialized view storage considerations

## Subtasks & Detailed Guidance

### T011 – Create matching algorithm SQL function with weighted scoring

**SQL Implementation** (see data-model.md for full query):
```sql
CREATE OR REPLACE FUNCTION calculate_match_score(
  sponsee_id UUID,
  sponsor_id UUID
) RETURNS NUMERIC AS $$
SELECT (
  0.3 * ts_rank(sp.bio_search, to_tsquery('english', s.bio)) +
  0.2 * similarity(sp.bio, s.bio) +
  0.2 * (1.0 - LEAST(earth_distance(...) / 160934.0, 1.0)) +
  0.15 * (CASE WHEN gender_match THEN 1.0 ELSE 0.0 END) +
  0.15 * (CASE WHEN capacity_available THEN 1.0 ELSE 0.0 END)
) * 100 AS score
FROM users s, users sp
WHERE s.id = sponsee_id AND sp.id = sponsor_id;
$$ LANGUAGE SQL;
```

**Test**: Verify scoring with known user pairs

### T012 – Add full-text search indexes

```sql
CREATE INDEX idx_users_bio_search ON users USING GIN(bio_search);
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

**Test**: Benchmark query performance with/without indexes

### T013 – Implement geographic distance calculation

```sql
CREATE EXTENSION IF NOT EXISTS earthdistance CASCADE;
```

Use `earth_distance()` for proximity scoring (100 miles = perfect match)

### T014 – Create matches materialized view with hourly refresh

```sql
CREATE MATERIALIZED VIEW matches AS
SELECT * FROM calculate_all_matches();

CREATE OR REPLACE FUNCTION refresh_matches() RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY matches;
END;
$$ LANGUAGE plpgsql;

-- Schedule with pg_cron
SELECT cron.schedule('refresh-matches', '0 * * * *', 'SELECT refresh_matches()');
```

### T015 – Build sponsor match list screen with compatibility breakdown

**UI Components**:
- MatchCard showing: Name, photo, bio snippet, compatibility score (0-100)
- Compatibility breakdown: Bio relevance, proximity, demographics
- "Send Request" button
- Filter/sort options (distance, score, availability)

**Service**:
```typescript
export const getMatches = async (sponseeId: string) => {
  const { data, error } = await supabase
    .from('matches')
    .select('*, sponsor:users!sponsor_id(*)')
    .eq('sponsee_id', sponseeId)
    .order('compatibility_score', { ascending: false })
    .limit(10)

  if (error) throw error
  return data
}
```

## Test Strategy

- Unit: Test scoring function with known inputs
- Integration: Query 1000+ users, verify < 200ms
- E2E: Sponsee views match list, sees 3-5 diverse matches

## Risks & Mitigations

**Risk**: Matching quality with few users
- Mitigation: Create comprehensive seed data (100+ sponsor profiles)
- Fallback: Show "limited matches" message with fewer results

**Risk**: Performance degradation with large datasets
- Mitigation: Monitor query execution plans, optimize indexes
- Mitigation: Consider partitioning matches table by sponsee_id

## Definition of Done

- [ ] Matching SQL function returns scores 0-100
- [ ] Full-text search indexes created and tested
- [ ] Geographic distance calculation working
- [ ] Materialized view refreshes hourly
- [ ] Match list screen displays with compatibility breakdown
- [ ] Performance < 200ms for 1000+ users
- [ ] Tests pass with realistic seed data

## Activity Log

- 2025-11-03 – system – lane=planned – Prompt created

---

**Next**: `/spec-kitty.implement WP03` (after WP02)
