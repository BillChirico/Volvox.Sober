/**
 * Advanced RLS Policy Tests - Step Work, Messaging, Connections
 * Purpose: Complete security coverage for all remaining entities
 * Constitution Requirement: 100% security path coverage
 *
 * Run: supabase test db
 */

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;

-- Reuse setup functions from rls-policies.test.sql
\i rls-policies.test.sql

-- ===========================================
-- TEST SUITE 3: Step Work RLS Policies
-- ===========================================

SELECT plan(8);

-- Setup
SELECT setup_test_users();

-- Test 3.1: Sponsees can view their own step work
SELECT results_eq(
  $$
    SET request.jwt.claims = '{"sub": "33333333-3333-3333-3333-333333333333"}';
    SELECT sponsee_id::text FROM step_work WHERE sponsee_id = '33333333-3333-3333-3333-333333333333';
  $$,
  $$
    VALUES ('33333333-3333-3333-3333-333333333333'::text)
  $$,
  'Sponsees should be able to view their own step work'
);

-- Test 3.2: Connected sponsors CAN view sponsee's step work
SELECT results_eq(
  $$
    SET request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111"}';
    SELECT sponsor_id::text FROM step_work
    WHERE sponsee_id = '33333333-3333-3333-3333-333333333333'
      AND sponsor_id = '11111111-1111-1111-1111-111111111111';
  $$,
  $$
    VALUES ('11111111-1111-1111-1111-111111111111'::text)
  $$,
  'Connected sponsors should be able to view their sponsee step work'
);

-- Test 3.3: Unconnected sponsors CANNOT view step work
SELECT is_empty(
  $$
    SET request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222"}';
    SELECT id FROM step_work WHERE sponsee_id = '33333333-3333-3333-3333-333333333333';
  $$,
  'Unconnected sponsors should NOT be able to view step work'
);

-- Test 3.4: Other sponsees CANNOT view another sponsee's step work
SELECT is_empty(
  $$
    SET request.jwt.claims = '{"sub": "44444444-4444-4444-4444-444444444444"}';
    SELECT id FROM step_work WHERE sponsee_id = '33333333-3333-3333-3333-333333333333';
  $$,
  'Other sponsees should NOT be able to view another sponsee step work'
);

-- ===========================================
-- TEST SUITE 4: Messaging RLS Policies
-- ===========================================

-- Test 4.1: Senders can view messages they sent
SELECT results_eq(
  $$
    SET request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111"}';
    SELECT sender_id::text FROM messages WHERE sender_id = '11111111-1111-1111-1111-111111111111';
  $$,
  $$
    VALUES ('11111111-1111-1111-1111-111111111111'::text)
  $$,
  'Senders should be able to view messages they sent'
);

-- Test 4.2: Recipients can view messages sent to them
SELECT results_eq(
  $$
    SET request.jwt.claims = '{"sub": "33333333-3333-3333-3333-333333333333"}';
    SELECT recipient_id::text FROM messages WHERE recipient_id = '33333333-3333-3333-3333-333333333333';
  $$,
  $$
    VALUES ('33333333-3333-3333-3333-333333333333'::text)
  $$,
  'Recipients should be able to view messages sent to them'
);

-- Test 4.3: Unrelated users CANNOT view messages
SELECT is_empty(
  $$
    SET request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222"}';
    SELECT id FROM messages
    WHERE sender_id = '11111111-1111-1111-1111-111111111111'
      OR recipient_id = '33333333-3333-3333-3333-333333333333';
  $$,
  'Unrelated users should NOT be able to view messages'
);

-- Test 4.4: Users can only send messages in connections they belong to
SELECT throws_ok(
  $$
    SET request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222"}';
    INSERT INTO messages (connection_id, sender_id, recipient_id, content) VALUES (
      (SELECT id FROM connections WHERE sponsor_id = '11111111-1111-1111-1111-111111111111' LIMIT 1),
      '22222222-2222-2222-2222-222222222222',
      '33333333-3333-3333-3333-333333333333',
      'Unauthorized message'
    );
  $$,
  'new row violates row-level security policy',
  'Users should NOT be able to send messages in connections they do not belong to'
);

-- ===========================================
-- TEST SUITE 5: Connections RLS Policies
-- ===========================================

-- Test 5.1: Sponsors can view their connections
SELECT results_eq(
  $$
    SET request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111"}';
    SELECT sponsor_id::text FROM connections WHERE sponsor_id = '11111111-1111-1111-1111-111111111111';
  $$,
  $$
    VALUES ('11111111-1111-1111-1111-111111111111'::text)
  $$,
  'Sponsors should be able to view their connections'
);

-- Test 5.2: Sponsees can view their connections
SELECT results_eq(
  $$
    SET request.jwt.claims = '{"sub": "33333333-3333-3333-3333-333333333333"}';
    SELECT sponsee_id::text FROM connections WHERE sponsee_id = '33333333-3333-3333-3333-333333333333';
  $$,
  $$
    VALUES ('33333333-3333-3333-3333-333333333333'::text)
  $$,
  'Sponsees should be able to view their connections'
);

-- Test 5.3: Unrelated users CANNOT view connections
SELECT is_empty(
  $$
    SET request.jwt.claims = '{"sub": "44444444-4444-4444-4444-444444444444"}';
    SELECT id FROM connections WHERE sponsor_id = '11111111-1111-1111-1111-111111111111';
  $$,
  'Unrelated users should NOT be able to view connections'
);

-- Cleanup
SELECT cleanup_test_users();

SELECT * FROM finish();

ROLLBACK;
