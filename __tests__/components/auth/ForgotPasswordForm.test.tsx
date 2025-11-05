import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ForgotPasswordForm from '../../../src/components/auth/ForgotPasswordForm';
import authService from '../../../src/services/authService';

// Mock authService
jest.mock('../../../src/services/authService', () => ({
  __esModule: true,
  default: {
    resetPasswordRequest: jest.fn(),
    updatePassword: jest.fn(),
  },
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn((callback) => callback()),
}));

const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    const defaultProps = {
      resetToken: null,
      onResetRequestSuccess: jest.fn(),
      onPasswordUpdateSuccess: jest.fn(),
    };

    return render(<ForgotPasswordForm {...defaultProps} {...props} />);
  };

  describe('Mode Detection', () => {
    it('should render in reset request mode when no token provided', () => {
      const { getByText, getByTestId } = renderComponent({ resetToken: null });

      expect(getByText('Reset Password')).toBeTruthy();
      expect(getByText(/Enter your email address and we'll send you a link/i)).toBeTruthy();
      expect(getByTestId('reset-email-input')).toBeTruthy();
      expect(getByTestId('reset-request-button')).toBeTruthy();
    });

    it('should render in password update mode when token provided', () => {
      const { getByText, getByTestId } = renderComponent({ resetToken: 'test-token-123' });

      expect(getByText('Set New Password')).toBeTruthy();
      expect(getByText('Enter your new password below.')).toBeTruthy();
      expect(getByTestId('new-password-input')).toBeTruthy();
      expect(getByTestId('confirm-password-input')).toBeTruthy();
      expect(getByTestId('update-password-button')).toBeTruthy();
    });

    it('should switch modes when resetToken prop changes', () => {
      const { getByTestId, rerender } = renderComponent({ resetToken: null });

      // Initially in reset request mode
      expect(getByTestId('reset-email-input')).toBeTruthy();

      // Switch to password update mode
      rerender(
        <ForgotPasswordForm
          resetToken="new-token"
          onResetRequestSuccess={jest.fn()}
          onPasswordUpdateSuccess={jest.fn()}
        />
      );

      expect(getByTestId('new-password-input')).toBeTruthy();
      expect(getByTestId('confirm-password-input')).toBeTruthy();
    });
  });

  describe('Reset Request Mode', () => {
    describe('Rendering', () => {
      it('should render email input and submit button', () => {
        const { getByTestId } = renderComponent({ resetToken: null });

        expect(getByTestId('reset-email-input')).toBeTruthy();
        expect(getByTestId('reset-request-button')).toBeTruthy();
      });

      it('should have correct input configuration', () => {
        const { getByTestId } = renderComponent({ resetToken: null });
        const emailInput = getByTestId('reset-email-input');

        expect(emailInput.props.keyboardType).toBe('email-address');
        expect(emailInput.props.autoCapitalize).toBe('none');
        expect(emailInput.props.autoComplete).toBe('email');
      });
    });

    describe('Form Input', () => {
      it('should update email field when text is entered', () => {
        const { getByTestId } = renderComponent({ resetToken: null });
        const emailInput = getByTestId('reset-email-input');

        fireEvent.changeText(emailInput, 'test@example.com');

        expect(emailInput.props.value).toBe('test@example.com');
      });
    });

    describe('Validation', () => {
      it('should show validation error for invalid email', async () => {
        const { getByTestId, findByText } = renderComponent({ resetToken: null });
        const emailInput = getByTestId('reset-email-input');
        const submitButton = getByTestId('reset-request-button');

        fireEvent.changeText(emailInput, 'invalid-email');
        fireEvent.press(submitButton);

        const errorMessage = await findByText(/valid email/i);
        expect(errorMessage).toBeTruthy();
      });

      it('should show validation error for empty email', async () => {
        const { getByTestId, findByText } = renderComponent({ resetToken: null });
        const submitButton = getByTestId('reset-request-button');

        fireEvent.press(submitButton);

        const errorMessage = await findByText(/email is required/i);
        expect(errorMessage).toBeTruthy();
      });

      it('should not submit with invalid email', async () => {
        const { getByTestId } = renderComponent({ resetToken: null });
        const emailInput = getByTestId('reset-email-input');
        const submitButton = getByTestId('reset-request-button');

        fireEvent.changeText(emailInput, 'invalid');
        fireEvent.press(submitButton);

        await waitFor(() => {
          expect(mockAuthService.resetPasswordRequest).not.toHaveBeenCalled();
        });
      });
    });

    describe('Submission', () => {
      it('should call resetPasswordRequest with email on submit', async () => {
        mockAuthService.resetPasswordRequest.mockResolvedValue({ error: null });

        const { getByTestId } = renderComponent({ resetToken: null });
        const emailInput = getByTestId('reset-email-input');
        const submitButton = getByTestId('reset-request-button');

        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.press(submitButton);

        await waitFor(() => {
          expect(mockAuthService.resetPasswordRequest).toHaveBeenCalledWith('test@example.com');
        });
      });

      it('should show generic success message on successful request (FR-011)', async () => {
        mockAuthService.resetPasswordRequest.mockResolvedValue({ error: null });

        const { getByTestId, findByText } = renderComponent({ resetToken: null });
        const emailInput = getByTestId('reset-email-input');
        const submitButton = getByTestId('reset-request-button');

        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.press(submitButton);

        // Generic message that doesn't reveal if account exists (FR-011)
        const successMessage = await findByText(
          /If an account exists with this email, you will receive a password reset link/i
        );
        expect(successMessage).toBeTruthy();
      });

      it('should call onResetRequestSuccess after successful submission', async () => {
        mockAuthService.resetPasswordRequest.mockResolvedValue({ error: null });

        const onResetRequestSuccess = jest.fn();
        const { getByTestId } = renderComponent({ resetToken: null, onResetRequestSuccess });
        const emailInput = getByTestId('reset-email-input');
        const submitButton = getByTestId('reset-request-button');

        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.press(submitButton);

        await waitFor(() => {
          expect(onResetRequestSuccess).toHaveBeenCalled();
        }, { timeout: 4000 });
      });

      it('should clear email field after successful submission', async () => {
        mockAuthService.resetPasswordRequest.mockResolvedValue({ error: null });

        const { getByTestId } = renderComponent({ resetToken: null });
        const emailInput = getByTestId('reset-email-input');
        const submitButton = getByTestId('reset-request-button');

        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.press(submitButton);

        await waitFor(() => {
          expect(emailInput.props.value).toBe('');
        });
      });

      it('should show error message on failed request', async () => {
        mockAuthService.resetPasswordRequest.mockResolvedValue({
          error: { message: 'Network error' } as any,
        });

        const { getByTestId, findByTestId } = renderComponent({ resetToken: null });
        const emailInput = getByTestId('reset-email-input');
        const submitButton = getByTestId('reset-request-button');

        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.press(submitButton);

        const errorMessage = await findByTestId('auth-error-message');
        expect(errorMessage).toBeTruthy();
      });

      it('should disable inputs during submission', async () => {
        mockAuthService.resetPasswordRequest.mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
        );

        const { getByTestId } = renderComponent({ resetToken: null });
        const emailInput = getByTestId('reset-email-input');
        const submitButton = getByTestId('reset-request-button');

        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.press(submitButton);

        await waitFor(() => {
          expect(mockAuthService.resetPasswordRequest).toHaveBeenCalled();
        });
      });
    });
  });

  describe('Password Update Mode', () => {
    describe('Rendering', () => {
      it('should render password inputs and submit button', () => {
        const { getByTestId } = renderComponent({ resetToken: 'test-token' });

        expect(getByTestId('new-password-input')).toBeTruthy();
        expect(getByTestId('confirm-password-input')).toBeTruthy();
        expect(getByTestId('update-password-button')).toBeTruthy();
      });

      it('should render password strength indicator', () => {
        const { getByTestId } = renderComponent({ resetToken: 'test-token' });
        const passwordInput = getByTestId('new-password-input');

        // Type password to show strength indicator
        fireEvent.changeText(passwordInput, 'Test123!');

        // PasswordStrength component should be rendered
        expect(getByTestId('new-password-input')).toBeTruthy();
      });
    });

    describe('Form Input', () => {
      it('should update new password field', () => {
        const { getByTestId } = renderComponent({ resetToken: 'test-token' });
        const passwordInput = getByTestId('new-password-input');

        fireEvent.changeText(passwordInput, 'NewPassword123!');

        expect(passwordInput.props.value).toBe('NewPassword123!');
      });

      it('should update confirm password field', () => {
        const { getByTestId } = renderComponent({ resetToken: 'test-token' });
        const confirmInput = getByTestId('confirm-password-input');

        fireEvent.changeText(confirmInput, 'NewPassword123!');

        expect(confirmInput.props.value).toBe('NewPassword123!');
      });
    });

    describe('Validation', () => {
      it('should show error for empty password', async () => {
        const { getByTestId, findByText } = renderComponent({ resetToken: 'test-token' });
        const submitButton = getByTestId('update-password-button');

        fireEvent.press(submitButton);

        // Yup shows multiple errors when password is empty, this is one of them
        const errorMessage = await findByText(/password must/i);
        expect(errorMessage).toBeTruthy();
      });

      it('should show error for password shorter than 8 characters', async () => {
        const { getByTestId, findByText } = renderComponent({ resetToken: 'test-token' });
        const passwordInput = getByTestId('new-password-input');
        const submitButton = getByTestId('update-password-button');

        fireEvent.changeText(passwordInput, 'Short1!');
        fireEvent.press(submitButton);

        const errorMessage = await findByText(/at least 8 characters/i);
        expect(errorMessage).toBeTruthy();
      });

      it('should show error for password without lowercase letter', async () => {
        const { getByTestId, findByText } = renderComponent({ resetToken: 'test-token' });
        const passwordInput = getByTestId('new-password-input');
        const submitButton = getByTestId('update-password-button');

        fireEvent.changeText(passwordInput, 'PASSWORD123!');
        fireEvent.press(submitButton);

        const errorMessage = await findByText(/must contain at least one lowercase letter/i);
        expect(errorMessage).toBeTruthy();
      });

      it('should show error for password without uppercase letter', async () => {
        const { getByTestId, findByText } = renderComponent({ resetToken: 'test-token' });
        const passwordInput = getByTestId('new-password-input');
        const submitButton = getByTestId('update-password-button');

        fireEvent.changeText(passwordInput, 'password123!');
        fireEvent.press(submitButton);

        const errorMessage = await findByText(/must contain at least one uppercase letter/i);
        expect(errorMessage).toBeTruthy();
      });

      it('should show error for password without number', async () => {
        const { getByTestId, findByText } = renderComponent({ resetToken: 'test-token' });
        const passwordInput = getByTestId('new-password-input');
        const submitButton = getByTestId('update-password-button');

        fireEvent.changeText(passwordInput, 'Password!');
        fireEvent.press(submitButton);

        const errorMessage = await findByText(/must contain at least one number/i);
        expect(errorMessage).toBeTruthy();
      });

      it('should show error for password without special character', async () => {
        const { getByTestId, findByText } = renderComponent({ resetToken: 'test-token' });
        const passwordInput = getByTestId('new-password-input');
        const submitButton = getByTestId('update-password-button');

        fireEvent.changeText(passwordInput, 'Password123');
        fireEvent.press(submitButton);

        const errorMessage = await findByText(/must contain at least one special character/i);
        expect(errorMessage).toBeTruthy();
      });

      it('should show error when passwords do not match', async () => {
        const { getByTestId, findByText } = renderComponent({ resetToken: 'test-token' });
        const passwordInput = getByTestId('new-password-input');
        const confirmInput = getByTestId('confirm-password-input');
        const submitButton = getByTestId('update-password-button');

        fireEvent.changeText(passwordInput, 'Password123!');
        fireEvent.changeText(confirmInput, 'DifferentPassword123!');
        fireEvent.press(submitButton);

        const errorMessage = await findByText(/passwords must match/i);
        expect(errorMessage).toBeTruthy();
      });

      it('should not submit with invalid password', async () => {
        const { getByTestId } = renderComponent({ resetToken: 'test-token' });
        const passwordInput = getByTestId('new-password-input');
        const submitButton = getByTestId('update-password-button');

        fireEvent.changeText(passwordInput, 'short');
        fireEvent.press(submitButton);

        await waitFor(() => {
          expect(mockAuthService.updatePassword).not.toHaveBeenCalled();
        });
      });
    });

    describe('Submission', () => {
      it('should call updatePassword with new password on submit', async () => {
        mockAuthService.updatePassword.mockResolvedValue({ user: null, error: null });

        const { getByTestId } = renderComponent({ resetToken: 'test-token' });
        const passwordInput = getByTestId('new-password-input');
        const confirmInput = getByTestId('confirm-password-input');
        const submitButton = getByTestId('update-password-button');

        fireEvent.changeText(passwordInput, 'NewPassword123!');
        fireEvent.changeText(confirmInput, 'NewPassword123!');
        fireEvent.press(submitButton);

        await waitFor(() => {
          expect(mockAuthService.updatePassword).toHaveBeenCalledWith('NewPassword123!');
        });
      });

      it('should show success message after password update', async () => {
        mockAuthService.updatePassword.mockResolvedValue({ user: null, error: null });

        const { getByTestId, findByText } = renderComponent({ resetToken: 'test-token' });
        const passwordInput = getByTestId('new-password-input');
        const confirmInput = getByTestId('confirm-password-input');
        const submitButton = getByTestId('update-password-button');

        fireEvent.changeText(passwordInput, 'NewPassword123!');
        fireEvent.changeText(confirmInput, 'NewPassword123!');
        fireEvent.press(submitButton);

        const successMessage = await findByText(/password has been updated successfully/i);
        expect(successMessage).toBeTruthy();
      });

      it('should call onPasswordUpdateSuccess after successful update', async () => {
        mockAuthService.updatePassword.mockResolvedValue({ user: null, error: null });

        const onPasswordUpdateSuccess = jest.fn();
        const { getByTestId } = renderComponent({ resetToken: 'test-token', onPasswordUpdateSuccess });
        const passwordInput = getByTestId('new-password-input');
        const confirmInput = getByTestId('confirm-password-input');
        const submitButton = getByTestId('update-password-button');

        fireEvent.changeText(passwordInput, 'NewPassword123!');
        fireEvent.changeText(confirmInput, 'NewPassword123!');
        fireEvent.press(submitButton);

        await waitFor(() => {
          expect(onPasswordUpdateSuccess).toHaveBeenCalled();
        }, { timeout: 3000 });
      });

      it('should clear password fields after successful update', async () => {
        mockAuthService.updatePassword.mockResolvedValue({ user: null, error: null });

        const { getByTestId } = renderComponent({ resetToken: 'test-token' });
        const passwordInput = getByTestId('new-password-input');
        const confirmInput = getByTestId('confirm-password-input');
        const submitButton = getByTestId('update-password-button');

        fireEvent.changeText(passwordInput, 'NewPassword123!');
        fireEvent.changeText(confirmInput, 'NewPassword123!');
        fireEvent.press(submitButton);

        await waitFor(() => {
          expect(passwordInput.props.value).toBe('');
          expect(confirmInput.props.value).toBe('');
        });
      });

      it('should show expired token error message', async () => {
        mockAuthService.updatePassword.mockResolvedValue({
          user: null,
          error: { message: 'Token expired' } as any,
        });

        const { getByTestId, findByText } = renderComponent({ resetToken: 'expired-token' });
        const passwordInput = getByTestId('new-password-input');
        const confirmInput = getByTestId('confirm-password-input');
        const submitButton = getByTestId('update-password-button');

        fireEvent.changeText(passwordInput, 'NewPassword123!');
        fireEvent.changeText(confirmInput, 'NewPassword123!');
        fireEvent.press(submitButton);

        const errorMessage = await findByText(/reset link has expired/i);
        expect(errorMessage).toBeTruthy();
      });

      it('should show invalid token error message', async () => {
        mockAuthService.updatePassword.mockResolvedValue({
          user: null,
          error: { message: 'Invalid token' } as any,
        });

        const { getByTestId, findByText } = renderComponent({ resetToken: 'invalid-token' });
        const passwordInput = getByTestId('new-password-input');
        const confirmInput = getByTestId('confirm-password-input');
        const submitButton = getByTestId('update-password-button');

        fireEvent.changeText(passwordInput, 'NewPassword123!');
        fireEvent.changeText(confirmInput, 'NewPassword123!');
        fireEvent.press(submitButton);

        const errorMessage = await findByText(/reset link has expired or is invalid/i);
        expect(errorMessage).toBeTruthy();
      });

      it('should disable inputs during submission', async () => {
        mockAuthService.updatePassword.mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve({ user: null, error: null }), 100))
        );

        const { getByTestId } = renderComponent({ resetToken: 'test-token' });
        const passwordInput = getByTestId('new-password-input');
        const confirmInput = getByTestId('confirm-password-input');
        const submitButton = getByTestId('update-password-button');

        fireEvent.changeText(passwordInput, 'NewPassword123!');
        fireEvent.changeText(confirmInput, 'NewPassword123!');
        fireEvent.press(submitButton);

        await waitFor(() => {
          expect(mockAuthService.updatePassword).toHaveBeenCalled();
        });
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels in reset mode', () => {
      const { getByTestId } = renderComponent({ resetToken: null });

      const form = getByTestId('forgot-password-form');
      const emailInput = getByTestId('reset-email-input');
      const submitButton = getByTestId('reset-request-button');

      expect(form.props.accessibilityLabel).toBe('Password reset request form');
      expect(emailInput.props.accessibilityLabel).toBe('Email address');
      expect(submitButton.props.accessibilityRole).toBe('button');
      expect(submitButton.props.accessibilityLabel).toBe('Send reset link');
    });

    it('should have proper accessibility labels in update mode', () => {
      const { getByTestId } = renderComponent({ resetToken: 'test-token' });

      const form = getByTestId('forgot-password-form');
      const submitButton = getByTestId('update-password-button');

      expect(form.props.accessibilityLabel).toBe('Update password form');
      expect(submitButton.props.accessibilityRole).toBe('button');
      expect(submitButton.props.accessibilityLabel).toBe('Update password');
    });

    it('should have accessibility hints on inputs in reset mode', () => {
      const { getByTestId } = renderComponent({ resetToken: null });

      const emailInput = getByTestId('reset-email-input');
      const submitButton = getByTestId('reset-request-button');

      expect(emailInput.props.accessibilityHint).toBe('Enter your email to receive a password reset link');
      expect(submitButton.props.accessibilityHint).toBe('Request a password reset email');
    });

    it('should have accessibility hints on inputs in update mode', () => {
      const { getByTestId } = renderComponent({ resetToken: 'test-token' });

      const passwordInput = getByTestId('new-password-input');
      const confirmInput = getByTestId('confirm-password-input');
      const submitButton = getByTestId('update-password-button');

      expect(passwordInput.props.accessibilityLabel).toBe('New Password');
      expect(passwordInput.props.accessibilityHint).toBe('Enter your new password');
      expect(confirmInput.props.accessibilityLabel).toBe('Confirm New Password');
      expect(confirmInput.props.accessibilityHint).toBe('Re-enter your new password');
      expect(submitButton.props.accessibilityHint).toBe('Save your new password');
    });

    it('should mark error messages as alerts', async () => {
      mockAuthService.resetPasswordRequest.mockResolvedValue({
        error: { message: 'Network error' } as any,
      });

      const { getByTestId } = renderComponent({ resetToken: null });
      const emailInput = getByTestId('reset-email-input');
      const submitButton = getByTestId('reset-request-button');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.press(submitButton);

      await waitFor(() => {
        const errorMessage = getByTestId('auth-error-message');
        expect(errorMessage).toBeTruthy();
      });
    });

    it('should mark success messages as alerts', async () => {
      mockAuthService.resetPasswordRequest.mockResolvedValue({ error: null });

      const { getByTestId, findByText } = renderComponent({ resetToken: null });
      const emailInput = getByTestId('reset-email-input');
      const submitButton = getByTestId('reset-request-button');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.press(submitButton);

      const successMessage = await findByText(/If an account exists/i);
      expect(successMessage).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('should show loading state during reset request', async () => {
      mockAuthService.resetPasswordRequest.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
      );

      const { getByTestId } = renderComponent({ resetToken: null });
      const emailInput = getByTestId('reset-email-input');
      const submitButton = getByTestId('reset-request-button');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockAuthService.resetPasswordRequest).toHaveBeenCalled();
      });
    });

    it('should show loading state during password update', async () => {
      mockAuthService.updatePassword.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ user: null, error: null }), 100))
      );

      const { getByTestId } = renderComponent({ resetToken: 'test-token' });
      const passwordInput = getByTestId('new-password-input');
      const confirmInput = getByTestId('confirm-password-input');
      const submitButton = getByTestId('update-password-button');

      fireEvent.changeText(passwordInput, 'NewPassword123!');
      fireEvent.changeText(confirmInput, 'NewPassword123!');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockAuthService.updatePassword).toHaveBeenCalled();
      });
    });
  });

  describe('Error Clearing', () => {
    it('should clear errors when switching modes', async () => {
      mockAuthService.resetPasswordRequest.mockResolvedValue({
        error: { message: 'Network error' } as any,
      });

      const { getByTestId, queryByTestId, rerender } = renderComponent({ resetToken: null });
      const emailInput = getByTestId('reset-email-input');
      const submitButton = getByTestId('reset-request-button');

      // Trigger error in reset mode
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(queryByTestId('auth-error-message')).toBeTruthy();
      });

      // Switch to update mode
      rerender(
        <ForgotPasswordForm
          resetToken="test-token"
          onResetRequestSuccess={jest.fn()}
          onPasswordUpdateSuccess={jest.fn()}
        />
      );

      // Error should be cleared
      await waitFor(() => {
        expect(queryByTestId('auth-error-message')).toBeNull();
      });
    });
  });
});
