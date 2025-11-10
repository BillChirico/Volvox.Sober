/**
 * Connections Redux Selectors
 * Memoized selectors for connection state with status grouping
 * Feature: 002-app-screens
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';

/**
 * Base selector for connections state
 */
export const selectConnectionsState = (state: RootState) => state.connections;

/**
 * Select active connections
 */
export const selectActiveConnections = createSelector(
  [selectConnectionsState],
  connectionsState => connectionsState.activeConnections,
);

/**
 * Select pending requests (received)
 */
export const selectPendingRequests = createSelector(
  [selectConnectionsState],
  connectionsState => connectionsState.pendingRequests,
);

/**
 * Select sent requests
 */
export const selectSentRequests = createSelector(
  [selectConnectionsState],
  connectionsState => connectionsState.sentRequests,
);

/**
 * Select ended connections
 */
export const selectEndedConnections = createSelector(
  [selectConnectionsState],
  connectionsState => connectionsState.endedConnections,
);

/**
 * Select connections loading state
 */
export const selectConnectionsLoading = createSelector(
  [selectConnectionsState],
  connectionsState => connectionsState.isLoading,
);

/**
 * Select connections refreshing state
 */
export const selectConnectionsRefreshing = createSelector(
  [selectConnectionsState],
  connectionsState => connectionsState.isRefreshing,
);

/**
 * Select connections error
 */
export const selectConnectionsError = createSelector(
  [selectConnectionsState],
  connectionsState => connectionsState.error,
);

/**
 * Select total active connections count
 */
export const selectActiveConnectionsCount = createSelector(
  [selectActiveConnections],
  connections => connections.length,
);

/**
 * Select total pending requests count
 */
export const selectPendingRequestsCount = createSelector(
  [selectPendingRequests],
  requests => requests.length,
);

/**
 * Select total sent requests count
 */
export const selectSentRequestsCount = createSelector(
  [selectSentRequests],
  requests => requests.length,
);

/**
 * Select total ended connections count
 */
export const selectEndedConnectionsCount = createSelector(
  [selectEndedConnections],
  connections => connections.length,
);

/**
 * Select if there are any active connections
 */
export const selectHasActiveConnections = createSelector(
  [selectActiveConnectionsCount],
  count => count > 0,
);

/**
 * Select if there are pending requests
 */
export const selectHasPendingRequests = createSelector(
  [selectPendingRequestsCount],
  count => count > 0,
);

/**
 * Select connection by ID
 */
export const selectConnectionById = createSelector(
  [selectConnectionsState, (_state: RootState, connectionId: string) => connectionId],
  (connectionsState, connectionId) => {
    const allConnections = [
      ...connectionsState.activeConnections,
      ...connectionsState.endedConnections,
    ];
    return allConnections.find(c => c.id === connectionId) || null;
  },
);

/**
 * Select request by ID
 */
export const selectRequestById = createSelector(
  [selectConnectionsState, (_state: RootState, requestId: string) => requestId],
  (connectionsState, requestId) => {
    const allRequests = [...connectionsState.pendingRequests, ...connectionsState.sentRequests];
    return allRequests.find(r => r.id === requestId) || null;
  },
);

/**
 * Select active connections with unread messages
 */
export const selectConnectionsWithUnreadMessages = createSelector(
  [selectActiveConnections],
  connections => {
    return connections.filter(c => c.unreadMessageCount > 0);
  },
);

/**
 * Select total unread message count across all connections
 */
export const selectTotalUnreadMessageCount = createSelector(
  [selectActiveConnections],
  connections => {
    return connections.reduce((total, c) => total + c.unreadMessageCount, 0);
  },
);

/**
 * Select active connections sorted by last interaction
 */
export const selectActiveConnectionsSortedByActivity = createSelector(
  [selectActiveConnections],
  connections => {
    return [...connections].sort((a, b) => {
      const aTime = a.lastInteractionAt
        ? new Date(a.lastInteractionAt).getTime()
        : new Date(a.created_at).getTime();
      const bTime = b.lastInteractionAt
        ? new Date(b.lastInteractionAt).getTime()
        : new Date(b.created_at).getTime();
      return bTime - aTime;
    });
  },
);

/**
 * Select pending requests sorted by creation date (newest first)
 */
export const selectPendingRequestsSortedByDate = createSelector(
  [selectPendingRequests],
  requests => {
    return [...requests].sort((a, b) => {
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();
      return bTime - aTime;
    });
  },
);

/**
 * Select if any operation is in progress
 */
export const selectIsConnectionsOperationInProgress = createSelector(
  [selectConnectionsLoading, selectConnectionsRefreshing],
  (isLoading, isRefreshing): boolean => isLoading || isRefreshing,
);

/**
 * Select connections statistics summary
 */
export const selectConnectionsStatistics = createSelector(
  [
    selectActiveConnectionsCount,
    selectPendingRequestsCount,
    selectSentRequestsCount,
    selectTotalUnreadMessageCount,
  ],
  (activeCount, pendingCount, sentCount, unreadCount) => ({
    totalActive: activeCount,
    totalPending: pendingCount,
    totalSent: sentCount,
    totalUnreadMessages: unreadCount,
  }),
);

/**
 * Select user's role in connection (sponsor or sponsee)
 */
export const selectUserRoleInConnection = createSelector(
  [
    (_state: RootState, connectionId: string, _userId: string) => connectionId,
    (_state: RootState, _connectionId: string, userId: string) => userId,
    selectConnectionsState,
  ],
  (connectionId, userId, connectionsState) => {
    const allConnections = [
      ...connectionsState.activeConnections,
      ...connectionsState.endedConnections,
    ];
    const connection = allConnections.find(c => c.id === connectionId);

    if (!connection) return null;

    if (connection.sponsor_id === userId) return 'sponsor';
    if (connection.sponsee_id === userId) return 'sponsee';

    return null;
  },
);

/**
 * Select connections by user role (as sponsor or as sponsee)
 */
export const selectConnectionsByRole = createSelector(
  [selectActiveConnections, (_state: RootState, userId: string) => userId],
  (connections, userId) => {
    const asSponsor = connections.filter(c => c.sponsor_id === userId);
    const asSponsee = connections.filter(c => c.sponsee_id === userId);

    return { asSponsor, asSponsee };
  },
);

/**
 * Select recent activity (last 7 days)
 */
export const selectRecentConnectionActivity = createSelector(
  [selectActiveConnections, selectPendingRequests],
  (activeConnections, pendingRequests) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentConnections = activeConnections.filter(c => {
      const interactionTime = c.lastInteractionAt
        ? new Date(c.lastInteractionAt)
        : new Date(c.created_at);
      return interactionTime >= sevenDaysAgo;
    });

    const recentRequests = pendingRequests.filter(r => {
      const createdTime = new Date(r.created_at);
      return createdTime >= sevenDaysAgo;
    });

    return {
      recentConnections,
      recentRequests,
      totalRecentActivity: recentConnections.length + recentRequests.length,
    };
  },
);

/**
 * Alias for selectPendingRequestsCount (used by navigation components)
 */
export const selectPendingConnectionRequestsCount = selectPendingRequestsCount;
