# Code Style & Conventions

## TypeScript Standards
- **Strict Mode**: Always enabled (`strict: true` in tsconfig.json)
- **No Implicit Any**: All variables must have explicit types
- **Strict Null Checks**: Handle null/undefined explicitly
- **Function Return Types**: Required for all functions (ESLint enforced)
- **Path Aliases**: Use `@/*` for absolute imports from `src/`

## React Native Best Practices
- **Functional Components**: Use function components with hooks (no class components)
- **Props Interface**: Define TypeScript interfaces for all component props
- **Accessibility**: Include `accessibilityLabel`, `accessibilityRole` on interactive elements
- **Performance**: Use `React.memo()` for expensive components, `useMemo()`/`useCallback()` for optimization
- **StyleSheet**: Use `StyleSheet.create()` for all styles (no inline styles)

## Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile`, `MessageList`)
- **Functions**: camelCase (e.g., `getUserData`, `sendMessage`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_TIMEOUT`, `MAX_RETRIES`)
- **Types/Interfaces**: PascalCase (e.g., `User`, `MessagePayload`)
- **Boolean Variables**: Prefixed with `is`, `has`, `should` (e.g., `isLoading`, `hasError`)

## Code Organization
- **Single Responsibility**: Each file/component has one clear purpose
- **DRY Principle**: Extract repeated logic into hooks or utilities
- **Small Functions**: Keep functions under 50 lines when possible
- **Commenting**: Use JSDoc for complex functions, avoid obvious comments

## ESLint Configuration
```javascript
{
  parser: '@typescript-eslint/parser',
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
    'react/prop-types': 'off'  // Using TypeScript instead
  }
}
```

## Prettier Configuration
- **Semi**: true (semicolons required)
- **Trailing Comma**: es5 compatible
- **Single Quote**: true (prefer single quotes)
- **Print Width**: 100 characters
- **Tab Width**: 2 spaces

## Testing Conventions
- **Test File Location**: Co-locate in `__tests__` directory next to source
- **Test Naming**: Descriptive test names using `it('should ...')` format
- **Coverage**: 80% minimum for business logic (enforced by Jest config)
- **Mocking**: Mock external dependencies (API calls, navigation, etc.)
- **Test Structure**: Arrange-Act-Assert pattern

## Git Commit Messages
- **Format**: `type(scope): description`
- **Types**: feat, fix, refactor, test, docs, chore
- **Examples**:
  - `feat(auth): implement sponsor login flow`
  - `fix(messaging): resolve real-time subscription memory leak`
  - `test(matching): add unit tests for scoring algorithm`

## Import Order
1. React/React Native imports
2. Third-party libraries
3. Local modules (using path aliases)
4. Types
5. Styles

Example:
```typescript
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useQuery } from 'react-query';
import { Button } from '@/components/base';
import type { User } from '@/types';
import styles from './styles';
```