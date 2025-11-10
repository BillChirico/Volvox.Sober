/**
 * Check-In Service
 * Manages check-in scheduling and response operations
 */

import { supabase } from './supabase';
import { getCurrentUserId } from './supabase';
import type { Database } from '../types/database.types';
import type { CheckIn, CheckInResponse, PaginatedResult } from '../types';

type _CheckInRow = Database['public']['Tables']['check_ins']['Row'];
type CheckInInsert = Database['public']['Tables']['check_ins']['Insert'];
type CheckInUpdate = Database['public']['Tables']['check_ins']['Update'];
type _CheckInResponseRow = Database['public']['Tables']['check_in_responses']['Row'];

// ============================================================
// Check-In Management (Sponsor Functions)
// ============================================================

/**
 * Create a new check-in schedule for a connection
 * Only sponsors can create check-ins
 */
export const createCheckIn = async (
  connectionId: string,
  recurrence: 'daily' | 'weekly' | 'custom',
  scheduledTime: string, // HH:MM format (24-hour)
  timezone: string, // IANA timezone (e.g., 'America/New_York')
  questions: string[],
  customIntervalDays?: number, // Only for 'custom' recurrence
): Promise<CheckIn> => {
  if (questions.length === 0) {
    throw new Error('At least one question is required');
  }

  // Calculate next scheduled time
  const now = new Date();
  const [hours, minutes] = scheduledTime.split(':').map(Number);
  const nextScheduled = new Date(now);
  nextScheduled.setHours(hours, minutes, 0, 0);

  // If the time has passed today, schedule for tomorrow
  if (nextScheduled <= now) {
    nextScheduled.setDate(nextScheduled.getDate() + 1);
  }

  const checkInData: CheckInInsert = {
    connection_id: connectionId,
    recurrence,
    scheduled_time: scheduledTime,
    timezone,
    questions,
    is_active: true,
    next_scheduled_at: nextScheduled.toISOString(),
    custom_interval_days: recurrence === 'custom' ? customIntervalDays : undefined,
  };

  const { data, error } = await supabase.from('check_ins').insert(checkInData).select().single();

  if (error) {
    throw new Error(`Failed to create check-in: ${error.message}`);
  }

  return data as CheckIn;
};

/**
 * Get check-ins for a specific connection
 * Sponsors see all check-ins, sponsees see active check-ins only
 */
export const getCheckInsForConnection = async (connectionId: string): Promise<CheckIn[]> => {
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .eq('connection_id', connectionId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch check-ins: ${error.message}`);
  }

  return data as CheckIn[];
};

/**
 * Get a single check-in by ID
 */
export const getCheckInById = async (checkInId: string): Promise<CheckIn> => {
  const { data, error } = await supabase.from('check_ins').select('*').eq('id', checkInId).single();

  if (error) {
    throw new Error(`Failed to fetch check-in: ${error.message}`);
  }

  return data as CheckIn;
};

/**
 * Update an existing check-in schedule
 * Only sponsors can update
 */
export const updateCheckIn = async (
  checkInId: string,
  updates: {
    recurrence?: 'daily' | 'weekly' | 'custom';
    scheduledTime?: string;
    timezone?: string;
    questions?: string[];
    isActive?: boolean;
    customIntervalDays?: number;
  },
): Promise<CheckIn> => {
  const updateData: CheckInUpdate = {};

  if (updates.recurrence) updateData.recurrence = updates.recurrence;
  if (updates.scheduledTime) updateData.scheduled_time = updates.scheduledTime;
  if (updates.timezone) updateData.timezone = updates.timezone;
  if (updates.questions) updateData.questions = updates.questions;
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
  if (updates.customIntervalDays) updateData.custom_interval_days = updates.customIntervalDays;

  // Recalculate next_scheduled_at if time or recurrence changed
  if (updates.scheduledTime || updates.recurrence) {
    const checkIn = await getCheckInById(checkInId);
    const time = updates.scheduledTime || checkIn.scheduled_time;
    const [hours, minutes] = time.split(':').map(Number);

    const now = new Date();
    const nextScheduled = new Date(now);
    nextScheduled.setHours(hours, minutes, 0, 0);

    if (nextScheduled <= now) {
      nextScheduled.setDate(nextScheduled.getDate() + 1);
    }

    updateData.next_scheduled_at = nextScheduled.toISOString();
  }

  const { data, error } = await supabase
    .from('check_ins')
    .update(updateData)
    .eq('id', checkInId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update check-in: ${error.message}`);
  }

  return data as CheckIn;
};

