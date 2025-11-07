import * as Yup from 'yup';

/**
 * Password validation rules per FR-003:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one symbol
 */
const passwordValidation = Yup.string()
  .required('Password is required')
  .min(8, 'Password must be at least 8 characters')
  .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
  .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .matches(/[0-9]/, 'Password must contain at least one number')
  .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');

/**
 * Email validation
 */
const emailValidation = Yup.string()
  .required('Email is required')
  .email('Please enter a valid email address');

/**
 * Login form validation schema
 * Fields: email, password
 */
export const loginSchema = Yup.object().shape({
  email: emailValidation,
  password: Yup.string().required('Password is required'),
});

/**
 * Signup form validation schema
 * Fields: email, password (with strength requirements)
 */
export const signupSchema = Yup.object().shape({
  email: emailValidation,
  password: passwordValidation,
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
});

/**
 * Password reset request form validation schema
 * Fields: email
 */
export const passwordResetSchema = Yup.object().shape({
  email: emailValidation,
});

/**
 * Update password form validation schema
 * Fields: newPassword, confirmNewPassword
 */
export const updatePasswordSchema = Yup.object().shape({
  newPassword: passwordValidation,
  confirmNewPassword: Yup.string()
    .required('Please confirm your new password')
    .oneOf([Yup.ref('newPassword')], 'Passwords must match'),
});

// ============================================================
// Feature 002-app-screens Validation Schemas
// ============================================================

/**
 * Profile form validation schema
 * Fields: name, bio, role, recovery_program, sobriety_start_date, city, state, availability
 */
export const profileSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  bio: Yup.string().max(500, 'Bio must be less than 500 characters').nullable(),
  role: Yup.string()
    .required('Role is required')
    .oneOf(['sponsor', 'sponsee', 'both'], 'Invalid role selected'),
  recovery_program: Yup.string()
    .required('Recovery program is required')
    .max(50, 'Recovery program must be less than 50 characters'),
  sobriety_start_date: Yup.date()
    .max(new Date(), 'Sobriety date cannot be in the future')
    .nullable(),
  city: Yup.string().max(100, 'City must be less than 100 characters').nullable(),
  state: Yup.string().max(50, 'State must be less than 50 characters').nullable(),
  country: Yup.string().max(50, 'Country must be less than 50 characters').nullable(),
  availability: Yup.array()
    .of(Yup.string())
    .min(1, 'Please select at least one availability option')
    .required('Availability is required'),
});

/**
 * Sponsor profile form validation schema
 * Extends base profile with sponsor-specific fields
 */
export const sponsorProfileSchema = profileSchema.shape({
  role: Yup.string().required('Role is required').oneOf(['sponsor', 'both'], 'Must be a sponsor'),
  sobriety_start_date: Yup.date()
    .required('Sobriety start date is required for sponsors')
    .max(new Date(), 'Sobriety date cannot be in the future'),
});

/**
 * Sponsee profile form validation schema
 * Extends base profile with sponsee-specific requirements
 */
export const sponseeProfileSchema = profileSchema.shape({
  role: Yup.string().required('Role is required').oneOf(['sponsee', 'both'], 'Must be a sponsee'),
});

/**
 * Role selection validation schema
 * Fields: role
 */
export const roleSelectionSchema = Yup.object().shape({
  role: Yup.string()
    .required('Please select your role')
    .oneOf(['sponsor', 'sponsee', 'both'], 'Invalid role selected'),
});

/**
 * Sobriety start date validation schema
 * Fields: current_sobriety_start_date
 */
export const sobrietyDateSchema = Yup.object().shape({
  current_sobriety_start_date: Yup.date()
    .required('Sobriety start date is required')
    .max(new Date(), 'Sobriety date cannot be in the future')
    .typeError('Please enter a valid date'),
});

/**
 * Reflection validation schema
 * Fields: text, date
 */
export const reflectionSchema = Yup.object().shape({
  text: Yup.string()
    .required('Reflection text is required')
    .min(1, 'Reflection cannot be empty')
    .max(1000, 'Reflection must be less than 1000 characters'),
  date: Yup.date().max(new Date(), 'Reflection date cannot be in the future').nullable(),
});

/**
 * Message validation schema
 * Fields: text
 */
export const messageSchema = Yup.object().shape({
  text: Yup.string()
    .required('Message cannot be empty')
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message must be less than 5000 characters')
    .trim(),
});

/**
 * Connection end feedback validation schema
 * Fields: end_feedback
 */
export const connectionEndFeedbackSchema = Yup.object().shape({
  end_feedback: Yup.string().max(500, 'Feedback must be less than 500 characters').nullable(),
});
