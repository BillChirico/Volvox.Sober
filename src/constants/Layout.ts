import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Layout constants and utilities for responsive design
 */

export const Layout = {
  // Screen dimensions
  window: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },

  // Breakpoints (following Material Design guidelines)
  isSmallDevice: SCREEN_WIDTH < 375,
  isMediumDevice: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 768,
  isLargeDevice: SCREEN_WIDTH >= 768,

  // Platform-specific values
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  isWeb: Platform.OS === 'web',

  // Spacing scale (8pt grid system)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border radius
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  // Safe area insets (approximate)
  safeArea: {
    top: Platform.select({ ios: 44, android: 0, default: 0 }),
    bottom: Platform.select({ ios: 34, android: 0, default: 0 }),
  },

  // Tab bar height
  tabBarHeight: Platform.select({
    ios: 90, // 60 + 30 (safe area bottom)
    android: 60,
    default: 60,
  }),

  // Header height
  headerHeight: Platform.select({
    ios: 44,
    android: 56,
    default: 64,
  }),
} as const;

/**
 * Helper function to calculate responsive sizes
 */
export const scale = (size: number): number => {
  const guidelineBaseWidth = 375; // iPhone SE width
  return (SCREEN_WIDTH / guidelineBaseWidth) * size;
};

/**
 * Helper function to calculate vertical responsive sizes
 */
export const verticalScale = (size: number): number => {
  const guidelineBaseHeight = 812; // iPhone X height
  return (SCREEN_HEIGHT / guidelineBaseHeight) * size;
};

/**
 * Helper function for moderate scaling (responsive but less aggressive)
 */
export const moderateScale = (size: number, factor = 0.5): number => {
  return size + (scale(size) - size) * factor;
};
