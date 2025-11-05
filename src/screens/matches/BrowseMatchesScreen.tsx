import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Surface, ActivityIndicator, Banner } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import MatchCard from '../../components/matches/MatchCard';
import { useGetMatchesQuery, Match } from '../../store/api/matchingApi';
import { RootState } from '../../store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const BrowseMatchesScreen: React.FC = () => {
  const navigation = useNavigation();
  const userId = useSelector((state: RootState) => state.user?.user?.id);
  const [isOffline, setIsOffline] = useState(false);
  const [cachedMatches, setCachedMatches] = useState<Match[] | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const {
    data: matchesData,
    isLoading,
    isFetching,
    refetch,
  } = useGetMatchesQuery(userId || '', {
    skip: !userId,
  });

  // Check network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  // Load cached matches on mount
  useEffect(() => {
    loadCachedMatches();
  }, [userId]);

  // Cache matches when data is fetched
  useEffect(() => {
    if (matchesData?.matches && userId) {
      cacheMatches(matchesData.matches);
    }
  }, [matchesData, userId]);

  const loadCachedMatches = async () => {
    if (!userId) return;

    try {
      const cached = await AsyncStorage.getItem(`matches:${userId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        setCachedMatches(parsed.matches);
        setLastRefresh(new Date(parsed.cached_at));
      }
    } catch (error) {
      console.error('Error loading cached matches:', error);
    }
  };

  const cacheMatches = async (matches: Match[]) => {
    if (!userId) return;

    try {
      await AsyncStorage.setItem(
        `matches:${userId}`,
        JSON.stringify({
          matches,
          cached_at: new Date().toISOString(),
        }),
      );
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error caching matches:', error);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleMatchPress = (match: Match) => {
    navigation.navigate('MatchDetail' as never, { match } as never);
  };

  const handleConnect = (match: Match) => {
    // Navigate to connection request screen (WP05)
    navigation.navigate('ConnectionRequest' as never, { sponsorId: match.sponsor_id } as never);
  };

  // Determine which matches to display
  const displayMatches = isOffline
    ? cachedMatches || []
    : matchesData?.matches || cachedMatches || [];

  const showStaleBanner = isOffline && cachedMatches && cachedMatches.length > 0;

  // Skeleton loading cards
  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map(key => (
        <Surface key={key} style={styles.skeletonCard}>
          <ActivityIndicator animating={true} size="large" />
          <Text variant="bodyMedium" style={styles.skeletonText}>
            Finding your matches...
          </Text>
        </Surface>
      ))}
    </View>
  );

  // Empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No Matches Found
      </Text>
      <Text variant="bodyMedium" style={styles.emptyMessage}>
        We couldn't find any sponsors that match your preferences right now.
      </Text>
      <Text variant="bodyMedium" style={styles.emptyHint}>
        Try updating your profile or check back later for new sponsors.
      </Text>
    </View>
  );

  if (isLoading && !cachedMatches) {
    return renderSkeleton();
  }

  return (
    <View style={styles.container}>
      {showStaleBanner && (
        <Banner visible={true} icon="wifi-off" style={styles.banner}>
          Offline - Showing cached matches from {lastRefresh?.toLocaleDateString() || 'earlier'}.
          Pull to refresh when online.
        </Banner>
      )}

      <FlatList
        data={displayMatches}
        keyExtractor={item => item.sponsor_id}
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            onPress={() => handleMatchPress(item)}
            onConnect={() => handleConnect(item)}
          />
        )}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={handleRefresh} enabled={!isOffline} />
        }
        contentContainerStyle={displayMatches.length === 0 ? styles.emptyList : styles.list}
      />
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    banner: {
      backgroundColor: '#FFF3E0',
    },
    list: {
      paddingVertical: 8,
    },
    emptyList: {
      flex: 1,
    },
    skeletonContainer: {
      flex: 1,
      padding: 16,
    },
    skeletonCard: {
      height: 200,
      marginVertical: 8,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    skeletonText: {
      marginTop: 16,
      color: theme.colors.onSurfaceVariant,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyTitle: {
      marginBottom: 16,
      textAlign: 'center',
      fontWeight: 'bold',
    },
    emptyMessage: {
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
      marginBottom: 8,
    },
    emptyHint: {
      textAlign: 'center',
      color: '#999',
      fontStyle: 'italic',
    },
  });

export default BrowseMatchesScreen;
