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

// Mock __DEV__ global for React Native
global.__DEV__ = true;

// Mock Supabase Client - Global mock for all tests
jest.mock('./src/services/supabase', () => ({
  __esModule: true,
  default: {
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      like: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn(),
      maybeSingle: jest.fn(),
    })),
  },
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
    key: 'test',
    name: 'Test',
  }),
  useFocusEffect: jest.fn(),
  useIsFocused: () => true,
  NavigationContainer: ({ children }) => children,
  createNavigationContainerRef: () => ({ current: null }),
}));

// Mock Expo Status Bar
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

// Mock Expo Constants
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        supabaseUrl: 'https://test.supabase.co',
        supabaseAnonKey: 'test-anon-key',
      },
    },
  },
  Constants: {
    expoConfig: {
      extra: {
        supabaseUrl: 'https://test.supabase.co',
        supabaseAnonKey: 'test-anon-key',
      },
    },
  },
}));

// Mock React Native Community NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

// Mock React Native Paper
jest.mock('react-native-paper', () => {
  const React = require('react');
  const RN = require('react-native');

  // Mock Icon component that preserves the icon prop for testing
  const MockIconElement = (iconProps) => {
    return React.createElement(RN.View, { ...iconProps, testID: 'icon-element' });
  };

  const MockTextInputIcon = (props) => {
    return React.createElement(RN.TouchableOpacity, {
      testID: props.testID,
      accessibilityLabel: props.accessibilityLabel,
      accessibilityHint: props.accessibilityHint,
      accessibilityRole: props.accessibilityRole,
      onPress: props.onPress,
      disabled: props.disabled,
      children: React.createElement(MockIconElement, { icon: props.icon }),
    });
  };

  const MockTextInput = React.forwardRef((props, ref) => {
    return React.createElement(
      RN.View,
      {},
      React.createElement(RN.TextInput, { ...props, ref }),
      props.right
    );
  });

  MockTextInput.Icon = MockTextInputIcon;

  return {
    Provider: ({ children }) => children,
    TextInput: MockTextInput,
    Text: (props) =>
      React.createElement(RN.Text, {
        ...props,
        children: props.children,
      }),
    Button: (props) =>
      React.createElement(RN.TouchableOpacity, {
        ...props,
        testID: props.testID,
        disabled: props.disabled,
      }),
    IconButton: (props) =>
      React.createElement(RN.TouchableOpacity, {
        ...props,
        testID: props.testID,
        onPress: props.onPress,
      }),
    HelperText: (props) =>
      React.createElement(RN.Text, {
        ...props,
        children: props.children,
      }),
    Portal: ({ children }) => children,
    Dialog: 'Dialog',
    Paragraph: 'Paragraph',
    useTheme: () => ({
      colors: {
        primary: '#6200ee',
        background: '#ffffff',
        surface: '#ffffff',
        error: '#B00020',
        text: '#000000',
        onSurface: '#000000',
        disabled: 'rgba(0, 0, 0, 0.26)',
        placeholder: 'rgba(0, 0, 0, 0.54)',
        backdrop: 'rgba(0, 0, 0, 0.5)',
        notification: '#f50057',
      },
      roundness: 4,
    }),
    DefaultTheme: {
      colors: {
        primary: '#6200ee',
        background: '#ffffff',
        surface: '#ffffff',
        error: '#B00020',
        text: '#000000',
        onSurface: '#000000',
        disabled: 'rgba(0, 0, 0, 0.26)',
        placeholder: 'rgba(0, 0, 0, 0.54)',
        backdrop: 'rgba(0, 0, 0, 0.5)',
        notification: '#f50057',
      },
    },
  };
});