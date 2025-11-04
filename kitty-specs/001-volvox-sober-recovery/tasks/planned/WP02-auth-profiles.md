---
work_package_id: "WP02"
subtasks:
  - "T006"
  - "T007"
  - "T008"
  - "T009"
  - "T010"
title: "User Authentication & Profiles"
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

# Work Package Prompt: WP02 – User Authentication & Profiles

## Objectives & Success Criteria

**Goal**: Implement Supabase auth with sponsor/sponsee profile creation and editing

**Success Criteria**:
- User can create account, receive email verification, and log in
- Onboarding flow collects all required profile fields per data-model.md
- Profile edit saves successfully and updates display immediately
- Profile photos upload to Supabase Storage and display correctly
- RLS policies enforce profile privacy (own profile full access, connections limited access)

## Context & Constraints

**Prerequisite Work**: WP01 (requires project setup and Supabase config)

**Supporting Documentation**:
- [data-model.md](../../data-model.md) - Complete User entity schema
- [plan.md](../../plan.md) - Supabase Auth strategy
- [spec.md](../../spec.md) - User Stories 1 & 2 (profile requirements)

**Key Architectural Decisions**:
- Supabase Auth for email/password authentication
- User table separate from auth.users (custom profile fields)
- RLS policies for multi-role users (both sponsor and sponsee)
- React Hook Form + Zod for form validation
- Profile photos stored in Supabase Storage with public bucket

**Constraints**:
- Must support users being both sponsor AND sponsee simultaneously
- Email verification required before profile creation
- Profile photos limited to 5MB, auto-compressed to 1024x1024
- Age verification (18+ required, with future minor consent consideration)

## Subtasks & Detailed Guidance

### Subtask T006 – Create User table schema with RLS policies

**Purpose**: Database foundation for user profiles with privacy enforcement

**Steps**:
1. Create migration `002_users_table.sql`:
   ```sql
   -- Users table
   CREATE TABLE users (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW(),

     -- Auth (linked to auth.users)
     email TEXT UNIQUE NOT NULL,

     -- Profile
     name TEXT NOT NULL,
     bio TEXT CHECK (length(bio) <= 1000),
     profile_photo_url TEXT,

     -- Demographics
     age INTEGER NOT NULL CHECK (age >= 18),
     gender TEXT CHECK (gender IN ('male', 'female', 'non_binary', 'prefer_not_to_say')),
     city TEXT,
     state TEXT,
     country TEXT NOT NULL,
     latitude NUMERIC,
     longitude NUMERIC,

     -- Roles
     is_sponsor BOOLEAN DEFAULT FALSE,
     is_sponsee BOOLEAN DEFAULT FALSE,

     -- Sponsor-specific fields
     max_sponsees INTEGER CHECK (max_sponsees BETWEEN 1 AND 10),
     current_sponsee_count INTEGER DEFAULT 0,
     communication_preferences JSONB,
     availability_status TEXT CHECK (availability_status IN ('active', 'on_hiatus')),

     -- Sponsee-specific
     current_step INTEGER CHECK (current_step BETWEEN 1 AND 12),

     -- Matching preferences
     preferred_sponsor_gender TEXT,
     preferred_sponsor_age_min INTEGER,
     preferred_sponsor_age_max INTEGER,
     preferred_sponsor_sobriety_min_days INTEGER,

     -- System
     fcm_token TEXT,
     theme_preference TEXT DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
     notification_settings JSONB DEFAULT '{"messages": true, "check_ins": true, "milestones": true, "connection_requests": true}',

     -- Full-text search
     bio_search TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', coalesce(bio, ''))) STORED
   );

   -- Indexes
   CREATE UNIQUE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_users_is_sponsor ON users(is_sponsor) WHERE is_sponsor = TRUE;
   CREATE INDEX idx_users_bio_search ON users USING GIN(bio_search);
   CREATE INDEX idx_users_location ON users(latitude, longitude);

   -- RLS Policies
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;

   -- Users can read their own profile (full access)
   CREATE POLICY "Users can read own profile"
     ON users FOR SELECT
     USING (auth.uid() = id);

   -- Users can update their own profile
   CREATE POLICY "Users can update own profile"
     ON users FOR UPDATE
     USING (auth.uid() = id);

   -- Public profiles visible during matching (limited fields)
   CREATE POLICY "Public profiles for matching"
     ON users FOR SELECT
     USING (
       is_sponsor = TRUE
       AND availability_status = 'active'
       AND id != auth.uid()
     );

   -- Trigger to update updated_at
   CREATE OR REPLACE FUNCTION update_updated_at()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.updated_at = NOW();
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER users_updated_at
     BEFORE UPDATE ON users
     FOR EACH ROW
     EXECUTE FUNCTION update_updated_at();
   ```

2. Test migration locally:
   ```bash
   supabase db reset
   ```

3. Create TypeScript types:
   ```bash
   supabase gen types typescript --local > mobile/src/types/supabase.ts
   ```

