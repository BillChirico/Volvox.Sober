export type CheckinMood = 'great' | 'good' | 'okay' | 'struggling' | 'difficult';

export interface Checkin {
  id: string;
  userId: string;
  mood: CheckinMood;
  cravingLevel: number; // 1-10 scale
  notes: string | null;
  gratitude: string | null;
  triggers: string[];
  supportUsed: string[];
  isPrivate: boolean;
  createdAt: string;
}

export interface CheckinStats {
  totalCheckins: number;
  averageMood: number;
  averageCravingLevel: number;
  commonTriggers: Array<{ trigger: string; count: number }>;
  streakDays: number;
}
