/**
 * Change Role Screen
 * Allow users to change their role with role-specific re-configuration
 * Feature: 002-app-screens (T121)
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  Button,
  Surface,
  RadioButton,
  TextInput,
  HelperText,
  Divider,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import * as Yup from 'yup';
import { useAppTheme } from '../../../src/theme/ThemeContext';
import { useProfile } from '../../../src/hooks/useProfile';
import { useAuth } from '../../../src/hooks/useAuth';
import type { UserRole } from '../../../src/types/profile';

// Validation schema for role-specific fields
const roleChangeSchema = Yup.object().shape({
  role: Yup.string().oneOf(['sponsor', 'sponsee', 'both']).required('Role is required'),
  sobriety_start_date: Yup.string()
    .nullable()
    .when('role', {
      is: (role: UserRole) => role === 'sponsee' || role === 'both',
      then: schema =>
        schema
          .required('Sobriety start date is required for sponsees')
          .matches(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in format YYYY-MM-DD')
          .test('not-future', 'Date cannot be in the future', value => {
            if (!value) return false;
            const inputDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return inputDate <= today;
          }),
      otherwise: schema => schema.nullable(),
    }),
});

export default function ChangeRoleScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const { profile, update } = useProfile();
  const { user } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>(profile?.role || 'sponsee');
  const [sobrietyStartDate, setSobrietyStartDate] = useState<string>(
    profile?.sobriety_start_date || '',
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const roleOptions = [
    {
      value: 'sponsee' as UserRole,
      label: 'Sponsee',
      description: 'Looking for a sponsor to support my recovery journey',
    },
    {
      value: 'sponsor' as UserRole,
      label: 'Sponsor',
      description: 'Ready to sponsor others in their recovery',
    },
    {
      value: 'both' as UserRole,
      label: 'Both',
      description: 'Open to both sponsoring others and having a sponsor',
    },
  ];

  const requiresSobrietyDate = selectedRole === 'sponsee' || selectedRole === 'both';

  const handleSave = async (): Promise<void> => {
    try {
      // Clear previous errors
      setErrors({});

      // Validate form data
      const formData = {
        role: selectedRole,
        sobriety_start_date: requiresSobrietyDate ? sobrietyStartDate : null,
      };

      await roleChangeSchema.validate(formData, { abortEarly: false });

      // Confirm role change
      Alert.alert(
        'Confirm Role Change',
        `Are you sure you want to change your role to ${roleOptions.find(r => r.value === selectedRole)?.label}? This will update your profile and may affect your match visibility.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Confirm',
            onPress: async () => {
              try {
                setIsSaving(true);

                if (!user?.id) {
                  throw new Error('User ID not found');
                }

                // Update profile with new role and role-specific data
                await update(user.id, {
                  role: selectedRole,
                  sobriety_start_date: requiresSobrietyDate ? sobrietyStartDate : undefined,
                });

                Alert.alert('Success', 'Your role has been updated successfully!', [
                  {
                    text: 'OK',
                    onPress: () => router.back(),
                  },
                ]);
              } catch (error) {
                console.error('Error updating role:', error);
                Alert.alert('Error', 'Failed to update your role. Please try again.');
              } finally {
                setIsSaving(false);
              }
            },
          },
        ],
      );
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors: Record<string, string> = {};
        error.inner.forEach(err => {
          if (err.path) {
            validationErrors[err.path] = err.message;
          }
        });
        setErrors(validationErrors);
        Alert.alert('Validation Error', 'Please check the form for errors.');
      } else {
        console.error('Error validating role change:', error);
        Alert.alert('Error', 'Failed to validate your changes. Please try again.');
      }
    }
  };

  const handleCancel = (): void => {
    router.back();
  };

  if (!profile) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text>Loading profile...</Text>
        <Button mode="contained" onPress={handleCancel} style={{ marginTop: 16 }}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}>
      <Surface style={[styles.surface, { backgroundColor: theme.colors.surface }]} elevation={2}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          Change Your Role
        </Text>

        {/* Current Role Info */}
        <View style={[styles.infoBox, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Current Role:{' '}
            <Text style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
              {roleOptions.find(r => r.value === profile.role)?.label || profile.role}
            </Text>
          </Text>
        </View>

        <Divider style={styles.divider} />

        {/* Role Selection */}
        <View style={styles.section}>
          <Text
            variant="titleSmall"
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Select New Role
          </Text>

          <RadioButton.Group
            onValueChange={value => setSelectedRole(value as UserRole)}
            value={selectedRole}>
            {roleOptions.map(option => (
              <View key={option.value} style={styles.radioItem}>
                <RadioButton.Item
                  label={option.label}
                  value={option.value}
                  disabled={isSaving}
                  labelStyle={{ color: theme.colors.onSurface }}
                />
                <Text
                  variant="bodySmall"
                  style={[styles.roleDescription, { color: theme.colors.onSurfaceVariant }]}>
                  {option.description}
                </Text>
              </View>
            ))}
          </RadioButton.Group>

          {errors.role && (
            <HelperText type="error" visible={!!errors.role}>
              {errors.role}
            </HelperText>
          )}
        </View>

        {/* Role-Specific Fields */}
        {requiresSobrietyDate && (
          <View style={styles.section}>
            <Divider style={styles.divider} />
            <Text
              variant="titleSmall"
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Role-Specific Information
            </Text>
            <Text
              variant="bodySmall"
              style={[styles.helperText, { color: theme.colors.onSurfaceVariant }]}>
              {selectedRole === 'sponsee'
                ? 'As a sponsee, your sobriety start date helps sponsors understand your journey.'
                : 'Your sobriety start date helps build trust and connection.'}
            </Text>

            <TextInput
              label="Sobriety Start Date *"
              value={sobrietyStartDate}
              onChangeText={setSobrietyStartDate}
              mode="outlined"
              placeholder="YYYY-MM-DD"
              error={!!errors.sobriety_start_date}
              disabled={isSaving}
              style={styles.input}
              keyboardType="default"
            />
            <HelperText type="info" visible={!errors.sobriety_start_date}>
              Format: YYYY-MM-DD (e.g., 2024-01-15)
            </HelperText>
            {errors.sobriety_start_date && (
              <HelperText type="error" visible={!!errors.sobriety_start_date}>
                {errors.sobriety_start_date}
              </HelperText>
            )}
          </View>
        )}

        {/* Warning Message */}
        <View style={[styles.warningBox, { backgroundColor: theme.colors.errorContainer }]}>
          <Text variant="bodySmall" style={{ color: theme.colors.onErrorContainer }}>
            ⚠️ Changing your role will update your profile visibility and may affect your match
            recommendations. Your existing connections will not be affected.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={isSaving}
            disabled={isSaving || selectedRole === profile.role}
            style={styles.saveButton}>
            {selectedRole === profile.role ? 'No Change' : 'Update Role'}
          </Button>

          <Button mode="outlined" onPress={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
        </View>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentContainer: {
    paddingVertical: 16,
  },
  surface: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  infoBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  helperText: {
    marginBottom: 12,
    lineHeight: 20,
  },
  radioItem: {
    marginBottom: 8,
  },
  roleDescription: {
    marginLeft: 56,
    marginTop: -8,
    marginBottom: 8,
  },
  input: {
    marginBottom: 4,
  },
  warningBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 8,
    gap: 12,
  },
  saveButton: {
    paddingVertical: 6,
  },
});
