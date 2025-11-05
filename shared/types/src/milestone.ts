export interface Milestone {
  id: string;
  userId: string;
  milestoneType: 'days' | 'months' | 'years';
  milestoneValue: number;
  achievedAt: string;
  isShared: boolean;
  celebrationMessage: string | null;
  createdAt: string;
}

export interface MilestoneProgress {
  currentDays: number;
  nextMilestone: {
    type: 'days' | 'months' | 'years';
    value: number;
    daysRemaining: number;
  };
  achievements: Milestone[];
}
