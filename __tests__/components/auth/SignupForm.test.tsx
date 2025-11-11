import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import SignupForm from '../../../src/features/auth/components/SignupForm';
import authReducer, { setError } from '../../../src/store/auth/authSlice';

// Mock the signupThunk
const mockSignupThunk = jest.fn();
jest.mock('../../../src/store/auth/authThunks', () => ({
  signupThunk: (payload: any) => mockSignupThunk(payload),
}));

describe('SignupForm', () => {
  let store: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock signupThunk to return a thunk action that resolves successfully
    mockSignupThunk.mockImplementation(() => {
      return async (dispatch: any) => {
        dispatch({ type: 'auth/signup/pending' });
        dispatch({ type: 'auth/signup/fulfilled', payload: { success: true } });
        return { type: 'auth/signup/fulfilled', payload: { success: true } };
      };
    });

    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  const renderComponent = (props = {}) => {
    return render(
      <ReduxProvider store={store}>
        <PaperProvider>
          <SignupForm {...props} />
        </PaperProvider>
      </ReduxProvider>,
    );
  };

  it('should render signup form with all required fields', () => {
    const { getByTestId } = renderComponent();

    expect(getByTestId('signup-email-input')).toBeTruthy();
    expect(getByTestId('signup-password-input')).toBeTruthy();
    expect(getByTestId('signup-confirm-password-input')).toBeTruthy();
    expect(getByTestId('signup-submit-button')).toBeTruthy();
  });

  it('should display password strength indicator', () => {
    const { getByTestId } = renderComponent();
    const passwordInput = getByTestId('signup-password-input');

    fireEvent.changeText(passwordInput, 'TestPass123!');

    expect(getByTestId('password-strength-indicator')).toBeTruthy();
  });

  it('should show validation error for invalid email', async () => {
    const { getByTestId, getByText } = renderComponent();
    const emailInput = getByTestId('signup-email-input');
    const submitButton = getByTestId('signup-submit-button');

    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText(/please enter a valid email address/i)).toBeTruthy();
    });
  });

  it('should show error when passwords do not match', async () => {
    const { getByTestId, getByText } = renderComponent();
    const emailInput = getByTestId('signup-email-input');
    const passwordInput = getByTestId('signup-password-input');
    const confirmPasswordInput = getByTestId('signup-confirm-password-input');
    const submitButton = getByTestId('signup-submit-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'TestPass123!');
    fireEvent.changeText(confirmPasswordInput, 'DifferentPass123!');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText(/passwords must match/i)).toBeTruthy();
    });
  });

  it('should submit form with valid credentials', async () => {
    const { getByTestId } = renderComponent();
    const emailInput = getByTestId('signup-email-input');
    const passwordInput = getByTestId('signup-password-input');
    const confirmPasswordInput = getByTestId('signup-confirm-password-input');
    const submitButton = getByTestId('signup-submit-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'TestPass123!');
    fireEvent.changeText(confirmPasswordInput, 'TestPass123!');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockSignupThunk).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'TestPass123!',
      });
    });
  });

  it('should display success message after successful signup', async () => {
    const { getByTestId, getAllByText } = renderComponent();
    const emailInput = getByTestId('signup-email-input');
    const passwordInput = getByTestId('signup-password-input');
    const confirmPasswordInput = getByTestId('signup-confirm-password-input');
    const submitButton = getByTestId('signup-submit-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'TestPass123!');
    fireEvent.changeText(confirmPasswordInput, 'TestPass123!');
    fireEvent.press(submitButton);

    await waitFor(() => {
      const successMessages = getAllByText(/check your email/i);
      expect(successMessages.length).toBeGreaterThan(0);
    });
  });

  it('should display error message on signup failure', async () => {
    const { getByText } = renderComponent();

    // Mock signup failure - dispatch error to store
    await act(async () => {
      store.dispatch(setError('Email already in use'));
    });

    // Error should be displayed via AuthErrorMessage component
    await waitFor(() => {
      expect(getByText('Email already in use')).toBeTruthy();
    });
  });

  it('should have proper accessibility labels', () => {
    const { getByTestId } = renderComponent();
    const emailInput = getByTestId('signup-email-input');
    const passwordInput = getByTestId('signup-password-input');
    const confirmPasswordInput = getByTestId('signup-confirm-password-input');
    const submitButton = getByTestId('signup-submit-button');

    expect(emailInput.props.accessibilityLabel).toBeTruthy();
    expect(passwordInput.props.accessibilityLabel).toBeTruthy();
    expect(confirmPasswordInput.props.accessibilityLabel).toBeTruthy();
    expect(submitButton.props.accessibilityLabel).toBeTruthy();
  });

  it('should show success view after successful signup', async () => {
    const { getByTestId, queryByTestId } = renderComponent();
    const emailInput = getByTestId('signup-email-input');
    const passwordInput = getByTestId('signup-password-input');
    const confirmPasswordInput = getByTestId('signup-confirm-password-input');
    const submitButton = getByTestId('signup-submit-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'TestPass123!');
    fireEvent.changeText(confirmPasswordInput, 'TestPass123!');
    fireEvent.press(submitButton);

    // Form should be replaced with success message
    await waitFor(() => {
      expect(queryByTestId('signup-success-message')).toBeTruthy();
      expect(queryByTestId('signup-email-input')).toBeNull();
    });
  });

  it('should validate all required fields before submission', async () => {
    const { getByTestId, getAllByText } = renderComponent();
    const submitButton = getByTestId('signup-submit-button');

    // Try to submit empty form
    fireEvent.press(submitButton);

    await waitFor(() => {
      // Should show validation errors
      const errors = getAllByText(/required/i);
      expect(errors.length).toBeGreaterThan(0);
    });

    // signupThunk should not be called
    expect(mockSignupThunk).not.toHaveBeenCalled();
  });
});
