import React, { useState, forwardRef } from 'react';
import { TextInput, useTheme, HelperText } from 'react-native-paper';
import { StyleSheet, View, ViewStyle, StyleProp, TextInput as RNTextInput } from 'react-native';

export interface PasswordInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
  disabled?: boolean;
  onBlur?: () => void | Promise<void> | boolean | Promise<boolean>;
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * PasswordInput component with visibility toggle
 *
 * Features:
 * - Toggle password visibility with eye icon
 * - Theme support (light/dark mode)
 * - WCAG 2.1 AA compliant
 * - Accessibility labels and hints
 * - Supports ref forwarding for focus management
 * - Enter key submission support
 *
 * @example
 * ```tsx
 * <PasswordInput
 *   label="Password"
 *   value={password}
 *   onChangeText={setPassword}
 *   error={!!errors.password}
 *   helperText={errors.password}
 *   onSubmitEditing={handleSubmit}
 *   returnKeyType="done"
 * />
 * ```
 */
const PasswordInput = forwardRef<RNTextInput, PasswordInputProps>(
  (
    {
      label,
      value,
      onChangeText,
      error = false,
      helperText,
      placeholder,
      disabled = false,
      onBlur,
      onSubmitEditing,
      returnKeyType,
      testID = 'password-input',
      accessibilityLabel,
      accessibilityHint,
      style,
    },
    ref,
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const theme = useTheme();

<<<<<<< Updated upstream
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(prev => !prev);
  };

  const iconName = isPasswordVisible ? 'eye-off' : 'eye';
  const toggleAccessibilityLabel = isPasswordVisible ? 'Hide password' : 'Show password';
  const toggleAccessibilityHint = isPasswordVisible
    ? 'Double tap to hide your password'
    : 'Double tap to show your password';

  return (
    <View style={[styles.container, style]}>
      <TextInput
        testID={testID}
        label={label}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        secureTextEntry={!isPasswordVisible}
        error={error}
        disabled={disabled}
        placeholder={placeholder}
        mode="outlined"
        accessibilityLabel={accessibilityLabel || label}
        accessibilityHint={accessibilityHint}
        editable={!disabled}
        right={
          <TextInput.Icon
            icon={iconName}
            onPress={togglePasswordVisibility}
            disabled={disabled}
            forceTextInputFocus={false}
            testID="password-toggle-button"
            accessibilityLabel={toggleAccessibilityLabel}
            accessibilityHint={toggleAccessibilityHint}
            accessibilityRole="button"
          />
        }
        style={[styles.input, { backgroundColor: theme.colors.surface }]}
      />
      {helperText && (
        <HelperText type={error ? 'error' : 'info'} visible={!!helperText}>
          {helperText}
        </HelperText>
      )}
    </View>
  );
};
=======
    const togglePasswordVisibility = () => {
      setIsPasswordVisible(prev => !prev);
    };

    const iconName = isPasswordVisible ? 'eye-off' : 'eye';
    const toggleAccessibilityLabel = isPasswordVisible ? 'Hide password' : 'Show password';
    const toggleAccessibilityHint = isPasswordVisible
      ? 'Double tap to hide your password'
      : 'Double tap to show your password';

    return (
      <View style={[styles.container, style]}>
        <TextInput
          ref={ref}
          testID={testID}
          label={label}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          secureTextEntry={!isPasswordVisible}
          error={error}
          disabled={disabled}
          placeholder={placeholder}
          mode="outlined"
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint}
          editable={!disabled}
          right={
            <TextInput.Icon
              icon={iconName}
              onPress={togglePasswordVisibility}
              disabled={disabled}
              forceTextInputFocus={false}
              testID="password-toggle-button"
              accessibilityLabel={toggleAccessibilityLabel}
              accessibilityHint={toggleAccessibilityHint}
              accessibilityRole="button"
            />
          }
          style={[styles.input, { backgroundColor: theme.colors.surface }]}
        />
        {helperText && (
          <HelperText type={error ? 'error' : 'info'} visible={!!helperText}>
            {helperText}
          </HelperText>
        )}
      </View>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
>>>>>>> Stashed changes

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    fontSize: 16,
  },
  helperText: {
    marginTop: 4,
    fontSize: 12,
  },
});

export default PasswordInput;
