import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, AccessibilityRole } from 'react-native';
import { extractTextContent } from '../utils/extractTextContent';

export interface AccessibleButtonProps extends TouchableOpacityProps {
  /**
   * Accessibility label for screen readers.
   * If not provided, will attempt to extract text from children.
   * WARNING: Icon-only buttons MUST provide an explicit accessibilityLabel.
   */
  accessibilityLabel?: string;

  /**
   * Hint that describes the result of performing an action on the element.
   * Read by screen readers after the accessibilityLabel.
   */
  accessibilityHint?: string;

  /**
   * Accessibility role for the button.
   * Defaults to 'button'.
   */
  accessibilityRole?: AccessibilityRole;

  /**
   * Children to render inside the button.
   */
  children?: React.ReactNode;
}

/**
 * Accessible button component that properly handles accessibility labels.
 *
 * This component solves the common bug where String(children) produces
 * "[object Object]" when children contain React elements like icons.
 *
 * Key features:
 * - Automatically extracts text from Text node children
 * - Prevents "[object Object]" accessibility labels
 * - Requires explicit label for icon-only buttons
 * - Follows React Native accessibility best practices
 *
 * @example
 * // String children - label automatically extracted
 * <AccessibleButton onPress={handleSubmit}>
 *   Submit
 * </AccessibleButton>
 *
 * @example
 * // Text component children - text automatically extracted
 * <AccessibleButton onPress={handleDelete}>
 *   <Text>Delete</Text>
 * </AccessibleButton>
 *
 * @example
 * // Icon-only - MUST provide explicit label
 * <AccessibleButton
 *   accessibilityLabel="Send message"
 *   onPress={handleSend}
 * >
 *   <SendIcon />
 * </AccessibleButton>
 *
 * @example
 * // Complex children - text extracted recursively
 * <AccessibleButton onPress={handleEdit}>
 *   <View>
 *     <Text>Edit</Text>
 *     <Text>Item</Text>
 *   </View>
 * </AccessibleButton>
 */
export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  ...props
}) => {
  // Use explicit label if provided, otherwise extract from children
  const label = accessibilityLabel || extractTextContent(children);

  // Warn in development if no label could be determined
  if (__DEV__ && !label) {
    console.warn(
      'AccessibleButton: No accessibility label found. ' +
        'For icon-only buttons, please provide an explicit accessibilityLabel prop.',
    );
  }

  return (
    <TouchableOpacity
      accessible={true}
      accessibilityLabel={label || undefined}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      {...props}>
      {children}
    </TouchableOpacity>
  );
};
