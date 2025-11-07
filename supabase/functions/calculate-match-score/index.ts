/**
 * Calculate Match Score Edge Function
 * Implements weighted compatibility scoring for sponsor/sponsee matching
 * Feature: 002-app-screens (T092)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers for client requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Weight distribution for compatibility scoring (must sum to 1.0)
const WEIGHTS = {
  recoveryProgram: 0.35, // Same program is critical
  availability: 0.25, // Schedule compatibility
  location: 0.2, // Geographic proximity
  experienceLevel: 0.15, // Matching experience to needs
  preferences: 0.05, // Optional preference match
};

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

interface MatchRequest {
  user_id: string;
}

interface ScoredMatch {
  candidate_id: string;
  compatibility_score: number;
  score_breakdown: {
    recovery_program: number;
    availability: number;
    location: number;
    experience_level: number;
    preferences: number;
  };
}

interface MatchResponse {
  matches: ScoredMatch[];
  execution_time_ms: number;
}

/**
 * Score recovery program match (0-1)
 * Same program = 1.0, different = 0.0
 */
function scoreRecoveryProgram(user: Profile, candidate: Profile): number {
  return user.recovery_program === candidate.recovery_program ? 1.0 : 0.0;
}

/**
 * Score availability overlap (0-1)
 * Measures schedule compatibility based on overlapping availability slots
 */
function scoreAvailability(user: Profile, candidate: Profile): number {
  if (!user.availability || user.availability.length === 0) return 0;
  if (!candidate.availability || candidate.availability.length === 0) return 0;

  const overlap = user.availability.filter(slot => candidate.availability.includes(slot));

  const maxLength = Math.max(user.availability.length, candidate.availability.length);
  return overlap.length / maxLength;
}

/**
 * Score location proximity (0-1)
 * Same city + state = 1.0, same state = 0.5, else = 0.0
 */
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

/**
 * Score experience level (0-1)
 * For sponsors: Must have >= 1 year sober (365 days minimum)
 * Returns ratio of sponsor's sobriety days to minimum required
 */
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

/**
 * Score preference match (0-1)
 * Placeholder for future preference-based matching
 * Currently returns neutral score
 */
function scorePreferences(_user: Profile, _candidate: Profile): number {
  // Future implementation: match preferences like meeting frequency,
  // communication style, approach (Big Book, step-focused, etc.)
  return 0.5; // Neutral score
}

/**
 * Calculate final compatibility score (0-100)
 * Combines all scoring functions with their respective weights
 */
function calculateCompatibility(user: Profile, candidate: Profile): number {
  const score =
    WEIGHTS.recoveryProgram * scoreRecoveryProgram(user, candidate) +
    WEIGHTS.availability * scoreAvailability(user, candidate) +
    WEIGHTS.location * scoreLocation(user, candidate) +
    WEIGHTS.experienceLevel * scoreExperienceLevel(user, candidate) +
    WEIGHTS.preferences * scorePreferences(user, candidate);

  return Math.round(score * 100);
}

/**
 * Main Edge Function handler
 * Calculates compatibility scores for potential matches
 */
serve(async req => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Verify authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const body: MatchRequest = await req.json();
    const { user_id } = body;

    if (!user_id) {
      return new Response(JSON.stringify({ error: 'Missing user_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch user profile
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'User profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Determine opposite role for filtering
    // sponsors match with sponsees, sponsees match with sponsors
    // users with role 'both' can match with either
    let oppositeRole: string;
    if (user.role === 'sponsor') {
      oppositeRole = 'sponsee';
    } else if (user.role === 'sponsee') {
      oppositeRole = 'sponsor';
    } else {
      // role = 'both', can match with either sponsors or sponsees
      oppositeRole = 'sponsor,sponsee';
    }

    // Fetch already declined matches within 30-day cooldown
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: declinedMatches } = await supabase
      .from('matches')
      .select('candidate_id')
      .eq('user_id', user_id)
      .eq('status', 'declined')
      .gte('declined_at', thirtyDaysAgo.toISOString());

    const declinedCandidateIds = new Set(declinedMatches?.map(m => m.candidate_id) || []);

    // Fetch already connected or requested matches to exclude
    const { data: existingMatches } = await supabase
      .from('matches')
      .select('candidate_id')
      .eq('user_id', user_id)
      .in('status', ['requested', 'connected']);

    const existingCandidateIds = new Set(existingMatches?.map(m => m.candidate_id) || []);

    // Fetch potential candidates
    let candidatesQuery = supabase
      .from('profiles')
      .select('*')
      .neq('id', user_id) // Don't match with self
      .is('deleted_at', null); // Exclude deleted profiles

    // Filter by role
    if (oppositeRole.includes(',')) {
      // role = 'both', match with both sponsors and sponsees
      candidatesQuery = candidatesQuery.in('role', ['sponsor', 'sponsee']);
    } else {
      candidatesQuery = candidatesQuery.eq('role', oppositeRole);
    }

    const { data: candidates, error: candidatesError } = await candidatesQuery;

    if (candidatesError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch candidates', details: candidatesError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Filter out declined and existing matches
    const eligibleCandidates = (candidates || []).filter(
      candidate =>
        !declinedCandidateIds.has(candidate.id) && !existingCandidateIds.has(candidate.id),
    );

    // Calculate compatibility scores
    const scoredMatches: ScoredMatch[] = eligibleCandidates.map(candidate => {
      const recoveryProgramScore = scoreRecoveryProgram(user, candidate);
      const availabilityScore = scoreAvailability(user, candidate);
      const locationScore = scoreLocation(user, candidate);
      const experienceLevelScore = scoreExperienceLevel(user, candidate);
      const preferencesScore = scorePreferences(user, candidate);

      const compatibilityScore = calculateCompatibility(user, candidate);

      return {
        candidate_id: candidate.id,
        compatibility_score: compatibilityScore,
        score_breakdown: {
          recovery_program: Math.round(recoveryProgramScore * 100),
          availability: Math.round(availabilityScore * 100),
          location: Math.round(locationScore * 100),
          experience_level: Math.round(experienceLevelScore * 100),
          preferences: Math.round(preferencesScore * 100),
        },
      };
    });

    // Sort by compatibility score (highest first) and take top 20
    const topMatches = scoredMatches
      .sort((a, b) => b.compatibility_score - a.compatibility_score)
      .slice(0, 20);

    const executionTime = Date.now() - startTime;

    const response: MatchResponse = {
      matches: topMatches,
      execution_time_ms: executionTime,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Calculate match score error:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
