/**
 * SettingsSection Component
 * Reusable component for organizing settings into sections
 * Feature: 002-app-screens (T117)
 */

import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Text, Divider, Switch, Icon } from 'react-native-paper'
import { useAppTheme } from '../../theme/ThemeContext'

interface SettingsItemBase {
  key: string
  label: string
  description?: string
  icon?: string
  disabled?: boolean
}

interface SettingsItemWithAction extends SettingsItemBase {
  type: 'action'
  onPress: () => void
  rightLabel?: string
}

interface SettingsItemWithToggle extends SettingsItemBase {
  type: 'toggle'
  value: boolean
  onValueChange: (value: boolean) => void
}

interface SettingsItemWithNavigation extends SettingsItemBase {
  type: 'navigation'
  onPress: () => void
  showChevron?: boolean
}

export type SettingsItem =
  | SettingsItemWithAction
  | SettingsItemWithToggle
  | SettingsItemWithNavigation

interface SettingsSectionProps {
  title: string
  items: SettingsItem[]
  showDividers?: boolean
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  items,
  showDividers = true,
}) => {
  const { theme } = useAppTheme()

  const renderItem = (item: SettingsItem, index: number) => {
    const isLastItem = index === items.length - 1

    return (
      <View key={item.key}>
        <TouchableOpacity
          style={[
            styles.itemContainer,
            item.disabled && styles.itemDisabled,
          ]}
          onPress={
            item.type === 'action' || item.type === 'navigation'
              ? item.onPress
              : undefined
          }
          disabled={item.disabled || item.type === 'toggle'}
          activeOpacity={0.7}
        >
          {/* Left Side: Icon + Label */}
          <View style={styles.leftContainer}>
            {item.icon && (
              <Icon
                source={item.icon}
                size={24}
                color={item.disabled ? theme.colors.onSurfaceDisabled : theme.colors.primary}
              />
            )}
            <View style={styles.labelContainer}>
              <Text
                variant="bodyLarge"
                style={[
                  styles.label,
                  {
                    color: item.disabled
                      ? theme.colors.onSurfaceDisabled
                      : theme.colors.onSurface,
                  },
                ]}
              >
                {item.label}
              </Text>
              {item.description && (
                <Text
                  variant="bodySmall"
                  style={[
                    styles.description,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {item.description}
                </Text>
              )}
            </View>
          </View>

          {/* Right Side: Action/Toggle/Navigation */}
          <View style={styles.rightContainer}>
            {item.type === 'action' && item.rightLabel && (
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {item.rightLabel}
              </Text>
            )}

            {item.type === 'toggle' && (
              <Switch
                value={item.value}
                onValueChange={item.onValueChange}
                disabled={item.disabled}
                color={theme.colors.primary}
              />
            )}

            {item.type === 'navigation' && item.showChevron !== false && (
              <Icon
                source="chevron-right"
                size={24}
                color={theme.colors.onSurfaceVariant}
              />
            )}
          </View>
        </TouchableOpacity>

        {showDividers && !isLastItem && (
          <Divider style={[styles.divider, { marginLeft: item.icon ? 56 : 16 }]} />
        )}
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Text
        variant="titleMedium"
        style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}
      >
        {title}
      </Text>
      <View style={styles.itemsContainer}>
        {items.map((item, index) => renderItem(item, index))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  itemsContainer: {
    paddingVertical: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  itemDisabled: {
    opacity: 0.5,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    marginBottom: 2,
  },
  description: {
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  divider: {
    marginVertical: 4,
  },
})
