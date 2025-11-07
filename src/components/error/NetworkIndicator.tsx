/**
 * Network Indicator Components
 * Visual indicators for network status and offline mode
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

/**
 * Offline Banner
 * Displays at top of screen when device goes offline
 */
export const OfflineBanner: React.FC = () => {
  const theme = useTheme();
  const [isOffline, setIsOffline] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const offline = !state.isConnected || state.isInternetReachable === false;
      setIsOffline(offline);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOffline ? 0 : -60,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOffline, slideAnim]);

  if (!isOffline) return null;

  return (
    <Animated.View
      style={[
        styles.offlineBanner,
        {
          backgroundColor: theme.colors.errorContainer,
          transform: [{ translateY: slideAnim }],
        },
      ]}>
      <MaterialCommunityIcons name="wifi-off" size={20} color={theme.colors.onErrorContainer} />
      <Text
        variant="labelLarge"
        style={[styles.offlineText, { color: theme.colors.onErrorContainer }]}>
        No Internet Connection
      </Text>
    </Animated.View>
  );
};

/**
 * Network Status Indicator (subtle, always visible)
 */
export const NetworkStatusIndicator: React.FC = () => {
  const theme = useTheme();
  const [networkState, setNetworkState] = useState<NetInfoState | null>(null);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(setNetworkState);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!networkState) return;

    const offline = !networkState.isConnected || networkState.isInternetReachable === false;
    setShowIndicator(offline);
  }, [networkState]);

  if (!showIndicator) return null;

  return (
    <View style={[styles.statusIndicator, { backgroundColor: theme.colors.errorContainer }]}>
      <MaterialCommunityIcons name="wifi-off" size={16} color={theme.colors.onErrorContainer} />
    </View>
  );
};

/**
 * Connection Lost Dialog
 * Full-screen message when critical connection is lost
 */
export const ConnectionLostDialog: React.FC<{
  onRetry?: () => void;
  onDismiss?: () => void;
  visible?: boolean;
}> = ({ onRetry, onDismiss, visible = true }) => {
  const theme = useTheme();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const online = state.isConnected === true && state.isInternetReachable !== false;
      setIsOnline(online);
    });

    return () => unsubscribe();
  }, []);

  // Auto-dismiss when back online
  useEffect(() => {
    if (isOnline && onDismiss) {
      onDismiss();
    }
  }, [isOnline, onDismiss]);

  if (!visible || isOnline) return null;

  return (
    <View style={[styles.dialogOverlay, { backgroundColor: theme.colors.background }]}>
      <View style={styles.dialogContent}>
        <MaterialCommunityIcons name="wifi-off" size={80} color={theme.colors.error} />

        <Text
          variant="headlineMedium"
          style={[styles.dialogTitle, { color: theme.colors.onBackground }]}>
          Connection Lost
        </Text>

        <Text
          variant="bodyLarge"
          style={[styles.dialogMessage, { color: theme.colors.onSurfaceVariant }]}>
          Please check your internet connection. Some features may not be available while offline.
        </Text>

        <View style={styles.dialogActions}>
          {onRetry && (
            <Button mode="contained" onPress={onRetry} icon="refresh" style={styles.dialogButton}>
              Try Again
            </Button>
          )}
          {onDismiss && (
            <Button mode="outlined" onPress={onDismiss} style={styles.dialogButton}>
              Continue Offline
            </Button>
          )}
        </View>
      </View>
    </View>
  );
};

/**
 * Network-aware Component Wrapper
 * Automatically shows offline message when wrapped component loses connection
 */
