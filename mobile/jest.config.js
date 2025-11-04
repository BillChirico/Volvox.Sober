module.exports = {
  // Use jest-expo preset but override its problemat setupFiles
  ...require('jest-expo/jest-preset'),
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Critical: Override setupFiles to exclude React Native's ES module setup
  setupFiles: [],
  // Exclude E2E tests from unit test runs (use Detox for E2E)
  testPathIgnorePatterns: [
    '/node_modules/',
    '/e2e/',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|expo-status-bar|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@supabase/.*|react-native-paper|react-native-safe-area-context)',
  ],
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Mock react-native to avoid ES module imports
    '^react-native$': '<rootDir>/jest.setup.js',
  },
};
