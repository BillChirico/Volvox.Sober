/**
 * RLS Policy Tests for Volvox.Sober Recovery Platform
 * Purpose: Verify Row Level Security policies prevent unauthorized data access
 * Constitution Requirement: 100% security path coverage
 *
 * Test Strategy:
 * - Create test users with different roles
 * - Attempt unauthorized access scenarios
 * - Verify RLS blocks access (expect failures)
 * - Verify authorized access works (expect success)
 *
 * Run: supabase test db
 */

BEGIN;

-- Import testing framework
CREATE EXTENSION IF NOT EXISTS pgtap;

-- Setup test data
CREATE OR REPLACE FUNCTION setup_test_users() RETURNS void AS $$
DECLARE
  sponsor1_id uuid;
  sponsor2_id uuid;
  sponsee1_id uuid;
  sponsee2_id uuid;
BEGIN
  -- Create test users
  INSERT INTO auth.users (id, email) VALUES
    ('11111111-1111-1111-1111-111111111111', 'sponsor1@test.com'),
    ('22222222-2222-2222-2222-222222222222', 'sponsor2@test.com'),
    ('33333333-3333-3333-3333-333333333333', 'sponsee1@test.com'),
    ('44444444-4444-4444-4444-444444444444', 'sponsee2@test.com');

  sponsor1_id := '11111111-1111-1111-1111-111111111111';
  sponsor2_id := '22222222-2222-2222-2222-222222222222';
  sponsee1_id := '33333333-3333-3333-3333-333333333333';
  sponsee2_id := '44444444-4444-4444-4444-444444444444';

  -- Create user profiles
  INSERT INTO users (id, email, role, name, age) VALUES
    (sponsor1_id, 'sponsor1@test.com', 'sponsor', 'Sponsor One', 35),
    (sponsor2_id, 'sponsor2@test.com', 'sponsor', 'Sponsor Two', 42),
    (sponsee1_id, 'sponsee1@test.com', 'sponsee', 'Sponsee One', 28),
    (sponsee2_id, 'sponsee2@test.com', 'sponsee', 'Sponsee Two', 31);

  -- Create sponsor profiles
  INSERT INTO sponsor_profiles (user_id, max_sponsees, current_sponsees) VALUES
    (sponsor1_id, 5, 1),
    (sponsor2_id, 3, 0);

  -- Create sponsee profiles
  INSERT INTO sponsee_profiles (user_id, seeking_gender_match, preferred_meeting_frequency) VALUES
    (sponsee1_id, true, 'weekly'),
    (sponsee2_id, false, 'biweekly');

  -- Create a connection (sponsor1 <-> sponsee1)
  INSERT INTO connections (sponsor_id, sponsee_id, established_date) VALUES
    (sponsor1_id, sponsee1_id, NOW());

  -- Create sobriety tracking data
  INSERT INTO sobriety_dates (user_id, substance, start_date) VALUES
    (sponsee1_id, 'alcohol', '2023-01-01'),
    (sponsee2_id, 'alcohol', '2022-06-15');

  -- Create a relapse with private note for sponsee1
  INSERT INTO relapses (sobriety_date_id, relapse_date, private_note, shared_with_sponsor) VALUES
    (
      (SELECT id FROM sobriety_dates WHERE user_id = sponsee1_id LIMIT 1),
      '2023-03-15',
      'This is a private note that sponsor should NOT see',
      false
    );

  -- Create step work
  INSERT INTO step_work (sponsee_id, sponsor_id, step_id, responses) VALUES
    (sponsee1_id, sponsor1_id, 1, '{"q1": "My answer", "q2": "Another answer"}'::jsonb);

  -- Create messages
  INSERT INTO messages (connection_id, sender_id, recipient_id, content) VALUES
    (
      (SELECT id FROM connections WHERE sponsor_id = sponsor1_id AND sponsee_id = sponsee1_id LIMIT 1),
      sponsor1_id,
      sponsee1_id,
      'Hello from sponsor'
    );
END;
$$ LANGUAGE plpgsql;

