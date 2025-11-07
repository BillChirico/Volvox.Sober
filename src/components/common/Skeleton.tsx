/**
 * Skeleton Components
 * Provides loading placeholders with shimmer animation
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  animated?: boolean;
}

/**
 * Base Skeleton component with shimmer animation
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  animated = true,
}) => {
  const theme = useTheme();
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;

    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [animated, shimmerValue]);

  const opacity = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.colors.surfaceVariant,
          opacity: animated ? opacity : 0.3,
        },
        style,
      ]}
    />
  );
};

/**
 * Circle Skeleton (for avatars)
 */
export const SkeletonCircle: React.FC<Omit<SkeletonProps, 'borderRadius'> & { size?: number }> = ({
  size = 40,
  style,
  ...props
}) => {
  return <Skeleton width={size} height={size} borderRadius={size / 2} style={style} {...props} />;
};

/**
 * Match Card Skeleton
 */
export const SkeletonMatchCard: React.FC = () => {
  return (
    <View style={styles.matchCard}>
      <View style={styles.matchCardHeader}>
        <SkeletonCircle size={60} />
        <View style={styles.matchCardHeaderText}>
          <Skeleton width="60%" height={20} style={{ marginBottom: 8 }} />
          <Skeleton width="40%" height={16} />
        </View>
        <Skeleton width={60} height={30} borderRadius={15} />
      </View>

      <Skeleton width="100%" height={16} style={{ marginTop: 12 }} />
      <Skeleton width="90%" height={16} style={{ marginTop: 6 }} />

      <View style={styles.matchCardFooter}>
        <Skeleton width="30%" height={14} />
        <Skeleton width="30%" height={14} />
        <Skeleton width="30%" height={14} />
      </View>
    </View>
  );
};

/**
 * Connection Card Skeleton
 */
export const SkeletonConnectionCard: React.FC = () => {
  return (
    <View style={styles.connectionCard}>
      <SkeletonCircle size={50} />
      <View style={styles.connectionCardContent}>
        <Skeleton width="50%" height={18} style={{ marginBottom: 6 }} />
        <Skeleton width="70%" height={14} />
      </View>
      <Skeleton width={32} height={32} borderRadius={16} />
    </View>
  );
};

/**
 * Message Thread Skeleton
 */
export const SkeletonMessageThread: React.FC = () => {
  return (
    <View style={styles.messageThread}>
      <SkeletonCircle size={48} />
      <View style={styles.messageThreadContent}>
        <View style={styles.messageThreadHeader}>
          <Skeleton width="40%" height={16} />
          <Skeleton width="20%" height={12} />
        </View>
        <Skeleton width="80%" height={14} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
};

/**
 * Message Bubble Skeleton
 */
export const SkeletonMessageBubble: React.FC<{ sent?: boolean }> = ({ sent = false }) => {
  return (
    <View
      style={[
        styles.messageBubble,
        sent ? styles.messageBubbleSent : styles.messageBubbleReceived,
      ]}>
      <Skeleton width={sent ? '70%' : '60%'} height={16} style={{ marginBottom: 4 }} />
      <Skeleton width={sent ? '50%' : '80%'} height={16} />
    </View>
  );
};

/**
 * Profile Header Skeleton
 */
export const SkeletonProfileHeader: React.FC = () => {
  return (
    <View style={styles.profileHeader}>
      <SkeletonCircle size={100} />
      <Skeleton width="50%" height={24} style={{ marginTop: 16 }} />
      <Skeleton width="30%" height={16} style={{ marginTop: 8 }} />

      <View style={styles.profileStats}>
        <View style={styles.profileStat}>
          <Skeleton width={40} height={28} />
          <Skeleton width={60} height={14} style={{ marginTop: 4 }} />
        </View>
        <View style={styles.profileStat}>
          <Skeleton width={40} height={28} />
          <Skeleton width={60} height={14} style={{ marginTop: 4 }} />
        </View>
        <View style={styles.profileStat}>
          <Skeleton width={40} height={28} />
          <Skeleton width={60} height={14} style={{ marginTop: 4 }} />
        </View>
      </View>
    </View>
  );
};

/**
 * List Skeleton (renders multiple skeleton items)
 */
export const SkeletonList: React.FC<{
  count?: number;
  ItemSkeleton: React.ComponentType;
}> = ({ count = 5, ItemSkeleton }) => {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <ItemSkeleton key={index} />
      ))}
    </View>
  );
};

/**
 * Screen Skeleton (full page loading)
 */
export const SkeletonScreen: React.FC<{
  hasHeader?: boolean;
  hasFooter?: boolean;
  contentType?: 'list' | 'profile' | 'detail';
}> = ({ hasHeader = true, hasFooter = false, contentType = 'list' }) => {
  return (
    <View style={styles.screenSkeleton}>
      {hasHeader && (
        <View style={styles.skeletonHeader}>
          <Skeleton width={120} height={28} />
          <Skeleton width={32} height={32} borderRadius={16} />
        </View>
      )}

      <View style={styles.skeletonContent}>
        {contentType === 'list' && <SkeletonList count={6} ItemSkeleton={SkeletonMatchCard} />}
        {contentType === 'profile' && <SkeletonProfileHeader />}
        {contentType === 'detail' && (
          <>
            <Skeleton width="100%" height={200} style={{ marginBottom: 16 }} />
            <Skeleton width="80%" height={24} style={{ marginBottom: 12 }} />
            <Skeleton width="100%" height={16} style={{ marginBottom: 6 }} />
            <Skeleton width="100%" height={16} style={{ marginBottom: 6 }} />
            <Skeleton width="90%" height={16} />
          </>
        )}
      </View>

      {hasFooter && (
        <View style={styles.skeletonFooter}>
          <Skeleton width={100} height={44} borderRadius={22} />
          <Skeleton width={100} height={44} borderRadius={22} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  matchCard: {
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  matchCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchCardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  matchCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  connectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 4,
  },
  connectionCardContent: {
    flex: 1,
    marginLeft: 12,
  },
  messageThread: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  messageThreadContent: {
    flex: 1,
    marginLeft: 12,
  },
  messageThreadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageBubble: {
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 16,
    maxWidth: '80%',
  },
  messageBubbleSent: {
    alignSelf: 'flex-end',
  },
  messageBubbleReceived: {
    alignSelf: 'flex-start',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
  },
  profileStats: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 32,
  },
  profileStat: {
    alignItems: 'center',
  },
  screenSkeleton: {
    flex: 1,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  skeletonContent: {
    flex: 1,
  },
  skeletonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
});
