export interface Match {
  id: string;
  userId: string;
  matchedUserId: string;
  compatibilityScore: number;
  sharedInterests: string[];
  sharedRecoveryGoals: string[];
  ageRangeCompatible: boolean;
  locationDistance: number | null;
  createdAt: string;
}

export interface MatchFilters {
  ageRange?: string[];
  substanceHistory?: string[];
  recoveryGoals?: string[];
  interests?: string[];
  maxDistance?: number;
  minCompatibilityScore?: number;
}