-- Cleanup test data
CREATE OR REPLACE FUNCTION cleanup_test_users() RETURNS void AS $$
BEGIN
  DELETE FROM messages WHERE sender_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444');
  DELETE FROM step_work WHERE sponsee_id IN ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444');
  DELETE FROM relapses WHERE sobriety_date_id IN (SELECT id FROM sobriety_dates WHERE user_id IN ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444'));
  DELETE FROM sobriety_dates WHERE user_id IN ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444');
  DELETE FROM connections WHERE sponsor_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
  DELETE FROM sponsee_profiles WHERE user_id IN ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444');
  DELETE FROM sponsor_profiles WHERE user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
  DELETE FROM users WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444');
  DELETE FROM auth.users WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444');
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- TEST SUITE 1: Users Table RLS Policies
-- ===========================================

SELECT plan(10);

-- Setup
SELECT setup_test_users();

-- Test 1.1: Users can view their own profile
SELECT results_eq(
  $$
    SET request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111"}';
    SELECT id::text FROM users WHERE id = '11111111-1111-1111-1111-111111111111';
  $$,
  $$
    VALUES ('11111111-1111-1111-1111-111111111111'::text)
  $$,
  'Users should be able to view their own profile'
);

-- Test 1.2: Users CANNOT view other unconnected users' profiles
SELECT is_empty(
  $$
    SET request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222"}';
    SELECT id FROM users WHERE id = '33333333-3333-3333-3333-333333333333';
  $$,
  'Users should NOT be able to view unconnected users profiles'
);

-- Test 1.3: Connected users CAN view each other's profiles
SELECT results_eq(
  $$
    SET request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111"}';
    SELECT id::text FROM users WHERE id = '33333333-3333-3333-3333-333333333333';
  $$,
  $$
    VALUES ('33333333-3333-3333-3333-333333333333'::text)
  $$,
  'Connected sponsor should be able to view sponsee profile'
);

-- Test 1.4: Users can UPDATE their own profile
SELECT lives_ok(
  $$
    SET request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111"}';
    UPDATE users SET bio = 'Updated bio' WHERE id = '11111111-1111-1111-1111-111111111111';
  $$,
  'Users should be able to update their own profile'
);

-- Test 1.5: Users CANNOT update other users' profiles
SELECT throws_ok(
  $$
    SET request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222"}';
    UPDATE users SET bio = 'Malicious update' WHERE id = '11111111-1111-1111-1111-111111111111';
  $$,
  'new row violates row-level security policy',
  'Users should NOT be able to update other users profiles'
);

-- ===========================================
-- TEST SUITE 2: Sobriety Tracking RLS Policies
-- ===========================================

-- Test 2.1: Users can view their own sobriety dates
SELECT results_eq(
  $$
    SET request.jwt.claims = '{"sub": "33333333-3333-3333-3333-333333333333"}';
    SELECT user_id::text FROM sobriety_dates WHERE user_id = '33333333-3333-3333-3333-333333333333';
  $$,
  $$
    VALUES ('33333333-3333-3333-3333-333333333333'::text)
  $$,
  'Users should be able to view their own sobriety dates'
);

-- Test 2.2: Connected sponsors CAN view sponsee's sobriety dates
SELECT results_eq(
  $$
    SET request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111"}';
    SELECT user_id::text FROM sobriety_dates WHERE user_id = '33333333-3333-3333-3333-333333333333';
  $$,
  $$
    VALUES ('33333333-3333-3333-3333-333333333333'::text)
  $$,
  'Connected sponsors should be able to view sponsee sobriety dates'
);

-- Test 2.3: Unconnected users CANNOT view sobriety dates
SELECT is_empty(
  $$
    SET request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222"}';
    SELECT user_id FROM sobriety_dates WHERE user_id = '33333333-3333-3333-3333-333333333333';
  $$,
  'Unconnected users should NOT be able to view sobriety dates'
);

-- Test 2.4: Sponsors CANNOT see private relapse notes
SELECT is_empty(
  $$
    SET request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111"}';
    SELECT private_note FROM relapses
    WHERE sobriety_date_id IN (
      SELECT id FROM sobriety_dates WHERE user_id = '33333333-3333-3333-3333-333333333333'
    ) AND private_note IS NOT NULL;
  $$,
  'Sponsors should NOT be able to view private relapse notes'
);

-- Test 2.5: Unconnected users CANNOT view any relapse data
SELECT is_empty(
  $$
    SET request.jwt.claims = '{"sub": "44444444-4444-4444-4444-444444444444"}';
    SELECT id FROM relapses
    WHERE sobriety_date_id IN (
      SELECT id FROM sobriety_dates WHERE user_id = '33333333-3333-3333-3333-333333333333'
    );
  $$,
  'Unconnected users should NOT be able to view any relapse data'
);

-- Cleanup
SELECT cleanup_test_users();

SELECT * FROM finish();

ROLLBACK;
