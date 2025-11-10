/**
 * Matches Screen
 * Browse and filter potential sponsor/sponsee matches
 * Feature: 002-app-screens
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { MatchCard } from '../../src/components/matches/MatchCard';
import { MatchDetailModal } from '../../src/components/matches/MatchDetailModal';
import { NoMatchesEmptyState } from '../../src/components/matches/NoMatchesEmptyState';
import { FilterBar, type FilterOptions } from '../../src/components/matches/FilterBar';
import { LoadingSpinner } from '../../src/components/common/LoadingSpinner';
import { EmptyState } from '../../src/components/common/EmptyState';
import { useMatches } from '../../src/hooks/useMatches';
import { useAuth } from '../../src/hooks/useAuth';
import { useAppTheme } from '../../src/core/theme/ThemeContext';
import type { MatchWithProfile } from '../../src/types/match';

export default function MatchesScreen() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const {
    suggestedMatches,
    isLoading,
    isRefreshing,
    error,
    hasSuggestedMatches,
    fetchSuggested,
    refresh,
    sendRequest,
    dismissError,
  } = useMatches();

  const [filters, setFilters] = useState<FilterOptions>({
    recoveryPrograms: [],
    availability: [],
  });
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchWithProfile | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  // Fetch matches on mount
  useEffect(() => {
    if (user?.id) {
      fetchSuggested(user.id);
    }
  }, [user?.id, fetchSuggested]);

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    if (!user?.id) return;

    try {
      await refresh(user.id);
    } catch (err) {
      console.error('Error refreshing matches:', err);
    }
  }, [user?.id, refresh]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: FilterOptions) => {
    setIsApplyingFilters(true);
    setFilters(newFilters);

    // Simulate filter application (in real app, would refetch with filters)
    setTimeout(() => {
      setIsApplyingFilters(false);
    }, 300);
  }, []);

  // Filter matches based on selected filters
  const filteredMatches = suggestedMatches.filter(match => {
    const { candidate } = match;

    // Filter by recovery program
    if (
      filters.recoveryPrograms.length > 0 &&
      !filters.recoveryPrograms.includes(candidate.recovery_program || '')
    ) {
      return false;
    }

    // Filter by availability
    if (filters.availability.length > 0) {
      const hasMatchingAvailability = candidate.availability?.some(avail =>
        filters.availability.includes(avail),
      );
      if (!hasMatchingAvailability) {
        return false;
      }
    }

    return true;
  });

  // Handle opening match detail
  const handleMatchPress = useCallback((match: MatchWithProfile) => {
    setSelectedMatch(match);
    setIsDetailModalVisible(true);
  }, []);

  // Handle closing match detail
  const handleCloseDetail = useCallback(() => {
    setIsDetailModalVisible(false);
    setSelectedMatch(null);
  }, []);

  // Handle connection request from detail modal
  const handleConnectFromDetail = useCallback(async () => {
    if (!user?.id || !selectedMatch) return;

    try {
      await sendRequest(user.id, selectedMatch.id);
      setIsDetailModalVisible(false);
      Alert.alert('Success', 'Connection request sent!', [{ text: 'OK' }]);
    } catch (err) {
      console.error('Error sending connection request:', err);
      Alert.alert('Error', 'Failed to send connection request. Please try again.', [
        { text: 'OK' },
      ]);
    }
  }, [user?.id, selectedMatch, sendRequest]);

  // Handle connection request from card
  const handleConnect = useCallback(
    (match: MatchWithProfile) => {
      Alert.alert(
        'Send Connection Request',
        `Send a connection request to ${match.candidate.name}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Send',
            onPress: async () => {
              if (!user?.id) return;

              try {
                await sendRequest(user.id, match.id);
                Alert.alert('Success', 'Connection request sent!', [{ text: 'OK' }]);
              } catch (err) {
                console.error('Error sending connection request:', err);
                Alert.alert('Error', 'Failed to send connection request. Please try again.', [
                  { text: 'OK' },
                ]);
              }
            },
          },
        ],
      );
    },
    [user?.id, sendRequest],
  );

  // Handle decline from detail modal (placeholder for T089)
  const handleDeclineFromDetail = useCallback(() => {
    if (!selectedMatch) return;

    Alert.alert(
      'Decline Match',
      `Are you sure you want to decline ${selectedMatch.candidate.name}? You won't see this match again for 30 days.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () => {
            setIsDetailModalVisible(false);
            Alert.alert(
              'Feature Coming Soon',
              'Decline functionality will be implemented in T089.',
              [{ text: 'OK' }],
            );
          },
        },
      ],
    );
  }, [selectedMatch]);

  // Show error alert if error exists
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        {
          text: 'OK',
          onPress: dismissError,
        },
      ]);
    }
  }, [error, dismissError]);

  // Loading state
  if (isLoading && !hasSuggestedMatches) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LoadingSpinner text="Finding your matches..." />
      </View>
    );
  }

  // Calculate profile completion (mock data - would come from user profile)
  const calculateProfileCompletion = useCallback(() => {
    // This would normally check actual user profile data
    const fields = {
      recovery_program: true, // Example: user.profile?.recovery_program
      availability: false, // Example: user.profile?.availability?.length > 0
      location: true, // Example: user.profile?.city && user.profile?.state
      bio: false, // Example: user.profile?.bio
      sobriety_date: true, // Example: user.profile?.sobriety_start_date
    };

    const totalFields = Object.keys(fields).length;
    const completedFields = Object.values(fields).filter(Boolean).length;
    const percentage = Math.round((completedFields / totalFields) * 100);

    const missing: string[] = [];
    if (!fields.recovery_program) missing.push('Recovery Program');
    if (!fields.availability) missing.push('Availability');
    if (!fields.location) missing.push('Location (City & State)');
    if (!fields.bio) missing.push('Bio');
    if (!fields.sobriety_date) missing.push('Sobriety Start Date');

    return { percentage, missing };
  }, []);

  // No matches state
  if (!hasSuggestedMatches && !isLoading) {
    const { percentage, missing } = calculateProfileCompletion();

    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <NoMatchesEmptyState
          completionPercentage={percentage}
          missingFields={missing}
          onImproveProfile={() => {
            // Navigate to profile tab
            Alert.alert(
              'Improve Your Profile',
              'Complete your profile to get better matches. Add your recovery program, availability, and location.',
              [{ text: 'OK' }],
            );
          }}
        />
      </View>
    );
  }

  const hasActiveFilters = filters.recoveryPrograms.length > 0 || filters.availability.length > 0;
  const showEmptyFilterState = hasActiveFilters && filteredMatches.length === 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isApplying={isApplyingFilters}
      />

      {/* Matches List */}
      {showEmptyFilterState ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="filter-off"
            title="No Matches Found"
            description="Try adjusting your filters to see more matches."
            actionText="Clear Filters"
            onAction={() => handleFiltersChange({ recoveryPrograms: [], availability: [] })}
          />
        </View>
      ) : (
        <FlatList
          data={filteredMatches}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <MatchCard
              match={item}
              onPress={() => handleMatchPress(item)}
              onConnect={() => handleConnect(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Match Detail Modal */}
      <MatchDetailModal
        match={selectedMatch}
        visible={isDetailModalVisible}
        onDismiss={handleCloseDetail}
        onConnect={handleConnectFromDetail}
        onDecline={handleDeclineFromDetail}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
  },
});
