/**
 * RTK Query API slice for Check-ins (WP08 T124-T128)
 * Handles scheduled check-ins and responses
 */

import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from './supabase';

export interface CheckinQuestion {
  question_id: number;
  question_text: string;
}

export interface Checkin {
  id: string;
  connection_id: string;
  questions: CheckinQuestion[];
  recurrence: 'daily' | 'weekly' | 'custom';
  custom_interval_days: number | null;
  active: boolean;
  next_scheduled_at: string;
  timezone: string;
  created_at: string;
}

export interface CheckinResponse {
  id: string;
  checkin_id: string;
  connection_id: string;
  answers: CheckinAnswer[];
  responded_at: string;
  status: 'completed' | 'missed';
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface CheckinAnswer {
  question_id: number;
  answer_text: string;
}

export interface CreateCheckinParams {
  connection_id: string;
  questions: CheckinQuestion[];
  recurrence: 'daily' | 'weekly' | 'custom';
  custom_interval_days?: number;
  scheduled_time: string; // HH:MM format
  timezone: string;
}

export interface SubmitCheckinResponseParams {
  checkin_id: string;
  connection_id: string;
  answers: CheckinAnswer[];
}

// T125: Pre-defined prompt templates
export const CHECKIN_TEMPLATES: CheckinQuestion[][] = [
  [
    { question_id: 1, question_text: 'How are you feeling today?' },
  ],
  [
    { question_id: 2, question_text: 'Any challenges this week?' },
  ],
  [
    { question_id: 3, question_text: 'Rate your recovery (1-10)' },
  ],
  [
    { question_id: 4, question_text: 'What are you grateful for today?' },
  ],
  [
    { question_id: 5, question_text: 'Have you attended any meetings recently?' },
  ],
  [
    { question_id: 1, question_text: 'How are you feeling today?' },
    { question_id: 6, question_text: 'What support do you need right now?' },
  ],
];

// T128: Sentiment analysis helper
export const analyzeSentiment = (answers: CheckinAnswer[]): 'positive' | 'neutral' | 'negative' => {
  const text = answers.map(a => a.answer_text.toLowerCase()).join(' ');

  const positiveKeywords = ['great', 'good', 'excellent', 'wonderful', 'amazing', 'happy', 'grateful', 'better', 'improving', 'strong'];
  const negativeKeywords = ['struggling', 'difficult', 'hard', 'bad', 'terrible', 'awful', 'depressed', 'anxious', 'worse', 'failing'];

  let positiveCount = 0;
  let negativeCount = 0;

  positiveKeywords.forEach(keyword => {
    if (text.includes(keyword)) positiveCount++;
  });

  negativeKeywords.forEach(keyword => {
    if (text.includes(keyword)) negativeCount++;
  });

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
};

// T124: Calculate next scheduled time
const calculateNextScheduledAt = (
  recurrence: 'daily' | 'weekly' | 'custom',
  scheduledTime: string, // HH:MM
  timezone: string,
  customIntervalDays?: number
): string => {
  const now = new Date();
  const [hours, minutes] = scheduledTime.split(':').map(Number);

  let nextDate = new Date(now);
  nextDate.setHours(hours, minutes, 0, 0);

  // If time has passed today, move to tomorrow
  if (nextDate <= now) {
    nextDate.setDate(nextDate.getDate() + 1);
  }

  // For weekly, move to next week if needed
  if (recurrence === 'weekly' && nextDate.getDay() !== now.getDay()) {
    nextDate.setDate(nextDate.getDate() + 7);
  }

  // For custom, add interval days
  if (recurrence === 'custom' && customIntervalDays) {
    nextDate.setDate(nextDate.getDate() + customIntervalDays - 1);
  }

  return nextDate.toISOString();
};

export const checkinsApi = createApi({
  reducerPath: 'checkinsApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Checkins', 'CheckinResponses'],
  endpoints: (builder) => ({
    // T124: Get check-ins for a connection
    getCheckins: builder.query<Checkin[], string>({
      async queryFn(connectionId) {
        const { data, error } = await supabase
          .from('checkins')
          .select('*')
          .eq('connection_id', connectionId)
          .order('created_at', { ascending: false });

        if (error) return { error };
        return { data: data as Checkin[] };
      },
      providesTags: (_result, _error, connectionId) => [
        { type: 'Checkins', id: connectionId },
      ],
    }),

    // T124: Create check-in schedule
    createCheckin: builder.mutation<Checkin, CreateCheckinParams>({
      async queryFn({
        connection_id,
        questions,
        recurrence,
        custom_interval_days,
        scheduled_time,
        timezone,
      }) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: { message: 'Not authenticated' } };

        // Verify user is sponsor for this connection
        const { data: connection } = await supabase
          .from('connections')
          .select('sponsor_id')
          .eq('id', connection_id)
          .single();

        if (!connection || connection.sponsor_id !== user.id) {
          return { error: { message: 'Only sponsors can create check-ins' } };
        }

        const nextScheduledAt = calculateNextScheduledAt(
          recurrence,
          scheduled_time,
          timezone,
          custom_interval_days
        );

        const { data, error } = await supabase
          .from('checkins')
          .insert({
            connection_id,
            questions,
            recurrence,
            custom_interval_days,
            next_scheduled_at: nextScheduledAt,
            timezone,
            active: true,
          })
          .select()
          .single();

        if (error) return { error };
        return { data: data as Checkin };
      },
      invalidatesTags: (_result, _error, { connection_id }) => [
        { type: 'Checkins', id: connection_id },
      ],
    }),

    // T124: Update check-in schedule
    updateCheckin: builder.mutation<Checkin, Partial<Checkin> & { id: string }>({
      async queryFn(updates) {
        const { id, ...updateData } = updates;

        const { data, error } = await supabase
          .from('checkins')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) return { error };
        return { data: data as Checkin };
      },
      invalidatesTags: (_result, _error, { connection_id }) => [
        { type: 'Checkins', id: connection_id },
      ],
    }),

