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
