import onboardingReducer, {
  setRole,
  updateProfileData,
  setCurrentStep,
  resetOnboarding,
  UserRole,
} from '../../../src/store/slices/onboardingSlice';

describe('onboardingSlice', () => {
  const initialState = {
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

  it('should return the initial state', () => {
    expect(onboardingReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setRole', () => {
    it('should set the user role to sponsee', () => {
      const role: UserRole = 'sponsee';
      const actual = onboardingReducer(initialState, setRole(role));
      expect(actual.role).toEqual('sponsee');
      expect(actual.currentStep).toEqual(1);
    });

    it('should set the user role to sponsor', () => {
      const role: UserRole = 'sponsor';
      const actual = onboardingReducer(initialState, setRole(role));
      expect(actual.role).toEqual('sponsor');
      expect(actual.currentStep).toEqual(1);
    });

    it('should set the user role to both', () => {
      const role: UserRole = 'both';
      const actual = onboardingReducer(initialState, setRole(role));
      expect(actual.role).toEqual('both');
      expect(actual.currentStep).toEqual(1);
    });
  });

  describe('updateProfileData', () => {
    it('should update name and location', () => {
      const updates = {
        name: 'John Doe',
        location: {
          city: 'San Francisco',
          state: 'CA',
        },
      };
      const actual = onboardingReducer(initialState, updateProfileData(updates));
      expect(actual.profileData.name).toEqual('John Doe');
      expect(actual.profileData.location.city).toEqual('San Francisco');
      expect(actual.profileData.location.state).toEqual('CA');
    });

    it('should update sponsee-specific fields', () => {
      const updates = {
        sobrietyDate: '2020-01-01',
        stepProgress: 5,
        bio: 'Test bio',
      };
      const actual = onboardingReducer(initialState, updateProfileData(updates));
      expect(actual.profileData.sobrietyDate).toEqual('2020-01-01');
      expect(actual.profileData.stepProgress).toEqual(5);
      expect(actual.profileData.bio).toEqual('Test bio');
    });

    it('should update sponsor-specific fields', () => {
      const updates = {
        yearsSober: 10,
        maxSponsees: 5,
        availability: '3-5 days',
        approach: 'Big Book approach',
      };
      const actual = onboardingReducer(initialState, updateProfileData(updates));
      expect(actual.profileData.yearsSober).toEqual(10);
      expect(actual.profileData.maxSponsees).toEqual(5);
      expect(actual.profileData.availability).toEqual('3-5 days');
      expect(actual.profileData.approach).toEqual('Big Book approach');
    });
  });

  describe('setCurrentStep', () => {
    it('should update the current step', () => {
      const actual = onboardingReducer(initialState, setCurrentStep(3));
      expect(actual.currentStep).toEqual(3);
    });
  });

  describe('resetOnboarding', () => {
    it('should reset state to initial values', () => {
      const modifiedState = {
        role: 'sponsee' as UserRole,
        profileData: {
          name: 'John Doe',
          location: {
            city: 'San Francisco',
            state: 'CA',
          },
          programType: 'AA',
          sobrietyDate: '2020-01-01',
          stepProgress: 5,
          bio: 'Test bio',
          yearsSober: null,
          maxSponsees: null,
          availability: null,
          approach: null,
        },
        currentStep: 2,
      };
      const actual = onboardingReducer(modifiedState, resetOnboarding());
      expect(actual).toEqual(initialState);
    });
  });
});
