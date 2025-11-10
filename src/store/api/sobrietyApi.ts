import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import supabaseClient from '../../services/supabase';
import type {
  SobrietyDate,
  SobrietyStats,
  Relapse,
  SetSobrietyDatePayload,
  LogRelapsePayload,
} from '@volvox-sober/shared/types/src/sobriety';

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
            .from('sobriety_records')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (error) {
            // No stats yet is not an error
            if (error.code === 'PGRST116') {
              return { data: null };
            }
            return { error: { status: 400, data: { message: error.message } } };
          }

          // Calculate days sober
          const startDate = new Date(data.current_sobriety_start_date);
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - startDate.getTime());
          const current_streak_days = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          // Calculate milestones achieved
          const milestones_achieved: import('@volvox-sober/shared/types/src/sobriety').MilestoneType[] =
            [];
          if (current_streak_days >= 365) milestones_achieved.push('1_year');
          if (current_streak_days >= 180) milestones_achieved.push('180_days');
          if (current_streak_days >= 90) milestones_achieved.push('90_days');
          if (current_streak_days >= 60) milestones_achieved.push('60_days');
          if (current_streak_days >= 30) milestones_achieved.push('30_days');

          // Calculate next milestone
          let next_milestone_days = null;
          let days_until_next_milestone = null;
          const milestones = [30, 60, 90, 180, 365];
          for (const milestone of milestones) {
            if (current_streak_days < milestone) {
              next_milestone_days = milestone;
              days_until_next_milestone = milestone - current_streak_days;
              break;
            }
          }

          const stats: SobrietyStats = {
            id: data.id,
            user_id: data.user_id,
            substance_type: 'General', // Legacy field, not in sobriety_records
            start_date: data.current_sobriety_start_date,
            current_streak_days,
            milestones_achieved,
            next_milestone_days,
            days_until_next_milestone,
            is_active: true,
            total_relapses: Array.isArray(data.previous_sobriety_dates)
              ? data.previous_sobriety_dates.length
              : 0,
            last_relapse_date:
              Array.isArray(data.previous_sobriety_dates) && data.previous_sobriety_dates.length > 0
                ? data.previous_sobriety_dates[data.previous_sobriety_dates.length - 1]
                : null,
          };

          return { data: stats };
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
            .from('sobriety_records')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (error) {
            if (error.code === 'PGRST116') {
              return { data: null };
            }
            return { error: { status: 400, data: { message: error.message } } };
          }

          // Calculate days sober
          const startDate = new Date(data.current_sobriety_start_date);
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - startDate.getTime());
          const current_streak_days = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          // Calculate milestones achieved
          const milestones_achieved: import('@volvox-sober/shared/types/src/sobriety').MilestoneType[] =
            [];
          if (current_streak_days >= 365) milestones_achieved.push('1_year');
          if (current_streak_days >= 180) milestones_achieved.push('180_days');
          if (current_streak_days >= 90) milestones_achieved.push('90_days');
          if (current_streak_days >= 60) milestones_achieved.push('60_days');
          if (current_streak_days >= 30) milestones_achieved.push('30_days');

          // Calculate next milestone
          let next_milestone_days = null;
          let days_until_next_milestone = null;
          const milestones = [30, 60, 90, 180, 365];
          for (const milestone of milestones) {
            if (current_streak_days < milestone) {
              next_milestone_days = milestone;
              days_until_next_milestone = milestone - current_streak_days;
              break;
            }
          }

          const stats: SobrietyStats = {
            id: data.id,
            user_id: data.user_id,
            substance_type: 'General', // Legacy field, not in sobriety_records
            start_date: data.current_sobriety_start_date,
            current_streak_days,
            milestones_achieved,
            next_milestone_days,
            days_until_next_milestone,
            is_active: true,
            total_relapses: Array.isArray(data.previous_sobriety_dates)
              ? data.previous_sobriety_dates.length
              : 0,
            last_relapse_date:
              Array.isArray(data.previous_sobriety_dates) && data.previous_sobriety_dates.length > 0
                ? data.previous_sobriety_dates[data.previous_sobriety_dates.length - 1]
                : null,
          };

          return { data: stats };
        } catch (error: any) {
          return { error: { status: 500, data: { message: error.message } } };
        }
      },
      providesTags: (_result, _error, userId) => [{ type: 'SobrietyStats', id: userId }],
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

          // Check if user already has a sobriety record
          const { data: existing } = await supabaseClient
            .from('sobriety_records')
            .select('id, current_sobriety_start_date, previous_sobriety_dates')
            .eq('user_id', user.id)
            .single();

          let result;
          if (existing) {
            // Update existing record
            // Add current start date to history if it's different
            const previousDates = existing.previous_sobriety_dates || [];
            if (existing.current_sobriety_start_date !== start_date) {
              previousDates.push(existing.current_sobriety_start_date);
            }

            const { data, error } = await supabaseClient
              .from('sobriety_records')
              .update({
                current_sobriety_start_date: start_date,
                previous_sobriety_dates: previousDates,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existing.id)
              .select()
              .single();

            if (error) {
              return { error: { status: 400, data: { message: error.message } } };
            }
            result = {
              id: data.id,
              user_id: data.user_id,
              substance_type,
              start_date: data.current_sobriety_start_date,
              is_active: true,
            };
          } else {
            // Insert new record
            const { data, error } = await supabaseClient
              .from('sobriety_records')
              .insert({
                user_id: user.id,
                current_sobriety_start_date: start_date,
                previous_sobriety_dates: [],
                milestones: [],
                reflections: [],
              })
              .select()
              .single();

            if (error) {
              return { error: { status: 400, data: { message: error.message } } };
            }
            result = {
              id: data.id,
              user_id: data.user_id,
              substance_type,
              start_date: data.current_sobriety_start_date,
              is_active: true,
            };
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
      providesTags: (_result, _error, sobrietyDateId) => [{ type: 'Relapses', id: sobrietyDateId }],
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
