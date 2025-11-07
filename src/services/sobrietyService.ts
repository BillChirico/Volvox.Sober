/**
 * Sobriety Service
 * Sobriety tracking, milestones, and calculations
 * Feature: 002-app-screens
 */

import supabaseClient from './supabase';
import {
  SobrietyRecord,
  SobrietyRecordWithCalculations,
  SobrietyMilestone,
  SobrietyReflection,
  MilestoneDefinition,
  MilestoneStatus,
  TablesInsert,
  TablesUpdate,
} from '../types';

class SobrietyService {
  /**
   * Milestone definitions
   */
  private readonly MILESTONES: MilestoneDefinition[] = [
    { days: 1, title: '24 Hours', description: 'First 24 hours sober', icon: '🌅' },
    { days: 7, title: '1 Week', description: 'One week of sobriety', icon: '📅' },
    { days: 30, title: '1 Month', description: 'First month sober', icon: '🌙' },
    { days: 60, title: '2 Months', description: 'Two months strong', icon: '💪' },
    { days: 90, title: '90 Days', description: 'Three months sober', icon: '🎯' },
    { days: 180, title: '6 Months', description: 'Half a year sober', icon: '⭐' },
    { days: 365, title: '1 Year', description: 'One year anniversary', icon: '🎉' },
    { days: 730, title: '2 Years', description: 'Two years strong', icon: '🏆' },
    { days: 1825, title: '5 Years', description: 'Five years sober', icon: '👑' },
    { days: 3650, title: '10 Years', description: 'A decade of sobriety', icon: '💎' },
  ];

  /**
   * Get user's sobriety record with calculations
   */
  async getSobrietyRecord(
    userId: string,
  ): Promise<{ data: SobrietyRecordWithCalculations | null; error: Error | null }> {
    try {
      const { data, error } = await supabaseClient
        .from('sobriety_records')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If no record exists, return null (not an error)
        if (error.code === 'PGRST116') {
          return { data: null, error: null };
        }
        throw error;
      }

      // Calculate days sober
      const daysSober = this.calculateDaysSober(data.current_sobriety_start_date);

      const recordWithCalculations: SobrietyRecordWithCalculations = {
        ...data,
        daysSober,
      };

      return { data: recordWithCalculations, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Create initial sobriety record
   */
  async createSobrietyRecord(
    userId: string,
    startDate: string,
  ): Promise<{ data: SobrietyRecord | null; error: Error | null }> {
    try {
      const insertData: TablesInsert<'sobriety_records'> = {
        user_id: userId,
        current_sobriety_start_date: startDate,
        previous_sobriety_dates: [],
        milestones: [],
        reflections: [],
      };

      const { data, error } = await supabaseClient
        .from('sobriety_records')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Update sobriety start date (for resets/relapses)
   */
  async updateSobrietyDate(
    userId: string,
    newStartDate: string,
  ): Promise<{ data: SobrietyRecord | null; error: Error | null }> {
    try {
      // Get current record to save previous date
      const { data: currentRecord, error: getError } = await this.getSobrietyRecord(userId);

      if (getError || !currentRecord) {
        throw getError || new Error('Sobriety record not found');
      }

      // Add current start date to history
      const previousDates = [
        ...(currentRecord.previous_sobriety_dates || []),
        currentRecord.current_sobriety_start_date,
      ];

      const updateData: TablesUpdate<'sobriety_records'> = {
        current_sobriety_start_date: newStartDate,
        previous_sobriety_dates: previousDates,
        milestones: [], // Reset milestones on new sobriety date
      };

      const { data, error } = await supabaseClient
        .from('sobriety_records')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Add a milestone achievement
   */
  async addMilestone(
    userId: string,
    milestone: SobrietyMilestone,
  ): Promise<{ data: SobrietyRecord | null; error: Error | null }> {
    try {
      const { data: currentRecord, error: getError } = await this.getSobrietyRecord(userId);

      if (getError || !currentRecord) {
        throw getError || new Error('Sobriety record not found');
      }

      // Check if milestone already exists
      const existingMilestone = currentRecord.milestones.find(m => m.days === milestone.days);

      if (existingMilestone) {
        return { data: currentRecord, error: null };
      }

      const updatedMilestones = [...currentRecord.milestones, milestone];

      const { data, error } = await supabaseClient
        .from('sobriety_records')
        .update({ milestones: updatedMilestones })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Add a daily reflection
   */
  async addReflection(
    userId: string,
    reflection: SobrietyReflection,
  ): Promise<{ data: SobrietyRecord | null; error: Error | null }> {
    try {
      const { data: currentRecord, error: getError } = await this.getSobrietyRecord(userId);

      if (getError || !currentRecord) {
        throw getError || new Error('Sobriety record not found');
      }

      const updatedReflections = [...currentRecord.reflections, reflection];

      const { data, error } = await supabaseClient
        .from('sobriety_records')
        .update({ reflections: updatedReflections })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Calculate days sober from start date
   */
  calculateDaysSober(startDate: string): number {
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Get milestone status for user
   */
  getMilestoneStatus(
    daysSober: number,
    achievedMilestones: SobrietyMilestone[],
  ): MilestoneStatus[] {
    return this.MILESTONES.map(milestone => {
      const achieved = achievedMilestones.find(m => m.days === milestone.days);

      if (achieved) {
        return {
          milestone,
          isAchieved: true,
          achievedAt: achieved.achieved_at,
        };
      }

      if (daysSober >= milestone.days) {
        return {
          milestone,
          isAchieved: false, // Not yet recorded
          daysUntilAchievement: 0,
        };
      }

      return {
        milestone,
        isAchieved: false,
        daysUntilAchievement: milestone.days - daysSober,
      };
    });
  }

  /**
   * Get next milestone for user
   */
  getNextMilestone(
    daysSober: number,
    achievedMilestones: SobrietyMilestone[],
  ): MilestoneStatus | null {
    const milestoneStatuses = this.getMilestoneStatus(daysSober, achievedMilestones);
    const unachieved = milestoneStatuses.filter(m => !m.isAchieved);

    if (unachieved.length === 0) return null;

    return unachieved[0]; // First unachieved milestone
  }

  /**
   * Check if new milestones were achieved
   */
  checkNewMilestones(
    daysSober: number,
    achievedMilestones: SobrietyMilestone[],
  ): MilestoneDefinition[] {
    const achievedDays = achievedMilestones.map(m => m.days);

    return this.MILESTONES.filter(
      milestone => daysSober >= milestone.days && !achievedDays.includes(milestone.days),
    );
  }
}

export default new SobrietyService();
