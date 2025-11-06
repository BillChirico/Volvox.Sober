/**
 * List Optimization Utilities
 * Performance optimizations for FlatList rendering
 * Can be easily migrated to FlashList when installed
 */

import { FlatListProps, ListRenderItemInfo } from 'react-native'

/**
 * Optimal FlatList configuration for performance
 */
export const OPTIMIZED_LIST_CONFIG = {
  // Window size configuration
  windowSize: 10, // Number of items to render outside visible area
  initialNumToRender: 10, // Initial items to render
  maxToRenderPerBatch: 10, // Max items to render in one batch
  updateCellsBatchingPeriod: 50, // Delay between batch renders (ms)

  // Performance settings
  removeClippedSubviews: true, // Remove off-screen views
  getItemLayout: true, // Enable if item heights are known

  // Optimization flags
  disableVirtualization: false,
  legacyImplementation: false,
}

/**
 * Get optimized FlatList props for matches list
 */
export const getMatchesListProps = <T>(): Partial<FlatListProps<T>> => ({
  windowSize: OPTIMIZED_LIST_CONFIG.windowSize,
  initialNumToRender: OPTIMIZED_LIST_CONFIG.initialNumToRender,
  maxToRenderPerBatch: OPTIMIZED_LIST_CONFIG.maxToRenderPerBatch,
  updateCellsBatchingPeriod: OPTIMIZED_LIST_CONFIG.updateCellsBatchingPeriod,
  removeClippedSubviews: OPTIMIZED_LIST_CONFIG.removeClippedSubviews,

  // Unique key extractor
  keyExtractor: (item: any, index: number) => item.id?.toString() || index.toString(),

  // Performance optimization
  getItemLayout: (data, index) => ({
    length: 120, // Approximate match card height
    offset: 120 * index,
    index,
  }),
})

/**
 * Get optimized FlatList props for messages/conversations list
 */
export const getMessagesListProps = <T>(): Partial<FlatListProps<T>> => ({
  windowSize: OPTIMIZED_LIST_CONFIG.windowSize,
  initialNumToRender: 15, // Show more messages initially
  maxToRenderPerBatch: 15,
  updateCellsBatchingPeriod: OPTIMIZED_LIST_CONFIG.updateCellsBatchingPeriod,
  removeClippedSubviews: true,

  // Inverted for chat-like behavior
  inverted: true,

  // Unique key extractor
  keyExtractor: (item: any, index: number) => item.id?.toString() || index.toString(),
})

/**
 * Get optimized FlatList props for connections list
 */
export const getConnectionsListProps = <T>(): Partial<FlatListProps<T>> => ({
  windowSize: OPTIMIZED_LIST_CONFIG.windowSize,
  initialNumToRender: OPTIMIZED_LIST_CONFIG.initialNumToRender,
  maxToRenderPerBatch: OPTIMIZED_LIST_CONFIG.maxToRenderPerBatch,
  updateCellsBatchingPeriod: OPTIMIZED_LIST_CONFIG.updateCellsBatchingPeriod,
  removeClippedSubviews: OPTIMIZED_LIST_CONFIG.removeClippedSubviews,

  // Unique key extractor
  keyExtractor: (item: any, index: number) => item.id?.toString() || index.toString(),

  // Performance optimization
  getItemLayout: (data, index) => ({
    length: 100, // Approximate connection card height
    offset: 100 * index,
    index,
  }),
})

/**
 * Create memoized render item function
 * Prevents unnecessary re-renders of list items
 */
export const createMemoizedRenderItem = <T>(
  renderItem: (info: ListRenderItemInfo<T>) => React.ReactElement | null
) => {
  return React.memo(
    ({ item, index }: { item: T; index: number }) => {
      return renderItem({ item, index, separators: {} as any })
    },
    (prevProps, nextProps) => {
      // Deep comparison for complex objects
      return JSON.stringify(prevProps.item) === JSON.stringify(nextProps.item)
    }
  )
}

/**
 * List item separator component (memoized)
 */
export const ItemSeparator = React.memo(() => (
  <View style={{ height: 1, backgroundColor: '#E0E0E0', marginHorizontal: 16 }} />
))

/**
 * Empty list component (memoized)
 */
export const EmptyListComponent = React.memo<{ message: string; icon?: string }>(
  ({ message, icon = 'inbox' }) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
      <MaterialCommunityIcons name={icon as any} size={64} color="#9E9E9E" />
      <Text style={{ marginTop: 16, fontSize: 16, color: '#757575', textAlign: 'center' }}>
        {message}
      </Text>
    </View>
  )
)

/**
 * List footer loading component (memoized)
 */
export const ListFooterLoader = React.memo(() => (
  <View style={{ padding: 16, alignItems: 'center' }}>
    <ActivityIndicator size="small" />
  </View>
))

/**
 * Pull to refresh indicator configuration
 */
export const getPullToRefreshConfig = () => ({
  refreshing: false,
  onRefresh: () => {},
  tintColor: '#007AFF', // iOS
  colors: ['#007AFF'], // Android
  progressBackgroundColor: '#FFFFFF', // Android
})

/**
 * Pagination configuration
 */
export const PAGINATION_CONFIG = {
  pageSize: 20,
  prefetchThreshold: 0.5, // Trigger load more when 50% from end
  prefetchDistance: 2, // Items from end to trigger load more
}

/**
 * Virtualization helpers
 */
export const virtualizationHelpers = {
  /**
   * Calculate estimated item height
   */
  estimateItemHeight: (index: number, data: any[]) => {
    // Can be customized based on item type
    return 100
  },

  /**
   * Check if item should be rendered
   */
  shouldRenderItem: (index: number, visibleRange: { start: number; end: number }) => {
    return index >= visibleRange.start && index <= visibleRange.end
  },

  /**
   * Get visible range with buffer
   */
  getVisibleRangeWithBuffer: (
    scrollOffset: number,
    viewportHeight: number,
    itemHeight: number,
    bufferSize: number = 5
  ) => {
    const startIndex = Math.max(0, Math.floor(scrollOffset / itemHeight) - bufferSize)
    const endIndex = Math.ceil((scrollOffset + viewportHeight) / itemHeight) + bufferSize
    return { start: startIndex, end: endIndex }
  },
}

/**
 * List performance monitoring
 */
export const listPerformanceMonitor = {
  renderCount: 0,
  renderTimes: [] as number[],

  /**
   * Track render performance
   */
  trackRender: (startTime: number) => {
    const renderTime = Date.now() - startTime
    listPerformanceMonitor.renderTimes.push(renderTime)
    listPerformanceMonitor.renderCount++

    // Keep only last 100 render times
    if (listPerformanceMonitor.renderTimes.length > 100) {
      listPerformanceMonitor.renderTimes.shift()
    }
  },

  /**
   * Get average render time
   */
  getAverageRenderTime: () => {
    if (listPerformanceMonitor.renderTimes.length === 0) return 0
    const sum = listPerformanceMonitor.renderTimes.reduce((a, b) => a + b, 0)
    return sum / listPerformanceMonitor.renderTimes.length
  },

  /**
   * Reset metrics
   */
  reset: () => {
    listPerformanceMonitor.renderCount = 0
    listPerformanceMonitor.renderTimes = []
  },
}

// Import required dependencies
import React from 'react'
import { View, ActivityIndicator, Text } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
