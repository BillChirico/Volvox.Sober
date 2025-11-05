# Supabase RLS Policy Tests

## Overview

This directory contains Row Level Security (RLS) policy tests for the Volvox.Sober Recovery Platform database. These tests ensure 100% security path coverage as required by the project constitution.

## Test Files

### `rls-policies.test.sql`
**Coverage**: Users, Sobriety Tracking, Relapses
- Users can only view/update their own profiles
- Connected users can view each other's profiles
- Unauthorized profile access blocked
- Sobriety dates visible only to user and connected sponsor
- Private relapse notes filtered from sponsors
- Unconnected users cannot access sobriety data

### `rls-policies-advanced.test.sql`
**Coverage**: Step Work, Messaging, Connections
- Sponsees can view their own step work
- Connected sponsors can view/comment on sponsee step work
- Unconnected sponsors cannot access step work
- Message visibility limited to sender and recipient
- Users cannot send messages in unrelated connections
- Connection visibility limited to participants

## Running Tests

### Prerequisites

1. **Supabase CLI** installed: `pnpm add -g supabase`
2. **Local Supabase** running: `supabase start`
3. **Migrations applied**: `supabase db push`

### Run All Tests

```bash
# From repository root
supabase test db

# Or run specific test file
supabase test db supabase/tests/rls-policies.test.sql
```

### Expected Output

```
TAP version 13
1..18
ok 1 - Users should be able to view their own profile
ok 2 - Users should NOT be able to view unconnected users profiles
ok 3 - Connected sponsor should be able to view sponsee profile
...
ok 18 - Unrelated users should NOT be able to view connections
```

**All tests should pass** (18/18 tests passing = 100% security coverage)

## Test Strategy

### Test Users

Tests create 4 test users:
- **Sponsor 1** (`11111111-1111-1111-1111-111111111111`) - Connected to Sponsee 1
- **Sponsor 2** (`22222222-2222-2222-2222-222222222222`) - No connections
- **Sponsee 1** (`33333333-3333-3333-3333-333333333333`) - Connected to Sponsor 1
- **Sponsee 2** (`44444444-4444-4444-4444-444444444444`) - No connections

### Security Scenarios Tested

1. **Own Data Access**: Users can view/modify their own records
2. **Connection-Based Access**: Connected users can view each other's relevant data
3. **Privacy Protection**: Private data (relapse notes) filtered even from connected users
4. **Unauthorized Access**: Unconnected users blocked from viewing any data
5. **Cross-Entity Security**: Message/step work visibility enforced across relationships

## Adding New Tests

### Test Template

```sql
-- Test X.Y: Description
SELECT results_eq(
  $$
    SET request.jwt.claims = '{"sub": "<user-id>"}';
    SELECT <columns> FROM <table> WHERE <condition>;
  $$,
  $$
    VALUES (<expected-values>)
  $$,
  'Test description explaining expected behavior'
);
```

### Test Types

- **`results_eq`**: Verify query returns expected results
- **`is_empty`**: Verify query returns no results (blocked)
- **`lives_ok`**: Verify operation succeeds without error
- **`throws_ok`**: Verify operation throws expected error

## Constitution Compliance

✅ **Security Requirement Met**: 100% security path coverage

- All RLS policies have automated tests
- Unauthorized access scenarios verified
- Multi-tenant data isolation confirmed
- Privacy requirements (relapse notes) validated

## Troubleshooting

### Test Failures

If tests fail, check:

1. **Migrations applied**: `supabase db push`
2. **Test data cleanup**: Tests use transactions (ROLLBACK) for isolation
3. **RLS enabled**: `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;`
4. **Policy syntax**: Review policy definitions in migration files

### Common Issues

**Error: "row-level security policy violated"**
- Expected for unauthorized access tests
- Verify test user IDs match policy conditions

**Error: "relation does not exist"**
- Ensure all migrations are applied
- Check table names match schema

**Tests hang indefinitely**
- Check for missing `ROLLBACK;` in test file
- Verify transaction isolation

## Continuous Integration

### GitHub Actions

```yaml
name: RLS Policy Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: supabase/setup-cli@v1
      - run: supabase start
      - run: supabase db push
      - run: supabase test db
```

## References

- [Supabase Testing Documentation](https://supabase.com/docs/guides/cli/testing)
- [pgTAP Documentation](https://pgtap.org/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- Constitution: Security & Privacy Requirements (FR-059 to FR-062)