**Files**:
- Create `/supabase/migrations/002_users_table.sql`
- Update `/mobile/src/types/supabase.ts` (generated)

**Parallel**: Must complete before T007-T010

**Test Strategy**:
- Write integration test to verify RLS policies
- Test: User can read own profile
- Test: User CANNOT read another user's private fields
- Test: Sponsors visible in matching queries

### Subtask T007 – Implement auth screens

**Purpose**: Email/password authentication with Supabase Auth

**Steps**:
1. Create SignupScreen with form fields:
   - Email (email validation)
   - Password (min 8 chars, complexity requirements)
   - Confirm Password
   - Terms & Conditions checkbox

2. Implement signup logic:
   ```typescript
   // mobile/src/services/auth/authService.ts
   import { supabase } from '../supabase/supabaseClient'

   export const signUp = async (email: string, password: string) => {
     const { data, error } = await supabase.auth.signUp({
       email,
       password,
       options: {
         emailRedirectTo: 'volvox://auth/callback'
       }
     })
     if (error) throw error
     return data
   }

   export const signIn = async (email: string, password: string) => {
     const { data, error } = await supabase.auth.signInWithPassword({
       email,
       password
     })
     if (error) throw error
     return data
   }

   export const signOut = async () => {
     const { error } = await supabase.auth.signOut()
     if (error) throw error
   }
   ```

3. Create LoginScreen with email/password fields
4. Create PasswordResetScreen with email input
5. Set up auth state listener in App.tsx

**Files**:
- Create `/mobile/src/screens/auth/SignupScreen.tsx`
- Create `/mobile/src/screens/auth/LoginScreen.tsx`
- Create `/mobile/src/screens/auth/PasswordResetScreen.tsx`
- Create `/mobile/src/services/auth/authService.ts`
- Create tests for each screen and service

**Parallel**: Can run parallel to T006 (schema) if using mock data

**Test Strategy** (TDD):
- Red: Write test expecting successful signup
- Green: Implement minimal signup flow
- Refactor: Add validation, error handling, loading states

### Subtask T008 – Build profile onboarding flow

**Purpose**: Multi-step wizard to collect all required profile data

**Steps**:
1. Create OnboardingScreen with 3 steps:
   - **Step 1: Role Selection**
     - "I want to be a sponsor"
     - "I'm looking for a sponsor"
     - "Both" (checkbox for each role)

   - **Step 2: Demographics**
     - Name, Age, Gender
     - City, State, Country (with location picker)
     - Optional: Enable location services for matching

   - **Step 3: Preferences**
     - If sponsor: Max sponsees (1-10), Communication preferences
     - If sponsee: Preferred sponsor demographics, Sobriety timeline

2. Create onboarding service:
   ```typescript
   // mobile/src/services/profile/profileService.ts
   import { supabase } from '../supabase/supabaseClient'

   export const createUserProfile = async (profileData: Partial<User>) => {
     const user = supabase.auth.getUser()
     const { data, error } = await supabase
       .from('users')
       .insert({
         id: user.id,
         email: user.email,
         ...profileData
       })
       .single()

     if (error) throw error
     return data
   }
   ```

3. Use React Hook Form + Zod for validation:
   ```typescript
   import { z } from 'zod'

   const profileSchema = z.object({
     name: z.string().min(2, 'Name must be at least 2 characters'),
     age: z.number().min(18, 'Must be 18 or older'),
     gender: z.enum(['male', 'female', 'non_binary', 'prefer_not_to_say']),
     city: z.string().optional(),
     country: z.string().min(1, 'Country is required'),
     is_sponsor: z.boolean(),
     is_sponsee: z.boolean(),
     bio: z.string().max(1000, 'Bio must be 1000 characters or less').optional()
   }).refine(data => data.is_sponsor || data.is_sponsee, {
     message: 'Must select at least one role'
   })
   ```

4. Implement step navigation with progress indicator

**Files**:
- Create `/mobile/src/screens/auth/OnboardingScreen.tsx`
- Create `/mobile/src/services/profile/profileService.ts`
- Create `/mobile/src/schemas/profileSchema.ts`
- Create tests for onboarding flow

**Parallel**: Must wait for T006 (schema) and T007 (auth) to complete

**Test Strategy**:
- Test: Validate role selection (at least one required)
- Test: Age validation (18+ required)
- Test: Bio character limit enforcement
- Test: Navigation between steps preserves data

### Subtask T009 – Create profile editing screen

**Purpose**: Allow users to update their profile information post-onboarding

**Steps**:
1. Create EditProfileScreen with form sections:
   - Basic Info (name, bio, photo)
   - Demographics (city, location)
   - Roles & Preferences
   - Communication Settings (if sponsor)
   - Notification Settings

2. Implement profile update:
   ```typescript
   export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
     const { data, error } = await supabase
       .from('users')
       .update(updates)
       .eq('id', userId)
       .single()

     if (error) throw error
     return data
   }
   ```

3. Add optimistic UI updates with React Query
4. Create ProfileScreen (read-only view of own profile)

