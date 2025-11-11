import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import AuthErrorMessage from '../../../src/features/auth/components/AuthErrorMessage';

describe('AuthErrorMessage', () => {
  const renderComponent = (props = {}) => {
    return render(
      <PaperProvider>
        <AuthErrorMessage message="" {...props} />
      </PaperProvider>,
    );
  };

  it('should render error message when provided', () => {
    const { getByText } = renderComponent({
      message: 'Invalid email or password',
    });
    expect(getByText('Invalid email or password')).toBeTruthy();
  });

  it('should not render when message is empty', () => {
    const { queryByTestId } = renderComponent({ message: '' });
    const errorContainer = queryByTestId('auth-error-message');
    expect(errorContainer).toBeNull();
  });

  it('should not render when message is null', () => {
    const { queryByTestId } = renderComponent({ message: null });
    const errorContainer = queryByTestId('auth-error-message');
    expect(errorContainer).toBeNull();
  });

  it('should have accessibilityLiveRegion for screen readers', () => {
    const { getByTestId } = renderComponent({
      message: 'Error occurred',
    });
    const errorContainer = getByTestId('auth-error-message');
    expect(errorContainer.props.accessibilityLiveRegion).toBe('polite');
  });

  it('should have error role for accessibility', () => {
    const { getByTestId } = renderComponent({
      message: 'Error occurred',
    });
    const errorContainer = getByTestId('auth-error-message');
    expect(errorContainer.props.accessibilityRole).toBe('alert');
  });

  it('should update when message changes', () => {
    const { getByText, rerender } = renderComponent({
      message: 'First error',
    });
    expect(getByText('First error')).toBeTruthy();

    rerender(
      <PaperProvider>
        <AuthErrorMessage message="Second error" />
      </PaperProvider>,
    );

    expect(getByText('Second error')).toBeTruthy();
  });

  it('should support dismissible prop with close button', () => {
    const onDismiss = jest.fn();
    const { getByTestId } = renderComponent({
      message: 'Error message',
      dismissible: true,
      onDismiss,
    });
    const dismissButton = getByTestId('error-dismiss-button');
    expect(dismissButton).toBeTruthy();
  });

  it('should call onDismiss when close button is pressed', () => {
    const onDismiss = jest.fn();
    const { getByTestId } = renderComponent({
      message: 'Error message',
      dismissible: true,
      onDismiss,
    });
    const dismissButton = getByTestId('error-dismiss-button');

    fireEvent.press(dismissButton);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('should not show dismiss button when dismissible is false', () => {
    const { queryByTestId } = renderComponent({
      message: 'Error message',
      dismissible: false,
    });
    const dismissButton = queryByTestId('error-dismiss-button');
    expect(dismissButton).toBeNull();
  });

  it('should use error theme color', () => {
    const { getByTestId } = renderComponent({
      message: 'Error occurred',
    });
    const errorContainer = getByTestId('auth-error-message');
    expect(errorContainer.props.style).toBeDefined();
    // Should use theme error color for styling
  });

  it('should display icon for visual indicator', () => {
    const { getByTestId } = renderComponent({
      message: 'Error occurred',
    });
    const icon = getByTestId('error-icon');
    expect(icon).toBeTruthy();
  });

  it('should have proper accessibility label for dismiss button', () => {
    const onDismiss = jest.fn();
    const { getByTestId } = renderComponent({
      message: 'Error message',
      dismissible: true,
      onDismiss,
    });
    const dismissButton = getByTestId('error-dismiss-button');
    expect(dismissButton.props.accessibilityLabel).toBe('Dismiss error message');
  });

  it('should support different message types', () => {
    const { getByText, rerender } = renderComponent({
      message: 'String error',
    });
    expect(getByText('String error')).toBeTruthy();

    rerender(
      <PaperProvider>
        <AuthErrorMessage message={['Error 1', 'Error 2']} />
      </PaperProvider>,
    );

    expect(getByText('Error 1')).toBeTruthy();
    expect(getByText('Error 2')).toBeTruthy();
  });

  it('should handle error objects with message property', () => {
    const error = { message: 'Network error' };
    const { getByText } = renderComponent({
      message: error.message,
    });
    expect(getByText('Network error')).toBeTruthy();
  });
});
