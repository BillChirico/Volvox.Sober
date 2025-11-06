/**
 * LazyImage Component
 * Implements lazy loading for images with placeholder and error states
 * Optimizes performance by loading images only when needed
 */

import React, { useState, useCallback } from 'react'
import { Image, View, StyleSheet, ActivityIndicator, ImageProps, ViewStyle } from 'react-native'
import { useTheme, Text } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'

interface LazyImageProps extends Omit<ImageProps, 'source'> {
  source: { uri?: string } | number
  placeholder?: React.ReactNode
  fallbackIcon?: keyof typeof MaterialCommunityIcons.glyphMap
  containerStyle?: ViewStyle
  aspectRatio?: number
  blurhash?: string
}

/**
 * LazyImage component with progressive loading
 *
 * Features:
 * - Shows loading indicator while image loads
 * - Displays fallback icon on error
 * - Supports local and remote images
 * - Maintains aspect ratio
 * - Caches images automatically
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  source,
  placeholder,
  fallbackIcon = 'image-off',
  containerStyle,
  aspectRatio = 1,
  style,
  ...props
}) => {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const handleLoadStart = useCallback(() => {
    setLoading(true)
    setError(false)
  }, [])

  const handleLoadEnd = useCallback(() => {
    setLoading(false)
  }, [])

  const handleError = useCallback(() => {
    setLoading(false)
    setError(true)
  }, [])

  // Render error state
  if (error) {
    return (
      <View
        style={[
          styles.container,
          { aspectRatio, backgroundColor: theme.colors.surfaceVariant },
          containerStyle,
        ]}
      >
        <MaterialCommunityIcons
          name={fallbackIcon}
          size={48}
          color={theme.colors.onSurfaceVariant}
        />
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
          Image unavailable
        </Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { aspectRatio }, containerStyle]}>
      <Image
        {...props}
        source={source}
        style={[{ width: '100%', height: '100%' }, style]}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        resizeMode="cover"
      />

      {loading && (
        <View style={[styles.loadingOverlay, { backgroundColor: theme.colors.surface }]}>
          {placeholder || (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
