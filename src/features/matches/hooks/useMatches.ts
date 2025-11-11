/**
 * useMatches Hook
 * Custom hook for matching operations
 * Feature: 002-app-screens
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/useAppDispatch';
import {
  fetchSuggestedMatches,
  fetchAllMatches,
  refreshSuggestedMatches,
  sendConnectionRequest,
  declineMatch,
  selectSuggestedMatches,
  selectRequestedMatches,
  selectDeclinedMatches,
  selectMatchesLoading,
  selectMatchesRefreshing,
  selectMatchesError,
  selectSuggestedMatchesCount,
  selectHasSuggestedMatches,
  selectTopSuggestedMatches,
  selectMatchById,
  selectMatchStatistics,
  selectIsMatchesOperationInProgress,
  clearError,
} from '../store';

/**
 * Hook for managing matches
 */
export const useMatches = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const suggestedMatches = useAppSelector(selectSuggestedMatches);
  const requestedMatches = useAppSelector(selectRequestedMatches);
  const declinedMatches = useAppSelector(selectDeclinedMatches);
  const isLoading = useAppSelector(selectMatchesLoading);
  const isRefreshing = useAppSelector(selectMatchesRefreshing);
  const error = useAppSelector(selectMatchesError);
  const suggestedCount = useAppSelector(selectSuggestedMatchesCount);
  const hasSuggestedMatches = useAppSelector(selectHasSuggestedMatches);
  const topMatches = useAppSelector(selectTopSuggestedMatches);
  const statistics = useAppSelector(selectMatchStatistics);
  const isOperationInProgress = useAppSelector(selectIsMatchesOperationInProgress);

  // Actions
  const fetchSuggested = useCallback(
    (userId: string) => {
      return dispatch(fetchSuggestedMatches(userId));
    },
    [dispatch],
  );

  const fetchAll = useCallback(
    (userId: string) => {
      return dispatch(fetchAllMatches(userId));
    },
    [dispatch],
  );

  const refresh = useCallback(
    (userId: string) => {
      return dispatch(refreshSuggestedMatches(userId));
    },
    [dispatch],
  );

  const sendRequest = useCallback(
    (userId: string, matchId: string) => {
      return dispatch(sendConnectionRequest({ userId, matchId }));
    },
    [dispatch],
  );

  const decline = useCallback(
    (userId: string, matchId: string) => {
      return dispatch(declineMatch({ userId, matchId }));
    },
    [dispatch],
  );

  const getMatchById = useCallback(
    (matchId: string) => {
      return selectMatchById(
        { matches: { suggestedMatches, requestedMatches, declinedMatches } } as any,
        matchId,
      );
    },
    [suggestedMatches, requestedMatches, declinedMatches],
  );

  const dismissError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // State
    suggestedMatches,
    requestedMatches,
    declinedMatches,
    isLoading,
    isRefreshing,
    error,
    suggestedCount,
    hasSuggestedMatches,
    topMatches,
    statistics,
    isOperationInProgress,

    // Actions
    fetchSuggested,
    fetchAll,
    refresh,
    sendRequest,
    decline,
    getMatchById,
    dismissError,
  };
};
