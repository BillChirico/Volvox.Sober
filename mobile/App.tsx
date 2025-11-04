import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeContext';
import { store } from './src/store';

// Placeholder content - will be replaced with actual navigation
import { View, Text, StyleSheet } from 'react-native';

const AppContent = () => {
  const { theme, isDark } = useAppTheme();

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <Text style={{ color: theme.colors.onBackground }}>
            Volvox.Sober - Recovery Platform
          </Text>
          <Text style={{ color: theme.colors.onBackground, marginTop: 8 }}>
            Theme: {isDark ? 'Dark' : 'Light'}
          </Text>
          <StatusBar style={isDark ? 'light' : 'dark'} />
        </View>
      </SafeAreaProvider>
    </PaperProvider>
  );
};

export default function App() {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ReduxProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
