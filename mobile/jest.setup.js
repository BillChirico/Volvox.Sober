// Mock Expo SecureStore
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock React Native AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn(),
    multiGet: jest.fn(),
    multiSet: jest.fn(),
    multiRemove: jest.fn(),
  },
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock React Native DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

// Mock Redux Persist
jest.mock('redux-persist', () => {
  const actual = jest.requireActual('redux-persist');
  return {
    ...actual,
    persistReducer: jest.fn().mockImplementation((config, reducer) => reducer),
    persistStore: jest.fn(() => ({
      purge: jest.fn(),
      flush: jest.fn(),
      pause: jest.fn(),
      persist: jest.fn(),
    })),
  };
});

// Mock React Native Reanimated
global.__reanimatedWorkletInit = jest.fn();
