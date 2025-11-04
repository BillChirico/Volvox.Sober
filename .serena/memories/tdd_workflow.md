# Test-Driven Development (TDD) Workflow

## Core Principle: Red-Green-Refactor

TDD is **MANDATORY** for all feature development in Volvox.Sober. This is non-negotiable per the project constitution.

## The TDD Cycle

### 1. RED Phase - Write Failing Test
**Before writing any implementation code**, write a test that fails.

```typescript
// Example: Testing a new authentication hook
// mobile/src/hooks/__tests__/useAuth.test.ts

import { renderHook } from '@testing-library/react-hooks';
import { useAuth } from '../useAuth';

describe('useAuth', () => {
  it('should return authenticated user after successful login', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAuth());
    
    await result.current.login('sponsor@test.com', 'password123');
    await waitForNextUpdate();
    
    expect(result.current.user).toBeDefined();
    expect(result.current.user?.email).toBe('sponsor@test.com');
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

**Run test**: `npm test useAuth.test.ts`
**Expected**: Test fails because `useAuth` doesn't exist yet.

### 2. GREEN Phase - Minimal Implementation
Write the **minimum code** necessary to make the test pass.

```typescript
// mobile/src/hooks/useAuth.ts

import { useState } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email: string, password: string) => {
    // Minimal implementation - just enough to pass test
    setUser({ email });
    setIsAuthenticated(true);
  };

  return { user, isAuthenticated, login };
};
```

**Run test**: `npm test useAuth.test.ts`
**Expected**: Test passes now.

### 3. REFACTOR Phase - Improve Quality
Now improve the code while keeping tests green.

```typescript
// mobile/src/hooks/useAuth.ts (refactored)

import { useState, useCallback } from 'react';
import { supabase } from '@/services/supabase/supabaseClient';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  });

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      setState({
        user: data.user as User,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
    }
  }, []);

  return { ...state, login };
};
```

**Run test**: `npm test useAuth.test.ts`
**Expected**: Test still passes with better implementation.

## Testing Patterns

### Component Testing
```typescript
// mobile/src/screens/__tests__/LoginScreen.test.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '../LoginScreen';

describe('LoginScreen', () => {
  it('should display error message on invalid credentials', async () => {
    const { getByTestId, getByText } = render(<LoginScreen />);
    
    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const loginButton = getByText('Login');
    
    fireEvent.changeText(emailInput, 'invalid@test.com');
    fireEvent.changeText(passwordInput, 'wrong');
    fireEvent.press(loginButton);
    
    await waitFor(() => {
      expect(getByText('Invalid credentials')).toBeTruthy();
    });
  });
});
```

### Service/API Testing
```typescript
// mobile/src/services/__tests__/messageService.test.ts

import { messageService } from '../messageService';
import { supabase } from '../supabase/supabaseClient';

jest.mock('../supabase/supabaseClient');

describe('messageService', () => {
  it('should send message with correct payload', async () => {
    const mockInsert = jest.fn().mockResolvedValue({ data: { id: '123' }, error: null });
    (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });
    
    await messageService.sendMessage('connection-id', 'Hello!');
    
    expect(mockInsert).toHaveBeenCalledWith({
      connection_id: 'connection-id',
      content: 'Hello!',
      sent_at: expect.any(String)
    });
  });
});
```

### Integration Testing
```typescript
// mobile/tests/integration/matchingFlow.test.ts

import { renderHook } from '@testing-library/react-hooks';
import { useMatching } from '@/hooks/useMatching';
import { supabase } from '@/services/supabase/supabaseClient';

describe('Matching Flow Integration', () => {
  beforeEach(async () => {
    // Seed test database
    await supabase.from('profiles').insert([
      { id: 'sponsor-1', role: 'sponsor', years_sober: 5 },
      { id: 'sponsee-1', role: 'sponsee', days_sober: 30 }
    ]);
  });

  it('should match sponsee with compatible sponsor', async () => {
    const { result, waitForNextUpdate } = renderHook(() => 
      useMatching('sponsee-1')
    );
    
    await waitForNextUpdate();
    
    expect(result.current.matches).toHaveLength(1);
    expect(result.current.matches[0].sponsor_id).toBe('sponsor-1');
    expect(result.current.matches[0].compatibility_score).toBeGreaterThan(0.7);
  });
});
```

## Coverage Requirements

### Minimum Coverage (enforced by Jest config)
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### What to Test
✅ **Must Test**:
- Business logic (hooks, services, utilities)
- User interactions (button clicks, form submissions)
- Error handling and edge cases
- API calls and data transformations
- Navigation flows

❌ **Don't Test**:
- External libraries (React, React Navigation, Supabase)
- Native modules (already tested by React Native)
- Simple prop passing (unless complex logic involved)

## Testing Best Practices

### Arrange-Act-Assert Pattern
```typescript
it('should update profile successfully', async () => {
  // Arrange
  const mockProfile = { id: '1', name: 'John', bio: 'Test bio' };
  const updateFn = jest.fn().mockResolvedValue({ data: mockProfile, error: null });
  
  // Act
  const result = await profileService.updateProfile(mockProfile);
  
  // Assert
  expect(result.data).toEqual(mockProfile);
  expect(updateFn).toHaveBeenCalledTimes(1);
});
```

### Mocking Guidelines
- Mock external dependencies (Supabase, navigation, async storage)
- Don't mock internal modules (test actual integration)
- Use `jest.mock()` for module mocks
- Use `jest.fn()` for function mocks

### Test Isolation
- Each test should be independent
- Use `beforeEach` for setup
- Use `afterEach` for cleanup
- Don't rely on test execution order

## Common TDD Anti-Patterns to Avoid

❌ **Writing implementation first, then tests**
- Violates TDD cycle
- Tests become validation, not specification

❌ **Writing tests that always pass**
- Not useful for catching regressions
- Defeats purpose of testing

❌ **Skipping refactor phase**
- Leads to technical debt
- Code quality degrades over time

❌ **Testing implementation details**
- Makes tests brittle
- Focus on behavior, not internal state

## Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (recommended during TDD)
npm test -- --watch

# Run specific test file
npm test -- useAuth.test.ts

# Run with coverage report
npm run test:coverage

# Update snapshots (use cautiously)
npm test -- -u
```

## Example TDD Session

1. **Start watch mode**: `npm test -- --watch`
2. **RED**: Write failing test
3. **GREEN**: Implement minimal code
4. **REFACTOR**: Improve code quality
5. **Repeat** for next feature
6. **Verify coverage**: `npm run test:coverage`

## References
- Jest Documentation: https://jestjs.io/
- React Native Testing Library: https://callstack.github.io/react-native-testing-library/
- Testing Best Practices: https://testingjavascript.com/