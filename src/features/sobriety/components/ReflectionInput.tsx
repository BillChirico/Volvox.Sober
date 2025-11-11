/**
 * ReflectionInput Component
 * Input for daily sobriety reflections
 * Feature: 002-app-screens
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Card, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../../theme/ThemeContext';
import type { ReflectionFormData } from '../../../types/sobriety';

export interface ReflectionInputProps {
  /** Callback when reflection is submitted */
  onSubmit: (data: ReflectionFormData) => void;
  /** Whether submission is in progress */
  isSubmitting?: boolean;
  /** Validation errors */
  errors?: Record<string, string>;
  /** Placeholder text */
  placeholder?: string;
}

const MAX_REFLECTION_LENGTH = 500;

/**
 * Reflection input component for daily entries
 */
export const ReflectionInput: React.FC<ReflectionInputProps> = ({
  onSubmit,
  isSubmitting = false,
  errors = {},
  placeholder = 'How are you feeling today? Share your thoughts...',
}) => {
  const { theme } = useAppTheme();
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const remainingChars = MAX_REFLECTION_LENGTH - text.length;
  const isValid = text.trim().length > 0 && text.length <= MAX_REFLECTION_LENGTH;

  const handleSubmit = () => {
    if (!isValid) return;

    onSubmit({
      text: text.trim(),
      date: new Date().toISOString(),
    });

    // Clear input after successful submission
    setText('');
  };

  return (
    <Card style={styles.card} elevation={2}>
      <Card.Content>
        <View style={styles.header}>
          <MaterialCommunityIcons name="pencil" size={24} color={theme.colors.primary} />
          <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
            Daily Reflection
          </Text>
        </View>

        <TextInput
          label="Write your reflection"
          value={text}
          onChangeText={setText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          mode="outlined"
          multiline
          numberOfLines={4}
          placeholder={placeholder}
          error={!!errors.text}
          disabled={isSubmitting}
          maxLength={MAX_REFLECTION_LENGTH}
          style={styles.input}
          accessibilityLabel="Daily reflection input"
          accessibilityHint="Share your thoughts about your recovery today"
        />

        {errors.text && <HelperText type="error">{errors.text}</HelperText>}

        <View style={styles.footer}>
          <Text
            variant="bodySmall"
            style={[
              styles.charCounter,
              {
                color: remainingChars < 50 ? theme.colors.error : theme.colors.onSurfaceVariant,
              },
            ]}>
            {remainingChars} characters remaining
          </Text>

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting || !isValid}
            contentStyle={styles.buttonContent}
            icon="send"
            accessibilityLabel="Save reflection"
            accessibilityHint="Save your daily reflection">
            Save Reflection
          </Button>
        </View>

        {isFocused && (
          <View style={styles.tipsContainer}>
            <Text variant="bodySmall" style={[styles.tipsTitle, { color: theme.colors.primary }]}>
              💡 Reflection Tips:
            </Text>
            <Text
              variant="bodySmall"
              style={[styles.tipItem, { color: theme.colors.onSurfaceVariant }]}>
              • What challenged you today?
            </Text>
            <Text
              variant="bodySmall"
              style={[styles.tipItem, { color: theme.colors.onSurfaceVariant }]}>
              • What are you grateful for?
            </Text>
            <Text
              variant="bodySmall"
              style={[styles.tipItem, { color: theme.colors.onSurfaceVariant }]}>
              • How did you stay strong?
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginLeft: 12,
    fontWeight: '600',
  },
  input: {
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  charCounter: {
    fontWeight: '500',
  },
  buttonContent: {
    paddingVertical: 4,
  },
  tipsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
  tipsTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  tipItem: {
    marginBottom: 4,
    paddingLeft: 8,
  },
});
