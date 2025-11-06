import { assertEquals, assertAlmostEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts';

// Import scoring functions (would need to export them in index.ts)
// For now, duplicating the logic for testing

/**
 * Calculate distance in miles between two lat/lng coordinates
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function scoreLocation(
  sponseeCity: string,
  sponseeState: string,
  sponseeLat: number,
  sponseeLng: number,
  sponsorCity: string,
  sponsorState: string,
  sponsorLat: number,
  sponsorLng: number,
): number {
  const distance = calculateDistance(sponseeLat, sponseeLng, sponsorLat, sponsorLng);

  if (distance < 10 && sponseeCity.toLowerCase() === sponsorCity.toLowerCase()) {
    return 25;
  } else if (distance < 100 && sponseeState === sponsorState) {
    return 15;
  } else if (distance < 100) {
    return 10;
  }
  return 0;
}

function scoreAvailability(sponseeNeeds: string, sponsorAvailability: string): number {
  const availabilityMap: Record<string, number> = {
    '1-2 days': 2,
    '3-5 days': 4,
    Daily: 7,
  };

  const sponseeNeedsDays = availabilityMap[sponseeNeeds] || 0;
  const sponsorAvailDays = availabilityMap[sponsorAvailability] || 0;

  if (sponsorAvailDays >= sponseeNeedsDays) {
    return 20;
  }
  return (sponsorAvailDays / sponseeNeedsDays) * 20;
}

function scoreApproach(sponseePreferences: string, sponsorApproach: string): number {
  const tokenize = (text: string): string[] => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);
  };

  const sponseeTokens = tokenize(sponseePreferences);
  const sponsorTokens = tokenize(sponsorApproach);

  const vocabulary = Array.from(new Set([...sponseeTokens, ...sponsorTokens]));
  const sponseeVector = vocabulary.map(word => sponseeTokens.filter(t => t === word).length);
  const sponsorVector = vocabulary.map(word => sponsorTokens.filter(t => t === word).length);

  const dotProduct = sponseeVector.reduce((sum, val, i) => sum + val * sponsorVector[i], 0);
  const sponseeMag = Math.sqrt(sponseeVector.reduce((sum, val) => sum + val * val, 0));
  const sponsorMag = Math.sqrt(sponsorVector.reduce((sum, val) => sum + val * val, 0));

  if (sponseeMag === 0 || sponsorMag === 0) {
    return 0;
  }

  const similarity = dotProduct / (sponseeMag * sponsorMag);
  return similarity * 15;
}

function scoreExperience(sponseeSobrietyMonths: number, sponsorYearsSober: number): number {
  const requiredYears = (sponseeSobrietyMonths / 12) * 2;
  if (sponsorYearsSober >= requiredYears) {
    return 15;
  }
  return (sponsorYearsSober / requiredYears) * 15;
}

// Location Scoring Tests
Deno.test('scoreLocation - same city (< 10 miles)', () => {
  const score = scoreLocation(
    'San Francisco',
    'CA',
    37.7749,
    -122.4194,
    'San Francisco',
    'CA',
    37.7849,
    -122.4094,
  );
  assertEquals(score, 25);
});

Deno.test('scoreLocation - same state (< 100 miles)', () => {
  const score = scoreLocation(
    'San Francisco',
    'CA',
    37.7749,
    -122.4194,
    'Oakland',
    'CA',
    37.8044,
    -122.2712,
  );
  assertEquals(score, 15);
});

Deno.test('scoreLocation - within 100 miles', () => {
  const score = scoreLocation(
    'San Francisco',
    'CA',
    37.7749,
    -122.4194,
    'San Jose',
    'CA',
    37.3382,
    -121.8863,
  );
  assertEquals(score, 15); // Same state, < 100 miles
});

Deno.test('scoreLocation - far away (> 100 miles)', () => {
  const score = scoreLocation(
    'San Francisco',
    'CA',
    37.7749,
    -122.4194,
    'Los Angeles',
    'CA',
    34.0522,
    -118.2437,
  );
  assertEquals(score, 0);
});

// Availability Scoring Tests
Deno.test('scoreAvailability - sponsor meets sponsee needs exactly', () => {
  const score = scoreAvailability('3-5 days', '3-5 days');
  assertEquals(score, 20);
});

Deno.test('scoreAvailability - sponsor exceeds sponsee needs', () => {
  const score = scoreAvailability('1-2 days', 'Daily');
  assertEquals(score, 20);
});

Deno.test('scoreAvailability - sponsor partially meets needs', () => {
  const score = scoreAvailability('Daily', '3-5 days');
  assertAlmostEquals(score, 11.43, 0.01); // (4/7) * 20 ≈ 11.43
});

Deno.test('scoreAvailability - sponsor does not meet needs', () => {
  const score = scoreAvailability('Daily', '1-2 days');
  assertAlmostEquals(score, 5.71, 0.01); // (2/7) * 20 ≈ 5.71
});

// Approach Alignment Tests
Deno.test('scoreApproach - identical text', () => {
  const text = 'I believe in working through the steps systematically with compassion';
  const score = scoreApproach(text, text);
  assertEquals(score, 15); // Perfect similarity = 1.0 * 15
});

Deno.test('scoreApproach - similar text', () => {
  const sponsee = 'I prefer a structured approach focused on the twelve steps';
  const sponsor = 'I use a step-focused structured method for recovery';
  const score = scoreApproach(sponsee, sponsor);
  // Should have high similarity due to shared words: structured, steps, focused
  assertEquals(score > 10, true);
});

Deno.test('scoreApproach - completely different text', () => {
  const sponsee = 'I like meditation and mindfulness';
  const sponsor = 'I emphasize accountability and discipline';
  const score = scoreApproach(sponsee, sponsor);
  // Should have low similarity
  assertEquals(score < 5, true);
});

Deno.test('scoreApproach - empty text', () => {
  const score = scoreApproach('', 'some approach');
  assertEquals(score, 0);
});

// Experience Scoring Tests
Deno.test('scoreExperience - sponsor has enough experience', () => {
  const score = scoreExperience(12, 2); // 12 months = 1 year, needs 2 years sober
  assertEquals(score, 15);
});

Deno.test('scoreExperience - sponsor has more than enough experience', () => {
  const score = scoreExperience(6, 5); // 6 months = 0.5 years, needs 1 year sober
  assertEquals(score, 15);
});

Deno.test('scoreExperience - sponsor has partial experience', () => {
  const score = scoreExperience(12, 1); // 12 months = 1 year, needs 2 years, has 1
  assertEquals(score, 7.5); // (1/2) * 15 = 7.5
});

Deno.test('scoreExperience - sponsor has no experience', () => {
  const score = scoreExperience(24, 0); // 24 months = 2 years, needs 4 years, has 0
  assertEquals(score, 0);
});

// Integration Tests
Deno.test('Full compatibility score - excellent match', () => {
  const locationScore = scoreLocation(
    'San Francisco',
    'CA',
    37.7749,
    -122.4194,
    'San Francisco',
    'CA',
    37.7849,
    -122.4094,
  );
  const programTypeScore = 25; // Same program
  const availabilityScore = scoreAvailability('3-5 days', 'Daily');
  const approachScore = scoreApproach(
    'I believe in working through the steps systematically',
    'I use a systematic step-by-step approach',
  );
  const experienceScore = scoreExperience(12, 3);

  const totalScore =
    locationScore + programTypeScore + availabilityScore + approachScore + experienceScore;

  // Should be a high score
  assertEquals(totalScore >= 80, true);
});

Deno.test('Full compatibility score - poor match', () => {
  const locationScore = scoreLocation(
    'San Francisco',
    'CA',
    37.7749,
    -122.4194,
    'New York',
    'NY',
    40.7128,
    -74.006,
  );
  const programTypeScore = 0; // Different program
  const availabilityScore = scoreAvailability('Daily', '1-2 days');
  const approachScore = scoreApproach(
    'meditation and mindfulness',
    'accountability and discipline',
  );
  const experienceScore = scoreExperience(24, 1);

  const totalScore =
    locationScore + programTypeScore + availabilityScore + approachScore + experienceScore;

  // Should be a low score
  assertEquals(totalScore <= 20, true);
});
