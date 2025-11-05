import { Platform, AccessibilityInfo, PixelRatio } from 'react-native';

/**
 * Accessibility Utilities
 * Constants and helpers for WCAG AA compliance
 */

// Minimum touch target sizes (WCAG 2.1 Level AAA)
export const TOUCH_TARGET = {
  // iOS Human Interface Guidelines: 44x44pt minimum
  IOS_MIN: 44,
  // Android Material Design: 48x48dp minimum
  ANDROID_MIN: 48,
  // Recommended comfortable size
  COMFORTABLE: 48,
};

export const getTouchTargetSize = () => {
  return Platform.select({
    ios: TOUCH_TARGET.IOS_MIN,
    android: TOUCH_TARGET.ANDROID_MIN,
    default: TOUCH_TARGET.COMFORTABLE,
  });
};

/**
 * Ensures a given size meets minimum touch target requirements
 * @param size - The current size in points/dp
 * @returns The size, adjusted if below minimum
 */
export const ensureTouchTarget = (size: number): number => {
  const minSize = getTouchTargetSize();
  return Math.max(size, minSize);
};

/**
 * Get padding needed to meet touch target from content size
 * @param contentSize - Size of the actual content
 * @returns Padding needed on each side
 */
export const getTouchTargetPadding = (contentSize: number): number => {
  const minSize = getTouchTargetSize();
  if (contentSize >= minSize) return 0;
  return (minSize - contentSize) / 2;
};

// Font scaling utilities for Dynamic Type/Large Text support
export const FONT_SCALE = {
  MIN: 0.85, // Don't scale below 85%
  MAX: 2.0, // Don't scale above 200%
  DEFAULT: 1.0,
};

/**
 * Gets the current font scale from accessibility settings
 * Respects user's text size preferences
 */
export const getFontScale = (): number => {
  const scale = PixelRatio.getFontScale();
  return Math.max(FONT_SCALE.MIN, Math.min(scale, FONT_SCALE.MAX));
};

/**
 * Scales a font size based on accessibility settings
 * @param baseSize - The base font size
 * @returns Scaled font size
 */
export const scaleFontSize = (baseSize: number): number => {
  return baseSize * getFontScale();
};

/**
 * Checks if screen reader is currently enabled
 * @returns Promise resolving to true if screen reader is active
 */
export const isScreenReaderEnabled = async (): Promise<boolean> => {
  try {
    return await AccessibilityInfo.isScreenReaderEnabled();
  } catch (error) {
    console.error('Failed to check screen reader status:', error);
    return false;
  }
};

/**
 * Checks if bold text accessibility setting is enabled
 * @returns Promise resolving to true if bold text is enabled
 */
export const isBoldTextEnabled = async (): Promise<boolean> => {
  try {
    return await AccessibilityInfo.isBoldTextEnabled();
  } catch (error) {
    console.error('Failed to check bold text status:', error);
    return false;
  }
};

/**
 * Checks if grayscale is enabled (iOS only)
 * @returns Promise resolving to true if grayscale is enabled
 */
export const isGrayscaleEnabled = async (): Promise<boolean> => {
  if (Platform.OS !== 'ios') return false;
  try {
    return await AccessibilityInfo.isGrayscaleEnabled();
  } catch (error) {
    console.error('Failed to check grayscale status:', error);
    return false;
  }
};

/**
 * Checks if invert colors is enabled (iOS only)
 * @returns Promise resolving to true if invert colors is enabled
 */
export const isInvertColorsEnabled = async (): Promise<boolean> => {
  if (Platform.OS !== 'ios') return false;
  try {
    return await AccessibilityInfo.isInvertColorsEnabled();
  } catch (error) {
    console.error('Failed to check invert colors status:', error);
    return false;
  }
};

/**
 * Checks if reduced motion is enabled
 * @returns Promise resolving to true if reduced motion is enabled
 */
export const isReduceMotionEnabled = async (): Promise<boolean> => {
  try {
    return await AccessibilityInfo.isReduceMotionEnabled();
  } catch (error) {
    console.error('Failed to check reduce motion status:', error);
    return false;
  }
};

/**
 * Announces a message to screen readers
 * Useful for dynamic content updates
 * @param message - The message to announce
 */
export const announceForAccessibility = (message: string) => {
  AccessibilityInfo.announceForAccessibility(message);
};

/**
 * Sets keyboard focus to an element
 * @param reactTag - The native tag of the element to focus
 */
export const setAccessibilityFocus = (reactTag: number) => {
  AccessibilityInfo.setAccessibilityFocus(reactTag);
};

// Accessibility labels for common actions
export const A11Y_LABELS = {
  CLOSE: 'Close',
  BACK: 'Go back',
  NEXT: 'Next',
  PREVIOUS: 'Previous',
  SUBMIT: 'Submit',
  CANCEL: 'Cancel',
  SAVE: 'Save',
  DELETE: 'Delete',
  EDIT: 'Edit',
  SEARCH: 'Search',
  FILTER: 'Filter',
  SORT: 'Sort',
  REFRESH: 'Refresh',
  MORE: 'More options',
  LOADING: 'Loading',
};

// Accessibility hints for common patterns
export const A11Y_HINTS = {
  BUTTON: 'Double tap to activate',
  LINK: 'Double tap to open',
  SWITCH: 'Double tap to toggle',
  CHECKBOX: 'Double tap to check or uncheck',
  RADIO: 'Double tap to select',
  SLIDER: 'Swipe up or down to adjust',
  TAB: 'Double tap to switch tabs',
};

// Accessibility roles for semantic HTML elements
export const A11Y_ROLES = {
  BUTTON: 'button' as const,
  LINK: 'link' as const,
  SEARCH: 'search' as const,
  IMAGE: 'image' as const,
  KEY: 'key' as const,
  TEXT: 'text' as const,
  ADJUSTABLE: 'adjustable' as const,
  IMAGE_BUTTON: 'imagebutton' as const,
  HEADER: 'header' as const,
  SUMMARY: 'summary' as const,
  ALERT: 'alert' as const,
  CHECKBOX: 'checkbox' as const,
  COMBOBOX: 'combobox' as const,
  MENU: 'menu' as const,
  MENUBAR: 'menubar' as const,
  MENUITEM: 'menuitem' as const,
  PROGRESSBAR: 'progressbar' as const,
  RADIO: 'radio' as const,
  RADIOGROUP: 'radiogroup' as const,
  SCROLLBAR: 'scrollbar' as const,
  SPINBUTTON: 'spinbutton' as const,
  SWITCH: 'switch' as const,
  TAB: 'tab' as const,
  TABLIST: 'tablist' as const,
  TIMER: 'timer' as const,
  TOOLBAR: 'toolbar' as const,
};

export type AccessibilityRole = (typeof A11Y_ROLES)[keyof typeof A11Y_ROLES];
