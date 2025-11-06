/**
 * useOptimizedList Hook
 * Provides optimized list rendering with performance tracking
 */

import React, { useState, useCallback, useRef, useMemo } from 'react'
import { FlatListProps, ViewToken, View, ActivityIndicator } from 'react-native'

export interface UseOptimizedListOptions<T> {
  data: T[]
  pageSize?: number
  prefetchThreshold?: number
  enablePerformanceTracking?: boolean
  getItemHeight?: (item: T, index: number) => number
}

export interface UseOptimizedListResult<T> {
  // List props
  flatListProps: Partial<FlatListProps<T>>

  // Pagination
  hasMore: boolean
  loadMore: () => void
  isLoadingMore: boolean

  // Refresh
  isRefreshing: boolean
  onRefresh: () => Promise<void>

  // Performance
  averageRenderTime: number
  totalRenders: number

  // Visible items
  visibleItems: T[]
  onViewableItemsChanged: (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => void
}

/**
 * Hook for optimized list rendering
 */
export const useOptimizedList = <T extends { id: string | number }>(
  options: UseOptimizedListOptions<T>
): UseOptimizedListResult<T> => {
  const {
    data,
    pageSize = 20,
    prefetchThreshold = 0.5,
    enablePerformanceTracking = __DEV__,
    getItemHeight,
  } = options

  // Pagination state
  const [displayedCount, setDisplayedCount] = useState(pageSize)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Performance tracking
  const renderTimes = useRef<number[]>([])
  const renderCount = useRef(0)

  // Visible items tracking
  const [visibleItems, setVisibleItems] = useState<T[]>([])

  // Displayed data (paginated)
  const displayedData = useMemo(() => {
    return data.slice(0, displayedCount)
  }, [data, displayedCount])

  // Has more items to load
  const hasMore = displayedCount < data.length

  // Load more items
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)

    // Simulate async loading (or integrate with actual data fetching)
    setTimeout(() => {
      setDisplayedCount(prev => Math.min(prev + pageSize, data.length))
      setIsLoadingMore(false)
    }, 300)
  }, [isLoadingMore, hasMore, pageSize, data.length])

  // Refresh list
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true)

    // Reset to initial page
    setDisplayedCount(pageSize)

    // Simulate refresh (or integrate with actual data fetching)
    await new Promise(resolve => setTimeout(resolve, 500))

    setIsRefreshing(false)
  }, [pageSize])

  // Track render performance
  const trackRender = useCallback(() => {
    if (!enablePerformanceTracking) return

    const now = performance.now()

    if (renderCount.current > 0) {
      const renderTime = now - (renderTimes.current[renderTimes.current.length - 1] || now)
      renderTimes.current.push(renderTime)

      // Keep only last 100 render times
      if (renderTimes.current.length > 100) {
        renderTimes.current.shift()
      }
    }

    renderCount.current++
  }, [enablePerformanceTracking])

  // Calculate average render time
  const averageRenderTime = useMemo(() => {
    if (renderTimes.current.length === 0) return 0
    const sum = renderTimes.current.reduce((a, b) => a + b, 0)
    return sum / renderTimes.current.length
  }, [renderTimes.current.length])

  // Handle viewable items changed
  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const items = viewableItems
        .map(token => token.item as T)
        .filter(Boolean)

      setVisibleItems(items)
    },
    []
  )

  // Viewable items changed config
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 100,
  })

  // FlatList props
  const flatListProps: Partial<FlatListProps<T>> = useMemo(
    () => ({
      data: displayedData,
      keyExtractor: (item, index) => item.id?.toString() || index.toString(),

      // Performance
      windowSize: 10,
      initialNumToRender: pageSize,
      maxToRenderPerBatch: 10,
      updateCellsBatchingPeriod: 50,
      removeClippedSubviews: true,

      // Layout
      getItemLayout: getItemHeight
        ? (data, index) => ({
            length: getItemHeight(data[index], index),
            offset: data.slice(0, index).reduce((sum, item, i) => sum + getItemHeight(item, i), 0),
            index,
          })
        : undefined,

      // Pagination
      onEndReached: loadMore,
      onEndReachedThreshold: prefetchThreshold,
      ListFooterComponent: isLoadingMore ? <LoadingFooter /> : null,

      // Refresh
      refreshing: isRefreshing,
      onRefresh,

      // Viewability
      onViewableItemsChanged: handleViewableItemsChanged,
      viewabilityConfig: viewabilityConfig.current,

      // Performance tracking
      onLayout: trackRender,
    }),
    [
      displayedData,
      pageSize,
      getItemHeight,
      loadMore,
      prefetchThreshold,
      isLoadingMore,
      isRefreshing,
      onRefresh,
      handleViewableItemsChanged,
      trackRender,
    ]
  )

  return {
    flatListProps,
    hasMore,
    loadMore,
    isLoadingMore,
    isRefreshing,
    onRefresh,
    averageRenderTime,
    totalRenders: renderCount.current,
    visibleItems,
    onViewableItemsChanged: handleViewableItemsChanged,
  }
}

/**
 * Loading footer component
 */
const LoadingFooter = () => {
  return (
    <View style={{ padding: 16, alignItems: 'center' }}>
      <ActivityIndicator size="small" />
    </View>
  )
}