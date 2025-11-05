import React, { useState } from 'react';
import { TextInput, useTheme, HelperText } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

export interface PasswordInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
  disabled?: boolean;
  onBlur?: () => void;
  testID?: string;
}

/**
 * PasswordInput component with visibility toggle
 *
 * Features:
 * - Toggle password visibility with eye icon
 * - Theme support (light/dark mode)
 * - WCAG 2.1 AA compliant
 * - Accessibility labels and hints
 *
 * @example
 * ```tsx
 * <PasswordInput
 *   label="Password"
 *   value={password}
 *   onChangeText={setPassword}
 *   error={!!errors.password}
 *   helperText={errors.password}
 * />
 * ```
 */
const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  onChangeText,
  error = false,
  helperText,
  placeholder,
  disabled = false,
  onBlur,
  testID = 'password-input',
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const theme = useTheme();

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const iconName = isPasswordVisible ? 'eye-off' : 'eye';
  const accessibilityLabel = isPasswordVisible
    ? 'Hide password'
    : 'Show password';
  const accessibilityHint = isPasswordVisible
    ? 'Double tap to hide your password'
    : 'Double tap to show your password';

  return (
    <View style={styles.container}>
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
        accessibilityLabel={label}
        editable={!disabled}
        right={
          <TextInput.Icon
            icon={iconName}
            onPress={togglePasswordVisibility}
            disabled={disabled}
            forceTextInputFocus={false}
            testID="password-toggle-button"
            accessibilityLabel={accessibilityLabel}
            accessibilityHint={accessibilityHint}
            accessibilityRole="button"
          />
        }
        style={[
          styles.input,
          { backgroundColor: theme.colors.surface },
        ]}
      />
      {helperText && (
        <HelperText type={error ? 'error' : 'info'} visible={!!helperText}>
          {helperText}
        </HelperText>
      )}
    </View>
  );
};

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
