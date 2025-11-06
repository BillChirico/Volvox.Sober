/**
 * ProfileForm Component
 * Profile setup form with role-specific fields
 * Feature: 002-app-screens
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, TextInput, Button, Chip, HelperText } from 'react-native-paper';
import { useAppTheme } from '../../theme/ThemeContext';
import { RECOVERY_PROGRAMS } from '../../constants/RecoveryPrograms';
import { AVAILABILITY_OPTIONS } from '../../constants/Availability';
import type { ProfileFormData, UserRole, AvailabilityOption } from '../../types/profile';

export interface ProfileFormProps {
  /** User's selected role */
  role: UserRole;
  /** Initial form data */
  initialData?: Partial<ProfileFormData>;
  /** Callback when form is submitted */
  onSubmit: (data: ProfileFormData) => void;
  /** Whether form is submitting */
  isSubmitting?: boolean;
  /** Form validation errors */
  errors?: Record<string, string>;
}

/**
 * Profile form component for onboarding
 */
export const ProfileForm: React.FC<ProfileFormProps> = ({
  role,
  initialData = {},
  onSubmit,
  isSubmitting = false,
  errors = {},
}) => {
  const { theme } = useAppTheme();

  // Form state
  const [formData, setFormData] = useState<Partial<ProfileFormData>>({
    role,
    name: initialData.name || '',
    bio: initialData.bio || '',
    recovery_program: initialData.recovery_program || '',
    sobriety_start_date: initialData.sobriety_start_date || '',
    city: initialData.city || '',
    state: initialData.state || '',
    country: initialData.country || 'United States',
    availability: initialData.availability || [],
  });

  const updateField = (field: keyof ProfileFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAvailability = (option: AvailabilityOption) => {
    setFormData((prev) => {
      const current = prev.availability || [];
      const updated = current.includes(option)
        ? current.filter((a) => a !== option)
        : [...current, option];
      return { ...prev, availability: updated };
    });
  };

  const handleSubmit = () => {
    if (!isFormValid()) return;

    onSubmit(formData as ProfileFormData);
  };

  const isFormValid = (): boolean => {
    return !!(
      formData.name &&
      formData.recovery_program &&
      formData.availability &&
      formData.availability.length > 0
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Text
        variant="headlineSmall"
        style={[styles.title, { color: theme.colors.onSurface }]}
      >
        Complete Your Profile
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
      >
        {role === 'sponsor'
          ? 'Help others find you by sharing your experience'
          : role === 'sponsee'
          ? 'Tell potential sponsors about your recovery journey'
          : 'Share your story to connect with the right people'}
      </Text>

      {/* Name - Required */}
      <TextInput
        label="Name *"
        value={formData.name}
        onChangeText={(text) => updateField('name', text)}
        mode="outlined"
        error={!!errors.name}
        disabled={isSubmitting}
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        style={styles.input}
        accessibilityLabel="Enter your name"
        accessibilityHint="This is how others will see you"
      />
      {errors.name && <HelperText type="error">{errors.name}</HelperText>}

      {/* Bio - Optional */}
      <TextInput
        label="Bio (Optional)"
        value={formData.bio}
        onChangeText={(text) => updateField('bio', text)}
        mode="outlined"
        multiline
        numberOfLines={4}
        error={!!errors.bio}
        disabled={isSubmitting}
        returnKeyType="next"
        style={styles.input}
        placeholder={
          role === 'sponsor'
            ? 'Share your experience and how you can help...'
            : 'Tell us about your recovery journey...'
        }
        accessibilityLabel="Enter your bio"
      />

      {/* Recovery Program - Required */}
      <Text
        variant="titleMedium"
        style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
      >
        Recovery Program *
      </Text>
      <View style={styles.chipContainer}>
        {RECOVERY_PROGRAMS.map((program) => (
          <Chip
            key={program}
            selected={formData.recovery_program === program}
            onPress={() => updateField('recovery_program', program)}
            style={styles.chip}
            disabled={isSubmitting}
            accessibilityLabel={`Select ${program}`}
            accessibilityState={{
              selected: formData.recovery_program === program,
            }}
          >
            {program}
          </Chip>
        ))}
      </View>
      {errors.recovery_program && (
        <HelperText type="error">{errors.recovery_program}</HelperText>
      )}

      {/* Sobriety Start Date - Optional for sponsors, encouraged for sponsees */}
      {(role === 'sponsee' || role === 'both') && (
        <>
          <TextInput
            label={role === 'sponsee' ? 'Sobriety Start Date *' : 'Sobriety Start Date (Optional)'}
            value={formData.sobriety_start_date}
            onChangeText={(text) => updateField('sobriety_start_date', text)}
            mode="outlined"
            placeholder="YYYY-MM-DD"
            error={!!errors.sobriety_start_date}
            disabled={isSubmitting}
            style={styles.input}
            accessibilityLabel="Enter your sobriety start date"
            accessibilityHint="Format: Year-Month-Day"
          />
          {errors.sobriety_start_date && (
            <HelperText type="error">{errors.sobriety_start_date}</HelperText>
          )}
        </>
      )}

      {/* Location - Optional */}
      <Text
        variant="titleMedium"
        style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
      >
        Location (Optional)
      </Text>
      <View style={styles.row}>
        <TextInput
          label="City"
          value={formData.city}
          onChangeText={(text) => updateField('city', text)}
          mode="outlined"
          error={!!errors.city}
          disabled={isSubmitting}
          style={[styles.input, styles.halfWidth]}
          autoComplete="address-line2"
          textContentType="addressCity"
        />
        <TextInput
          label="State"
          value={formData.state}
          onChangeText={(text) => updateField('state', text)}
          mode="outlined"
          error={!!errors.state}
          disabled={isSubmitting}
          style={[styles.input, styles.halfWidth]}
          autoComplete="address-line1"
          textContentType="addressState"
        />
      </View>

      {/* Availability - Required */}
      <Text
        variant="titleMedium"
        style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
      >
        Availability *
      </Text>
      <Text
        variant="bodySmall"
        style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}
      >
        When are you typically available?
      </Text>
      <View style={styles.chipContainer}>
        {[...AVAILABILITY_OPTIONS].map((option) => (
          <Chip
            key={option}
            selected={formData.availability?.includes(option) || false}
            onPress={() => toggleAvailability(option)}
            style={styles.chip}
            disabled={isSubmitting}
            accessibilityLabel={`Toggle ${option} availability`}
            accessibilityState={{
              selected={formData.availability?.includes(option) || false,
            }}
          >
            {option}
          </Chip>
        ))}
      </View>
      {errors.availability && (
        <HelperText type="error">{errors.availability}</HelperText>
      )}

      {/* Submit Button */}
      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={isSubmitting}
        disabled={isSubmitting || !isFormValid()}
        style={styles.submitButton}
        contentStyle={styles.submitButtonContent}
        accessibilityLabel="Complete profile setup"
        accessibilityHint="Submit your profile information"
      >
        Complete Profile
      </Button>

      <Text
        variant="bodySmall"
        style={[styles.requiredNote, { color: theme.colors.onSurfaceVariant }]}
      >
        * Required fields
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  title: {
    marginBottom: 8,
    fontWeight: '600',
  },
  subtitle: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 12,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 12,
    fontWeight: '600',
  },
  hint: {
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 8,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  requiredNote: {
    textAlign: 'center',
    marginBottom: 16,
  },
});
