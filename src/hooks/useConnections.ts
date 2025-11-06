/**
 * useConnections Hook
 * Custom hook for connection management operations
 * Feature: 002-app-screens
 */

import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from './useAppDispatch'
import {
  fetchActiveConnections,
  fetchPendingRequests,
  fetchSentRequests,
  fetchAllConnections,
  refreshAllConnections,
  createConnectionRequest,
  acceptConnectionRequest,
  declineConnectionRequest,
  cancelConnectionRequest,
  endActiveConnection,
} from '../store/connections/connectionsThunks'
import {
  selectActiveConnections,
  selectPendingRequests,
  selectSentRequests,
  selectEndedConnections,
  selectConnectionsLoading,
  selectConnectionsRefreshing,
  selectConnectionsError,
  selectActiveConnectionsCount,
  selectPendingRequestsCount,
  selectHasActiveConnections,
  selectHasPendingRequests,
  selectTotalUnreadMessageCount,
  selectConnectionById,
  selectConnectionsStatistics,
  selectIsConnectionsOperationInProgress,
  selectActiveConnectionsSortedByActivity,
} from '../store/connections/connectionsSelectors'
import { clearError } from '../store/connections/connectionsSlice'
import type { CreateConnectionData } from '../types'

/**
 * Hook for managing connections
 */
export const useConnections = () => {
  const dispatch = useAppDispatch()

  // Selectors
  const activeConnections = useAppSelector(selectActiveConnections)
  const pendingRequests = useAppSelector(selectPendingRequests)
  const sentRequests = useAppSelector(selectSentRequests)
  const endedConnections = useAppSelector(selectEndedConnections)
  const isLoading = useAppSelector(selectConnectionsLoading)
  const isRefreshing = useAppSelector(selectConnectionsRefreshing)
  const error = useAppSelector(selectConnectionsError)
  const activeCount = useAppSelector(selectActiveConnectionsCount)
  const pendingCount = useAppSelector(selectPendingRequestsCount)
  const hasActiveConnections = useAppSelector(selectHasActiveConnections)
  const hasPendingRequests = useAppSelector(selectHasPendingRequests)
  const totalUnreadCount = useAppSelector(selectTotalUnreadMessageCount)
  const statistics = useAppSelector(selectConnectionsStatistics)
  const isOperationInProgress = useAppSelector(selectIsConnectionsOperationInProgress)
  const sortedByActivity = useAppSelector(selectActiveConnectionsSortedByActivity)

  // Actions
  const fetchActive = useCallback(
    (userId: string) => {
      return dispatch(fetchActiveConnections(userId))
    },
    [dispatch]
  )

  const fetchPending = useCallback(
    (userId: string) => {
      return dispatch(fetchPendingRequests(userId))
    },
    [dispatch]
  )

  const fetchSent = useCallback(
    (userId: string) => {
      return dispatch(fetchSentRequests(userId))
    },
    [dispatch]
  )

  const fetchAll = useCallback(
    (userId: string) => {
      return dispatch(fetchAllConnections(userId))
    },
    [dispatch]
  )

  const refresh = useCallback(
    (userId: string) => {
      return dispatch(refreshAllConnections(userId))
    },
    [dispatch]
  )

  const createRequest = useCallback(
    (data: CreateConnectionData) => {
      return dispatch(createConnectionRequest(data))
    },
    [dispatch]
  )

  const acceptRequest = useCallback(
    (requestId: string) => {
      return dispatch(acceptConnectionRequest(requestId))
    },
    [dispatch]
  )

  const declineRequest = useCallback(
    (requestId: string) => {
      return dispatch(declineConnectionRequest(requestId))
    },
    [dispatch]
  )

  const cancelRequest = useCallback(
    (requestId: string) => {
      return dispatch(cancelConnectionRequest(requestId))
    },
    [dispatch]
  )

  const endConnection = useCallback(
    (connectionId: string) => {
      return dispatch(endActiveConnection(connectionId))
    },
    [dispatch]
  )

  const getConnectionById = useCallback(
    (connectionId: string) => {
      return selectConnectionById(
        { connections: { activeConnections, endedConnections } } as any,
        connectionId
      )
    },
    [activeConnections, endedConnections]
  )

  const dismissError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  return {
    // State
    activeConnections,
    pendingRequests,
    sentRequests,
    endedConnections,
    isLoading,
    isRefreshing,
    error,
    activeCount,
    pendingCount,
    hasActiveConnections,
    hasPendingRequests,
    totalUnreadCount,
    statistics,
    isOperationInProgress,
    sortedByActivity,

    // Actions
    fetchActive,
    fetchPending,
    fetchSent,
    fetchAll,
    refresh,
    createRequest,
    acceptRequest,
    declineRequest,
    cancelRequest,
    endConnection,
    getConnectionById,
    dismissError,
  }
}