    // T124: Delete check-in schedule
    deleteCheckin: builder.mutation<void, string>({
      async queryFn(checkinId) {
        const { error } = await supabase
          .from('checkins')
          .delete()
          .eq('id', checkinId);

        if (error) return { error };
        return { data: undefined };
      },
      invalidatesTags: ['Checkins'],
    }),

    // T127: Get check-in responses for a connection
    getCheckinResponses: builder.query<CheckinResponse[], string>({
      async queryFn(connectionId) {
        const { data, error } = await supabase
          .from('checkin_responses')
          .select('*')
          .eq('connection_id', connectionId)
          .order('responded_at', { ascending: false });

        if (error) return { error };
        return { data: data as CheckinResponse[] };
      },
      providesTags: (_result, _error, connectionId) => [
        { type: 'CheckinResponses', id: connectionId },
      ],
    }),

    // T127: Submit check-in response
    submitCheckinResponse: builder.mutation<CheckinResponse, SubmitCheckinResponseParams>({
      async queryFn({ checkin_id, connection_id, answers }) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: { message: 'Not authenticated' } };

        // T128: Analyze sentiment
        const sentiment = analyzeSentiment(answers);

        const { data, error } = await supabase
          .from('checkin_responses')
          .insert({
            checkin_id,
            connection_id,
            answers,
            status: 'completed',
          })
          .select()
          .single();

        if (error) return { error };

        const response = { ...data, sentiment } as CheckinResponse;

        // Update checkin next_scheduled_at
        const { data: checkin } = await supabase
          .from('checkins')
          .select('recurrence, custom_interval_days, timezone, next_scheduled_at')
          .eq('id', checkin_id)
          .single();

        if (checkin) {
          const currentTime = new Date(checkin.next_scheduled_at);
          const timeString = `${currentTime.getHours()}:${String(currentTime.getMinutes()).padStart(2, '0')}`;

          const nextScheduledAt = calculateNextScheduledAt(
            checkin.recurrence,
            timeString,
            checkin.timezone,
            checkin.custom_interval_days || undefined
          );

          await supabase
            .from('checkins')
            .update({ next_scheduled_at: nextScheduledAt })
            .eq('id', checkin_id);
        }

        // TODO: Send notification to sponsor (T127)

        return { data: response };
      },
      invalidatesTags: (_result, _error, { connection_id }) => [
        { type: 'CheckinResponses', id: connection_id },
        { type: 'Checkins', id: connection_id },
      ],
    }),

    // T128: Get sentiment trend for a connection
    getSentimentTrend: builder.query<{ date: string; sentiment: string }[], string>({
      async queryFn(connectionId) {
        const { data, error } = await supabase
          .from('checkin_responses')
          .select('responded_at, answers')
          .eq('connection_id', connectionId)
          .eq('status', 'completed')
          .order('responded_at', { ascending: true });

        if (error) return { error };

        const trend = (data as CheckinResponse[]).map(response => ({
          date: new Date(response.responded_at).toISOString().split('T')[0],
          sentiment: analyzeSentiment(response.answers),
        }));

        return { data: trend };
      },
    }),
  }),
});

export const {
  useGetCheckinsQuery,
  useCreateCheckinMutation,
  useUpdateCheckinMutation,
  useDeleteCheckinMutation,
  useGetCheckinResponsesQuery,
  useSubmitCheckinResponseMutation,
  useGetSentimentTrendQuery,
} = checkinsApi;
