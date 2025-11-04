import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabaseClient } from '../../lib/supabase';

export interface Match {
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

export interface MatchesResponse {
  matches: Match[];
  execution_time_ms: number;
}

export const matchingApi = createApi({
  reducerPath: 'matchingApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Matches'],
  endpoints: (builder) => ({
    getMatches: builder.query<MatchesResponse, string>({
      queryFn: async (userId: string) => {
        try {
          // Get current session for auth header
          const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();

          if (sessionError || !sessionData.session) {
            return {
              error: {
                status: 401,
                data: { message: 'Not authenticated' },
              },
            };
          }

          // Call Edge Function
          const { data, error } = await supabaseClient.functions.invoke('matching-algorithm', {
            body: { user_id: userId },
            headers: {
              Authorization: `Bearer ${sessionData.session.access_token}`,
            },
          });

          if (error) {
            return {
              error: {
                status: error.status || 500,
                data: { message: error.message || 'Failed to fetch matches' },
              },
            };
          }

          return { data: data as MatchesResponse };
        } catch (error: any) {
          return {
            error: {
              status: 500,
              data: { message: error.message || 'An error occurred' },
            },
          };
        }
      },
      providesTags: ['Matches'],
      // Cache matches for 1 hour
      keepUnusedDataFor: 3600,
    }),
  }),
});

export const { useGetMatchesQuery, useLazyGetMatchesQuery } = matchingApi;
