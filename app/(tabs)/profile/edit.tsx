/**
 * Edit Profile Screen
 * Allow users to edit their profile information with validation
 * Feature: 002-app-screens (T120)
 */

import React, { useEffect, useState } from 'react'
import { View, StyleSheet, ScrollView, Alert } from 'react-native'
import {
  Text,
  TextInput,
  Button,
  Surface,
  HelperText,
  Chip,
} from 'react-native-paper'
import { useRouter } from 'expo-router'
import * as Yup from 'yup'
import { useAppTheme } from '../../../src/theme/ThemeContext'
import { useProfile } from '../../../src/hooks/useProfile'
import { useAuth } from '../../../src/hooks/useAuth'
import ProfilePhotoUpload from '../../../src/components/ProfilePhotoUpload'
import { RECOVERY_PROGRAMS } from '../../../src/constants/RecoveryPrograms'
import { AVAILABILITY_OPTIONS } from '../../../src/constants/Availability'

// Validation schema
const profileSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  bio: Yup.string()
    .max(500, 'Bio must be less than 500 characters')
    .nullable(),
  city: Yup.string()
    .required('City is required')
    .max(100, 'City must be less than 100 characters'),
  state: Yup.string()
    .required('State is required')
    .max(50, 'State must be less than 50 characters'),
  country: Yup.string()
    .required('Country is required')
    .max(50, 'Country must be less than 50 characters'),
  recovery_program: Yup.string()
    .oneOf([...RECOVERY_PROGRAMS])
    .required('Recovery program is required'),
  availability: Yup.array()
    .of(Yup.string().oneOf([...AVAILABILITY_OPTIONS]))
    .min(1, 'Please select at least one availability')
    .required('Availability is required'),
})

interface FormData {
  name: string
  bio?: string
  city?: string
  state?: string
  country?: string
  recovery_program: string
  availability: string[]
  profile_photo_url?: string
  sobriety_start_date?: string
}

