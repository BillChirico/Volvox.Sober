import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import PasswordInput from '../../../src/components/auth/PasswordInput';

describe('PasswordInput', () => {
  const renderComponent = (props = {}) => {
    return render(
      <PaperProvider>
        <PasswordInput
          label="Password"
          value=""
          onChangeText={jest.fn()}
          {...props}
        />
      </PaperProvider>
    );
  };

  it('should render password input field', () => {
    const { getByTestId } = renderComponent();
    const input = getByTestId('password-input');
    expect(input).toBeTruthy();
  });

  it('should initially show password as hidden (secureTextEntry)', () => {
    const { getByTestId } = renderComponent();
    const input = getByTestId('password-input');
    expect(input.props.secureTextEntry).toBe(true);
  });

  it('should toggle password visibility when eye icon is pressed', () => {
    const { getByTestId } = renderComponent();
    const toggleButton = getByTestId('password-toggle-button');
    const input = getByTestId('password-input');

    // Initially hidden
    expect(input.props.secureTextEntry).toBe(true);

    // Press toggle button
    fireEvent.press(toggleButton);

    // Should now be visible
    expect(input.props.secureTextEntry).toBe(false);

    // Press again
    fireEvent.press(toggleButton);

    // Should be hidden again
    expect(input.props.secureTextEntry).toBe(true);
  });

  it('should call onChangeText when text changes', () => {
    const onChangeText = jest.fn();
    const { getByTestId } = renderComponent({ onChangeText });
    const input = getByTestId('password-input');

    fireEvent.changeText(input, 'MyPassword123');

    expect(onChangeText).toHaveBeenCalledWith('MyPassword123');
  });

  it('should display error message when error prop is provided', () => {
    const { getByText } = renderComponent({
      error: true,
      helperText: 'Password is required',
    });

    expect(getByText('Password is required')).toBeTruthy();
  });

  it('should apply error styling when error prop is true', () => {
    const { getByTestId } = renderComponent({
      error: true,
      helperText: 'Invalid password',
    });
    const input = getByTestId('password-input');

    expect(input.props.error).toBe(true);
  });

  it('should have proper accessibility labels', () => {
    const { getByTestId } = renderComponent();
    const input = getByTestId('password-input');
    const toggleButton = getByTestId('password-toggle-button');

    expect(input.props.accessibilityLabel).toBe('Password');
    expect(toggleButton.props.accessibilityLabel).toBeTruthy();
    expect(toggleButton.props.accessibilityHint).toBeTruthy();
  });

  it('should show "eye" icon when password is hidden', () => {
    const { getByTestId } = renderComponent();
    const toggleButton = getByTestId('password-toggle-button');

    // Icon name should be "eye" when password is hidden
    // Note: children is an array in the test renderer
    const iconElement = Array.isArray(toggleButton.props.children)
      ? toggleButton.props.children[0]
      : toggleButton.props.children;
    expect(iconElement.props.icon).toBe('eye');
  });

  it('should show "eye-off" icon when password is visible', () => {
    const { getByTestId } = renderComponent();
    const toggleButton = getByTestId('password-toggle-button');

    // Press to show password
    fireEvent.press(toggleButton);

    // Icon should change to "eye-off"
    // Note: children is an array in the test renderer
    const iconElement = Array.isArray(toggleButton.props.children)
      ? toggleButton.props.children[0]
      : toggleButton.props.children;
    expect(iconElement.props.icon).toBe('eye-off');
  });

  it('should support custom placeholder text', () => {
    const { getByTestId } = renderComponent({
      placeholder: 'Enter your password',
    });
    const input = getByTestId('password-input');

    expect(input.props.placeholder).toBe('Enter your password');
  });

  it('should support disabled state', () => {
    const { getByTestId } = renderComponent({ disabled: true });
    const input = getByTestId('password-input');

    expect(input.props.editable).toBe(false);
  });

  it('should handle onBlur callback', () => {
    const onBlur = jest.fn();
    const { getByTestId } = renderComponent({ onBlur });
    const input = getByTestId('password-input');

    fireEvent(input, 'blur');

    expect(onBlur).toHaveBeenCalled();
  });
});
