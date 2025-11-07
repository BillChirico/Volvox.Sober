/**
 * Account Settings Screen
 * Manage email, password, and account deletion
 * Feature: 002-app-screens
 */

import React, { useState } from 'react'
import { StyleSheet, ScrollView, Alert } from 'react-native'
import { Text, Button, TextInput, Surface, HelperText, Divider } from 'react-native-paper'
import { useRouter } from 'expo-router'
import * as Yup from 'yup'
import { useAppTheme } from '../../../src/theme/ThemeContext'
import { useAuth } from '../../../src/hooks/useAuth'

/**
 * Account settings screen for managing email, password, and account
 */
export default function AccountSettingsScreen() {
  const { theme } = useAppTheme()
  const router = useRouter()
  const { user, updateEmail, updatePassword, deleteAccount, logout } = useAuth()

  // Email update state
  const [newEmail, setNewEmail] = useState<string>('')
  const [emailPassword, setEmailPassword] = useState<string>('')
  const [isUpdatingEmail, setIsUpdatingEmail] = useState<boolean>(false)
  const [emailError, setEmailError] = useState<string>('')

  // Password update state
  const [currentPassword, setCurrentPassword] = useState<string>('')
  const [newPassword, setNewPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState<boolean>(false)
  const [passwordError, setPasswordError] = useState<string>('')

  // Account deletion state
  const [deletePassword, setDeletePassword] = useState<string>('')
  const [deleteConfirmation, setDeleteConfirmation] = useState<string>('')
  const [isDeletingAccount, setIsDeletingAccount] = useState<boolean>(false)
  const [deleteError, setDeleteError] = useState<string>('')

  // Validation schemas
  const emailSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().required('Password is required for email change'),
  })

  const passwordSchema = Yup.object().shape({
    currentPassword: Yup.string().required('Current password is required'),
    newPassword: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[0-9]/, 'Password must contain at least one number')
      .required('New password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], 'Passwords must match')
      .required('Please confirm your new password'),
  })

  const deleteSchema = Yup.object().shape({
    password: Yup.string().required('Password is required to delete account'),
    confirmation: Yup.string()
      .oneOf(['DELETE'], 'Please type DELETE to confirm')
      .required('Confirmation is required'),
  })

  /**
   * Handle email update
   */
  const handleUpdateEmail = async (): Promise<void> => {
    try {
      setEmailError('')

      // Validate
      await emailSchema.validate({ email: newEmail, password: emailPassword })

      // Confirm action
      Alert.alert(
        'Update Email',
        `Are you sure you want to change your email to ${newEmail}?\n\nYou will need to verify the new email address.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Update',
            style: 'default',
            onPress: async () => {
              setIsUpdatingEmail(true)
              try {
                await updateEmail(newEmail, emailPassword)
                Alert.alert(
                  'Email Updated',
                  'Please check your new email address to verify the change.',
                  [{ text: 'OK', onPress: () => router.back() }]
                )
                setNewEmail('')
                setEmailPassword('')
              } catch (error: any) {
                setEmailError(error.message || 'Failed to update email')
              } finally {
                setIsUpdatingEmail(false)
              }
            },
          },
        ]
      )
    } catch (error: any) {
      setEmailError(error.message || 'Invalid email or password')
    }
  }

  /**
   * Handle password update
   */
  const handleUpdatePassword = async (): Promise<void> => {
    try {
      setPasswordError('')

      // Validate
      await passwordSchema.validate({
        currentPassword,
        newPassword,
        confirmPassword,
      })

      // Confirm action
      Alert.alert(
        'Update Password',
        'Are you sure you want to change your password?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Update',
            style: 'default',
            onPress: async () => {
              setIsUpdatingPassword(true)
              try {
                await updatePassword(currentPassword, newPassword)
                Alert.alert('Password Updated', 'Your password has been changed successfully.', [
                  { text: 'OK', onPress: () => router.back() },
                ])
                setCurrentPassword('')
                setNewPassword('')
                setConfirmPassword('')
              } catch (error: any) {
                setPasswordError(error.message || 'Failed to update password')
              } finally {
                setIsUpdatingPassword(false)
              }
            },
          },
        ]
      )
    } catch (error: any) {
      setPasswordError(error.message || 'Invalid password')
    }
  }

  /**
   * Handle account deletion
   */
  const handleDeleteAccount = async (): Promise<void> => {
    try {
      setDeleteError('')

      // Validate
      await deleteSchema.validate({
        password: deletePassword,
        confirmation: deleteConfirmation,
      })

      // Final confirmation
      Alert.alert(
        'Delete Account',
        'This action cannot be undone. All your data will be permanently deleted.\n\nAre you absolutely sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete Account',
            style: 'destructive',
            onPress: async () => {
              setIsDeletingAccount(true)
              try {
                await deleteAccount(deletePassword)
                await logout()
                Alert.alert(
                  'Account Deleted',
                  'Your account has been permanently deleted.',
                  [{ text: 'OK' }]
                )
              } catch (error: any) {
                setDeleteError(error.message || 'Failed to delete account')
                setIsDeletingAccount(false)
              }
            },
          },
        ]
      )
    } catch (error: any) {
      setDeleteError(error.message || 'Invalid password or confirmation')
    }
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
        Account Settings
      </Text>
      <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
        Manage your email, password, and account status
      </Text>

      {/* Current Email Display */}
      <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text variant="labelSmall" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
          Current Email
        </Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
          {user?.email}
        </Text>
      </Surface>

      {/* Update Email Section */}
      <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Update Email
        </Text>
        <Text variant="bodySmall" style={[styles.sectionHint, { color: theme.colors.onSurfaceVariant }]}>
          You will need to verify your new email address
        </Text>

        <TextInput
          label="New Email"
          value={newEmail}
          onChangeText={setNewEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          disabled={isUpdatingEmail}
          style={styles.input}
        />

        <TextInput
          label="Current Password"
          value={emailPassword}
          onChangeText={setEmailPassword}
          mode="outlined"
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          disabled={isUpdatingEmail}
          style={styles.input}
        />

        {emailError ? <HelperText type="error">{emailError}</HelperText> : null}

        <Button
          mode="contained"
          onPress={handleUpdateEmail}
          loading={isUpdatingEmail}
          disabled={isUpdatingEmail || !newEmail || !emailPassword}
          style={styles.button}
        >
          Update Email
        </Button>
      </Surface>

      <Divider style={styles.divider} />

      {/* Update Password Section */}
      <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Update Password
        </Text>
        <Text variant="bodySmall" style={[styles.sectionHint, { color: theme.colors.onSurfaceVariant }]}>
          Choose a strong password with at least 8 characters
        </Text>

        <TextInput
          label="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          mode="outlined"
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          disabled={isUpdatingPassword}
          style={styles.input}
        />

        <TextInput
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          mode="outlined"
          secureTextEntry
          autoComplete="password-new"
          textContentType="newPassword"
          disabled={isUpdatingPassword}
          style={styles.input}
        />

        <TextInput
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          mode="outlined"
          secureTextEntry
          autoComplete="password-new"
          textContentType="newPassword"
          disabled={isUpdatingPassword}
          style={styles.input}
        />

        {passwordError ? <HelperText type="error">{passwordError}</HelperText> : null}

        <Button
          mode="contained"
          onPress={handleUpdatePassword}
          loading={isUpdatingPassword}
          disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
          style={styles.button}
        >
          Update Password
        </Button>
      </Surface>

      <Divider style={styles.divider} />

      {/* Delete Account Section */}
      <Surface style={[styles.section, styles.dangerSection, { backgroundColor: theme.colors.errorContainer }]}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.error }]}>
          Delete Account
        </Text>
        <Text variant="bodySmall" style={[styles.sectionHint, { color: theme.colors.onErrorContainer }]}>
          This action cannot be undone. All your data will be permanently deleted.
        </Text>

        <TextInput
          label="Password"
          value={deletePassword}
          onChangeText={setDeletePassword}
          mode="outlined"
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          disabled={isDeletingAccount}
          style={styles.input}
        />

        <TextInput
          label="Type DELETE to confirm"
          value={deleteConfirmation}
          onChangeText={setDeleteConfirmation}
          mode="outlined"
          autoCapitalize="characters"
          disabled={isDeletingAccount}
          style={styles.input}
          placeholder="DELETE"
        />

        {deleteError ? <HelperText type="error">{deleteError}</HelperText> : null}

        <Button
          mode="contained"
          onPress={handleDeleteAccount}
          loading={isDeletingAccount}
          disabled={isDeletingAccount || !deletePassword || deleteConfirmation !== 'DELETE'}
          buttonColor={theme.colors.error}
          textColor={theme.colors.onError}
          style={styles.button}
        >
          Delete Account Permanently
        </Button>
      </Surface>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    marginBottom: 8,
    fontWeight: '600',
  },
  subtitle: {
    marginBottom: 24,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 4,
    fontWeight: '600',
  },
  sectionHint: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
  divider: {
    marginVertical: 8,
  },
  dangerSection: {
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.2)',
  },
})