/**
 * Delete a check-in schedule
 * Only sponsors can delete
 */
export const deleteCheckIn = async (checkInId: string): Promise<void> => {
  const { error } = await supabase.from('check_ins').delete().eq('id', checkInId);

  if (error) {
    throw new Error(`Failed to delete check-in: ${error.message}`);
  }
};

/**
 * Toggle check-in active status (pause/resume)
 */
export const toggleCheckInStatus = async (
  checkInId: string,
  isActive: boolean,
): Promise<CheckIn> => {
  return updateCheckIn(checkInId, { isActive });
};

// ============================================================
// Check-In Response Management (Sponsee Functions)
// ============================================================

/**
 * Submit a check-in response
 * Only sponsees can submit responses
 */
export const submitCheckInResponse = async (
  checkInId: string,
  answers: Record<string, string>, // Question → Answer mapping
): Promise<CheckInResponse> => {
  const checkIn = await getCheckInById(checkInId);

  // Validate all questions are answered
  const unansweredQuestions = checkIn.questions.filter(q => !answers[q]);
  if (unansweredQuestions.length > 0) {
    throw new Error('All questions must be answered');
  }

  const responseData = {
    check_in_id: checkInId,
    scheduled_for: checkIn.next_scheduled_at,
    status: 'completed' as const,
    response_data: answers,
  };

  const { data, error } = await supabase
    .from('check_in_responses')
    .insert(responseData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to submit response: ${error.message}`);
  }

  return data as CheckInResponse;
};

/**
 * Get check-in responses for a specific check-in
 * Both sponsor and sponsee can view
 */
export const getCheckInResponses = async (
  checkInId: string,
  limit = 30,
  offset = 0,
): Promise<PaginatedResult<CheckInResponse>> => {
  const { data, error, count } = await supabase
    .from('check_in_responses')
    .select('*', { count: 'exact' })
    .eq('check_in_id', checkInId)
    .order('scheduled_for', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to fetch responses: ${error.message}`);
  }

  return {
    data: data as CheckInResponse[],
    count,
    hasMore: count ? offset + limit < count : false,
    nextPage: count && offset + limit < count ? Math.floor(offset / limit) + 1 : undefined,
  };
};

/**
 * Get missed check-ins for a connection
 * Used by sponsors to track compliance
 */
export const getMissedCheckIns = async (
  checkInId: string,
  limit = 10,
): Promise<CheckInResponse[]> => {
  const { data, error } = await supabase
    .from('check_in_responses')
    .select('*')
    .eq('check_in_id', checkInId)
    .eq('status', 'missed')
    .order('scheduled_for', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch missed check-ins: ${error.message}`);
  }

  return data as CheckInResponse[];
};

/**
 * Get completion statistics for a check-in
 */
export const getCheckInStats = async (
  checkInId: string,
): Promise<{
  total: number;
  completed: number;
  missed: number;
  completionRate: number;
  consecutiveMisses: number;
}> => {
  const { data, error } = await supabase
    .from('check_in_responses')
    .select('status')
    .eq('check_in_id', checkInId)
    .order('scheduled_for', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch check-in stats: ${error.message}`);
  }

  const total = data.length;
  const completed = data.filter(r => r.status === 'completed').length;
  const missed = data.filter(r => r.status === 'missed').length;
  const completionRate = total > 0 ? (completed / total) * 100 : 0;

  // Calculate consecutive misses from most recent
  let consecutiveMisses = 0;
  for (const response of data) {
    if (response.status === 'missed') {
      consecutiveMisses++;
    } else {
      break;
    }
  }

  return {
    total,
    completed,
    missed,
    completionRate: Math.round(completionRate),
    consecutiveMisses,
  };
};

/**
 * Check if user is sponsor for a connection
 * Helper function for permission checks
 */
export const isUserSponsor = async (connectionId: string): Promise<boolean> => {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('connections')
    .select('sponsor_id')
    .eq('id', connectionId)
    .single();

  if (error) {
    throw new Error(`Failed to check sponsor status: ${error.message}`);
  }

  return data.sponsor_id === userId;
};
