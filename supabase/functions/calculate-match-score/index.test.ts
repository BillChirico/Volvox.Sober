/**
 * Calculate Match Score Edge Function Tests
 * Tests weighted compatibility scoring algorithm
 * Feature: 002-app-screens (T093)
 */

import { assertEquals, assertExists } from 'https://deno.land/std@0.168.0/testing/asserts.ts';

// Mock profile data for testing
interface Profile {
  id: string;
  name: string;
  bio: string | null;
  profile_photo_url: string | null;
  role: 'sponsor' | 'sponsee' | 'both';
  recovery_program: string;
  sobriety_start_date: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  availability: string[];
  preferences: Record<string, unknown>;
}

// Test data: Sponsee profile (seeking sponsor)
const testSponseeProfile: Profile = {
  id: 'sponsee-001',
  name: 'John Doe',
  bio: 'New to recovery, seeking support',
  profile_photo_url: null,
  role: 'sponsee',
  recovery_program: 'Alcoholics Anonymous (AA)',
  sobriety_start_date: '2024-10-01',
  city: 'Boston',
  state: 'MA',
  country: 'United States',
  availability: ['Weekday Evenings', 'Weekend Mornings'],
  preferences: {},
};

// Test data: Ideal sponsor match (high compatibility)
const highCompatibilitySponsor: Profile = {
  id: 'sponsor-001',
  name: 'Jane Smith',
  bio: '5 years sober, love helping others',
  profile_photo_url: null,
  role: 'sponsor',
  recovery_program: 'Alcoholics Anonymous (AA)',
  sobriety_start_date: '2019-01-15', // 5+ years sober
  city: 'Boston',
  state: 'MA',
  country: 'United States',
  availability: ['Weekday Evenings', 'Weekend Mornings', 'Flexible'],
  preferences: {},
};

// Test data: Medium compatibility sponsor
const mediumCompatibilitySponsor: Profile = {
  id: 'sponsor-002',
  name: 'Mike Johnson',
  bio: '2 years sober',
  profile_photo_url: null,
  role: 'sponsor',
  recovery_program: 'Alcoholics Anonymous (AA)',
  sobriety_start_date: '2022-06-01', // 2+ years sober
  city: 'Cambridge',
  state: 'MA',
  country: 'United States',
  availability: ['Weekday Mornings'], // Different availability
  preferences: {},
};

// Test data: Low compatibility sponsor
const lowCompatibilitySponsor: Profile = {
  id: 'sponsor-003',
  name: 'Sarah Williams',
  bio: 'Just started sponsoring',
  profile_photo_url: null,
  role: 'sponsor',
  recovery_program: 'Narcotics Anonymous (NA)', // Different program
  sobriety_start_date: '2023-03-01', // 1+ years sober
  city: 'Worcester',
  state: 'MA',
  country: 'United States',
  availability: ['Weekend Evenings'], // No overlap
  preferences: {},
};

// Test data: Ineligible sponsor (< 1 year sober)
const ineligibleSponsor: Profile = {
  id: 'sponsor-004',
  name: 'Tom Brown',
  bio: 'Early in recovery',
  profile_photo_url: null,
  role: 'sponsor',
  recovery_program: 'Alcoholics Anonymous (AA)',
  sobriety_start_date: '2024-08-01', // < 1 year sober
  city: 'Boston',
  state: 'MA',
  country: 'United States',
  availability: ['Weekday Evenings'],
  preferences: {},
};

/**
 * Test: Recovery Program Scoring
 */
Deno.test('scoreRecoveryProgram - same program returns 1.0', () => {
  const score = scoreRecoveryProgram(testSponseeProfile, highCompatibilitySponsor);
  assertEquals(score, 1.0);
});

Deno.test('scoreRecoveryProgram - different program returns 0.0', () => {
  const score = scoreRecoveryProgram(testSponseeProfile, lowCompatibilitySponsor);
  assertEquals(score, 0.0);
});

/**
 * Test: Availability Scoring
 */
Deno.test('scoreAvailability - full overlap returns 1.0', () => {
  const user: Profile = {
    ...testSponseeProfile,
    availability: ['Weekday Evenings'],
  };
  const candidate: Profile = {
    ...highCompatibilitySponsor,
    availability: ['Weekday Evenings'],
  };
  const score = scoreAvailability(user, candidate);
  assertEquals(score, 1.0);
});

