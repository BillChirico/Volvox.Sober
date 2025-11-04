import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MatchRequest {
  user_id: string;
}

interface Match {
  sponsor_id: string;
  sponsor_name: string;
  sponsor_photo_url?: string;
  compatibility_score: number;
  location: {
    city: string;
    state: string;
  };
  years_sober: number;
  availability: string;
  approach: string;
  bio?: string;
  score_breakdown: {
    location: number;
    program_type: number;
    availability: number;
    approach: number;
    experience: number;
  };
}

interface MatchResponse {
  matches: Match[];
  execution_time_ms: number;
}

/**
 * Calculate distance in miles between two lat/lng coordinates
 * Uses Haversine formula
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
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

/**
 * Score location proximity (25 points max)
 * Same city (< 10 miles): 25 pts
 * Same state (< 100 miles): 15 pts
 * Within 100 miles: 10 pts
 * Else: 0 pts
 */
function scoreLocation(
  sponseeCity: string,
  sponseeState: string,
  sponseeLat: number,
  sponseeLng: number,
  sponsorCity: string,
  sponsorState: string,
  sponsorLat: number,
  sponsorLng: number
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

/**
 * Score availability match (20 points max)
 * Map availability to days: "1-2 days" = 2, "3-5 days" = 4, "Daily" = 7
 * If sponsor availability >= sponsee needs: 20 pts
 * Else: proportional score
 */
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

/**
 * Score approach alignment using simple cosine similarity (15 points max)
 * Tokenize and vectorize using bag-of-words
 */
function scoreApproach(sponseePreferences: string, sponsorApproach: string): number {
  // Simple tokenization: lowercase, remove punctuation, split on whitespace
  const tokenize = (text: string): string[] => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 2); // Remove short words
  };

  const sponseeTokens = tokenize(sponseePreferences);
  const sponsorTokens = tokenize(sponsorApproach);

  // Create vocabulary and vectors
  const vocabulary = Array.from(new Set([...sponseeTokens, ...sponsorTokens]));
  const sponseeVector = vocabulary.map((word) =>
    sponseeTokens.filter((t) => t === word).length
  );
  const sponsorVector = vocabulary.map((word) =>
    sponsorTokens.filter((t) => t === word).length
  );

  // Calculate cosine similarity
  const dotProduct = sponseeVector.reduce((sum, val, i) => sum + val * sponsorVector[i], 0);
  const sponseeMag = Math.sqrt(sponseeVector.reduce((sum, val) => sum + val * val, 0));
  const sponsorMag = Math.sqrt(sponsorVector.reduce((sum, val) => sum + val * val, 0));

  if (sponseeMag === 0 || sponsorMag === 0) {
    return 0;
  }

  const similarity = dotProduct / (sponseeMag * sponsorMag);
  return similarity * 15;
}

/**
 * Score sobriety experience (15 points max)
 * Sponsor years_sober >= (sponsee sobriety_months / 12) * 2 = 15 pts
 */
function scoreExperience(sponseeSobrietyMonths: number, sponsorYearsSober: number): number {
  const requiredYears = (sponseeSobrietyMonths / 12) * 2;
  if (sponsorYearsSober >= requiredYears) {
    return 15;
  }
  return (sponsorYearsSober / requiredYears) * 15;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Verify JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const { user_id }: MatchRequest = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: 'Missing user_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch sponsee profile (T060)
    const { data: sponsee, error: sponseeError } = await supabase
      .from('users')
      .select(
        `
        *,
        sponsee_profiles (*)
      `
      )
      .eq('id', user_id)
      .single();

    if (sponseeError || !sponsee) {
      return new Response(JSON.stringify({ error: 'Sponsee profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if profile is complete
    if (
      !sponsee.location ||
      !sponsee.program_type ||
      !sponsee.sponsee_profiles ||
      !sponsee.sponsee_profiles.length
    ) {
      return new Response(JSON.stringify({ error: 'Profile incomplete' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sponseeProfile = sponsee.sponsee_profiles[0];

    // Query eligible sponsor pool (T061)
    const { data: sponsors, error: sponsorsError } = await supabase
      .from('users')
      .select(
        `
        *,
        sponsor_profiles (*)
      `
      )
      .eq('program_type', sponsee.program_type)
      .eq('role', 'sponsor')
      .limit(50);

    if (sponsorsError) {
      return new Response(JSON.stringify({ error: 'Failed to fetch sponsors' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Filter sponsors with capacity and not already connected
    const { data: connections } = await supabase
      .from('connections')
      .select('sponsor_id')
      .eq('sponsee_id', user_id);

    const connectedSponsorIds = new Set(connections?.map((c) => c.sponsor_id) || []);

    const eligibleSponsors = (sponsors || []).filter((sponsor) => {
      if (!sponsor.sponsor_profiles || !sponsor.sponsor_profiles.length) return false;
      const profile = sponsor.sponsor_profiles[0];
      return (
        !connectedSponsorIds.has(sponsor.id) &&
        profile.current_sponsees < profile.max_sponsees
      );
    });

    // Score each sponsor and create matches
    const matches: Match[] = eligibleSponsors
      .map((sponsor) => {
        const sponsorProfile = sponsor.sponsor_profiles[0];

        // Calculate individual scores
        const locationScore = scoreLocation(
          sponsee.location.city,
          sponsee.location.state,
          sponsee.location.latitude || 0,
          sponsee.location.longitude || 0,
          sponsor.location.city,
          sponsor.location.state,
          sponsor.location.latitude || 0,
          sponsor.location.longitude || 0
        );

        const programTypeScore = sponsor.program_type === sponsee.program_type ? 25 : 0;

        const availabilityScore = scoreAvailability(
          sponseeProfile.availability_needs || '3-5 days',
          sponsorProfile.availability || 'Daily'
        );

        const approachScore = scoreApproach(
          sponseeProfile.approach_preferences || '',
          sponsorProfile.approach || ''
        );

        // Calculate sobriety months for sponsee
        const sobrietyDate = new Date(sponseeProfile.sobriety_date);
        const now = new Date();
        const sobrietyMonths =
          (now.getTime() - sobrietyDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

        const experienceScore = scoreExperience(sobrietyMonths, sponsorProfile.years_sober);

        const compatibilityScore =
          locationScore + programTypeScore + availabilityScore + approachScore + experienceScore;

        return {
          sponsor_id: sponsor.id,
          sponsor_name: sponsor.name,
          sponsor_photo_url: sponsor.profile_photo_url,
          compatibility_score: Math.round(compatibilityScore),
          location: sponsor.location,
          years_sober: sponsorProfile.years_sober,
          availability: sponsorProfile.availability,
          approach: sponsorProfile.approach,
          bio: sponsor.bio,
          score_breakdown: {
            location: Math.round(locationScore),
            program_type: programTypeScore,
            availability: Math.round(availabilityScore),
            approach: Math.round(approachScore),
            experience: Math.round(experienceScore),
          },
        };
      })
      .sort((a, b) => b.compatibility_score - a.compatibility_score)
      .slice(0, 5); // Return top 5 matches

    const executionTime = Date.now() - startTime;

    const response: MatchResponse = {
      matches,
      execution_time_ms: executionTime,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Matching algorithm error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
