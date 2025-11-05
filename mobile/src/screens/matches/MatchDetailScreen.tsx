import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, Avatar, Button, Divider, Chip } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Match } from '../../store/api/matchingApi';

const MatchDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const match = (route.params as { match: Match })?.match;

  if (!match) {
    return null;
  }

  const handleSendRequest = () => {
    navigation.navigate('ConnectionRequest' as never, { sponsorId: match.sponsor_id } as never);
  };

  const getScoreColor = (score: number, max: number): string => {
    const percentage = score / max;
    if (percentage >= 0.8) return '#4CAF50';
    if (percentage >= 0.6) return '#FFC107';
    return '#FF9800';
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.surface}>
        {/* Profile Header */}
        <View style={styles.header}>
          {match.sponsor_photo_url ? (
            <Avatar.Image size={100} source={{ uri: match.sponsor_photo_url }} />
          ) : (
            <Avatar.Icon size={100} icon="account" />
          )}
          <Text variant="headlineMedium" style={styles.name}>
            {match.sponsor_name}
          </Text>
          <View style={styles.scoreBadge}>
            <Text variant="displaySmall" style={styles.scoreText}>
              {match.compatibility_score}
            </Text>
            <Text variant="labelMedium" style={styles.scoreLabel}>
              Compatibility Score
            </Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Basic Info */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Basic Information
          </Text>

          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.label}>
              📍 Location:
            </Text>
            <Text variant="bodyMedium">
              {match.location.city}, {match.location.state}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.label}>
              🎯 Sobriety:
            </Text>
            <Text variant="bodyMedium">{match.years_sober} years sober</Text>
          </View>

          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.label}>
              📅 Availability:
            </Text>
            <Text variant="bodyMedium">{match.availability}</Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Sponsorship Approach */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Sponsorship Approach
          </Text>
          <Text variant="bodyMedium" style={styles.approach}>
            {match.approach}
          </Text>
        </View>

        {match.bio && (
          <>
            <Divider style={styles.divider} />
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                About Me
              </Text>
              <Text variant="bodyMedium" style={styles.bio}>
                {match.bio}
              </Text>
            </View>
          </>
        )}

        <Divider style={styles.divider} />

        {/* Compatibility Breakdown */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Compatibility Details
          </Text>
          <Text variant="bodySmall" style={styles.breakdownHint}>
            Here's how this match was calculated:
          </Text>

          <View style={styles.scoreBreakdown}>
            <View style={styles.scoreItem}>
              <View style={styles.scoreHeader}>
                <Text variant="bodyMedium" style={styles.scoreLabel}>
                  Location Proximity
                </Text>
                <Chip
                  mode="flat"
                  style={[
                    styles.scoreChip,
                    { backgroundColor: getScoreColor(match.score_breakdown.location, 25) },
                  ]}
                  textStyle={styles.chipText}
                >
                  {match.score_breakdown.location}/25
                </Chip>
              </View>
              <Text variant="bodySmall" style={styles.scoreDescription}>
                How close you are geographically
              </Text>
            </View>

            <View style={styles.scoreItem}>
              <View style={styles.scoreHeader}>
                <Text variant="bodyMedium" style={styles.scoreLabel}>
                  Program Type Match
                </Text>
                <Chip
                  mode="flat"
                  style={[
                    styles.scoreChip,
                    { backgroundColor: getScoreColor(match.score_breakdown.program_type, 25) },
                  ]}
                  textStyle={styles.chipText}
                >
                  {match.score_breakdown.program_type}/25
                </Chip>
              </View>
              <Text variant="bodySmall" style={styles.scoreDescription}>
                Same recovery program (AA, NA, etc.)
              </Text>
            </View>

            <View style={styles.scoreItem}>
              <View style={styles.scoreHeader}>
                <Text variant="bodyMedium" style={styles.scoreLabel}>
                  Availability Match
                </Text>
                <Chip
                  mode="flat"
                  style={[
                    styles.scoreChip,
                    { backgroundColor: getScoreColor(match.score_breakdown.availability, 20) },
                  ]}
                  textStyle={styles.chipText}
                >
                  {match.score_breakdown.availability}/20
                </Chip>
              </View>
              <Text variant="bodySmall" style={styles.scoreDescription}>
                Sponsor's availability meets your needs
              </Text>
            </View>

            <View style={styles.scoreItem}>
              <View style={styles.scoreHeader}>
                <Text variant="bodyMedium" style={styles.scoreLabel}>
                  Approach Alignment
                </Text>
                <Chip
                  mode="flat"
                  style={[
                    styles.scoreChip,
                    { backgroundColor: getScoreColor(match.score_breakdown.approach, 15) },
                  ]}
                  textStyle={styles.chipText}
                >
                  {match.score_breakdown.approach}/15
                </Chip>
              </View>
              <Text variant="bodySmall" style={styles.scoreDescription}>
                Similar sponsorship philosophy
              </Text>
            </View>

            <View style={styles.scoreItem}>
              <View style={styles.scoreHeader}>
                <Text variant="bodyMedium" style={styles.scoreLabel}>
                  Experience Level
                </Text>
                <Chip
                  mode="flat"
                  style={[
                    styles.scoreChip,
                    { backgroundColor: getScoreColor(match.score_breakdown.experience, 15) },
                  ]}
                  textStyle={styles.chipText}
                >
                  {match.score_breakdown.experience}/15
                </Chip>
              </View>
              <Text variant="bodySmall" style={styles.scoreDescription}>
                Sponsor has appropriate sobriety experience
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <Button
          mode="contained"
          onPress={handleSendRequest}
          style={styles.connectButton}
          icon="hand-wave"
        >
          Send Connection Request
        </Button>
      </Surface>
    </ScrollView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
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
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    marginTop: 16,
    marginBottom: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scoreBadge: {
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  scoreText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scoreLabel: {
    color: '#fff',
    marginTop: 4,
  },
  divider: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  label: {
    fontWeight: '600',
    marginRight: 8,
    minWidth: 120,
  },
  approach: {
    lineHeight: 22,
    fontStyle: 'italic',
  },
  bio: {
    lineHeight: 22,
  },
  breakdownHint: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: 16,
  },
  scoreBreakdown: {
    gap: 16,
  },
  scoreItem: {
    marginBottom: 12,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  scoreChip: {
    height: 28,
  },
  chipText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  scoreDescription: {
    color: theme.colors.onSurfaceVariant,
    marginTop: 4,
  },
  connectButton: {
    marginTop: 24,
    paddingVertical: 8,
  },
});

export default MatchDetailScreen;
