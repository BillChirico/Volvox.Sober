import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserRole = 'sponsee' | 'sponsor' | 'both';

interface OnboardingState {
  role: UserRole | null;
  profileData: {
    name: string;
    location: {
      city: string;
      state: string;
    };
    programType: string;
    sobrietyDate: string | null;
    stepProgress: number | null;
    bio: string;
    // Sponsor-specific fields
    yearsSober: number | null;
    maxSponsees: number | null;
    availability: string | null;
    approach: string | null;
  };
  currentStep: number;
}

const initialState: OnboardingState = {
  role: null,
  profileData: {
    name: '',
    location: {
      city: '',
      state: '',
    },
    programType: 'AA',
    sobrietyDate: null,
    stepProgress: null,
    bio: '',
    yearsSober: null,
    maxSponsees: null,
    availability: null,
    approach: null,
  },
  currentStep: 0,
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setRole: (state, action: PayloadAction<UserRole>) => {
      state.role = action.payload;
      state.currentStep = 1;
    },
    updateProfileData: (state, action: PayloadAction<Partial<OnboardingState['profileData']>>) => {
      state.profileData = {
        ...state.profileData,
        ...action.payload,
      };
    },
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    resetOnboarding: _state => {
      return initialState;
    },
  },
});

export const { setRole, updateProfileData, setCurrentStep, resetOnboarding } =
  onboardingSlice.actions;
export default onboardingSlice.reducer;
