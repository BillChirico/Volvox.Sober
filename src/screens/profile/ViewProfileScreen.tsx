import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, Avatar, Button, Divider, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { supabaseClient } from '../../services/supabase';

interface UserProfile {
  id: string;
  email: string;
  role: 'sponsor' | 'sponsee' | 'both';
  profile_photo_url?: string;
  name: string;
  location: {
    city: string;
    state: string;
  };
  program_type: string;
  bio?: string;
  // Sponsee fields
  sobriety_date?: string;
  step_progress?: number;
  // Sponsor fields
  years_sober?: number;
  max_sponsees?: number;
  availability?: string;
  approach?: string;
  // Connection stats
  sponsee_count?: number;
  sponsor_count?: number;
}

const ViewProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      if (!session?.user) {
        return;
      }

      const { data: userData, error } = await supabaseClient
        .from('users')
        .select(
          `
          *,
          sponsor_profiles (*),
          sponsee_profiles (*)
        `,
        )
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      // Get connection counts
      const { count: sponseeCount } = await supabaseClient
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .eq('sponsor_id', session.user.id);

      const { count: sponsorCount } = await supabaseClient
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .eq('sponsee_id', session.user.id);

      setProfile({
        ...userData,
        sponsee_count: sponseeCount || 0,
        sponsor_count: sponsorCount || 0,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !profile) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.surface}>
        {/* Profile Photo */}
        <View style={styles.photoContainer}>
          {profile.profile_photo_url ? (
            <Avatar.Image size={120} source={{ uri: profile.profile_photo_url }} />
          ) : (
            <Avatar.Icon size={120} icon="account" />
          )}
        </View>

        {/* Edit Button */}
        <Button
          mode="contained"
          onPress={() => navigation.navigate('EditProfile' as never)}
          style={styles.editButton}
          icon="pencil">
          Edit Profile
        </Button>

        {/* Basic Info */}
        <Text variant="headlineMedium" style={styles.name}>
          {profile.name}
        </Text>

        <View style={styles.roleContainer}>
          <Chip mode="outlined" style={styles.roleChip}>
            {profile.role === 'both'
              ? 'Sponsor & Sponsee'
              : profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
          </Chip>
        </View>

        <Text variant="bodyLarge" style={styles.location}>
          📍 {profile.location.city}, {profile.location.state}
        </Text>

        <Text variant="bodyMedium" style={styles.program}>
          Program: {profile.program_type}
        </Text>

        <Divider style={styles.divider} />

        {/* Connection Stats */}
        <View style={styles.statsContainer}>
          {(profile.role === 'sponsor' || profile.role === 'both') && (
            <View style={styles.stat}>
              <Text variant="headlineSmall">{profile.sponsee_count}</Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Sponsees
              </Text>
            </View>
          )}
          {(profile.role === 'sponsee' || profile.role === 'both') && (
            <View style={styles.stat}>
              <Text variant="headlineSmall">{profile.sponsor_count}</Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Sponsors
              </Text>
            </View>
          )}
        </View>

        <Divider style={styles.divider} />

        {/* Sponsee Info */}
        {(profile.role === 'sponsee' || profile.role === 'both') && (
          <>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Recovery Journey
            </Text>

            {profile.sobriety_date && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Sobriety Date:
                </Text>
                <Text variant="bodyMedium">
                  {new Date(profile.sobriety_date).toLocaleDateString()}
                </Text>
              </View>
            )}

            {profile.step_progress !== undefined && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Step Progress:
                </Text>
                <Text variant="bodyMedium">Step {profile.step_progress} of 12</Text>
              </View>
            )}
          </>
        )}

        {/* Sponsor Info */}
        {(profile.role === 'sponsor' || profile.role === 'both') && (
          <>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Sponsorship Details
            </Text>

            {profile.years_sober !== undefined && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Years Sober:
                </Text>
                <Text variant="bodyMedium">{profile.years_sober} years</Text>
              </View>
            )}

            {profile.availability && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Availability:
                </Text>
                <Text variant="bodyMedium">{profile.availability}</Text>
              </View>
            )}

            {profile.max_sponsees !== undefined && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Capacity:
                </Text>
                <Text variant="bodyMedium">
                  {profile.sponsee_count}/{profile.max_sponsees} sponsees
                </Text>
              </View>
            )}

            {profile.approach && (
              <View style={styles.approachContainer}>
                <Text variant="bodyMedium" style={styles.label}>
                  Approach:
                </Text>
                <Text variant="bodyMedium" style={styles.approach}>
                  {profile.approach}
                </Text>
              </View>
            )}
          </>
        )}

        {/* Bio */}
        {profile.bio && (
          <>
            <Divider style={styles.divider} />
            <Text variant="titleMedium" style={styles.sectionTitle}>
              About Me
            </Text>
            <Text variant="bodyMedium" style={styles.bio}>
              {profile.bio}
            </Text>
          </>
        )}
      </Surface>
    </ScrollView>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    surface: {
      margin: 16,
      padding: 24,
      borderRadius: 8,
      elevation: 2,
    },
    photoContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    editButton: {
      marginBottom: 24,
    },
    name: {
      textAlign: 'center',
      fontWeight: 'bold',
      marginBottom: 12,
    },
    roleContainer: {
      alignItems: 'center',
      marginBottom: 12,
    },
    roleChip: {
      marginBottom: 8,
    },
    location: {
      textAlign: 'center',
      marginBottom: 8,
    },
    program: {
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
      marginBottom: 16,
    },
    divider: {
      marginVertical: 16,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginVertical: 8,
    },
    stat: {
      alignItems: 'center',
    },
    statLabel: {
      color: theme.colors.onSurfaceVariant,
      marginTop: 4,
    },
    sectionTitle: {
      fontWeight: 'bold',
      marginBottom: 12,
    },
    infoRow: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    label: {
      fontWeight: '600',
      marginRight: 8,
      minWidth: 120,
    },
    approachContainer: {
      marginTop: 8,
    },
    approach: {
      marginTop: 4,
      fontStyle: 'italic',
    },
    bio: {
      lineHeight: 22,
    },
  });

export default ViewProfileScreen;
