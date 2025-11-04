export interface User {
  id: string;
  email: string;
  displayName: string;
  sobrietyDate: string;
  biography: string | null;
  preferredPronoun: 'he/him' | 'she/her' | 'they/them' | 'other';
  ageRange: '18-25' | '26-35' | '36-45' | '46-55' | '56+';
  location: string | null;
  substanceHistory: string[];
  recoveryGoals: string[];
  interests: string[];
  profilePhotoUrl: string | null;
  visibility: 'public' | 'private';
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends Omit<User, 'email'> {
  connectionStatus?: 'connected' | 'pending' | 'none';
}
