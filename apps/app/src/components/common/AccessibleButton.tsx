import React from 'react';
import { Button, ButtonProps } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { getTouchTargetSize } from '../../utils/accessibility';

interface AccessibleButtonProps extends ButtonProps {
  /**
   * Accessibility label for screen readers
   * If not provided, uses the button's children text
   */
  accessibilityLabel?: string;
  /**
   * Accessibility hint to describe what happens when activated
   */
  accessibilityHint?: string;
  /**
   * Whether to enforce minimum touch target size
   * @default true
   */
  enforceMinTouchTarget?: boolean;
}

/**
 * Accessible Button Component
 * Automatically ensures WCAG compliance:
 * - Minimum touch target size (44x44pt iOS, 48x48dp Android)
 * - Proper accessibility labels
 * - Screen reader support
 */
export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  accessibilityLabel,
  accessibilityHint,
  enforceMinTouchTarget = true,
  children,
  style,
  contentStyle,
  ...rest
}) => {
  const minTouchTarget = getTouchTargetSize();

  return (
    <View
      style={[
        enforceMinTouchTarget && styles.touchTargetWrapper,
        { minHeight: minTouchTarget },
      ]}
    >
      <Button
        {...rest}
        style={[enforceMinTouchTarget && { minHeight: minTouchTarget }, style]}
        contentStyle={[
          enforceMinTouchTarget && { minHeight: minTouchTarget },
          contentStyle,
        ]}
        accessibilityLabel={accessibilityLabel || String(children)}
        accessibilityHint={accessibilityHint || 'Double tap to activate'}
        accessibilityRole="button"
      >
        {children}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  touchTargetWrapper: {
    justifyContent: 'center',
  },
});

export default AccessibleButton;