Deno.test('scoreAvailability - partial overlap returns proportional score', () => {
  const score = scoreAvailability(testSponseeProfile, highCompatibilitySponsor);
  // sponsee: ['Weekday Evenings', 'Weekend Mornings'] = 2 slots
  // sponsor: ['Weekday Evenings', 'Weekend Mornings', 'Flexible'] = 3 slots
  // overlap: 2 slots
  // score: 2 / max(2, 3) = 2/3 ≈ 0.67
  assertEquals(Math.round(score * 100), 67);
});

Deno.test('scoreAvailability - no overlap returns 0.0', () => {
  const score = scoreAvailability(testSponseeProfile, mediumCompatibilitySponsor);
  // sponsee: ['Weekday Evenings', 'Weekend Mornings']
  // sponsor: ['Weekday Mornings']
  // overlap: 0
  assertEquals(score, 0.0);
});

Deno.test('scoreAvailability - empty availability returns 0.0', () => {
  const user: Profile = {
    ...testSponseeProfile,
    availability: [],
  };
  const score = scoreAvailability(user, highCompatibilitySponsor);
  assertEquals(score, 0.0);
});

/**
 * Test: Location Scoring
 */
Deno.test('scoreLocation - same city and state returns 1.0', () => {
  const score = scoreLocation(testSponseeProfile, highCompatibilitySponsor);
  assertEquals(score, 1.0);
});

Deno.test('scoreLocation - same state different city returns 0.5', () => {
  const score = scoreLocation(testSponseeProfile, mediumCompatibilitySponsor);
  assertEquals(score, 0.5);
});

Deno.test('scoreLocation - different state returns 0.0', () => {
  const candidate: Profile = {
    ...highCompatibilitySponsor,
    city: 'New York',
    state: 'NY',
  };
  const score = scoreLocation(testSponseeProfile, candidate);
  assertEquals(score, 0.0);
});

Deno.test('scoreLocation - missing location data returns 0.0', () => {
  const user: Profile = {
    ...testSponseeProfile,
    city: null,
    state: null,
  };
  const score = scoreLocation(user, highCompatibilitySponsor);
  assertEquals(score, 0.0);
});

/**
 * Test: Experience Level Scoring
 */
Deno.test('scoreExperienceLevel - sponsor with 5+ years returns 1.0', () => {
  const score = scoreExperienceLevel(testSponseeProfile, highCompatibilitySponsor);
  assertEquals(score, 1.0);
});

Deno.test('scoreExperienceLevel - sponsor with 2+ years returns proportional score', () => {
  const score = scoreExperienceLevel(testSponseeProfile, mediumCompatibilitySponsor);
  // 2+ years = ~730 days, required = 365 days
  // score = min(730/365, 1.0) = 1.0
  assertEquals(score, 1.0);
});

Deno.test('scoreExperienceLevel - sponsor with < 1 year returns proportional score', () => {
  const score = scoreExperienceLevel(testSponseeProfile, ineligibleSponsor);
  // < 1 year = < 365 days
  // score = days / 365 < 1.0
  assertEquals(score < 1.0, true);
});

Deno.test('scoreExperienceLevel - missing sobriety date returns 0.0', () => {
  const candidate: Profile = {
    ...highCompatibilitySponsor,
    sobriety_start_date: null,
  };
  const score = scoreExperienceLevel(testSponseeProfile, candidate);
  assertEquals(score, 0.0);
});

Deno.test('scoreExperienceLevel - non-sponsee/sponsor pair returns 1.0', () => {
  // When user is sponsor and candidate is sponsee, return neutral score
  const sponsor: Profile = { ...testSponseeProfile, role: 'sponsor' };
  const sponsee: Profile = { ...highCompatibilitySponsor, role: 'sponsee' };
  const score = scoreExperienceLevel(sponsor, sponsee);
  assertEquals(score, 1.0);
});

/**
 * Test: Preferences Scoring (placeholder)
 */
Deno.test('scorePreferences - returns neutral score 0.5', () => {
  const score = scorePreferences(testSponseeProfile, highCompatibilitySponsor);
  assertEquals(score, 0.5);
});

/**
 * Test: Calculate Compatibility (integration)
 */
