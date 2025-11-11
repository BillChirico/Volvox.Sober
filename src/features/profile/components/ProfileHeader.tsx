/**
 * ProfileHeader Component
 * Displays user profile photo and name with role badge
 * Feature: 002-app-screens (T116)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, Text, Chip, ProgressBar } from 'react-native-paper';
import { useAppTheme } from '../../../theme/ThemeContext';
import type { Profile } from '../../../types/profile';

interface ProfileHeaderProps {
  profile: Profile;
  completionPercentage?: number;
  showCompletionBar?: boolean;
  onPhotoPress?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  completionPercentage = 100,
  showCompletionBar = false,
  onPhotoPress,
}) => {
  const { theme } = useAppTheme();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'sponsor':
        return theme.colors.primary;
      case 'sponsee':
        return theme.colors.secondary;
      case 'both':
        return theme.colors.tertiary;
      default:
        return theme.colors.surfaceVariant;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'sponsor':
        return 'Sponsor';
      case 'sponsee':
        return 'Sponsee';
      case 'both':
        return 'Sponsor & Sponsee';
      default:
        return 'User';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Profile Photo */}
      <View style={styles.photoContainer}>
        {profile.profile_photo_url ? (
          <Avatar.Image
            size={100}
            source={{ uri: profile.profile_photo_url }}
            style={styles.avatar}
          />
        ) : (
          <Avatar.Icon
            size={100}
            icon="account"
            style={[styles.avatar, { backgroundColor: theme.colors.surfaceVariant }]}
          />
        )}
        {onPhotoPress && (
          <View style={styles.editBadge}>
            <Avatar.Icon
              size={32}
              icon="camera"
              style={{ backgroundColor: theme.colors.primary }}
            />
          </View>
        )}
      </View>

      {/* Name and Role */}
      <View style={styles.infoContainer}>
        <Text variant="headlineMedium" style={[styles.name, { color: theme.colors.onSurface }]}>
          {profile.name}
        </Text>

        <Chip
          mode="flat"
          style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(profile.role) + '20' }]}
          textStyle={{ color: getRoleBadgeColor(profile.role) }}>
          {getRoleLabel(profile.role)}
        </Chip>

        {/* Bio */}
        {profile.bio && (
          <Text
            variant="bodyMedium"
            style={[styles.bio, { color: theme.colors.onSurfaceVariant }]}
            numberOfLines={3}>
            {profile.bio}
          </Text>
        )}

        {/* Location */}
        {(profile.city || profile.state) && (
          <View style={styles.locationContainer}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              📍 {[profile.city, profile.state, profile.country].filter(Boolean).join(', ')}
            </Text>
          </View>
        )}

        {/* Profile Completion */}
        {showCompletionBar && completionPercentage < 100 && (
          <View style={styles.completionContainer}>
            <View style={styles.completionHeader}>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Profile Completion
              </Text>
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                {completionPercentage}%
              </Text>
            </View>
            <ProgressBar
              progress={completionPercentage / 100}
              color={theme.colors.primary}
              style={styles.progressBar}
            />
            <Text
              variant="bodySmall"
              style={[styles.completionHint, { color: theme.colors.onSurfaceVariant }]}>
              Complete your profile to improve match quality
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  infoContainer: {
    alignItems: 'center',
    width: '100%',
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  roleBadge: {
    marginBottom: 12,
  },
  bio: {
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  locationContainer: {
    marginBottom: 12,
  },
  completionContainer: {
    width: '100%',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  completionHint: {
    textAlign: 'center',
  },
});
