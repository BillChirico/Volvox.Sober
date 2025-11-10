/**
 * TabBar Component
 * Custom bottom tab bar with icons, badges, and accessibility
 * Feature: 002-app-screens
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../core/theme/ThemeContext';
import { useAppSelector } from '../../hooks/useAppDispatch';
import { selectUnreadMessagesCount } from '../../store/messages/messagesSelectors';
import { selectPendingConnectionRequestsCount } from '../../store/connections/connectionsSelectors';
import { NotificationBadge } from './NotificationBadge';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

/**
 * Tab icon configuration
 */
const TAB_ICONS: Record<
  string,
  {
    focused: keyof typeof MaterialCommunityIcons.glyphMap;
    unfocused: keyof typeof MaterialCommunityIcons.glyphMap;
    label: string;
    accessibilityLabel: string;
  }
> = {
  sobriety: {
    focused: 'calendar-check',
    unfocused: 'calendar-check-outline',
    label: 'Sobriety',
    accessibilityLabel: 'Sobriety tracking tab',
  },
  matches: {
    focused: 'account-heart',
    unfocused: 'account-heart-outline',
    label: 'Matches',
    accessibilityLabel: 'Match discovery tab',
  },
  connections: {
    focused: 'account-group',
    unfocused: 'account-group-outline',
    label: 'Connections',
    accessibilityLabel: 'Connections management tab',
  },
  messages: {
    focused: 'message',
    unfocused: 'message-outline',
    label: 'Messages',
    accessibilityLabel: 'Messages tab',
  },
  profile: {
    focused: 'account',
    unfocused: 'account-outline',
    label: 'Profile',
    accessibilityLabel: 'Profile settings tab',
  },
};

/**
 * Custom TabBar component with notification badges
 */
export const TabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { theme } = useAppTheme();

  // Get notification counts from Redux
  const unreadMessagesCount = useAppSelector(selectUnreadMessagesCount);
  const pendingConnectionsCount = useAppSelector(selectPendingConnectionRequestsCount);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          height: Platform.OS === 'ios' ? 90 : 60,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
        },
      ]}>
      {state.routes.map((route, index) => {
        const { options: _options } = descriptors[route.key];
        const isFocused = state.index === index;
        const tabName = route.name;
        const iconConfig = TAB_ICONS[tabName];

        if (!iconConfig) {
          return null;
        }

        // Determine badge count for this tab
        let badgeCount = 0;
        if (tabName === 'messages') {
          badgeCount = unreadMessagesCount;
        } else if (tabName === 'connections') {
          badgeCount = pendingConnectionsCount;
        }

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={iconConfig.accessibilityLabel}
            testID={`tab-${tabName}`}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={isFocused ? iconConfig.focused : iconConfig.unfocused}
                size={26}
                color={isFocused ? theme.colors.primary : theme.colors.onSurfaceVariant}
              />
              {badgeCount > 0 && <NotificationBadge count={badgeCount} />}
            </View>
            <Text
              variant="labelSmall"
              style={{
                color: isFocused ? theme.colors.primary : theme.colors.onSurfaceVariant,
                marginTop: 4,
              }}>
              {iconConfig.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
    minHeight: 44, // Ensure minimum 44px touch target
    minWidth: 44, // Ensure minimum 44px touch target
  },
  iconContainer: {
    position: 'relative',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
