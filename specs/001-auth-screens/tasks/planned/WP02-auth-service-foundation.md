# WP02: Authentication Service Foundation

**Status**: 📋 Planned
**Priority**: Foundational
**Dependencies**: WP01
**Estimated Effort**: 4-6 hours

---

## Objective

Implement the core authentication service layer, validation schemas, utilities, and comprehensive unit tests. This work package creates the foundational business logic that all auth screens will consume.

---

## Context

From [spec.md](../../spec.md):
- FR-001: System MUST allow new users to create accounts using email and password
- FR-003: System MUST enforce password requirements (8+ chars, letter + number)
- FR-006: System MUST allow existing users to login with email and password
- FR-008: System MUST allow users to request password reset via email
- FR-010: System MUST securely hash passwords (bcrypt via Supabase)
- FR-011: System MUST use generic error messages for security-sensitive operations
- FR-013: System MUST display clear error messages for incorrect login credentials
- FR-016: System MUST use Supabase Auth for all authentication operations

From [data-model.md](../../data-model.md):
```typescript
export const authService = {
  async signUp(email: string, password: string),
  async signIn(email: string, password: string),
  async resetPasswordRequest(email: string),
  async updatePassword(newPassword: string),
  async signOut(),
  async getSession(),
  onAuthStateChange(callback)
}
```

Validation schemas (Yup):
```typescript
const signupSchema = yup.object({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(8, 'Minimum 8 characters required')
    .matches(/[a-zA-Z]/, 'Must contain at least one letter')
    .matches(/[0-9]/, 'Must contain at least one number')
    .required('Password is required')
})
```

---

## Subtasks

### T005 [P]: Implement authService.ts with Supabase SDK wrapper

**What**: Create authentication service wrapping Supabase Auth SDK methods.

**Steps**:
1. Install Supabase client: `pnpm add @supabase/supabase-js`
2. Create `src/services/authService.ts`
3. Initialize Supabase client with environment variables
4. Implement all auth methods per data-model.md specification
5. Add proper TypeScript types for all methods
6. Export authService object

**Implementation**:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const authService = {
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: 'volvoxsober://auth/verify' }
    })
    return { data, error }
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  },

  async resetPasswordRequest(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'volvoxsober://auth/forgot-password'
    })
    return { data, error }
  },

  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    return { data, error }
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}
```

**Acceptance Criteria**:
- All methods implemented per specification
- Proper TypeScript types for all parameters and return values
- Supabase client initialized correctly
- No TypeScript errors

---

### T006 [P]: Create Yup validation schemas

**What**: Implement client-side validation schemas for login, signup, and password reset forms.

**Implementation**: Create `src/services/validationSchemas.ts` with all three schemas per data-model.md.

**Acceptance Criteria**:
- loginSchema validates email and password (required only)
- signupSchema enforces FR-003 password requirements
- passwordResetSchema validates email format
- All schemas export correctly

---

### T007 [P]: Implement password strength utility function

**What**: Create utility to calculate password strength (weak/medium/strong).

**Implementation**: Create `src/utils/passwordStrength.ts` per research.md Decision 6.

**Acceptance Criteria**:
- Returns correct strength levels based on scoring
- TypeScript types defined (`PasswordStrength = 'weak' | 'medium' | 'strong'`)

---

### T008 [P]: Create authErrors.ts error mapping utility

**What**: Map Supabase error messages to user-friendly messages.

**Implementation**: Create `src/utils/authErrors.ts` per contracts/auth.yaml error mapping.

**Acceptance Criteria**:
- Maps all common Supabase auth errors
- Uses generic messages for security-sensitive errors (FR-011)
- Returns default message for unknown errors

---

### T009-T011 [P]: Write unit tests

**What**: Comprehensive unit tests for all services and utilities.

**Files to Create**:
- `__tests__/services/authService.test.ts`
- `__tests__/services/validationSchemas.test.ts`
- `__tests__/utils/passwordStrength.test.ts`

**Coverage Requirements**:
- 100% coverage of all authService methods
- All validation scenarios tested (valid/invalid inputs)
- All password strength levels tested

---

## Completion Checklist

- [ ] All 7 subtasks completed (T005-T011)
- [ ] authService.ts implements all methods
- [ ] All validation schemas functional
- [ ] Password strength utility working
- [ ] Error mapping utility complete
- [ ] All unit tests pass (`pnpm test`)
- [ ] Test coverage ≥100% for services/utilities
- [ ] No TypeScript errors (`pnpm typecheck`)
- [ ] Code formatted (`pnpm format`)

---

## Files Created

- `src/services/authService.ts`
- `src/services/validationSchemas.ts`
- `src/utils/passwordStrength.ts`
- `src/utils/authErrors.ts`
- `__tests__/services/authService.test.ts`
- `__tests__/services/validationSchemas.test.ts`
- `__tests__/utils/passwordStrength.test.ts`

---

## Dependencies

**Blocks**: WP03 (Redux needs authService), WP04 (Components need validation/utilities)
**Blocked By**: WP01 (Needs Supabase config)
