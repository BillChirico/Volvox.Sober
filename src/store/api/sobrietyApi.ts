import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import supabaseClient from '../../services/supabase';
import type {
  SobrietyDate,
  SobrietyStats,
  Relapse,
  SetSobrietyDatePayload,
  LogRelapsePayload,
} from '@volvox-sober/types/sobriety';

export const sobrietyApi = createApi({
  reducerPath: 'sobrietyApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['SobrietyStats', 'Relapses'],
  endpoints: builder => ({
    // Get sobriety stats for current user (T098)
    getSobrietyStats: builder.query<SobrietyStats | null, void>({
      queryFn: async () => {
        try {
          const {
            data: { user },
          } = await supabaseClient.auth.getUser();

          if (!user) {
            return { error: { status: 401, data: { message: 'Not authenticated' } } };
          }

          const { data, error } = await supabaseClient
            .from('sobriety_stats_view')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single();

          if (error) {
            // No stats yet is not an error
            if (error.code === 'PGRST116') {
              return { data: null };
            }
            return { error: { status: 400, data: { message: error.message } } };
          }

          return { data: data as SobrietyStats };
        } catch (error: any) {
          return { error: { status: 500, data: { message: error.message } } };
        }
      },
      providesTags: ['SobrietyStats'],
    }),

    // Get sobriety stats for a connected user (sponsor/sponsee view) (T094)
    getConnectedUserSobrietyStats: builder.query<SobrietyStats | null, string>({
      queryFn: async userId => {
        try {
          const {
            data: { user },
          } = await supabaseClient.auth.getUser();

          if (!user) {
            return { error: { status: 401, data: { message: 'Not authenticated' } } };
          }

          // Query will be filtered by RLS to only allow connected users
          const { data, error } = await supabaseClient
            .from('sobriety_stats_view')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

          if (error) {
            if (error.code === 'PGRST116') {
              return { data: null };
            }
            return { error: { status: 400, data: { message: error.message } } };
          }

          return { data: data as SobrietyStats };
        } catch (error: any) {
          return { error: { status: 500, data: { message: error.message } } };
        }
      },
      providesTags: (result, error, userId) => [{ type: 'SobrietyStats', id: userId }],
    }),

    // Set/update sobriety date (T092)
    setSobrietyDate: builder.mutation<SobrietyDate, SetSobrietyDatePayload>({
      queryFn: async ({ substance_type, start_date }) => {
        try {
          const {
            data: { user },
          } = await supabaseClient.auth.getUser();

          if (!user) {
            return { error: { status: 401, data: { message: 'Not authenticated' } } };
          }

          // Check if user already has an active sobriety date
          const { data: existing } = await supabaseClient
            .from('sobriety_dates')
            .select('id')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single();

          let result;
          if (existing) {
            // Update existing
            const { data, error } = await supabaseClient
              .from('sobriety_dates')
              .update({
                substance_type,
                start_date,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existing.id)
              .select()
              .single();

            if (error) {
              return { error: { status: 400, data: { message: error.message } } };
            }
            result = data;
          } else {
            // Insert new
            const { data, error } = await supabaseClient
              .from('sobriety_dates')
              .insert({
                user_id: user.id,
                substance_type,
                start_date,
              })
              .select()
              .single();

            if (error) {
              return { error: { status: 400, data: { message: error.message } } };
            }
            result = data;
          }

          return { data: result as SobrietyDate };
        } catch (error: any) {
          return { error: { status: 500, data: { message: error.message } } };
        }
      },
      invalidatesTags: ['SobrietyStats'],
    }),

    // Log relapse (T093)
    logRelapse: builder.mutation<Relapse, LogRelapsePayload>({
      queryFn: async ({ sobriety_date_id, relapse_date, private_note, trigger_context }) => {
        try {
          const {
            data: { user },
          } = await supabaseClient.auth.getUser();

          if (!user) {
            return { error: { status: 401, data: { message: 'Not authenticated' } } };
          }

          const { data, error } = await supabaseClient
            .from('relapses')
            .insert({
              sobriety_date_id,
              relapse_date,
              private_note,
              trigger_context,
              sponsor_notified: false,
            })
            .select()
            .single();

          if (error) {
            return { error: { status: 400, data: { message: error.message } } };
          }

          // Note: The database trigger will automatically update the sobriety start_date

          return { data: data as Relapse };
        } catch (error: any) {
          return { error: { status: 500, data: { message: error.message } } };
        }
      },
      invalidatesTags: ['SobrietyStats', 'Relapses'],
    }),

    // Get relapse history for current user
    getMyRelapses: builder.query<Relapse[], string>({
      queryFn: async sobrietyDateId => {
        try {
          const {
            data: { user },
          } = await supabaseClient.auth.getUser();

          if (!user) {
            return { error: { status: 401, data: { message: 'Not authenticated' } } };
          }

          const { data, error } = await supabaseClient
            .from('relapses')
            .select('*')
            .eq('sobriety_date_id', sobrietyDateId)
            .order('relapse_date', { ascending: false });

          if (error) {
            return { error: { status: 400, data: { message: error.message } } };
          }

          return { data: data as Relapse[] };
        } catch (error: any) {
          return { error: { status: 500, data: { message: error.message } } };
        }
      },
      providesTags: ['Relapses'],
    }),

    // Get relapse history for connected user (sponsor view - NO private notes)
    getConnectedUserRelapses: builder.query<Omit<Relapse, 'private_note'>[], string>({
      queryFn: async sobrietyDateId => {
        try {
          const {
            data: { user },
          } = await supabaseClient.auth.getUser();

          if (!user) {
            return { error: { status: 401, data: { message: 'Not authenticated' } } };
          }

          // Query will be filtered by RLS
          // IMPORTANT: Explicitly exclude private_note to comply with privacy requirements
          const { data, error } = await supabaseClient
            .from('relapses')
            .select(
              'id, sobriety_date_id, relapse_date, trigger_context, sponsor_notified, created_at',
            )
            .eq('sobriety_date_id', sobrietyDateId)
            .order('relapse_date', { ascending: false });

          if (error) {
            return { error: { status: 400, data: { message: error.message } } };
          }

          return { data: data as Omit<Relapse, 'private_note'>[] };
        } catch (error: any) {
          return { error: { status: 500, data: { message: error.message } } };
        }
      },
      providesTags: (result, error, sobrietyDateId) => [{ type: 'Relapses', id: sobrietyDateId }],
    }),
  }),
});

export const {
  useGetSobrietyStatsQuery,
  useGetConnectedUserSobrietyStatsQuery,
  useSetSobrietyDateMutation,
  useLogRelapseMutation,
  useGetMyRelapsesQuery,
  useGetConnectedUserRelapsesQuery,
} = sobrietyApi;