export const NetworkAwareContainer: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onNetworkChange?: (isOnline: boolean) => void;
}> = ({ children, fallback, onNetworkChange }) => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const online = state.isConnected === true && state.isInternetReachable !== false;
      setIsOnline(online);
      onNetworkChange?.(online);
    });

    return () => unsubscribe();
  }, [onNetworkChange]);

  if (!isOnline) {
    return (
      <>
        {fallback || (
          <View style={styles.fallbackContainer}>
            <MaterialCommunityIcons name="wifi-off" size={48} color="#9E9E9E" />
            <Text variant="titleMedium" style={styles.fallbackText}>
              No Internet Connection
            </Text>
            <Text variant="bodyMedium" style={styles.fallbackMessage}>
              This content is not available offline
            </Text>
          </View>
        )}
      </>
    );
  }

  return <>{children}</>;
};

/**
 * Hook for network status
 */
export const useNetworkStatus = () => {
  const [networkState, setNetworkState] = useState<NetInfoState | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setNetworkState(state);
      const online = state.isConnected === true && state.isInternetReachable !== false;
      setIsOnline(online);
      setConnectionType(state.type);
    });

    // Fetch initial state
    NetInfo.fetch().then(setNetworkState);

    return () => unsubscribe();
  }, []);

  return {
    isOnline,
    isConnected: networkState?.isConnected ?? false,
    isInternetReachable: networkState?.isInternetReachable ?? null,
    connectionType,
    networkState,
  };
};

/**
 * Retry with Network Check
 * Wrapper function that checks network before retrying an operation
 */
export const retryWithNetworkCheck = async <T,>(
  operation: () => Promise<T>,
  options?: {
    maxRetries?: number;
    retryDelay?: number;
    onError?: (error: Error) => void;
  },
): Promise<T> => {
  const { maxRetries = 3, retryDelay = 1000, onError } = options || {};

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Check network status before attempting
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected || netInfo.isInternetReachable === false) {
        throw new Error('No internet connection');
      }

      // Attempt the operation
      return await operation();
    } catch (error) {
      lastError = error as Error;
      onError?.(lastError);

      // Don't retry on last attempt
      if (attempt < maxRetries - 1) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  // All retries failed
  throw lastError || new Error('Operation failed after retries');
};

/**
 * Network Speed Indicator
 */
export const NetworkSpeedIndicator: React.FC = () => {
  const theme = useTheme();
  const [connectionType, setConnectionType] = useState<string | null>(null);
  const [effectiveType, setEffectiveType] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setConnectionType(state.type);
      // @ts-ignore - details may not be fully typed
      setEffectiveType(state.details?.effectiveConnectionType || null);
    });

    return () => unsubscribe();
  }, []);

  if (!connectionType || connectionType === 'wifi' || connectionType === 'ethernet') {
    return null; // Don't show indicator for fast connections
  }

  const getConnectionInfo = () => {
    if (connectionType === 'cellular') {
      if (effectiveType === '2g') {
        return { label: 'Slow', color: theme.colors.error, icon: 'signal-cellular-1' as const };
      }
      if (effectiveType === '3g') {
        return { label: 'Moderate', color: '#FF9800', icon: 'signal-cellular-2' as const };
      }
      return { label: 'Good', color: theme.colors.primary, icon: 'signal-cellular-3' as const };
    }
    return { label: connectionType, color: theme.colors.onSurfaceVariant, icon: 'signal' as const };
  };

  const info = getConnectionInfo();

  return (
    <View style={[styles.speedIndicator, { backgroundColor: `${info.color}20` }]}>
      <MaterialCommunityIcons name={info.icon} size={14} color={info.color} />
      <Text variant="labelSmall" style={{ color: info.color, marginLeft: 4 }}>
        {info.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  offlineBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
    gap: 8,
    zIndex: 1000,
    elevation: 4,
  },
  offlineText: {
    fontWeight: '600',
  },
  statusIndicator: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 10,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    elevation: 3,
  },
  dialogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 9999,
  },
  dialogContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  dialogTitle: {
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  dialogMessage: {
    textAlign: 'center',
    marginBottom: 32,
  },
  dialogActions: {
    width: '100%',
    gap: 12,
  },
  dialogButton: {
    marginVertical: 4,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  fallbackText: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  fallbackMessage: {
    textAlign: 'center',
    color: '#757575',
  },
  speedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
});
