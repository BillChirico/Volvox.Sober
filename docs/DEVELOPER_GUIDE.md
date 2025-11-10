# Volvox.Sober Developer Guide

> Your complete onboarding guide to becoming productive with the Volvox.Sober codebase

**Last Updated**: 2025-11-10
**Estimated Onboarding Time**: 2 hours (setup → first commit)

---

## Table of Contents

1. [Getting Started](#1-getting-started) (~30 minutes)
2. [Understanding the Codebase](#2-understanding-the-codebase) (~30 minutes)
3. [Development Workflow](#3-development-workflow) (Essential Reading)
4. [Common Tasks & How-Tos](#4-common-tasks--how-tos)
5. [Troubleshooting Guide](#5-troubleshooting-guide)
6. [Advanced Topics](#6-advanced-topics) (Optional)
7. [Resources & References](#7-resources--references)

---

## 1. Getting Started

### 1.1 Prerequisites & System Requirements

Before you begin, ensure you have:

**Required:**

- **Node.js**: 18.0.0 or higher ([Download](https://nodejs.org/))
- **pnpm**: 8.0.0 or higher
  ```bash
  npm install -g pnpm@latest
  ```
- **Git**: Latest version ([Download](https://git-scm.com/))

**Platform-Specific (choose based on your target):**

- **iOS Development**: macOS with Xcode 14+ ([Mac App Store](https://apps.apple.com/app/xcode/id497799835))
- **Android Development**: Android Studio + SDK 33+ ([Download](https://developer.android.com/studio))
- **Web Development**: Modern browser (Chrome/Firefox/Safari/Edge)

**Backend (Required for Full Functionality):**

- **Supabase Account**: Free tier available ([Sign Up](https://supabase.com/))

### 1.2 Initial Setup (Step-by-Step)

Follow these steps in order. Each step includes success criteria so you know you're on track.

#### Step 1: Clone the Repository

```bash
git clone https://github.com/BillChirico/Volvox.Sober.git
cd Volvox.Sober
```

✅ **Success**: You see the project files when running `ls`

#### Step 2: Install Dependencies

```bash
pnpm install
```

⏱️ **Duration**: ~2-3 minutes
✅ **Success**: No errors, `node_modules/` directory created

#### Step 3: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

Now edit `.env` with your Supabase credentials:

```bash
# Open in your preferred editor
code .env  # VS Code
# OR
nano .env  # Terminal editor
```

**Required Variables:**

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**How to get Supabase credentials:**

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project (or use existing)
3. Navigate to **Settings** → **API**
4. Copy **Project URL** → Paste into `EXPO_PUBLIC_SUPABASE_URL`
5. Copy **anon public** key → Paste into `EXPO_PUBLIC_SUPABASE_ANON_KEY`

✅ **Success**: `.env` file exists with valid Supabase credentials

#### Step 4: Verify Installation

```bash
# Check TypeScript compilation
pnpm typecheck
```

✅ **Success**: "Found 0 errors" message appears

```bash
# Run tests (may have some pre-existing failures - this is documented)
pnpm test
```

✅ **Success**: Tests run (even if some fail - see [Known Issues](#known-issues))

### 1.3 First Run

Start the development server:

```bash
pnpm start
```

You should see:

```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press j │ open debugger
› Press r │ reload app
› Press m │ toggle menu
```

**Choose your platform:**

```bash
# Press 'w' for web (quickest to test)
# Or run specific platform:
pnpm web          # Web browser
pnpm ios          # iOS simulator (macOS only)
pnpm android      # Android emulator
```

✅ **Success**: You see the Welcome/Login screen

**Troubleshooting**: If you encounter issues, see [Troubleshooting Guide](#5-troubleshooting-guide)

### 1.4 Quick Win: Make Your First Commit

Let's make a simple change to verify your setup is working:

#### Step 1: Create a feature branch

```bash
git checkout -b test/my-first-change
```

#### Step 2: Make a small change

Add a comment to `README.md`:

```bash
echo "<!-- Tested by [Your Name] on $(date) -->" >> README.md
```

#### Step 3: Run quality checks

```bash
pnpm lint:fix && pnpm typecheck && pnpm test
```

✅ **All checks pass**: You're ready to commit!

#### Step 4: Commit your change

```bash
git add README.md
git commit -m "docs: verify development environment setup"
git push -u origin test/my-first-change
```

#### Step 5: Clean up (optional)

```bash
git checkout main
git branch -D test/my-first-change
```

🎉 **Congratulations!** You've completed the setup and made your first commit.

---

## 2. Understanding the Codebase

### 2.1 Project Architecture Overview

Volvox.Sober is a **universal Expo application** that runs on iOS, Android, and Web using a single codebase.

**High-Level Architecture:**

```
┌─────────────────────────────────────────────────────────┐
│                    User Devices                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   iOS    │  │  Android │  │   Web    │             │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘             │
└───────┼─────────────┼─────────────┼────────────────────┘
        │             │             │
        └──────────┬──┴─────────────┘
                   │
        ┌──────────▼──────────────────────────────┐
        │   Volvox.Sober App (React Native)       │
        │                                          │
        │  ┌────────────────────────────────┐    │
        │  │  Expo Router (File-based)      │    │
        │  │  app/(auth)/, app/(tabs)/      │    │
        │  └────────────────────────────────┘    │
        │                                          │
        │  ┌────────────────────────────────┐    │
        │  │  Redux Store                   │    │
        │  │  - Auth, Messages, Profile     │    │
        │  └────────────────────────────────┘    │
        │                                          │
        │  ┌────────────────────────────────┐    │
        │  │  React Native Paper (UI)       │    │
        │  │  - Material Design 3 Components│    │
        │  └────────────────────────────────┘    │
        └──────────────┬───────────────────────┘
                       │
                       │ Supabase Client SDK
                       │
        ┌──────────────▼───────────────────────────┐
        │         Supabase Backend                  │
        │                                            │
        │  ┌──────────────┐  ┌──────────────┐     │
        │  │ PostgreSQL   │  │  Supabase    │     │
        │  │ Database     │  │  Auth        │     │
        │  │ + RLS        │  │  (GoTrue)    │     │
        │  └──────────────┘  └──────────────┘     │
        │                                            │
        │  ┌──────────────┐  ┌──────────────┐     │
        │  │  Realtime    │  │  Edge        │     │
        │  │  WebSockets  │  │  Functions   │     │
        │  └──────────────┘  └──────────────┘     │
        └──────────────────────────────────────────┘
```

### 2.2 Technology Stack Deep Dive

#### Frontend Stack

| Technology             | Version | Purpose                  | Why We Use It                           |
| ---------------------- | ------- | ------------------------ | --------------------------------------- |
| **Expo**               | 54.x    | Universal app platform   | Simplifies iOS/Android/Web development  |
| **Expo Router**        | 4.x     | File-based routing       | Next.js-style routing for React Native  |
| **React Native**       | 0.81+   | Cross-platform framework | Native performance with JavaScript      |
| **TypeScript**         | 5.x     | Type safety              | Catch errors at compile time            |
| **Redux Toolkit**      | 2.x     | State management         | Predictable state with less boilerplate |
| **React Native Paper** | 5.x     | UI components            | Material Design 3 components            |
| **Yup**                | 1.x     | Form validation          | Schema-based validation                 |

#### Backend Stack

| Technology         | Version | Purpose                       |
| ------------------ | ------- | ----------------------------- |
| **Supabase**       | Latest  | Backend-as-a-Service          |
| **PostgreSQL**     | 15+     | Relational database           |
| **Supabase Auth**  | Latest  | Authentication (email, OAuth) |
| **Edge Functions** | Deno    | Serverless functions          |
| **Realtime**       | Latest  | WebSocket subscriptions       |

#### Testing Stack

| Technology                       | Purpose                  | Command          |
| -------------------------------- | ------------------------ | ---------------- |
| **Jest**                         | Unit + Integration tests | `pnpm test`      |
| **React Native Testing Library** | Component testing        | Included in Jest |
| **Playwright**                   | E2E testing              | `pnpm test:e2e`  |

### 2.3 File Structure Walkthrough

```
volvox-sober/
├── app/                        # 🎯 ALL SCREENS GO HERE (Expo Router)
│   ├── (auth)/                 # Auth screens (login, signup, etc.)
│   │   ├── _layout.tsx         # Auth layout wrapper
│   │   ├── login.tsx           # Login screen
│   │   ├── signup.tsx          # Signup screen
│   │   ├── forgot-password.tsx # Password reset
│   │   └── verify-email.tsx    # Email verification
│   │
│   ├── (onboarding)/           # Onboarding flow
│   │   ├── welcome.tsx
│   │   ├── role-selection.tsx
│   │   └── [role]-profile.tsx  # Dynamic route (sponsor/sponsee)
│   │
│   ├── (tabs)/                 # Main app (tab navigation)
│   │   ├── _layout.tsx         # Tab bar configuration
│   │   ├── connections.tsx     # Connections list
│   │   ├── matches.tsx         # Match suggestions
│   │   ├── messages.tsx        # Messaging inbox
│   │   ├── sobriety.tsx        # Sobriety tracker
│   │   └── profile.tsx         # User profile
│   │
│   ├── _layout.tsx             # Root layout (providers, theme)
│   ├── index.tsx               # Entry point (redirect logic)
│   └── +not-found.tsx          # 404 page
│
├── src/                        # Application source code
│   ├── components/             # Reusable UI components
│   │   ├── auth/               # Auth-specific components
│   │   ├── common/             # Shared components (Button, Card, etc.)
│   │   ├── profile/            # Profile components
│   │   └── [feature]/          # Feature-specific components
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts          # Authentication hook
│   │   ├── useMessages.ts      # Messaging hook (with Realtime)
│   │   └── [feature].ts        # Feature-specific hooks
│   │
│   ├── services/               # API clients & business logic
│   │   ├── authService.ts      # Supabase Auth wrapper
│   │   ├── messageService.ts   # Messaging API
│   │   └── validationSchemas.ts# Yup schemas
│   │
│   ├── store/                  # Redux state management
│   │   ├── index.ts            # Store configuration
│   │   ├── auth/               # Auth slice + selectors + thunks
│   │   ├── messages/           # Messages slice + selectors + thunks
│   │   └── [feature]/          # Feature-specific slices
│   │
│   ├── theme/                  # Theme configuration
│   │   ├── index.ts            # Theme tokens (colors, spacing)
│   │   └── ThemeContext.tsx    # Theme provider (light/dark mode)
│   │
│   ├── types/                  # TypeScript type definitions
│   │   ├── auth.ts             # Auth types
│   │   ├── message.ts          # Message types
│   │   └── [feature].ts        # Feature-specific types
│   │
│   ├── constants/              # App constants
│   │   ├── Colors.ts           # Color palette
│   │   └── Layout.ts           # Layout constants (spacing, sizing)
│   │
│   └── utils/                  # Utility functions
│       ├── dateFormat.ts       # Date utilities
│       └── [utility].ts        # Various helpers
│
├── __tests__/                  # Test files
│   ├── [feature].spec.ts       # Playwright E2E tests
│   ├── components/             # Component unit tests
│   ├── store/                  # Redux tests
│   └── services/               # Service tests
│
├── supabase/                   # Backend code
│   ├── migrations/             # Database migrations
│   │   └── [timestamp]_[name].sql
│   ├── functions/              # Edge Functions
│   │   └── [function-name]/
│   └── seed.sql                # Test data seeding
│
├── assets/                     # Static resources
│   ├── images/                 # Images
│   ├── fonts/                  # Custom fonts
│   └── icons/                  # App icons
│
├── docs/                       # Documentation
│   ├── DEVELOPER_GUIDE.md      # This file!
│   └── [topic].md              # Additional docs
│
├── specs/                      # Feature specifications
│   └── [feature-number]-[name]/
│       ├── spec.md             # Feature spec
│       ├── plan.md             # Implementation plan
│       └── tasks.md            # Work breakdown
│
├── scripts/                    # Build & utility scripts
│
├── .env                        # Environment variables (DO NOT COMMIT)
├── .env.example                # Environment template (commit this)
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript configuration
├── app.config.js               # Expo configuration
├── CLAUDE.md                   # Development guidelines
└── README.md                   # Project overview
```

### 2.4 Key Patterns & Conventions

#### 🎯 Expo Router File-Based Routing

**IMPORTANT**: All screens MUST be in the `app/` directory.

```typescript
// ✅ CORRECT: Screens in app/ directory
app/
  ├── (tabs)/
  │   └── profile.tsx         → Route: /(tabs)/profile

// ❌ INCORRECT: Don't create screens in src/
src/
  └── screens/  // This directory is DEPRECATED
```

**Routing Examples:**

| File Path                      | Route                  | Description              |
| ------------------------------ | ---------------------- | ------------------------ |
| `app/index.tsx`                | `/`                    | Entry point              |
| `app/(auth)/login.tsx`         | `/(auth)/login`        | Login screen             |
| `app/(tabs)/profile.tsx`       | `/(tabs)/profile`      | Profile tab              |
| `app/(tabs)/messages/[id].tsx` | `/(tabs)/messages/123` | Message detail (dynamic) |

**Navigation:**

```typescript
import { useRouter } from 'expo-router';

const router = useRouter();

// Navigate to profile
router.push('/(tabs)/profile');

// Navigate with parameters
router.push({
  pathname: '/(tabs)/messages/[id]',
  params: { id: '123' },
});

// Go back
router.back();

// Replace (no back button)
router.replace('/(auth)/login');
```

#### 📦 Redux State Management Pattern

**Feature-based slice structure:**

```
src/store/
  └── messages/
      ├── messagesSlice.ts      # State + reducers + actions
      ├── messagesSelectors.ts  # Memoized selectors
      └── messagesThunks.ts     # Async operations
```

**Example Slice:**

```typescript
// messagesSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MessagesState {
  items: Message[];
  loading: boolean;
  error: string | null;
}

const messagesSlice = createSlice({
  name: 'messages',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.items.push(action.payload);
    },
  },
});

export const { addMessage } = messagesSlice.actions;
export default messagesSlice.reducer;
```

**Example Selector:**

```typescript
// messagesSelectors.ts
import { createSelector } from '@reduxjs/toolkit';

export const selectAllMessages = (state: RootState) => state.messages.items;

export const selectUnreadCount = createSelector(
  [selectAllMessages],
  messages => messages.filter(m => !m.read).length,
);
```

**Example Thunk:**

```typescript
// messagesThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchMessages = createAsyncThunk('messages/fetch', async () => {
  const response = await messageService.getAll();
  return response.data;
});
```

#### 🎨 React Native Paper Component Pattern

**Always use themed components:**

```typescript
import { Card, Text, Button } from 'react-native-paper';
import { useAppTheme } from '@/theme/ThemeContext';

export const MyComponent = () => {
  const { theme } = useAppTheme();

  return (
    <Card style={{ backgroundColor: theme.colors.surface }}>
      <Card.Content>
        <Text variant="titleLarge">Hello World</Text>
        <Button mode="contained">Click Me</Button>
      </Card.Content>
    </Card>
  );
};
```

#### 🔐 Supabase Integration Pattern

**Always use the service layer:**

```typescript
// ✅ CORRECT: Use service layer
import { authService } from '@/services/authService';

const result = await authService.signIn(email, password);

// ❌ INCORRECT: Direct Supabase client usage
import { supabase } from '@/lib/supabase';
const { data } = await supabase.auth.signInWithPassword({ email, password });
```

#### ⚡ Realtime Subscriptions Pattern

**Always clean up subscriptions:**

```typescript
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useRealtimeMessages = (userId: string) => {
  useEffect(() => {
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`,
        },
        payload => {
          // Handle new message
        },
      )
      .subscribe();

    // ✅ IMPORTANT: Cleanup on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);
};
```

### 2.5 Navigation & Routing (Expo Router)

**Route Groups (Parentheses)**

Routes inside `()` don't appear in the URL:

```
app/
  ├── (auth)/           # Group name doesn't appear in URL
  │   └── login.tsx     → /(auth)/login (URL shown as /login)
```

**Dynamic Routes (Brackets)**

Use `[param]` for dynamic segments:

```
app/
  └── (tabs)/
      └── messages/
          └── [id].tsx  → /(tabs)/messages/123

// Access the parameter:
import { useLocalSearchParams } from 'expo-router';

const { id } = useLocalSearchParams<{ id: string }>();
```

**Layouts (\_layout.tsx)**

Define shared UI and navigation structure:

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="connections" options={{ title: 'Connections' }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
```

---

## 3. Development Workflow

### 3.1 Daily Development Cycle

#### Morning Routine

```bash
# 1. Update your local repository
git checkout main
git pull origin main

# 2. Install any new dependencies (if package.json changed)
pnpm install

# 3. Start the dev server
pnpm start

# 4. Choose your platform (press keys in terminal):
#    - Press 'w' for web (fastest)
#    - Press 'i' for iOS
#    - Press 'a' for Android
```

#### Feature Development Flow

**Step 1: Create Feature Branch**

```bash
git checkout -b feature/your-feature-name
```

**Branch Naming Convention:**

- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation
- `test/` - Test additions

**Step 2: Follow TDD (Test-Driven Development)**

Our project **requires** TDD. Here's the RED-GREEN-REFACTOR cycle:

```bash
# 🔴 RED: Write a failing test
npm test -- --watch  # Keep tests running

# 1. Create test file: __tests__/components/MyComponent.test.tsx
# 2. Write test that describes desired behavior
# 3. Watch it FAIL ❌

# 🟢 GREEN: Make the test pass
# 1. Implement minimal code to pass the test
# 2. Watch it PASS ✅

# 🔵 REFACTOR: Improve the code
# 1. Clean up code while keeping tests green
# 2. Tests still PASS ✅
```

**Step 3: Quality Checks (Before Every Commit)**

Run these commands **in this exact order**:

```bash
# 1. Lint & auto-fix issues
pnpm lint:fix

# 2. Type checking
pnpm typecheck

# 3. Run tests
pnpm test
```

**All three must pass** before committing!

**Step 4: Commit Your Changes**

Follow **Conventional Commits** format:

```bash
git add .
git commit -m "type(scope): description"
```

**Commit Types:**

- `feat(auth)`: New feature
- `fix(messages)`: Bug fix
- `docs(readme)`: Documentation
- `style(ui)`: Code style (formatting, whitespace)
- `refactor(store)`: Code refactoring
- `test(components)`: Adding tests
- `chore(deps)`: Dependencies, config

**Examples:**

```bash
git commit -m "feat(auth): add password reset functionality"
git commit -m "fix(messages): resolve real-time subscription memory leak"
git commit -m "docs(guide): add troubleshooting section"
```

**Step 5: Push & Create Pull Request**

```bash
git push -u origin feature/your-feature-name
```

Then create a PR on GitHub.

### 3.2 TDD Workflow (Detailed)

#### Example: Adding a Profile Avatar Component

**Step 1: RED - Write the failing test**

```typescript
// __tests__/components/profile/Avatar.test.tsx
import { render, screen } from '@testing-library/react-native';
import { Avatar } from '@/components/profile/Avatar';

describe('Avatar', () => {
  it('displays user initials when no image provided', () => {
    render(<Avatar name="John Doe" />);

    expect(screen.getByText('JD')).toBeTruthy();
  });

  it('displays avatar image when provided', () => {
    const imageUrl = 'https://example.com/avatar.jpg';
    render(<Avatar name="John Doe" imageUrl={imageUrl} />);

    const avatar = screen.getByTestId('avatar-image');
    expect(avatar.props.source.uri).toBe(imageUrl);
  });
});
```

Run the test:

```bash
pnpm test Avatar.test.tsx
```

**Result**: ❌ Tests fail (component doesn't exist yet)

**Step 2: GREEN - Implement the component**

```typescript
// src/components/profile/Avatar.tsx
import { Avatar as PaperAvatar } from 'react-native-paper';

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  imageUrl,
  size = 48
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  if (imageUrl) {
    return (
      <PaperAvatar.Image
        source={{ uri: imageUrl }}
        size={size}
        testID="avatar-image"
      />
    );
  }

  return (
    <PaperAvatar.Text
      label={getInitials(name)}
      size={size}
    />
  );
};
```

Run the test again:

```bash
pnpm test Avatar.test.tsx
```

**Result**: ✅ Tests pass

**Step 3: REFACTOR - Improve the code**

```typescript
// Refactored version with better type safety
interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: 24 | 48 | 64 | 96;  // Predefined sizes
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  imageUrl,
  size = 48
}) => {
  const getInitials = (fullName: string): string => {
    return fullName
      .trim()
      .split(/\s+/)  // Handle multiple spaces
      .slice(0, 2)   // Max 2 initials
      .map(word => word[0]?.toUpperCase() || '')
      .join('');
  };

  if (imageUrl) {
    return (
      <PaperAvatar.Image
        source={{ uri: imageUrl }}
        size={size}
        testID="avatar-image"
      />
    );
  }

  return (
    <PaperAvatar.Text
      label={getInitials(name)}
      size={size}
    />
  );
};
```

Run tests one more time:

```bash
pnpm test Avatar.test.tsx
```

**Result**: ✅ Tests still pass after refactoring

### 3.3 Quality Checks Explained

#### 1. Linting (`pnpm lint:fix`)

**What it does:**

- Checks code style consistency
- Enforces project coding standards
- Auto-fixes formatting issues

**Common Issues Fixed:**

- Indentation
- Semicolons
- Unused imports
- Variable naming

**Fix workflow:**

```bash
pnpm lint:fix              # Auto-fix most issues
pnpm lint                  # Check for remaining issues
```

#### 2. Type Checking (`pnpm typecheck`)

**What it does:**

- Validates TypeScript types
- Catches type errors before runtime

**Common Errors:**

```typescript
// ❌ Type error: Property 'name' does not exist on type 'User'
const userName = user.name;

// ✅ Fix: Check if property exists or use optional chaining
const userName = user?.name || 'Unknown';
```

**Fix workflow:**

```bash
pnpm typecheck              # Show all type errors

# Read the error message, fix the code, repeat
```

#### 3. Testing (`pnpm test`)

**What it does:**

- Runs all unit and integration tests
- Validates component behavior
- Checks business logic

**Running Tests:**

```bash
pnpm test                   # Run all tests
pnpm test -- --watch        # Run in watch mode
pnpm test Avatar            # Run specific test file
pnpm test -- -u             # Update snapshots
```

**Test Coverage:**

```bash
pnpm test -- --coverage     # Generate coverage report
```

**Target**: 80% coverage for business logic

### 3.4 Git Workflow

#### Branch Strategy

```
main (production-ready code)
  └─ feature/your-feature  (your work)
```

#### Commit Best Practices

**DO:**

- ✅ Commit early and often
- ✅ Write descriptive commit messages
- ✅ Use conventional commit format
- ✅ Keep commits focused (one concern per commit)

**DON'T:**

- ❌ Commit broken code
- ❌ Commit commented-out code
- ❌ Commit `.env` files
- ❌ Push directly to `main`

#### Pull Request Process

1. **Push your feature branch**

   ```bash
   git push -u origin feature/your-feature
   ```

2. **Create PR on GitHub**
   - Add descriptive title
   - Fill out PR template
   - Link related issues

3. **Code Review**
   - Address reviewer feedback
   - Push changes to same branch
   - PR updates automatically

4. **Merge**
   - After approval, merge via GitHub
   - Delete feature branch

### 3.5 Code Review Checklist

Before requesting review, verify:

- [ ] All tests pass (`pnpm test`)
- [ ] Type checking passes (`pnpm typecheck`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Code follows project conventions
- [ ] New features have tests (TDD)
- [ ] Documentation updated (if needed)
- [ ] No commented-out code
- [ ] No `console.log` statements
- [ ] No hardcoded values (use constants/env vars)
- [ ] Commit messages follow convention

---

## 4. Common Tasks & How-Tos

### 4.1 Creating a New Screen

**Remember**: All screens go in the `app/` directory (not `src/screens/`).

#### Step 1: Determine the route location

```
app/
  ├── (auth)/          # Auth screens (login, signup, etc.)
  ├── (onboarding)/    # Onboarding flow
  └── (tabs)/          # Main app screens
```

#### Step 2: Create the screen file

```bash
# Example: Create a new settings screen
touch app/(tabs)/settings.tsx
```

#### Step 3: Implement the screen

```typescript
// app/(tabs)/settings.tsx
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, List, Divider } from 'react-native-paper';
import { useAppTheme } from '@/theme/ThemeContext';

export default function SettingsScreen() {
  const { theme } = useAppTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <List.Section>
        <List.Subheader>Account</List.Subheader>
        <List.Item
          title="Profile Settings"
          left={() => <List.Icon icon="account" />}
          onPress={() => {/* Navigate to profile settings */}}
        />
        <Divider />
        <List.Item
          title="Privacy"
          left={() => <List.Icon icon="shield-account" />}
          onPress={() => {/* Navigate to privacy settings */}}
        />
      </List.Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

#### Step 4: Add to navigation (if not auto-discovered)

If creating a new tab, update the `_layout.tsx`:

```typescript
// app/(tabs)/_layout.tsx
<Tabs.Screen
  name="settings"
  options={{
    title: 'Settings',
    tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />
  }}
/>
```

#### Step 5: Add tests

```typescript
// __tests__/app/tabs/settings.test.tsx
import { render, screen } from '@testing-library/react-native';
import SettingsScreen from '@/app/(tabs)/settings';

describe('SettingsScreen', () => {
  it('renders settings options', () => {
    render(<SettingsScreen />);

    expect(screen.getByText('Profile Settings')).toBeTruthy();
    expect(screen.getByText('Privacy')).toBeTruthy();
  });
});
```

### 4.2 Adding a New Component

#### Step 1: Determine component location

```
src/components/
  ├── auth/          # Auth-specific components
  ├── common/        # Shared/reusable components
  ├── profile/       # Profile components
  └── [feature]/     # Feature-specific components
```

#### Step 2: Write the test first (TDD)

```typescript
// __tests__/components/common/Badge.test.tsx
import { render, screen } from '@testing-library/react-native';
import { Badge } from '@/components/common/Badge';

describe('Badge', () => {
  it('displays badge count', () => {
    render(<Badge count={5} />);
    expect(screen.getByText('5')).toBeTruthy();
  });

  it('displays 99+ for counts over 99', () => {
    render(<Badge count={150} />);
    expect(screen.getByText('99+')).toBeTruthy();
  });

  it('does not render when count is 0', () => {
    const { container } = render(<Badge count={0} />);
    expect(container).toBeEmptyDOMElement();
  });
});
```

#### Step 3: Implement the component

```typescript
// src/components/common/Badge.tsx
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/theme/ThemeContext';

interface BadgeProps {
  count: number;
  maxCount?: number;
}

export const Badge: React.FC<BadgeProps> = ({ count, maxCount = 99 }) => {
  const { theme } = useAppTheme();

  if (count === 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
      <Text style={[styles.text, { color: theme.colors.onError }]}>
        {displayCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
```

#### Step 4: Export from index (optional)

```typescript
// src/components/common/index.ts
export { Badge } from './Badge';
export { Button } from './Button';
// ... other exports
```

### 4.3 Working with Redux State

#### Step 1: Create a new slice

```typescript
// src/store/profile/profileSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Profile } from '@/types/profile';

interface ProfileState {
  data: Profile | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  data: null,
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<Profile>) => {
      state.data = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setProfile, setLoading, setError } = profileSlice.actions;
export default profileSlice.reducer;
```

#### Step 2: Add selectors

```typescript
// src/store/profile/profileSelectors.ts
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';

export const selectProfile = (state: RootState) => state.profile.data;
export const selectProfileLoading = (state: RootState) => state.profile.loading;
export const selectProfileError = (state: RootState) => state.profile.error;

export const selectProfileFullName = createSelector([selectProfile], profile =>
  profile ? `${profile.firstName} ${profile.lastName}` : '',
);
```

#### Step 3: Create async thunks

```typescript
// src/store/profile/profileThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { profileService } from '@/services/profileService';

export const fetchProfile = createAsyncThunk(
  'profile/fetch',
  async (userId: string, { rejectWithValue }) => {
    try {
      const profile = await profileService.getProfile(userId);
      return profile;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateProfile = createAsyncThunk(
  'profile/update',
  async (updates: Partial<Profile>, { rejectWithValue }) => {
    try {
      const updated = await profileService.updateProfile(updates);
      return updated;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
```

#### Step 4: Register in store

```typescript
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import profileReducer from './profile/profileSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

#### Step 5: Use in components

```typescript
// app/(tabs)/profile.tsx
import { useSelector, useDispatch } from 'react-redux';
import { selectProfile, selectProfileLoading } from '@/store/profile/profileSelectors';
import { fetchProfile } from '@/store/profile/profileThunks';

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const profile = useSelector(selectProfile);
  const loading = useSelector(selectProfileLoading);

  useEffect(() => {
    dispatch(fetchProfile(userId));
  }, [userId]);

  if (loading) return <ActivityIndicator />;
  if (!profile) return <Text>No profile found</Text>;

  return (
    <View>
      <Text>{profile.firstName} {profile.lastName}</Text>
    </View>
  );
}
```

### 4.4 Supabase Integration

#### Setting up a new service

```typescript
// src/services/connectionService.ts
import { supabase } from '@/lib/supabase';
import { Connection } from '@/types/connection';

export const connectionService = {
  async getConnections(userId: string): Promise<Connection[]> {
    const { data, error } = await supabase.from('connections').select('*').eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  async createConnection(connection: Omit<Connection, 'id'>): Promise<Connection> {
    const { data, error } = await supabase
      .from('connections')
      .insert([connection])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateConnection(id: string, updates: Partial<Connection>): Promise<Connection> {
    const { data, error } = await supabase
      .from('connections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteConnection(id: string): Promise<void> {
    const { error } = await supabase.from('connections').delete().eq('id', id);

    if (error) throw error;
  },
};
```

#### Real-time Subscriptions

```typescript
// src/hooks/useRealtimeConnections.ts
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { supabase } from '@/lib/supabase';
import {
  addConnection,
  updateConnection,
  removeConnection,
} from '@/store/connections/connectionsSlice';

export const useRealtimeConnections = (userId: string) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const subscription = supabase
      .channel('connections')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'connections',
          filter: `user_id=eq.${userId}`,
        },
        payload => {
          dispatch(addConnection(payload.new));
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'connections',
          filter: `user_id=eq.${userId}`,
        },
        payload => {
          dispatch(updateConnection(payload.new));
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'connections',
          filter: `user_id=eq.${userId}`,
        },
        payload => {
          dispatch(removeConnection(payload.old.id));
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, dispatch]);
};
```

### 4.5 Testing

#### Unit Testing a Component

```typescript
// __tests__/components/ConnectionCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ConnectionCard } from '@/components/connections/ConnectionCard';

describe('ConnectionCard', () => {
  const mockConnection = {
    id: '1',
    name: 'John Doe',
    avatar: 'https://example.com/avatar.jpg',
    status: 'active',
  };

  it('renders connection information', () => {
    render(<ConnectionCard connection={mockConnection} />);

    expect(screen.getByText('John Doe')).toBeTruthy();
    expect(screen.getByText('active')).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const onPress = jest.fn();
    render(<ConnectionCard connection={mockConnection} onPress={onPress} />);

    fireEvent.press(screen.getByTestId('connection-card'));
    expect(onPress).toHaveBeenCalledWith(mockConnection);
  });
});
```

#### E2E Testing with Playwright

```typescript
// __tests__/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('successful login redirects to home', async ({ page }) => {
    await page.goto('http://localhost:8081');

    // Navigate to login
    await page.click('[data-testid="login-button"]');

    // Fill form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');

    // Submit
    await page.click('[data-testid="submit-button"]');

    // Verify redirect
    await expect(page).toHaveURL(/.*\/(tabs)\/connections/);
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:8081/(auth)/login');

    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpass');
    await page.click('[data-testid="submit-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});
```

### 4.6 Debugging Techniques

#### Using React Native Debugger

**Step 1: Install React Native Debugger**

```bash
# macOS
brew install --cask react-native-debugger

# Or download from: https://github.com/jhen0409/react-native-debugger/releases
```

**Step 2: Start debugging**

```bash
# Start your app
pnpm start

# In the Expo Dev Tools, press 'j' to open debugger
# Or shake device and select "Debug"
```

**Step 3: Set breakpoints**

- Open React Native Debugger
- Navigate to Sources tab
- Find your file and click line number to set breakpoint

#### Console Logging Best Practices

```typescript
// ❌ DON'T: Leave console.logs in production
console.log('User:', user);

// ✅ DO: Use conditional logging
if (__DEV__) {
  console.log('[ProfileScreen] User:', user);
}

// ✅ BETTER: Use a logger utility
import { logger } from '@/utils/logger';
logger.debug('ProfileScreen', { user });
```

#### Redux DevTools

```typescript
// Redux DevTools is already configured in store/index.ts
// Open React Native Debugger to see:
// - All dispatched actions
// - State changes over time
// - Time-travel debugging
```

#### Network Debugging

```bash
# View network requests in Chrome DevTools:
# 1. Open Chrome DevTools (in Expo Dev Tools, press 'j')
# 2. Go to Network tab
# 3. Filter by 'XHR' to see API calls
```

---

## 5. Troubleshooting Guide

### 5.1 Setup Issues

#### Problem: `pnpm install` fails

**Symptoms:**

```
ERR_PNPM_FETCH_... unable to resolve dependency tree
```

**Solutions:**

```bash
# 1. Clear pnpm cache
pnpm store prune

# 2. Delete lockfile and node_modules
rm -rf node_modules pnpm-lock.yaml

# 3. Reinstall
pnpm install

# 4. If still failing, try legacy peer deps
pnpm install --legacy-peer-deps
```

#### Problem: Expo CLI not found

**Symptoms:**

```
expo: command not found
```

**Solution:**

```bash
# Expo CLI is installed with project dependencies
# Use pnpm instead:
pnpm start  # ✅ Instead of: expo start

# Or install globally:
npm install -g expo-cli
```

#### Problem: Can't connect to Supabase

**Symptoms:**

```
Error: Invalid API key
Error: Failed to fetch
```

**Solutions:**

```bash
# 1. Verify .env file exists
cat .env

# 2. Check environment variables are loaded
# Add this to your code temporarily:
console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);

# 3. Restart the development server
# Environment variables are only loaded on start
pnpm start --clear

# 4. Verify Supabase credentials in dashboard
# https://app.supabase.com/project/_/settings/api
```

### 5.2 Build Errors

#### Problem: "Module not found"

**Symptoms:**

```
Error: Unable to resolve module @/components/Button
```

**Solutions:**

```bash
# 1. Check TypeScript path aliases are configured
# Verify tsconfig.json has:
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

# 2. Check babel is configured for path aliases
# Verify babel.config.js has:
module.exports = {
  plugins: [
    ['module-resolver', {
      alias: {
        '@': './src'
      }
    }]
  ]
};

# 3. Clear Metro bundler cache
pnpm start --clear

# 4. Restart TypeScript server in VS Code
# Command Palette (Cmd+Shift+P): "TypeScript: Restart TS Server"
```

#### Problem: TypeScript errors everywhere

**Symptoms:**

```
Property 'X' does not exist on type 'Y'
Type 'A' is not assignable to type 'B'
```

**Solutions:**

```bash
# 1. Delete node_modules and reinstall
rm -rf node_modules
pnpm install

# 2. Clear TypeScript cache
rm -rf node_modules/.cache

# 3. Restart TypeScript server
# VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"

# 4. Check for version mismatches
pnpm list typescript
pnpm list @types/react

# 5. Verify tsconfig.json is valid
pnpm typecheck
```

#### Problem: "Invariant Violation: requireNativeComponent"

**Symptoms:**

```
Invariant Violation: requireNativeComponent: "RNCWebView" was not found
```

**Solutions:**

```bash
# 1. Install missing native dependency
pnpm install [missing-package]

# 2. Clear cache and restart
pnpm start --clear

# For iOS (macOS only):
cd ios && pod install && cd ..

# For Android:
cd android && ./gradlew clean && cd ..

# 3. Rebuild the app
pnpm ios  # or pnpm android
```

### 5.3 Test Failures

#### Problem: Tests fail after setup

**Note**: The project has documented pre-existing test failures. See `claudedocs/pre-existing-test-issues.md`.

**Solutions:**

```bash
# 1. Update test snapshots
pnpm test -- -u

# 2. Clear Jest cache
pnpm test --clearCache

# 3. Run tests in verbose mode
pnpm test --verbose

# 4. Run specific test file
pnpm test Button.test.tsx

# 5. Check for async issues
# Make sure to use `await` and `waitFor`:
import { waitFor } from '@testing-library/react-native';

await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeTruthy();
});
```

#### Problem: Snapshot tests always fail

**Symptoms:**

```
Snapshot name: `Component 1`

- Snapshot
+ Received
```

**Solutions:**

```bash
# 1. Update all snapshots
pnpm test -- -u

# 2. Update specific snapshot
pnpm test Button.test.tsx -- -u

# 3. Delete snapshot file and regenerate
rm __tests__/__snapshots__/Button.test.tsx.snap
pnpm test Button.test.tsx -- -u
```

### 5.4 Supabase Connection Problems

#### Problem: Auth errors

**Symptoms:**

```
Error: Invalid login credentials
Error: Email not confirmed
```

**Solutions:**

```bash
# 1. Check Supabase Auth settings
# Dashboard → Authentication → Providers
# Verify Email provider is enabled

# 2. Check email confirmation settings
# Dashboard → Authentication → Email Templates
# Verify "Confirm signup" is enabled

# 3. Test with confirmed user
# Dashboard → Authentication → Users
# Manually confirm a test user

# 4. Check RLS policies
# Dashboard → Table Editor → Select table → RLS
# Verify policies allow your operations
```

#### Problem: Database queries fail

**Symptoms:**

```
Error: new row violates row-level security policy
Error: permission denied for table
```

**Solutions:**

```sql
-- 1. Check RLS policies in Supabase Dashboard
-- Dashboard → Table Editor → Select table → RLS

-- 2. Temporarily disable RLS for testing (NOT for production!)
ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;

-- 3. Create proper RLS policy
CREATE POLICY "Users can view their own data"
ON your_table
FOR SELECT
USING (auth.uid() = user_id);

-- 4. Verify user is authenticated
-- In your code:
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);
```

### 5.5 Platform-Specific Issues

#### iOS Issues

**Problem: "No bundle URL present"**

**Solutions:**

```bash
# 1. Clear Xcode build folder
# Xcode → Product → Clean Build Folder

# 2. Delete derived data
rm -rf ~/Library/Developer/Xcode/DerivedData

# 3. Reinstall pods
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..

# 4. Restart Metro bundler
pnpm start --clear
```

**Problem: Simulator won't launch**

**Solutions:**

```bash
# 1. List available simulators
xcrun simctl list devices

# 2. Boot specific simulator
xcrun simctl boot "iPhone 15 Pro"

# 3. Reset simulator
xcrun simctl erase all

# 4. Restart CoreSimulatorService
sudo killall -9 com.apple.CoreSimulator.CoreSimulatorService
```

#### Android Issues

**Problem: "SDK location not found"**

**Solutions:**

```bash
# 1. Create local.properties file
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties

# 2. Set ANDROID_HOME environment variable
# Add to ~/.zshrc or ~/.bash_profile:
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools

# 3. Reload shell
source ~/.zshrc  # or source ~/.bash_profile
```

**Problem: Emulator won't start**

**Solutions:**

```bash
# 1. List available AVDs
emulator -list-avds

# 2. Start specific emulator
emulator -avd Pixel_5_API_33

# 3. Cold boot emulator
emulator -avd Pixel_5_API_33 -no-snapshot-load

# 4. Check HAXM/virtualization
# Android Studio → Tools → AVD Manager → Check system requirements
```

#### Web Issues

**Problem: "Cannot find module 'react-native-web'"**

**Solutions:**

```bash
# 1. Install react-native-web
pnpm add react-native-web

# 2. Clear cache
pnpm start --clear

# 3. Verify webpack config (expo handles this automatically)
```

### 5.6 Performance Issues

#### Problem: App is slow/laggy

**Solutions:**

```javascript
// 1. Enable Hermes (already enabled in app.json)
// Verify in app.json:
{
  "expo": {
    "jsEngine": "hermes"
  }
}

// 2. Use React.memo for expensive components
import { memo } from 'react';

const ExpensiveComponent = memo(({ data }) => {
  return <View>{/* Complex rendering */}</View>;
});

// 3. Use useMemo for expensive calculations
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.date - b.date);
}, [data]);

// 4. Use useCallback for event handlers
const handlePress = useCallback(() => {
  console.log('Pressed');
}, []);

// 5. Optimize FlatList
<FlatList
  data={items}
  renderItem={renderItem}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
  initialNumToRender={10}
/>
```

### 5.7 Known Issues

**Pre-existing Test Failures**

The project has documented pre-existing test issues that are not related to current development:

- 7 failing unit test suites
- 456 TypeScript errors in old test files
- 78 lint warnings
- Supabase functions not included in tsconfig.json

**Details**: See `claudedocs/pre-existing-test-issues.md`

**Important**: All new code should pass quality checks. Pre-existing issues are tracked separately.

---

## 6. Advanced Topics

### 6.1 MCP Server Configuration

MCP (Model Context Protocol) servers enhance Claude's capabilities for specific tasks.

**Available MCP Servers:**

- **Supabase MCP**: Database operations, migrations, Edge Functions
- **Serena MCP**: Code navigation, symbol operations, refactoring
- **Sequential Thinking MCP**: Complex reasoning and analysis
- **Memory Keeper MCP**: Session management and context persistence
- **GitHub MCP**: Repository operations, PRs, issues
- **Tavily MCP**: Web research and documentation search
- **Fetch MCP**: Enhanced web fetching with image support
- **ToolHive MCP**: Tool discovery and optimization
- **IDE MCP**: VS Code diagnostics and code execution

**Configuration**: See `docs/MCP_SETUP.md` for detailed setup instructions.

**When to use MCP servers:**

```bash
# Database operations
mcp__supabase__list_tables
mcp__supabase__execute_sql

# Find all references to a function
mcp__serena__find_referencing_symbols

# Complex debugging
--think "Why is login slow?"

# Track project state
mcp__memory-keeper__context_session_start
```

### 6.2 Performance Optimization

#### Image Optimization

```typescript
// Use React Native Paper's Avatar with lazy loading
import { Avatar } from 'react-native-paper';

<Avatar.Image
  source={{ uri: imageUrl }}
  size={48}
  // Lazy loading is handled automatically
/>
```

#### List Virtualization

```typescript
// FlatList optimization
<FlatList
  data={messages}
  renderItem={renderMessage}
  keyExtractor={(item) => item.id}
  // Performance props:
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
  initialNumToRender={10}
  getItemLayout={(data, index) => ({
    length: MESSAGE_HEIGHT,
    offset: MESSAGE_HEIGHT * index,
    index,
  })}
/>
```

#### Memoization

```typescript
// Memoize expensive components
const MessageCard = memo(({ message }) => {
  return <Card>{/* ... */}</Card>;
}, (prev, next) => prev.message.id === next.message.id);

// Memoize expensive calculations
const sortedMessages = useMemo(() => {
  return messages.sort((a, b) => b.timestamp - a.timestamp);
}, [messages]);
```

#### Redux Performance

```typescript
// Use memoized selectors
import { createSelector } from '@reduxjs/toolkit';

export const selectUnreadMessages = createSelector([selectAllMessages], messages =>
  messages.filter(m => !m.read),
);

// Avoid selecting entire state
// ❌ DON'T:
const state = useSelector(state => state);

// ✅ DO:
const messages = useSelector(selectMessages);
```

### 6.3 Accessibility Testing

Our app targets **WCAG 2.1 AA compliance**.

#### Manual Testing with Screen Readers

**iOS VoiceOver:**

```
1. Enable: Settings → Accessibility → VoiceOver → On
2. Navigate: Swipe right/left
3. Activate: Double-tap
4. Test checklist: __tests__/voiceover-testing-checklist.md
```

**Android TalkBack:**

```
1. Enable: Settings → Accessibility → TalkBack → On
2. Navigate: Swipe right/left
3. Activate: Double-tap
4. Test checklist: __tests__/talkback-testing-checklist.md
```

#### Automated Accessibility Testing

```typescript
// __tests__/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('should not have accessibility violations', async ({ page }) => {
  await page.goto('http://localhost:8081');

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

#### Accessibility Props

```typescript
// Always add accessibility props
<TouchableOpacity
  accessibilityLabel="Send message"
  accessibilityRole="button"
  accessibilityHint="Double tap to send the message"
  accessibilityState={{ disabled: !canSend }}
>
  <Icon name="send" />
</TouchableOpacity>
```

### 6.4 Custom Native Modules

For functionality not available in Expo, you may need custom native code.

**Step 1: Check if Expo has the feature**

```bash
# Search Expo documentation
# https://docs.expo.dev/
```

**Step 2: Use expo-dev-client for custom native code**

```bash
# Install expo-dev-client
pnpm add expo-dev-client

# Create custom native module
# Follow Expo docs: https://docs.expo.dev/modules/overview/
```

**Step 3: Rebuild native apps**

```bash
# iOS
pnpm ios --clear

# Android
pnpm android --clear
```

---

## 7. Resources & References

### 7.1 Quick Reference Card

**Daily Commands:**

```bash
pnpm start           # Start dev server
pnpm web             # Run on web
pnpm ios             # Run on iOS
pnpm android         # Run on Android

pnpm lint:fix        # Lint & auto-fix
pnpm typecheck       # Type checking
pnpm test            # Run tests

pnpm test:e2e        # E2E tests (Playwright)
```

**Quality Check (Pre-commit):**

```bash
pnpm lint:fix && pnpm typecheck && pnpm test
```

**Git Workflow:**

```bash
git checkout -b feature/name    # Create branch
git add .                       # Stage changes
git commit -m "type: msg"       # Commit
git push -u origin feature/name # Push
```

**Debugging:**

```bash
pnpm start --clear              # Clear cache
rm -rf node_modules && pnpm i   # Reinstall deps
pnpm test -- -u                 # Update snapshots
```

### 7.2 External Documentation Links

**Official Documentation:**

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [React Native Documentation](https://reactnative.dev/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Supabase Documentation](https://supabase.com/docs)
- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)

**Community Resources:**

- [React Native Community](https://github.com/react-native-community)
- [Expo Forums](https://forums.expo.dev/)
- [Stack Overflow - React Native](https://stackoverflow.com/questions/tagged/react-native)
- [Supabase Discord](https://discord.supabase.com/)

### 7.3 Project-Specific Documentation

**In this repository:**

- `README.md` - Project overview and quick start
- `CLAUDE.md` - Development guidelines and coding standards
- `specs/` - Feature specifications and implementation plans
- `docs/DEVELOPER_GUIDE.md` - This guide!
- `claudedocs/pre-existing-test-issues.md` - Known test issues

### 7.4 Team Communication

**Code Review Guidelines:**

- All PRs require review before merging
- Address all feedback before requesting re-review
- Keep PRs focused and under 500 lines when possible
- Include tests for new features

**Getting Help:**

- Check this guide first
- Search existing GitHub issues
- Ask in team chat (if applicable)
- Create a GitHub issue for bugs or feature requests

### 7.5 Further Reading

**Architecture & Patterns:**

- [React Native Best Practices](https://github.com/jondot/awesome-react-native#best-practices)
- [Redux Style Guide](https://redux.js.org/style-guide/)
- [TypeScript Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [React Native Performance](https://reactnative.dev/docs/performance)

**Testing:**

- [Testing React Native Apps](https://reactnative.dev/docs/testing-overview)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

**Accessibility:**

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [Mobile Accessibility Guide](https://www.a11yproject.com/posts/mobile-accessibility/)

---

## Appendix: Checklist for First Feature

Ready to implement your first feature? Use this checklist:

### Planning Phase

- [ ] Read the feature specification (if available)
- [ ] Understand acceptance criteria
- [ ] Identify affected components/screens
- [ ] Plan your approach

### Development Phase

- [ ] Create feature branch (`git checkout -b feature/name`)
- [ ] Write test first (TDD - RED phase)
- [ ] Implement feature (GREEN phase)
- [ ] Refactor code (REFACTOR phase)
- [ ] Add documentation comments
- [ ] Update types if needed

### Quality Assurance

- [ ] All tests pass (`pnpm test`)
- [ ] Type checking passes (`pnpm typecheck`)
- [ ] Linting passes (`pnpm lint:fix`)
- [ ] Manual testing on target platform(s)
- [ ] Accessibility testing (if UI changes)
- [ ] Performance check (if data-intensive)

### Documentation

- [ ] Update relevant docs (if needed)
- [ ] Add/update inline comments
- [ ] Update types/interfaces
- [ ] Screenshot (if UI changes)

### Submission

- [ ] Review your own code
- [ ] Run quality checks one more time
- [ ] Commit with conventional commit message
- [ ] Push to remote branch
- [ ] Create pull request
- [ ] Fill out PR template
- [ ] Request review

---

## Conclusion

You've reached the end of the Developer Guide! You should now have:

✅ A working development environment
✅ Understanding of the codebase structure
✅ Knowledge of the development workflow
✅ Ability to complete common tasks
✅ Troubleshooting skills for common issues

**Next Steps:**

1. Pick a small issue from GitHub to work on
2. Follow the TDD workflow
3. Create your first pull request
4. Ask for help when needed

**Remember:**

- When stuck, check the [Troubleshooting Guide](#5-troubleshooting-guide)
- Follow TDD (RED-GREEN-REFACTOR)
- Run quality checks before every commit
- Ask questions when uncertain

**Welcome to the team! Happy coding! 🚀**

---

**Last Updated**: 2025-11-10
**Maintainers**: Bill Chirico ([@BillChirico](https://github.com/BillChirico))
**Feedback**: Please open an issue if you find errors or have suggestions for improvement.
