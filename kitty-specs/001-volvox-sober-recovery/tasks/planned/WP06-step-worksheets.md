---
work_package_id: "WP06"
subtasks:
  - "T028"
  - "T029"
  - "T030"
  - "T031"
  - "T032"
  - "T033"
title: "12-Step Worksheets"
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

# Work Package Prompt: WP06 – 12-Step Worksheets

## Objectives & Success Criteria

**Goal**: Structured step worksheets with sponsor editing and progress tracking

**Success Criteria**:
- All 12 steps available with default questions
- Responses auto-save every 30 seconds without user action
- Sponsor comments appear inline with sponsee responses
- Step completion updates progress on both dashboards

## Context & Constraints

**Prerequisites**: WP04 (requires active connections)

**Key Docs**: [data-model.md](../../data-model.md#7-step) - Step and StepWork entities

**Architecture**: JSONB for flexible response storage, auto-save with debounce

**Constraints**:
- Large text responses may hit JSONB size limits (monitor and validate)
- Auto-save must handle offline scenarios gracefully
- Sponsor can only edit their sponsees' step work

## Subtasks

### T028 – Create Step and StepWork tables

**Schema**:
```sql
CREATE TABLE steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_number INTEGER UNIQUE CHECK (step_number BETWEEN 1 AND 12),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  default_questions TEXT[] NOT NULL
);

CREATE TABLE step_work (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  sponsee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sponsor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  step_id UUID REFERENCES steps(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES connections(id) ON DELETE CASCADE,

  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  responses JSONB DEFAULT '[]',
  custom_questions JSONB DEFAULT '[]',

  UNIQUE(sponsee_id, sponsor_id, step_id)
);

-- Trigger on completion
CREATE OR REPLACE FUNCTION handle_step_completion() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Update user's current_step
    UPDATE users SET current_step = GREATEST(current_step, (
      SELECT step_number FROM steps WHERE id = NEW.step_id
    ))
    WHERE id = NEW.sponsee_id;

    -- Send notifications
    -- (handled by Edge Function invocation)
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER step_work_completed
  AFTER UPDATE ON step_work
  FOR EACH ROW EXECUTE FUNCTION handle_step_completion();
```

### T029 – Seed database with 12 AA steps

**Seed Script** (`supabase/seed.sql`):
```sql
INSERT INTO steps (step_number, title, description, default_questions) VALUES
(1, 'Step 1: Powerlessness', 'We admitted we were powerless over alcohol—that our lives had become unmanageable.', ARRAY[
  'Describe a time when you felt powerless over your substance use.',
  'In what ways has your life become unmanageable?',
  'What are the consequences of your substance use?'
]),
(2, 'Step 2: Came to Believe', 'Came to believe that a Power greater than ourselves could restore us to sanity.', ARRAY[
  'What does "sanity" mean to you in the context of recovery?',
  'Describe your understanding of a higher power.',
  'How do you envision this power helping you?'
]),
-- ... (repeat for steps 3-12)
```

**Complete all 12 steps** with 3-5 default questions each based on AA literature

### T030 – Build step worksheet screen

**UI Components**:
- Step header (number, title, description)
- Progress indicator (not_started / in_progress / completed)
- Question-answer sections (auto-expanding text areas)
- Auto-save indicator ("Saved" / "Saving...")
- Navigation (previous/next step)

**Auto-Save Logic**:
```typescript
import { useDebounce } from 'use-debounce'

export const StepWorksheetScreen = ({ stepId }) => {
  const [responses, setResponses] = useState<Response[]>([])
  const [debouncedResponses] = useDebounce(responses, 30000) // 30 seconds

  useEffect(() => {
    // Auto-save when debounced responses change
    saveStepWork(stepId, debouncedResponses)
  }, [debouncedResponses])

  const handleResponseChange = (questionId: string, answer: string) => {
    setResponses(prev => prev.map(r =>
      r.question_id === questionId ? { ...r, answer } : r
    ))
  }

  return (
    <ScrollView>
      <StepHeader step={currentStep} />
      {responses.map(response => (
        <QuestionSection
          key={response.question_id}
          question={response.question_text}
          answer={response.answer}
          onChange={(answer) => handleResponseChange(response.question_id, answer)}
        />
      ))}
      <AutoSaveIndicator lastSaved={lastSavedAt} />
    </ScrollView>
  )
}
```

**Service**:
```typescript
export const saveStepWork = async (stepWorkId: string, responses: Response[]) => {
  const { data, error } = await supabase
    .from('step_work')
    .update({
      responses,
      updated_at: new Date().toISOString(),
      status: 'in_progress'
    })
    .eq('id', stepWorkId)

  if (error) throw error
  return data
}
```

**Parallel**: Can develop parallel to T031

### T031 – Implement sponsor comment system

**UI**: Sponsor view of sponsee step work
- Read-only questions and answers
- Inline comment boxes per question
- Comment history (sponsor can edit own comments)

**Schema Update** (responses JSONB structure):
```typescript
{
  question_id: string
  question_text: string
  answer: string | null
  sponsor_comments: string | null
  last_updated_at: string
}
```

**Service**:
```typescript
export const addSponsorComment = async (
  stepWorkId: string,
  questionId: string,
  comment: string
) => {
  const { data: stepWork } = await supabase
    .from('step_work')
    .select('responses')
    .eq('id', stepWorkId)
    .single()

  const updatedResponses = stepWork.responses.map(r =>
    r.question_id === questionId
      ? { ...r, sponsor_comments: comment }
      : r
  )

  const { data, error } = await supabase
    .from('step_work')
    .update({ responses: updatedResponses })
    .eq('id', stepWorkId)

  if (error) throw error
  return data
}
```

**Parallel**: Can develop parallel to T030

### T032 – Create sponsor customization

**Features**:
- Edit existing question text
- Add custom questions (up to 10 per step)
- Reorder questions (drag and drop)
- Delete custom questions

**UI**: Sponsor-only edit mode toggle

**Service**:
```typescript
export const addCustomQuestion = async (
  stepWorkId: string,
  questionText: string
) => {
  const { data: stepWork } = await supabase
    .from('step_work')
    .select('custom_questions')
    .eq('id', stepWorkId)
    .single()

  const newQuestion = {
    question_id: uuid(),
    question_text: questionText,
    answer: null,
    sponsor_comments: null
  }

  const { data, error } = await supabase
    .from('step_work')
    .update({
      custom_questions: [...stepWork.custom_questions, newQuestion]
    })
    .eq('id', stepWorkId)

  if (error) throw error
  return data
}
```

### T033 – Build step completion flow

**UI**: Sponsor marks step as complete
- Review all responses
- Add final summary comment
- "Mark Complete" button
- Confirmation dialog

**Service**:
```typescript
export const completeStep = async (stepWorkId: string) => {
  const { data, error } = await supabase
    .from('step_work')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', stepWorkId)

  if (error) throw error

  // Trigger sends notifications automatically
  return data
}
```

**Dashboard Integration**:
- Update sponsee progress indicator
- Show completed steps with checkmarks
- Unlock next step for sponsee

## Test Strategy

- Unit: Test auto-save debounce logic
- Unit: Test JSONB response structure validation
- Integration: Complete step workflow (start → answer → comment → complete)
- E2E: Sponsee fills step → sponsor reviews → marks complete

## Risks & Mitigations

**Risk**: Large text responses hit JSONB size limits
- Mitigation: Validate answer length client-side (max 5000 chars per answer)
- Mitigation: Monitor JSONB payload sizes, alert if approaching limits

**Risk**: Auto-save offline scenarios
- Mitigation: Queue failed saves, retry when online
- Mitigation: Show offline indicator to user

## Definition of Done

- [ ] Step and StepWork tables created
- [ ] 12 AA steps seeded with default questions
- [ ] Step worksheet screen with auto-save
- [ ] Sponsor comment system working
- [ ] Sponsor can customize questions
- [ ] Step completion flow functional
- [ ] Progress updates on both dashboards
- [ ] Tests pass for step workflow

## Activity Log

- 2025-11-03 – system – lane=planned – Prompt created

---

**Next**: `/spec-kitty.implement WP06` (parallel with WP05/WP07)