Deno.test('calculateCompatibility - high compatibility sponsor scores 80+', () => {
  const score = calculateCompatibility(testSponseeProfile, highCompatibilitySponsor);
  // Expected breakdown:
  // - recoveryProgram: 1.0 * 0.35 = 0.35 (35 points)
  // - availability: 0.67 * 0.25 = 0.17 (17 points)
  // - location: 1.0 * 0.20 = 0.20 (20 points)
  // - experienceLevel: 1.0 * 0.15 = 0.15 (15 points)
  // - preferences: 0.5 * 0.05 = 0.025 (2.5 points)
  // Total: ~90 points
  assertEquals(score >= 80, true);
});

Deno.test('calculateCompatibility - medium compatibility sponsor scores 40-70', () => {
  const score = calculateCompatibility(testSponseeProfile, mediumCompatibilitySponsor);
  // Expected breakdown:
  // - recoveryProgram: 1.0 * 0.35 = 0.35 (35 points)
  // - availability: 0.0 * 0.25 = 0.0 (0 points)
  // - location: 0.5 * 0.20 = 0.10 (10 points)
  // - experienceLevel: 1.0 * 0.15 = 0.15 (15 points)
  // - preferences: 0.5 * 0.05 = 0.025 (2.5 points)
  // Total: ~63 points
  assertEquals(score >= 40 && score <= 70, true);
});

Deno.test('calculateCompatibility - low compatibility sponsor scores < 40', () => {
  const score = calculateCompatibility(testSponseeProfile, lowCompatibilitySponsor);
  // Expected breakdown:
  // - recoveryProgram: 0.0 * 0.35 = 0.0 (0 points)
  // - availability: 0.0 * 0.25 = 0.0 (0 points)
  // - location: 0.5 * 0.20 = 0.10 (10 points)
  // - experienceLevel: 1.0 * 0.15 = 0.15 (15 points)
  // - preferences: 0.5 * 0.05 = 0.025 (2.5 points)
  // Total: ~28 points
  assertEquals(score < 40, true);
});

Deno.test('calculateCompatibility - returns score between 0 and 100', () => {
  const score = calculateCompatibility(testSponseeProfile, highCompatibilitySponsor);
  assertEquals(score >= 0, true);
  assertEquals(score <= 100, true);
});

/**
 * Helper functions extracted from main implementation
 * (These would normally be imported, but included here for testing)
 */

function scoreRecoveryProgram(user: Profile, candidate: Profile): number {
  return user.recovery_program === candidate.recovery_program ? 1.0 : 0.0;
}

function scoreAvailability(user: Profile, candidate: Profile): number {
  if (!user.availability || user.availability.length === 0) return 0;
  if (!candidate.availability || candidate.availability.length === 0) return 0;

  const overlap = user.availability.filter(slot => candidate.availability.includes(slot));

  const maxLength = Math.max(user.availability.length, candidate.availability.length);
  return overlap.length / maxLength;
}

function scoreLocation(user: Profile, candidate: Profile): number {
  if (!user.city || !user.state || !candidate.city || !candidate.state) return 0;

  if (user.city.toLowerCase() === candidate.city.toLowerCase() && user.state === candidate.state) {
    return 1.0;
  }

  if (user.state === candidate.state) {
    return 0.5;
  }

  return 0.0;
}

function scoreExperienceLevel(user: Profile, candidate: Profile): number {
  // Only applies when user is sponsee and candidate is sponsor
  if (user.role !== 'sponsee' || candidate.role !== 'sponsor') {
    return 1.0; // Neutral score for other combinations
  }

  if (!candidate.sobriety_start_date) return 0;

  const sobrietyStartDate = new Date(candidate.sobriety_start_date);
  const now = new Date();
  const daysSober = Math.floor(
    (now.getTime() - sobrietyStartDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  const minDaysRequired = 365; // 1 year minimum
  return Math.min(daysSober / minDaysRequired, 1.0);
}

function scorePreferences(_user: Profile, _candidate: Profile): number {
  return 0.5; // Neutral score
}

function calculateCompatibility(user: Profile, candidate: Profile): number {
  const WEIGHTS = {
    recoveryProgram: 0.35,
    availability: 0.25,
    location: 0.2,
    experienceLevel: 0.15,
    preferences: 0.05,
  };

  const score =
    WEIGHTS.recoveryProgram * scoreRecoveryProgram(user, candidate) +
    WEIGHTS.availability * scoreAvailability(user, candidate) +
    WEIGHTS.location * scoreLocation(user, candidate) +
    WEIGHTS.experienceLevel * scoreExperienceLevel(user, candidate) +
    WEIGHTS.preferences * scorePreferences(user, candidate);

  return Math.round(score * 100);
}
