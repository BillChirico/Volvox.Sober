import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Avatar, Text, Button, ProgressBar, Chip } from 'react-native-paper';
import { Match } from '../../store/api/matchingApi';

interface MatchCardProps {
  match: Match;
  onPress: () => void;
  onConnect: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onPress, onConnect }) => {
  const getCompatibilityColor = (score: number): string => {
    if (score >= 80) return '#4CAF50'; // Green
    if (score >= 60) return '#FFC107'; // Amber
    return '#FF9800'; // Orange
  };

  const getCompatibilityLabel = (score: number): string => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    return 'Potential Match';
  };

  return (
    <TouchableOpacity onPress={onPress} accessibilityLabel={`Match with ${match.sponsor_name}`}>
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          {/* Header: Photo + Name + Score */}
          <View style={styles.header}>
            <View style={styles.profileSection}>
              {match.sponsor_photo_url ? (
                <Avatar.Image size={60} source={{ uri: match.sponsor_photo_url }} />
              ) : (
                <Avatar.Icon size={60} icon="account" />
              )}
              <View style={styles.profileInfo}>
                <Text variant="titleMedium" style={styles.name}>
                  {match.sponsor_name}
                </Text>
                <Text variant="bodySmall" style={styles.location}>
                  📍 {match.location.city}, {match.location.state}
                </Text>
                <Text variant="bodySmall" style={styles.experience}>
                  🎯 {match.years_sober} years sober
                </Text>
              </View>
            </View>

            {/* Compatibility Score Badge */}
            <View style={styles.scoreSection}>
              <View
                style={[
                  styles.scoreBadge,
                  { backgroundColor: getCompatibilityColor(match.compatibility_score) },
                ]}
                accessibilityLabel={`Compatibility score: ${match.compatibility_score} out of 100`}>
                <Text variant="headlineSmall" style={styles.scoreText}>
                  {match.compatibility_score}
                </Text>
                <Text variant="labelSmall" style={styles.scoreLabel}>
                  / 100
                </Text>
              </View>
              <Chip
                mode="flat"
                textStyle={styles.chipText}
                style={[
                  styles.chip,
                  { backgroundColor: getCompatibilityColor(match.compatibility_score) },
                ]}>
                {getCompatibilityLabel(match.compatibility_score)}
              </Chip>
            </View>
          </View>

          {/* Compatibility Breakdown */}
          <View style={styles.breakdown}>
            <Text variant="labelMedium" style={styles.breakdownTitle}>
              Compatibility Breakdown
            </Text>

            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLabel}>
                <Text variant="bodySmall">Location</Text>
                <Text variant="bodySmall" style={styles.breakdownScore}>
                  {match.score_breakdown.location}/25
                </Text>
              </View>
              <ProgressBar
                progress={match.score_breakdown.location / 25}
                color="#4CAF50"
                style={styles.progressBar}
              />
            </View>

            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLabel}>
                <Text variant="bodySmall">Program Type</Text>
                <Text variant="bodySmall" style={styles.breakdownScore}>
                  {match.score_breakdown.program_type}/25
                </Text>
              </View>
              <ProgressBar
                progress={match.score_breakdown.program_type / 25}
                color="#2196F3"
                style={styles.progressBar}
              />
            </View>

            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLabel}>
                <Text variant="bodySmall">Availability</Text>
                <Text variant="bodySmall" style={styles.breakdownScore}>
                  {match.score_breakdown.availability}/20
                </Text>
              </View>
              <ProgressBar
                progress={match.score_breakdown.availability / 20}
                color="#FF9800"
                style={styles.progressBar}
              />
            </View>

            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLabel}>
                <Text variant="bodySmall">Approach</Text>
                <Text variant="bodySmall" style={styles.breakdownScore}>
                  {match.score_breakdown.approach}/15
                </Text>
              </View>
              <ProgressBar
                progress={match.score_breakdown.approach / 15}
                color="#9C27B0"
                style={styles.progressBar}
              />
            </View>

            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLabel}>
                <Text variant="bodySmall">Experience</Text>
                <Text variant="bodySmall" style={styles.breakdownScore}>
                  {match.score_breakdown.experience}/15
                </Text>
              </View>
              <ProgressBar
                progress={match.score_breakdown.experience / 15}
                color="#FFC107"
                style={styles.progressBar}
              />
            </View>
          </View>

          {/* Connect Button */}
          <Button
            mode="contained"
            onPress={onConnect}
            style={styles.connectButton}
            icon="hand-wave">
            Send Connection Request
          </Button>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  profileSection: {
    flexDirection: 'row',
    flex: 1,
  },
  profileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  location: {
    color: '#666',
    marginBottom: 2,
  },
  experience: {
    color: '#666',
  },
  scoreSection: {
    alignItems: 'center',
  },
  scoreBadge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scoreLabel: {
    color: '#fff',
    marginTop: -4,
  },
  chip: {
    height: 24,
  },
  chipText: {
    fontSize: 10,
    color: '#fff',
  },
  breakdown: {
    marginVertical: 16,
  },
  breakdownTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  breakdownItem: {
    marginBottom: 12,
  },
  breakdownLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  breakdownScore: {
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  connectButton: {
    marginTop: 8,
  },
});

export default MatchCard;