**Files**:
- Create `/mobile/src/screens/profile/EditProfileScreen.tsx`
- Create `/mobile/src/screens/profile/ProfileScreen.tsx`
- Update `/mobile/src/services/profile/profileService.ts`
- Create tests for edit flow

**Parallel**: Can start after T008 (onboarding) completes

**Test Strategy**:
- Test: Profile updates save to database
- Test: Optimistic updates revert on error
- Test: Validation prevents invalid updates

### Subtask T010 – Implement profile photo upload

**Purpose**: Photo storage in Supabase Storage with compression

**Steps**:
1. Create Supabase Storage bucket:
   ```sql
   -- In migration file
   INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true);

   -- RLS policy for uploads
   CREATE POLICY "Users can upload own profile photo"
     ON storage.objects FOR INSERT
     WITH CHECK (
       bucket_id = 'profile-photos'
       AND auth.uid()::text = (storage.foldername(name))[1]
     );
   ```

2. Create photo upload component:
   ```typescript
   // mobile/src/components/profile/PhotoUploader.tsx
   import { launchImageLibrary } from 'react-native-image-picker'
   import ImageResizer from '@bam.tech/react-native-image-resizer'

   export const uploadProfilePhoto = async (userId: string, uri: string) => {
     // Compress image
     const compressed = await ImageResizer.createResizedImage(
       uri,
       1024,
       1024,
       'JPEG',
       80
     )

     // Upload to Supabase Storage
     const fileName = `${userId}/${Date.now()}.jpg`
     const { data, error } = await supabase.storage
       .from('profile-photos')
       .upload(fileName, compressed, {
         contentType: 'image/jpeg',
         upsert: true
       })

     if (error) throw error

     // Get public URL
     const { data: { publicUrl } } = supabase.storage
       .from('profile-photos')
       .getPublicUrl(fileName)

     // Update user profile
     await updateUserProfile(userId, { profile_photo_url: publicUrl })

     return publicUrl
   }
   ```

3. Add photo picker UI to EditProfileScreen
4. Handle permissions (camera, photo library)

**Files**:
- Update `/supabase/migrations/002_users_table.sql` (add storage policies)
- Create `/mobile/src/components/profile/PhotoUploader.tsx`
- Create tests for photo upload flow

**Parallel**: Can run parallel to T009 (profile editing)

**Notes**:
- Install dependencies: `react-native-image-picker`, `@bam.tech/react-native-image-resizer`
- Handle iOS/Android permissions in app manifest files
- 5MB file size limit enforced client-side

**Test Strategy**:
- Test: Photo uploads successfully
- Test: Image compressed to 1024x1024
- Test: Invalid file types rejected
- Test: 5MB size limit enforced

## Test Strategy

**Integration Tests**:
- Full auth flow: Signup → Email verification → Onboarding → Profile creation
- Profile edit flow: Update profile → Save → Verify persistence
- Photo upload flow: Pick image → Compress → Upload → Display

**Unit Tests**:
- Zod schema validation for all profile fields
- Auth service methods (signup, login, logout)
- Profile service methods (create, update, read)

**E2E Tests (Playwright)**:
- New user signup to completed profile (end-to-end)
- Existing user login and profile edit

## Risks & Mitigations

**Risk 1: RLS policy complexity for multi-role users**
- Mitigation: Test RLS policies thoroughly with different user combinations
- Mitigation: Use Supabase Studio to debug policy issues
- Fallback: Simplify RLS rules and add application-level checks if needed

**Risk 2: Profile photo upload requires Supabase Storage bucket configuration**
- Mitigation: Document bucket setup in migration file
- Mitigation: Test upload flow in local development
- Fallback: Use external service (Cloudinary) if Storage issues persist

**Risk 3: Email verification may be slow or fail**
- Mitigation: Add retry mechanism for verification emails
- Mitigation: Provide manual "resend email" button
- Fallback: Allow profile creation without verification in development

## Definition of Done Checklist

- [ ] Users table created with RLS policies
- [ ] Signup flow functional with email verification
- [ ] Login and logout working correctly
- [ ] Onboarding wizard collects all required fields
- [ ] Profile editing saves successfully
- [ ] Profile photos upload and display
- [ ] All forms use React Hook Form + Zod validation
- [ ] RLS policies tested (users can only access own profile)
- [ ] Tests pass with 80%+ coverage
- [ ] TypeScript types generated from database schema

## Review Guidance

**Key Acceptance Checkpoints**:
1. Verify RLS policies prevent unauthorized access
2. Check form validation matches data-model.md constraints
3. Test multi-role users (both sponsor and sponsee)
4. Confirm photo compression to 1024x1024
5. Validate onboarding UX (clear, not overwhelming)

**Context for Reviewers**:
- This work package is critical for all subsequent features (matching, connections)
- Pay attention to RLS policy correctness
- Ensure form validation is comprehensive

## Activity Log

- 2025-11-03 – system – lane=planned – Prompt created via /spec-kitty.tasks

---

**Next Command**: `/spec-kitty.implement WP02` (after WP01 complete)
