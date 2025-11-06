import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Card,
  List,
  RadioButton,
  Text,
  useTheme,
  Surface,
  Icon,
  ActivityIndicator,
} from 'react-native-paper';
import { useAppTheme } from '../../theme/ThemeContext';
import type { ThemeMode } from '../../theme';

const ThemeSettingsScreen = () => {
  const paperTheme = useTheme();
  const { themeMode, setThemeMode, isDark } = useAppTheme();
  const [isChanging, setIsChanging] = useState(false);

  const handleThemeChange = async (mode: ThemeMode) => {
    setIsChanging(true);
    try {
      await setThemeMode(mode);
    } catch (error) {
      console.error('Failed to change theme:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const getThemeIcon = (mode: ThemeMode) => {
    switch (mode) {
      case 'light':
        return 'white-balance-sunny';
      case 'dark':
        return 'weather-night';
      case 'system':
        return 'theme-light-dark';
      default:
        return 'theme-light-dark';
    }
  };

  const getThemeDescription = (mode: ThemeMode) => {
    switch (mode) {
      case 'light':
        return 'Always use light theme';
      case 'dark':
        return 'Always use dark theme';
      case 'system':
        return 'Automatically switch based on system settings';
      default:
        return '';
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: paperTheme.colors.background }]}
      contentContainerStyle={styles.content}>
      <Card style={styles.card} mode="elevated">
        <Card.Title
          title="Theme Appearance"
          subtitle="Choose your preferred theme"
          left={props => (
            <Icon {...props} source={isDark ? 'weather-night' : 'white-balance-sunny'} size={24} />
          )}
        />
        <Card.Content>
          <Surface style={styles.previewContainer} elevation={0}>
            <View style={styles.previewContent}>
              <Icon source={getThemeIcon(themeMode)} size={48} color={paperTheme.colors.primary} />
              <Text variant="titleMedium" style={styles.previewText}>
                {themeMode === 'light' && 'Light Theme'}
                {themeMode === 'dark' && 'Dark Theme'}
                {themeMode === 'system' && 'System Default'}
              </Text>
              <Text
                variant="bodySmall"
                style={[styles.previewDescription, { color: paperTheme.colors.onSurfaceVariant }]}>
                {isDark ? 'Dark mode active' : 'Light mode active'}
              </Text>
            </View>
          </Surface>

          <View style={styles.optionsContainer}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Appearance Options
            </Text>

            <RadioButton.Group
              onValueChange={value => handleThemeChange(value as ThemeMode)}
              value={themeMode}>
              {(['light', 'dark', 'system'] as ThemeMode[]).map(mode => (
                <List.Item
                  key={mode}
                  title={mode.charAt(0).toUpperCase() + mode.slice(1)}
                  description={getThemeDescription(mode)}
                  left={props => <List.Icon {...props} icon={getThemeIcon(mode)} />}
                  right={props => (
                    <RadioButton
                      {...props}
                      value={mode}
                      disabled={isChanging}
                      accessibilityLabel={`Select ${mode} theme`}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: themeMode === mode }}
                    />
                  )}
                  onPress={() => handleThemeChange(mode)}
                  disabled={isChanging}
                  style={styles.listItem}
                  accessibilityRole="button"
                  accessibilityLabel={`${mode.charAt(0).toUpperCase() + mode.slice(1)} theme option`}
                  accessibilityHint={getThemeDescription(mode)}
                />
              ))}
            </RadioButton.Group>

            {isChanging && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" />
                <Text variant="bodySmall" style={styles.loadingText}>
                  Applying theme...
                </Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card} mode="elevated">
        <Card.Title title="Accessibility" subtitle="WCAG AA compliant colors" />
        <Card.Content>
          <Text variant="bodyMedium" style={styles.infoText}>
            All text colors meet WCAG AA contrast standards (4.5:1 ratio) for optimal readability in
            both light and dark themes.
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: 16,
      paddingBottom: 32,
    },
    card: {
      marginBottom: 16,
    },
    previewContainer: {
      borderRadius: 12,
      padding: 24,
      marginBottom: 16,
    },
    previewContent: {
      alignItems: 'center',
    },
    previewText: {
      marginTop: 12,
    },
    previewDescription: {
      marginTop: 4,
    },
    optionsContainer: {
      marginTop: 8,
    },
    sectionTitle: {
      marginBottom: 8,
      marginLeft: 16,
    },
    listItem: {
      paddingVertical: 8,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 16,
      padding: 12,
    },
    loadingText: {
      marginLeft: 8,
    },
    infoText: {
      lineHeight: 22,
    },
  });

export default ThemeSettingsScreen;
