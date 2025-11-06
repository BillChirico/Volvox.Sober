/**
 * RTK Query API slice for 12-Step Program Worksheets
 * Handles steps reference data and step work CRUD operations
 */

import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from './supabase';
import {
  sendStepWorkCommentNotification,
  sendStepWorkSubmittedNotification,
  sendStepWorkReviewedNotification,
} from '../utils/notificationHelpers';

export interface Step {
  id: string;
  step_number: number;
  step_title: string;
  step_description: string;
  default_questions: StepQuestion[];
}

export interface StepQuestion {
  id: number;
  text: string;
  type: 'long_text' | 'bullet_list' | 'rating';
}

export interface StepWorkResponse {
  question_id: number;
  question_text: string;
  answer_text: string;
}

export interface SponsorComment {
  question_id: number;
  text: string;
  timestamp: string;
}

export interface StepWork {
  id: string;
  sponsee_id: string;
  sponsor_id: string | null;
  step_id: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'reviewed';
  responses: StepWorkResponse[] | null;
  sponsor_comments: SponsorComment[] | null;
  custom_questions: StepQuestion[] | null;
  started_at: string | null;
  completed_at: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewer_id: string | null;
  last_updated_at: string;
}

export const stepsApi = createApi({
  reducerPath: 'stepsApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Steps', 'StepWork'],
  endpoints: builder => ({
    // Get all 12 steps (reference data)
    getAllSteps: builder.query<Step[], void>({
      async queryFn() {
        const { data, error } = await supabase
          .from('steps')
          .select('*')
          .order('step_number', { ascending: true });

        if (error) return { error };
        return { data: data as Step[] };
      },
      providesTags: ['Steps'],
    }),

    // Get all step work for current user
    getMyStepWork: builder.query<StepWork[], void>({
      async queryFn() {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return { error: { message: 'Not authenticated' } };

        const { data, error } = await supabase
          .from('step_work')
          .select('*')
          .eq('sponsee_id', user.id)
          .order('step_id', { ascending: true });

        if (error) return { error };
        return { data: data as StepWork[] };
      },
      providesTags: ['StepWork'],
    }),

    // Get specific step work by step ID
    getStepWork: builder.query<StepWork | null, string>({
      async queryFn(stepId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return { error: { message: 'Not authenticated' } };

        const { data, error } = await supabase
          .from('step_work')
          .select('*')
          .eq('sponsee_id', user.id)
          .eq('step_id', stepId)
          .maybeSingle();

        if (error) return { error };
        return { data: data as StepWork | null };
      },
      providesTags: (_result, _error, stepId) => [{ type: 'StepWork', id: stepId }],
    }),

    // Save step work (create or update)
    saveStepWork: builder.mutation<
      StepWork,
      {
        stepId: string;
        responses: StepWorkResponse[];
        status?: 'not_started' | 'in_progress' | 'submitted';
      }
    >({
      async queryFn({ stepId, responses, status = 'in_progress' }) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return { error: { message: 'Not authenticated' } };

        // Check if step work exists
        const { data: existing } = await supabase
          .from('step_work')
          .select('id')
          .eq('sponsee_id', user.id)
          .eq('step_id', stepId)
          .maybeSingle();

        const now = new Date().toISOString();
        const workData = {
          sponsee_id: user.id,
          step_id: stepId,
          responses,
          status,
          last_updated_at: now,
          ...(status === 'in_progress' && !existing ? { started_at: now } : {}),
        };

        if (existing) {
          // Update existing
          const { data, error } = await supabase
            .from('step_work')
            .update(workData)
            .eq('id', existing.id)
            .select()
            .single();

          if (error) return { error };
          return { data: data as StepWork };
        } else {
          // Create new
          const { data, error } = await supabase
            .from('step_work')
            .insert(workData)
            .select()
            .single();

          if (error) return { error };
          return { data: data as StepWork };
        }
      },
      invalidatesTags: (_result, _error, { stepId }) => [
        'StepWork',
        { type: 'StepWork', id: stepId },
      ],
    }),

    // Submit step work for review
    submitStepWork: builder.mutation<
      StepWork,
      {
        stepId: string;
        responses: StepWorkResponse[];
      }
    >({
      async queryFn({ stepId, responses }) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return { error: { message: 'Not authenticated' } };

        const { data: existing } = await supabase
          .from('step_work')
          .select('id')
          .eq('sponsee_id', user.id)
          .eq('step_id', stepId)
          .maybeSingle();

        if (!existing) {
          return { error: { message: 'Step work not found' } };
        }

        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from('step_work')
          .update({
            responses,
            status: 'submitted',
            submitted_at: now,
            last_updated_at: now,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) return { error };

        // T109: Send push notification to sponsor
        const stepWorkData = data as StepWork;
        if (stepWorkData.sponsor_id) {
          // Get step info for notification
          const { data: stepData } = await supabase
            .from('steps')
            .select('step_number')
            .eq('id', stepId)
            .single();

          // Get sponsee name
          const { data: userData } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', user.id)
            .single();

          if (stepData && userData) {
            await sendStepWorkSubmittedNotification(
              stepWorkData.sponsor_id,
              userData.full_name || 'A sponsee',
              stepData.step_number,
              stepId,
              stepWorkData.id,
            );
          }
        }

        return { data: data as StepWork };
      },
      invalidatesTags: (_result, _error, { stepId }) => [
        'StepWork',
        { type: 'StepWork', id: stepId },
      ],
    }),

    // Add sponsor comment
    addSponsorComment: builder.mutation<
      StepWork,
      {
        stepWorkId: string;
        questionId: number;
        commentText: string;
      }
    >({
      async queryFn({ stepWorkId, questionId, commentText }) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return { error: { message: 'Not authenticated' } };

        // Get existing step work
        const { data: stepWork, error: fetchError } = await supabase
          .from('step_work')
          .select('sponsor_comments')
          .eq('id', stepWorkId)
          .single();

        if (fetchError) return { error: fetchError };

        const existingComments = (stepWork.sponsor_comments as SponsorComment[]) || [];
        const newComment: SponsorComment = {
          question_id: questionId,
          text: commentText,
          timestamp: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from('step_work')
          .update({
            sponsor_comments: [...existingComments, newComment],
            last_updated_at: new Date().toISOString(),
          })
          .eq('id', stepWorkId)
          .select()
          .single();

        if (error) return { error };

        // T108: Send push notification to sponsee
        const stepWorkData = data as StepWork;

        // Get step info for notification
        const { data: stepData } = await supabase
          .from('steps')
          .select('step_number')
          .eq('id', stepWorkData.step_id)
          .single();

        if (stepData) {
          await sendStepWorkCommentNotification(
            stepWorkData.sponsee_id,
            stepData.step_number,
            stepWorkData.step_id,
          );
        }

        return { data: data as StepWork };
      },
      invalidatesTags: ['StepWork'],
    }),

    // Mark step work as reviewed
    markAsReviewed: builder.mutation<
      StepWork,
      {
        stepWorkId: string;
      }
    >({
      async queryFn({ stepWorkId }) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return { error: { message: 'Not authenticated' } };

        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from('step_work')
          .update({
            status: 'reviewed',
            reviewed_at: now,
            reviewer_id: user.id,
            last_updated_at: now,
          })
          .eq('id', stepWorkId)
          .select()
          .single();

        if (error) return { error };

        // T110: Send push notification to sponsee
        const reviewedWork = data as StepWork;

        // Get step info for notification
        const { data: stepData } = await supabase
          .from('steps')
          .select('step_number')
          .eq('id', reviewedWork.step_id)
          .single();

        if (stepData) {
          await sendStepWorkReviewedNotification(
            reviewedWork.sponsee_id,
            stepData.step_number,
            reviewedWork.step_id,
          );
        }

        return { data: data as StepWork };
      },
      invalidatesTags: ['StepWork'],
    }),

    // Get sponsee step work (for sponsors)
    getSponseeStepWork: builder.query<StepWork[], string>({
      async queryFn(sponseeId) {
        const { data, error } = await supabase
          .from('step_work')
          .select('*')
          .eq('sponsee_id', sponseeId)
          .order('step_id', { ascending: true });

        if (error) return { error };
        return { data: data as StepWork[] };
      },
      providesTags: (_result, _error, sponseeId) => [
        { type: 'StepWork', id: `sponsee-${sponseeId}` },
      ],
    }),
  }),
});

export const {
  useGetAllStepsQuery,
  useGetMyStepWorkQuery,
  useGetStepWorkQuery,
  useSaveStepWorkMutation,
  useSubmitStepWorkMutation,
  useAddSponsorCommentMutation,
  useMarkAsReviewedMutation,
  useGetSponseeStepWorkQuery,
} = stepsApi;
