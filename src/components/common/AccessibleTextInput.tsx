import React from 'react';
import { TextInput, TextInputProps, HelperText } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { getTouchTargetSize } from '../../utils/accessibility';

interface AccessibleTextInputProps extends Omit<TextInputProps, 'theme'> {
  /**
   * Accessibility label for screen readers
   * If not provided, uses the label prop
   */
  accessibilityLabel?: string;
  /**
   * Accessibility hint to describe the input's purpose
   */
  accessibilityHint?: string;
  /**
   * Error message to display and announce
   */
  errorText?: string;
  /**
   * Whether the input is required
   */
  required?: boolean;
}

/**
 * Accessible Text Input Component
 * Automatically ensures WCAG compliance:
 * - Minimum touch target size (44x44pt iOS, 48x48dp Android)
 * - Proper accessibility labels and hints
 * - Error announcements for screen readers
 * - Required field indication
 */
export const AccessibleTextInput: React.FC<AccessibleTextInputProps> = ({
  accessibilityLabel,
  accessibilityHint,
  errorText,
  required,
  label,
  error,
  style,
  ...rest
}) => {
  const minTouchTarget = getTouchTargetSize();

  const effectiveLabel = label ? `${label}${required ? ' (required)' : ''}` : undefined;
  const effectiveAccessibilityLabel = accessibilityLabel || effectiveLabel;

  return (
    <View style={styles.container}>
      <TextInput
        {...rest}
        label={effectiveLabel}
        error={error || !!errorText}
        style={[{ minHeight: minTouchTarget }, style]}
        accessibilityLabel={effectiveAccessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRequired={required}
        accessibilityInvalid={error || !!errorText}
        // Announce errors to screen readers
        accessibilityLiveRegion={errorText ? 'polite' : 'none'}
      />
      {errorText && (
        <HelperText
          type="error"
          visible={true}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive">
          {errorText}
        </HelperText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
});

export default AccessibleTextInput;
