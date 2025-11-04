---
work_package_id: "WP05"
subtasks:
  - "T022"
  - "T023"
  - "T024"
  - "T025"
  - "T026"
  - "T027"
title: "Sobriety Tracking"
phase: "Phase 2 - Core Features"
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

# Work Package Prompt: WP05 – Sobriety Tracking

## Objectives & Success Criteria

**Goal**: Sobriety date tracking, relapse logging, milestone celebrations with mutual visibility

**Success Criteria**:
- Sobriety streak calculates correctly after relapses
- Milestones detected within 24 hours of occurrence
- Sponsor receives compassionate notification on sponsee relapse
- Multiple substances tracked independently

## Context & Constraints

**Prerequisites**: WP02 (user profiles), WP04 (connections for notifications)

**Key Docs**: [data-model.md](../../data-model.md#2-sobrietydate) - SobrietyDate and Relapse entities

**Architecture**: PostgreSQL triggers for streak calculations, pg_cron for milestone detection

**Milestones**: 1, 7, 30, 60, 90, 180, 365, 730 days

## Subtasks

### T022 – Create SobrietyDate and Relapse tables

**Schema with auto-calculation triggers**:
```sql
CREATE TABLE sobriety_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  substance_type TEXT CHECK (substance_type IN ('alcohol', 'drugs', 'gambling', 'other')),
  substance_name TEXT,
  sobriety_start_date DATE NOT NULL,

  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  total_relapses INTEGER DEFAULT 0,

  milestones_achieved INTEGER[] DEFAULT '{}',
  next_milestone_date DATE,
  next_milestone_days INTEGER
);

CREATE TABLE relapses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sobriety_date_id UUID REFERENCES sobriety_dates(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  relapse_date DATE NOT NULL,
  private_note TEXT CHECK (length(private_note) <= 1000),
  sponsor_notified BOOLEAN DEFAULT FALSE
);

-- Trigger to update streak on insert/update
CREATE OR REPLACE FUNCTION update_sobriety_streak() RETURNS TRIGGER AS $$
BEGIN
  -- Calculate current streak (days since last relapse or sobriety_start_date)
  UPDATE sobriety_dates SET
    current_streak_days = (
      SELECT COALESCE(
        EXTRACT(DAY FROM (CURRENT_DATE - MAX(r.relapse_date))),
        EXTRACT(DAY FROM (CURRENT_DATE - sobriety_start_date))
      )
      FROM relapses r WHERE r.sobriety_date_id = NEW.sobriety_date_id
    ),
    longest_streak_days = GREATEST(longest_streak_days, current_streak_days),
    total_relapses = (SELECT COUNT(*) FROM relapses WHERE sobriety_date_id = NEW.sobriety_date_id)
  WHERE id = NEW.sobriety_date_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER relapse_inserted
  AFTER INSERT ON relapses
  FOR EACH ROW EXECUTE FUNCTION update_sobriety_streak();
```

### T023 – Build sobriety tracking screen

**UI Features**:
- Add sobriety date form (substance, start date)
- Current streak display with visual progress
- Milestone timeline (past and upcoming)
- Multiple substances support (list view)

**Service**:
```typescript
export const addSobrietyDate = async (params: {
  userId: string
  substanceType: string
  substanceName?: string
  startDate: string
}) => {
  const { data, error } = await supabase
    .from('sobriety_dates')
    .insert(params)
    .single()
  if (error) throw error
  return data
}

export const getSobrietyDates = async (userId: string) => {
  const { data, error } = await supabase
    .from('sobriety_dates')
    .select('*')
    .eq('user_id', userId)
  if (error) throw error
  return data
}
```

### T024 – Implement relapse logging

**UI**: Compassionate relapse logging form
- Date picker (relapse occurred)
- Optional private note (max 1000 chars)
- "This is private, only you can see this note" disclaimer
- Confirmation: "Log relapse" button

**Service**:
```typescript
export const logRelapse = async (params: {
  sobrietyDateId: string
  relapseDate: string
  privateNote?: string
}) => {
  const { data, error } = await supabase
    .from('relapses')
    .insert(params)
    .single()

  if (error) throw error

  // Trigger notifies sponsor automatically
  return data
}
```

**Parallel**: Can develop parallel to T025

### T025 – Create milestone detection cron job

**Edge Function**:
```typescript
// supabase/functions/check-milestones/index.ts
serve(async (req) => {
  const supabase = createClient(...)

  // Get all sobriety dates approaching milestones
  const { data: sobrietyDates } = await supabase
    .from('sobriety_dates')
    .select('*, user:users(*)')
    .gte('current_streak_days', 0)

  for (const sd of sobrietyDates) {
    const milestones = [1, 7, 30, 60, 90, 180, 365, 730]
    const nextMilestone = milestones.find(m => !sd.milestones_achieved.includes(m) && sd.current_streak_days >= m)

    if (nextMilestone) {
      // Update achieved milestones
      await supabase
        .from('sobriety_dates')
        .update({
          milestones_achieved: [...sd.milestones_achieved, nextMilestone]
        })
        .eq('id', sd.id)

      // Send celebration notification
      await invokeSendNotification({
        userId: sd.user_id,
        title: `🎉 ${nextMilestone}-Day Milestone!`,
        body: `Congratulations on ${nextMilestone} days of sobriety!`,
        type: 'milestone_celebration'
      })

      // Notify connections
      const { data: connections } = await supabase
        .from('connections')
        .select('sponsor_id, sponsee_id')
        .or(`sponsor_id.eq.${sd.user_id},sponsee_id.eq.${sd.user_id}`)

      for (const conn of connections) {
        const partnerId = conn.sponsor_id === sd.user_id ? conn.sponsee_id : conn.sponsor_id
        await invokeSendNotification({
          userId: partnerId,
          title: 'Milestone Celebration!',
          body: `${sd.user.name} reached ${nextMilestone} days sober!`
        })
      }
    }
  }

  return new Response('OK', { status: 200 })
})
```

**Cron Setup**:
```sql
SELECT cron.schedule('check-milestones', '0 8 * * *', $$
  SELECT net.http_post(
    url := 'https://[project-id].functions.supabase.co/check-milestones',
    headers := '{"Authorization": "Bearer [anon-key]"}'::jsonb
  );
$$);
```

**Parallel**: Can develop parallel to T024

### T026 – Build milestone celebration UI

**Features**:
- Milestone achievement notification handler
- Celebration animation (confetti, badge)
- Share milestone option (social media)
- Milestone history view

### T027 – Implement mutual visibility

**Sponsor View**: See sponsee's sobriety data on their profile
- Current streak display
- Recent milestones
- Compassionate messaging on relapses

**RLS Policy**:
```sql
-- Sponsors can see sponsee sobriety data
CREATE POLICY "Sponsors can view sponsee sobriety"
  ON sobriety_dates FOR SELECT
  USING (
    user_id IN (
      SELECT sponsee_id FROM connections WHERE sponsor_id = auth.uid() AND status = 'active'
    )
  );
```

## Test Strategy

- Unit: Test streak calculation logic with various relapse scenarios
- Integration: Add sobriety date → log relapse → verify streak resets
- Cron: Test milestone detection with mock data (adjust dates to today)

## Risks & Mitigations

**Risk**: Date calculations must handle timezones correctly
- Mitigation: Use UTC for all date storage, convert to user timezone for display
- Mitigation: Test with users in different timezones

**Risk**: Private notes must remain private (RLS enforcement)
- Mitigation: Strict RLS policies on relapses table
- Mitigation: Test that sponsors CANNOT see private notes

## Definition of Done

- [ ] SobrietyDate and Relapse tables created with triggers
- [ ] Users can add/edit sobriety dates
- [ ] Relapse logging works with streak recalculation
- [ ] Milestone detection runs daily via pg_cron
- [ ] Milestone notifications sent to user and connections
- [ ] Sponsor can view sponsee sobriety data (not private notes)
- [ ] Tests pass for streak calculations

## Activity Log

- 2025-11-03 – system – lane=planned – Prompt created

---

**Next**: `/spec-kitty.implement WP05` (parallel with WP06/WP07)
