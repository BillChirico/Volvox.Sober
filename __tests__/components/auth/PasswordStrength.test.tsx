import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import PasswordStrength from '../../../src/components/auth/PasswordStrength';

describe('PasswordStrength', () => {
  const renderComponent = (props = {}) => {
    return render(
      <PaperProvider>
        <PasswordStrength password="" {...props} />
      </PaperProvider>
    );
  };

  it('should render password strength indicator', () => {
    const { getByTestId } = renderComponent();
    const indicator = getByTestId('password-strength-indicator');
    expect(indicator).toBeTruthy();
  });

  it('should show weak strength for empty password', () => {
    const { getByText } = renderComponent({ password: '' });
    expect(getByText('Weak')).toBeTruthy();
  });

  it('should show weak strength for short password', () => {
    const { getByText } = renderComponent({ password: 'abc' });
    expect(getByText('Weak')).toBeTruthy();
  });

  it('should show medium strength for moderate password', () => {
    const { getByText } = renderComponent({ password: 'Abcd1234' });
    expect(getByText('Medium')).toBeTruthy();
  });

  it('should show strong strength for complex password', () => {
    const { getByText } = renderComponent({ password: 'Abcd1234!@#$' });
    expect(getByText('Strong')).toBeTruthy();
  });

  it('should display colored bar based on strength', () => {
    const { getByTestId } = renderComponent({ password: 'Abcd1234!@#$' });
    const bar = getByTestId('password-strength-bar');
    expect(bar).toBeTruthy();
    // Bar should have some width based on strength
    expect(bar.props.style).toBeDefined();
  });

  it('should update strength when password changes', () => {
    const { getByText, rerender } = renderComponent({ password: 'weak' });
    expect(getByText('Weak')).toBeTruthy();

    rerender(
      <PaperProvider>
        <PasswordStrength password="Abcd1234!@#$" />
      </PaperProvider>
    );

    expect(getByText('Strong')).toBeTruthy();
  });

  it('should display feedback messages', () => {
    const { getByText } = renderComponent({ password: 'abc' });
    // Should show at least one feedback message for weak password
    expect(
      getByText(/password should be at least 8 characters/i) ||
        getByText(/add uppercase letters/i) ||
        getByText(/add numbers/i)
    ).toBeTruthy();
  });

  it('should use correct color for weak password', () => {
    const { getByTestId } = renderComponent({ password: 'abc' });
    const bar = getByTestId('password-strength-bar');
    // Weak = Red (#F44336)
    const styles = Array.isArray(bar.props.style) ? bar.props.style : [bar.props.style];
    const styleWithColor = styles.find((s: any) => s && s.backgroundColor);
    expect(styleWithColor).toBeDefined();
    expect(styleWithColor.backgroundColor).toBe('#F44336');
  });

  it('should use correct color for medium password', () => {
    const { getByTestId } = renderComponent({ password: 'Abcd1234' });
    const bar = getByTestId('password-strength-bar');
    // Medium = Orange (#FF9800)
    const styles = Array.isArray(bar.props.style) ? bar.props.style : [bar.props.style];
    const styleWithColor = styles.find((s: any) => s && s.backgroundColor);
    expect(styleWithColor).toBeDefined();
    expect(styleWithColor.backgroundColor).toBe('#FF9800');
  });

  it('should use correct color for strong password', () => {
    const { getByTestId } = renderComponent({ password: 'Abcd1234!@#$' });
    const bar = getByTestId('password-strength-bar');
    // Strong = Green (#4CAF50)
    const styles = Array.isArray(bar.props.style) ? bar.props.style : [bar.props.style];
    const styleWithColor = styles.find((s: any) => s && s.backgroundColor);
    expect(styleWithColor).toBeDefined();
    expect(styleWithColor.backgroundColor).toBe('#4CAF50');
  });

  it('should have accessibility label', () => {
    const { getByTestId } = renderComponent({ password: 'Abcd1234' });
    const indicator = getByTestId('password-strength-indicator');
    expect(indicator.props.accessibilityLabel).toBeTruthy();
    expect(indicator.props.accessibilityLabel).toContain('Password strength');
  });

  it('should update accessibility label based on strength', () => {
    const { getByTestId } = renderComponent({ password: 'Abcd1234!@#$' });
    const indicator = getByTestId('password-strength-indicator');
    expect(indicator.props.accessibilityLabel).toContain('Strong');
  });

  it('should support optional visibility prop', () => {
    const { queryByTestId } = renderComponent({
      password: 'test',
      visible: false,
    });
    const indicator = queryByTestId('password-strength-indicator');
    // Component returns null when visible=false
    expect(indicator).toBeNull();
  });

  it('should calculate strength score correctly', () => {
    const { getByTestId } = renderComponent({ password: 'Abcd1234!@#$' });
    const bar = getByTestId('password-strength-bar');
    // Strong password should have width close to 100%
    const styles = Array.isArray(bar.props.style) ? bar.props.style : [bar.props.style];
    const styleWithWidth = styles.find((s: any) => s && s.width);
    expect(styleWithWidth).toBeDefined();
    expect(styleWithWidth.width).toBeDefined();
    // Width should be a percentage string
    expect(typeof styleWithWidth.width).toBe('string');
    expect(styleWithWidth.width).toMatch(/%$/);
  });
});
