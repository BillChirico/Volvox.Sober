import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import {
  calculatePasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthLabel,
  type PasswordStrengthResult,
} from '../../utils/passwordStrength';

export interface PasswordStrengthProps {
  password: string;
  visible?: boolean;
}

/**
 * PasswordStrength component with colored bar indicator
 *
 * Features:
 * - Real-time password strength calculation
 * - Colored bar indicator (red/orange/green)
 * - Accessibility labels and hints
 * - Feedback messages for improvement
 *
 * @example
 * ```tsx
 * <PasswordStrength
 *   password={password}
 *   visible={password.length > 0}
 * />
 * ```
 */
const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
  visible = true,
}) => {
  const theme = useTheme();

  // Calculate password strength
  const strengthResult: PasswordStrengthResult = useMemo(
    () => calculatePasswordStrength(password),
    [password]
  );

  const { strength, score, feedback } = strengthResult;
  const strengthLabel = getPasswordStrengthLabel(strength);
  const strengthColor = getPasswordStrengthColor(strength);

  // Calculate bar width as percentage (score is 0-100)
  const barWidth = `${score}%`;

  // Accessibility label
  const accessibilityLabel = `Password strength: ${strengthLabel}. ${feedback.join('. ')}`;

  if (!visible) {
    return null;
  }

  return (
    <View
      style={styles.container}
      testID="password-strength-indicator"
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessible={true}
    >
      {/* Strength label */}
      <View style={styles.labelContainer}>
        <Text
          style={[
            styles.label,
            { color: theme.colors.onSurface },
          ]}
          variant="bodySmall"
        >
          Password Strength:
        </Text>
        <Text
          style={[
            styles.strengthLabel,
            { color: strengthColor },
          ]}
          variant="bodySmall"
        >
          {strengthLabel}
        </Text>
      </View>

      {/* Strength bar */}
      <View style={[styles.barBackground, { backgroundColor: theme.colors.surfaceVariant }]}>
        <View
          testID="password-strength-bar"
          style={[
            styles.bar,
            {
              width: barWidth,
              backgroundColor: strengthColor,
            },
          ]}
        />
      </View>

      {/* Feedback messages */}
      {feedback.length > 0 && (
        <View style={styles.feedbackContainer}>
          {feedback.map((message, index) => (
            <Text
              key={index}
              style={[
                styles.feedbackText,
                { color: theme.colors.onSurfaceVariant },
              ]}
              variant="bodySmall"
            >
              • {message}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  barBackground: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },
  feedbackContainer: {
    marginTop: 8,
  },
  feedbackText: {
    fontSize: 11,
    lineHeight: 16,
  },
});

export default PasswordStrength;
