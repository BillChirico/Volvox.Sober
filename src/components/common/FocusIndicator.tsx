import React, { useState } from 'react';
import { Pressable, PressableProps } from 'react-native';
import { useTheme } from 'react-native-paper';

interface FocusIndicatorProps extends PressableProps {
  /**
   * Children to render inside the focusable area
   */
  children: React.ReactNode;
  /**
   * Whether to show focus indicator
   * @default true
   */
  showFocusIndicator?: boolean;
  /**
   * Custom focus indicator color
   * If not provided, uses theme primary color
   */
  focusColor?: string;
  /**
   * Focus indicator width
   * @default 2
   */
  focusWidth?: number;
  /**
   * Focus indicator border radius
   * @default 8
   */
  focusRadius?: number;
}

/**
 * Focus Indicator Component
 * Provides visible focus indication for keyboard navigation
 * WCAG 2.1 Level AA requires visible focus indicators
 */
export const FocusIndicator: React.FC<FocusIndicatorProps> = ({
  children,
  showFocusIndicator = true,
  focusColor,
  focusWidth = 2,
  focusRadius = 8,
  style,
  onFocus,
  onBlur,
  ...rest
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const effectiveFocusColor = focusColor || theme.colors.primary;

  const handleFocus = (event: any) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: any) => {
    setIsFocused(false);
    onBlur?.(event);
  };

  return (
    <Pressable
      {...rest}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={[
        style,
        showFocusIndicator &&
          isFocused && {
            borderWidth: focusWidth,
            borderColor: effectiveFocusColor,
            borderRadius: focusRadius,
            shadowColor: effectiveFocusColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          },
      ]}
      // Enhanced accessibility for keyboard navigation
      accessibilityState={{ focused: isFocused }}
      focusable={true}>
      {children}
    </Pressable>
  );
};

export default FocusIndicator;
