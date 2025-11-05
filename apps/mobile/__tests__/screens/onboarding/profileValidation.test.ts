import * as Yup from 'yup';

const sponseeProfileSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  sobrietyDate: Yup.date()
    .required('Sobriety date is required')
    .max(new Date(), 'Sobriety date cannot be in the future'),
  stepProgress: Yup.number()
    .min(0, 'Step progress must be between 0 and 12')
    .max(12, 'Step progress must be between 0 and 12')
    .required('Step progress is required'),
  bio: Yup.string().max(500, 'Bio must be less than 500 characters'),
});

const sponsorProfileSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  yearsSober: Yup.number()
    .min(1, 'Must have at least 1 year sober')
    .required('Years sober is required'),
  maxSponsees: Yup.number()
    .min(1, 'Must be willing to sponsor at least 1 person')
    .max(20, 'Maximum 20 sponsees')
    .required('Maximum sponsees is required'),
  availability: Yup.string().required('Availability is required'),
  approach: Yup.string()
    .max(200, 'Approach must be less than 200 characters')
    .required('Sponsorship approach is required'),
  bio: Yup.string().max(500, 'Bio must be less than 500 characters'),
});

describe('Profile Form Validation', () => {
  describe('Sponsee Profile Validation', () => {
    it('should validate a complete sponsee profile', async () => {
      const validData = {
        name: 'John Doe',
        city: 'San Francisco',
        state: 'CA',
        sobrietyDate: new Date('2020-01-01'),
        stepProgress: 5,
        bio: 'My recovery journey',
      };

      await expect(sponseeProfileSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should reject missing required fields', async () => {
      const invalidData = {
        name: '',
        city: '',
        state: '',
      };

      await expect(sponseeProfileSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should reject future sobriety date', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const invalidData = {
        name: 'John Doe',
        city: 'San Francisco',
        state: 'CA',
        sobrietyDate: futureDate,
        stepProgress: 5,
      };

      await expect(sponseeProfileSchema.validate(invalidData)).rejects.toThrow(
        'Sobriety date cannot be in the future'
      );
    });

    it('should reject invalid step progress', async () => {
      const invalidData = {
        name: 'John Doe',
        city: 'San Francisco',
        state: 'CA',
        sobrietyDate: new Date('2020-01-01'),
        stepProgress: 15,
      };

      await expect(sponseeProfileSchema.validate(invalidData)).rejects.toThrow(
        'Step progress must be between 0 and 12'
      );
    });

    it('should reject bio longer than 500 characters', async () => {
      const longBio = 'a'.repeat(501);

      const invalidData = {
        name: 'John Doe',
        city: 'San Francisco',
        state: 'CA',
        sobrietyDate: new Date('2020-01-01'),
        stepProgress: 5,
        bio: longBio,
      };

      await expect(sponseeProfileSchema.validate(invalidData)).rejects.toThrow(
        'Bio must be less than 500 characters'
      );
    });
  });

  describe('Sponsor Profile Validation', () => {
    it('should validate a complete sponsor profile', async () => {
      const validData = {
        name: 'Jane Smith',
        city: 'Los Angeles',
        state: 'CA',
        yearsSober: 10,
        maxSponsees: 5,
        availability: '3-5 days',
        approach: 'Big Book approach',
        bio: 'Helping others in recovery',
      };

      await expect(sponsorProfileSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should reject missing required fields', async () => {
      const invalidData = {
        name: '',
        city: '',
        state: '',
      };

      await expect(sponsorProfileSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should reject less than 1 year sober', async () => {
      const invalidData = {
        name: 'Jane Smith',
        city: 'Los Angeles',
        state: 'CA',
        yearsSober: 0,
        maxSponsees: 5,
        availability: '3-5 days',
        approach: 'Big Book approach',
      };

      await expect(sponsorProfileSchema.validate(invalidData)).rejects.toThrow(
        'Must have at least 1 year sober'
      );
    });

    it('should reject more than 20 max sponsees', async () => {
      const invalidData = {
        name: 'Jane Smith',
        city: 'Los Angeles',
        state: 'CA',
        yearsSober: 10,
        maxSponsees: 25,
        availability: '3-5 days',
        approach: 'Big Book approach',
      };

      await expect(sponsorProfileSchema.validate(invalidData)).rejects.toThrow(
        'Maximum 20 sponsees'
      );
    });

    it('should reject approach longer than 200 characters', async () => {
      const longApproach = 'a'.repeat(201);

      const invalidData = {
        name: 'Jane Smith',
        city: 'Los Angeles',
        state: 'CA',
        yearsSober: 10,
        maxSponsees: 5,
        availability: '3-5 days',
        approach: longApproach,
      };

      await expect(sponsorProfileSchema.validate(invalidData)).rejects.toThrow(
        'Approach must be less than 200 characters'
      );
    });
  });
});