export default function EditProfileScreen() {
  const { theme } = useAppTheme()
  const router = useRouter()
  const { profile, isLoading, update } = useProfile()
  const { user } = useAuth()

  const [formData, setFormData] = useState<FormData>({
    name: '',
    bio: undefined,
    city: undefined,
    state: undefined,
    country: undefined,
    recovery_program: '',
    availability: [],
    profile_photo_url: undefined,
    sobriety_start_date: undefined,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Load profile data into form
  useEffect(() => {
    if (profile) {
      // Parse availability if it's stored as string/JSON
      let availabilityArray: string[] = []
      if (typeof profile.availability === 'string') {
        try {
          availabilityArray = JSON.parse(profile.availability) as string[]
        } catch {
          availabilityArray = profile.availability ? [profile.availability as string] : []
        }
      } else if (Array.isArray(profile.availability)) {
        availabilityArray = profile.availability as string[]
      }

      setFormData({
        name: profile.name || '',
        bio: profile.bio || undefined,
        city: profile.city || undefined,
        state: profile.state || undefined,
        country: profile.country || undefined,
        recovery_program: profile.recovery_program || '',
        availability: availabilityArray,
        profile_photo_url: profile.profile_photo_url || undefined,
        sobriety_start_date: profile.sobriety_start_date || undefined,
      })
    }
  }, [profile])

  const handleSave = async (): Promise<void> => {
    try {
      // Clear previous errors
      setErrors({})

      // Validate form data
      await profileSchema.validate(formData, { abortEarly: false })

      setIsSaving(true)

      if (!user?.id) {
        throw new Error('User ID not found')
      }

      // Prepare update data
      const updateData: Partial<FormData> = {
        name: formData.name.trim(),
        bio: formData.bio?.trim() || undefined,
        city: formData.city?.trim() || undefined,
        state: formData.state?.trim() || undefined,
        country: formData.country?.trim() || undefined,
        recovery_program: formData.recovery_program,
        availability: formData.availability,
        sobriety_start_date: formData.sobriety_start_date || undefined,
      }

      // Update profile using hook
      await update(user.id, updateData as any)

      Alert.alert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ])
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors: Record<string, string> = {}
        error.inner.forEach((err) => {
          if (err.path) {
            validationErrors[err.path] = err.message
          }
        })
        setErrors(validationErrors)
        Alert.alert('Validation Error', 'Please check the form for errors.')
      } else {
        console.error('Error saving profile:', error)
        Alert.alert('Error', 'Failed to update profile. Please try again.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handlePhotoUploadComplete = (photoUrl: string): void => {
    setFormData({ ...formData, profile_photo_url: photoUrl })
  }

  const handleCancel = (): void => {
    router.back()
  }

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text>Loading profile...</Text>
      </View>
    )
  }

  if (!profile) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text>Profile not found</Text>
        <Button mode="contained" onPress={handleCancel} style={{ marginTop: 16 }}>
          Go Back
        </Button>
      </View>
    )
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Surface style={[styles.surface, { backgroundColor: theme.colors.surface }]} elevation={2}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          Edit Profile
        </Text>

        {/* Profile Photo */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Profile Photo
          </Text>
          <ProfilePhotoUpload
            userId={profile.id}
            currentPhotoUrl={formData.profile_photo_url}
            onUploadComplete={handlePhotoUploadComplete}
          />
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Basic Information
          </Text>

          <TextInput
            label="Name *"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            mode="outlined"
            style={styles.input}
            error={!!errors.name}
            disabled={isSaving}
          />
          <HelperText type="error" visible={!!errors.name}>
            {errors.name}
          </HelperText>

          <TextInput
            label="Bio"
            value={formData.bio}
            onChangeText={(text) => setFormData({ ...formData, bio: text })}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
            error={!!errors.bio}
            disabled={isSaving}
          />
          <HelperText type="info" visible={true}>
            {formData.bio?.length || 0}/500 characters
          </HelperText>
          {errors.bio && (
            <HelperText type="error" visible={!!errors.bio}>
              {errors.bio}
            </HelperText>
          )}
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Location
          </Text>

          <TextInput
            label="City *"
            value={formData.city}
            onChangeText={(text) => setFormData({ ...formData, city: text })}
            mode="outlined"
            style={styles.input}
            error={!!errors.city}
            disabled={isSaving}
          />
          <HelperText type="error" visible={!!errors.city}>
            {errors.city}
          </HelperText>

          <TextInput
            label="State *"
            value={formData.state}
            onChangeText={(text) => setFormData({ ...formData, state: text })}
            mode="outlined"
            style={styles.input}
            error={!!errors.state}
            disabled={isSaving}
          />
          <HelperText type="error" visible={!!errors.state}>
            {errors.state}
          </HelperText>

          <TextInput
            label="Country *"
            value={formData.country}
            onChangeText={(text) => setFormData({ ...formData, country: text })}
            mode="outlined"
            style={styles.input}
            error={!!errors.country}
            disabled={isSaving}
          />
          <HelperText type="error" visible={!!errors.country}>
            {errors.country}
          </HelperText>
        </View>

        {/* Recovery Information */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Recovery Information
          </Text>

          <Text variant="bodySmall" style={{ marginBottom: 8, color: theme.colors.onSurfaceVariant }}>
            Recovery Program *
          </Text>
          <View style={styles.chipContainer}>
            {RECOVERY_PROGRAMS.map((program) => (
              <Chip
                key={program}
                selected={formData.recovery_program === program}
                onPress={() => setFormData({ ...formData, recovery_program: program })}
                style={styles.chip}
                disabled={isSaving}
              >
                {program}
              </Chip>
            ))}
          </View>
          <HelperText type="error" visible={!!errors.recovery_program}>
            {errors.recovery_program}
          </HelperText>
        </View>

        {/* Availability */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Availability *
          </Text>
          <Text variant="bodySmall" style={[styles.helperText, { color: theme.colors.onSurfaceVariant }]}>
            Select all times you're typically available
          </Text>

          <View style={styles.chipContainer}>
            {AVAILABILITY_OPTIONS.map((option) => (
              <Chip
                key={option}
                selected={formData.availability.includes(option)}
                onPress={() => {
                  const updated = formData.availability.includes(option)
                    ? formData.availability.filter((a) => a !== option)
                    : [...formData.availability, option]
                  setFormData({ ...formData, availability: updated })
                }}
                style={styles.chip}
                disabled={isSaving}
              >
                {option}
              </Chip>
            ))}
          </View>
          <HelperText type="error" visible={!!errors.availability}>
            {errors.availability}
          </HelperText>
        </View>

        {/* Role Info (Read-only) */}
        <View style={styles.section}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Current Role: {profile.role === 'sponsor' ? 'Sponsor' : profile.role === 'sponsee' ? 'Sponsee' : 'Both'}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
            To change your role, go back to Profile and select "Change Role".
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={isSaving}
            disabled={isSaving}
            style={styles.saveButton}
          >
            Save Changes
          </Button>

          <Button mode="outlined" onPress={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
        </View>
      </Surface>
    </ScrollView>
  )
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
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    marginBottom: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 8,
  },
  helperText: {
    marginBottom: 12,
  },
  buttonContainer: {
    marginTop: 8,
    gap: 12,
  },
  saveButton: {
    paddingVertical: 6,
  },
})
