import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6B4EAC', // Purple - recovery/transformation
    secondary: '#4A90A4', // Teal - calm/serenity
    tertiary: '#88B04B', // Green - growth
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    background: '#FAFAFA',
    error: '#D32F2F',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
    onSurface: '#1C1C1C',
    onBackground: '#1C1C1C',
    onError: '#FFFFFF',
  },
  roundness: 12,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#9575CD', // Lighter purple for dark mode
    secondary: '#64B5CC', // Lighter teal for dark mode
    tertiary: '#AED581', // Lighter green for dark mode
    surface: '#1E1E1E',
    surfaceVariant: '#2C2C2C',
    background: '#121212',
    error: '#EF5350',
    onPrimary: '#FFFFFF',
    onSecondary: '#000000',
    onTertiary: '#000000',
    onSurface: '#E0E0E0',
    onBackground: '#E0E0E0',
    onError: '#FFFFFF',
  },
  roundness: 12,
};
