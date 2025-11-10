/**
 * Profile Screen
 * View profile information and navigate to settings
 * Feature: 002-app-screens (T119)
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { ActivityIndicator, Button, Divider, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useAppTheme } from '../../../src/theme/ThemeContext';
import { useProfile } from '../../../src/hooks/useProfile';
import { useAuth } from '../../../src/hooks/useAuth';
import { ProfileHeader } from '../../../src/components/profile/ProfileHeader';
import { SettingsSection, type SettingsItem } from '../../../src/components/profile/SettingsSection';

export default function ProfileScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const { profile, isLoading, fetch } = useProfile();
  const { user, logout } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    if (user?.id) {
      fetch(user.id);
    }
  }, [user?.id, fetch]);

  const handleEditProfile = (): void => {
    router.push('/profile/edit');
  };

  const handleViewFullProfile = (): void => {
    router.push('/profile/view');
  };

  const handleChangeRole = (): void => {
    router.push('/profile/change-role');
  };

  const handleNotificationSettings = (): void => {
    router.push('/settings/notifications');
  };

  const handleThemeSettings = (): void => {
    router.push('/settings/theme');
  };

  const handleLogout = (): void => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSigningOut(true);
              await logout();
              // Navigation handled by useAuthRedirect
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setIsSigningOut(false);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const handleAccountSettings = (): void => {
    router.push('/settings/account');
  };

  // Calculate profile completion percentage
  const calculateCompletionPercentage = (): number => {
    if (!profile) return 0;

    const fields = [
      profile.name,
      profile.bio,
      profile.profile_photo_url,
      profile.city,
      profile.state,
      profile.country,
      profile.recovery_program,
      profile.availability,
      profile.sobriety_start_date,
    ];

    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  // Show loading spinner only while fetching
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Handle case where profile doesn't exist yet
  if (!profile) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text variant="headlineSmall" style={{ marginBottom: 16 }}>
          No Profile Found
        </Text>
        <Text
          variant="bodyMedium"
          style={{ marginBottom: 24, textAlign: 'center', paddingHorizontal: 32 }}>
          Complete your profile to connect with sponsors or sponsees
        </Text>
        <Button mode="contained" onPress={() => router.push('/profile/edit')}>
          Create Profile
        </Button>
      </View>
    );
  }

  const completionPercentage = calculateCompletionPercentage();

  // Profile management section
  const profileManagementItems: SettingsItem[] = [
    {
      key: 'edit_profile',
      type: 'navigation',
      label: 'Edit Profile',
      description: 'Update your profile information',
      icon: 'account-edit',
      onPress: handleEditProfile,
    },
    {
      key: 'view_profile',
      type: 'navigation',
      label: 'View Full Profile',
      description: 'See your profile as others see it',
      icon: 'account-eye',
      onPress: handleViewFullProfile,
    },
    {
      key: 'change_role',
      type: 'navigation',
      label: 'Change Role',
      description: 'Update your role (sponsor/sponsee)',
      icon: 'account-switch',
      onPress: handleChangeRole,
    },
  ];

  // Preferences section
  const preferencesItems: SettingsItem[] = [
    {
      key: 'notifications',
      type: 'navigation',
      label: 'Notifications',
      description: 'Manage notification preferences',
      icon: 'bell-outline',
      onPress: handleNotificationSettings,
    },
    {
      key: 'theme',
      type: 'navigation',
      label: 'Theme',
      description: 'Light, dark, or system',
      icon: 'theme-light-dark',
      onPress: handleThemeSettings,
    },
  ];

  // Account section
  const accountItems: SettingsItem[] = [
    {
      key: 'account_settings',
      type: 'navigation',
      label: 'Account Settings',
      description: 'Manage email, password, and account',
      icon: 'account-cog',
      onPress: handleAccountSettings,
    },
    {
      key: 'logout',
      type: 'action',
      label: 'Sign Out',
      description: 'Sign out of your account',
      icon: 'logout',
      onPress: handleLogout,
      disabled: isSigningOut,
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}>
      {/* Profile Header */}
      <ProfileHeader
        profile={profile}
        completionPercentage={completionPercentage}
        showCompletionBar={completionPercentage < 100}
        onPhotoPress={handleEditProfile}
      />

      <Divider style={styles.divider} />

      {/* Profile Management Section */}
      <SettingsSection title="Profile" items={profileManagementItems} />

      {/* Preferences Section */}
      <SettingsSection title="Preferences" items={preferencesItems} />

      {/* Account Section */}
      <SettingsSection title="Account" items={accountItems} />

      {/* Version info */}
      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, { color: theme.colors.onSurfaceVariant }]}>
          Volvox.Sober v{Constants.expoConfig?.version || '1.0.0-alpha.1'}
        </Text>
      </View>
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
  },
  contentContainer: {
    paddingVertical: 16,
  },
  divider: {
    marginVertical: 16,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 12,
  },
});
