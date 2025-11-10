/**
 * Matches Redux Selectors
 * Memoized selectors for match state with filtering
 * Feature: 002-app-screens
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type { MatchWithScore } from '../../types';

/**
 * Base selector for matches state
 */
export const selectMatchesState = (state: RootState) => state.matches;

/**
 * Select suggested matches
 */
export const selectSuggestedMatches = createSelector(
  [selectMatchesState],
  matchesState => matchesState.suggestedMatches,
);

/**
 * Select requested matches
 */
export const selectRequestedMatches = createSelector(
  [selectMatchesState],
  matchesState => matchesState.requestedMatches,
);

/**
 * Select declined matches
 */
export const selectDeclinedMatches = createSelector(
  [selectMatchesState],
  matchesState => matchesState.declinedMatches,
);

/**
 * Select matches loading state
 */
export const selectMatchesLoading = createSelector(
  [selectMatchesState],
  matchesState => matchesState.isLoading,
);

/**
 * Select matches refreshing state
 */
export const selectMatchesRefreshing = createSelector(
  [selectMatchesState],
  matchesState => matchesState.isRefreshing,
);

/**
 * Select matches error
 */
export const selectMatchesError = createSelector(
  [selectMatchesState],
  matchesState => matchesState.error,
);

/**
 * Select total suggested matches count
 */
export const selectSuggestedMatchesCount = createSelector(
  [selectSuggestedMatches],
  matches => matches.length,
);

/**
 * Select total requested matches count
 */
export const selectRequestedMatchesCount = createSelector(
  [selectRequestedMatches],
  matches => matches.length,
);

/**
 * Select total declined matches count
 */
export const selectDeclinedMatchesCount = createSelector(
  [selectDeclinedMatches],
  matches => matches.length,
);

/**
 * Select if there are any suggested matches
 */
export const selectHasSuggestedMatches = createSelector(
  [selectSuggestedMatchesCount],
  count => count > 0,
);

/**
 * Select top suggested matches (highest compatibility scores)
 */
export const selectTopSuggestedMatches = createSelector(
  [selectSuggestedMatches],
  (matches): MatchWithScore[] => {
    return [...matches]
      .sort((a, b) => b.compatibilityScore.totalScore - a.compatibilityScore.totalScore)
      .slice(0, 10);
  },
);

/**
 * Select suggested matches by minimum compatibility score
 */
export const selectSuggestedMatchesByMinScore = createSelector(
  [selectSuggestedMatches, (_state: RootState, minScore: number) => minScore],
  (matches, minScore): MatchWithScore[] => {
    return matches.filter(m => m.compatibilityScore.totalScore >= minScore);
  },
);

/**
 * Select suggested matches by recovery program
 */
export const selectSuggestedMatchesByProgram = createSelector(
  [selectSuggestedMatches, (_state: RootState, program: string) => program],
  (matches, program): MatchWithScore[] => {
    return matches.filter(
      m => m.matchedUser.recovery_program.toLowerCase() === program.toLowerCase(),
    );
  },
);

/**
 * Select suggested matches by location (same city/state)
 */
export const selectSuggestedMatchesByLocation = createSelector(
  [
    selectSuggestedMatches,
    (_state: RootState, location: { city?: string; state?: string }) => location,
  ],
  (matches, location): MatchWithScore[] => {
    return matches.filter(m => {
      const user = m.matchedUser;
      if (location.city && user.city) {
        return user.city.toLowerCase() === location.city.toLowerCase();
      }
      if (location.state && user.state) {
        return user.state.toLowerCase() === location.state.toLowerCase();
      }
      return false;
    });
  },
);

/**
 * Select match by ID
 */
export const selectMatchById = createSelector(
  [selectMatchesState, (_state: RootState, matchId: string) => matchId],
  (matchesState, matchId): MatchWithScore | null => {
    const allMatches = [
      ...matchesState.suggestedMatches,
      ...matchesState.requestedMatches,
      ...matchesState.declinedMatches,
    ];
    return allMatches.find(m => m.id === matchId) || null;
  },
);

/**
 * Select compatibility factors for a match
 */
export const selectMatchCompatibilityFactors = createSelector(
  [(_state: RootState, matchId: string) => matchId, selectMatchesState],
  (matchId, matchesState) => {
    const allMatches = [
      ...matchesState.suggestedMatches,
      ...matchesState.requestedMatches,
      ...matchesState.declinedMatches,
    ];
    const match = allMatches.find(m => m.id === matchId);
    return match?.compatibilityScore.factors || null;
  },
);

/**
 * Select if any operation is in progress
 */
export const selectIsMatchesOperationInProgress = createSelector(
  [selectMatchesLoading, selectMatchesRefreshing],
  (isLoading, isRefreshing): boolean => isLoading || isRefreshing,
);

/**
 * Select match statistics summary
 */
export const selectMatchStatistics = createSelector(
  [
    selectSuggestedMatchesCount,
    selectRequestedMatchesCount,
    selectDeclinedMatchesCount,
    selectTopSuggestedMatches,
  ],
  (suggestedCount, requestedCount, declinedCount, topMatches) => {
    const averageScore =
      topMatches.length > 0
        ? Math.round(
            topMatches.reduce((sum, m) => sum + m.compatibilityScore.totalScore, 0) /
              topMatches.length,
          )
        : 0;

    return {
      totalSuggested: suggestedCount,
      totalRequested: requestedCount,
      totalDeclined: declinedCount,
      averageCompatibilityScore: averageScore,
      topMatchScore: topMatches[0]?.compatibilityScore.totalScore || 0,
    };
  },
);

/**
 * Select recent requested matches (last 7 days)
 */
export const selectRecentRequestedMatches = createSelector(
  [selectRequestedMatches],
  (matches): MatchWithScore[] => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return matches.filter(m => {
      const createdDate = new Date(m.created_at);
      return createdDate >= sevenDaysAgo;
    });
  },
);

/**
 * Select if match exists in any status
 */
export const selectMatchExists = createSelector(
  [selectMatchesState, (_state: RootState, matchId: string) => matchId],
  (matchesState, matchId): boolean => {
    const allMatches = [
      ...matchesState.suggestedMatches,
      ...matchesState.requestedMatches,
      ...matchesState.declinedMatches,
    ];
    return allMatches.some(m => m.id === matchId);
  },
);
