/**
 * FilterBar Component
 * Filter matches by recovery program and availability
 * Feature: 002-app-screens
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Chip, Menu, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../../theme/ThemeContext';
import { RECOVERY_PROGRAMS } from '../../../constants/RecoveryPrograms';
import { AVAILABILITY_OPTIONS } from '../../../constants/Availability';

export interface FilterOptions {
  recoveryPrograms: string[];
  availability: string[];
}

export interface FilterBarProps {
  /** Current filter selections */
  filters: FilterOptions;
  /** Callback when filters change */
  onFiltersChange: (filters: FilterOptions) => void;
  /** Whether filters are being applied */
  isApplying?: boolean;
}

/**
 * Filter bar component for matches
 */
export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFiltersChange,
  isApplying = false,
}) => {
  const { theme } = useAppTheme();
  const [programMenuVisible, setProgramMenuVisible] = useState(false);
  const [availabilityMenuVisible, setAvailabilityMenuVisible] = useState(false);

  const hasActiveFilters = filters.recoveryPrograms.length > 0 || filters.availability.length > 0;

  const toggleRecoveryProgram = (program: string) => {
    const updated = filters.recoveryPrograms.includes(program)
      ? filters.recoveryPrograms.filter(p => p !== program)
      : [...filters.recoveryPrograms, program];

    onFiltersChange({
      ...filters,
      recoveryPrograms: updated,
    });
  };

  const toggleAvailability = (availability: string) => {
    const updated = filters.availability.includes(availability)
      ? filters.availability.filter(a => a !== availability)
      : [...filters.availability, availability];

    onFiltersChange({
      ...filters,
      availability: updated,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      recoveryPrograms: [],
      availability: [],
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Recovery Program Filter */}
        <Menu
          visible={programMenuVisible}
          onDismiss={() => setProgramMenuVisible(false)}
          anchor={
            <Chip
              mode={filters.recoveryPrograms.length > 0 ? 'flat' : 'outlined'}
              selected={filters.recoveryPrograms.length > 0}
              onPress={() => setProgramMenuVisible(true)}
              icon="heart-pulse"
              style={styles.filterChip}
              disabled={isApplying}>
              Recovery Program
              {filters.recoveryPrograms.length > 0 && ` (${filters.recoveryPrograms.length})`}
            </Chip>
          }>
          {RECOVERY_PROGRAMS.map(program => (
            <Menu.Item
              key={program}
              onPress={() => {
                toggleRecoveryProgram(program);
              }}
              title={program}
              leadingIcon={
                filters.recoveryPrograms.includes(program)
                  ? 'checkbox-marked'
                  : 'checkbox-blank-outline'
              }
            />
          ))}
        </Menu>

        {/* Availability Filter */}
        <Menu
          visible={availabilityMenuVisible}
          onDismiss={() => setAvailabilityMenuVisible(false)}
          anchor={
            <Chip
              mode={filters.availability.length > 0 ? 'flat' : 'outlined'}
              selected={filters.availability.length > 0}
              onPress={() => setAvailabilityMenuVisible(true)}
              icon="clock-outline"
              style={styles.filterChip}
              disabled={isApplying}>
              Availability
              {filters.availability.length > 0 && ` (${filters.availability.length})`}
            </Chip>
          }>
          {AVAILABILITY_OPTIONS.map(option => (
            <Menu.Item
              key={option}
              onPress={() => {
                toggleAvailability(option);
              }}
              title={option}
              leadingIcon={
                filters.availability.includes(option) ? 'checkbox-marked' : 'checkbox-blank-outline'
              }
            />
          ))}
        </Menu>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            mode="text"
            onPress={clearAllFilters}
            disabled={isApplying}
            icon="filter-remove"
            style={styles.clearButton}
            contentStyle={styles.clearButtonContent}>
            Clear All
          </Button>
        )}
      </ScrollView>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.activeFiltersContent}>
          {filters.recoveryPrograms.map(program => (
            <Chip
              key={program}
              mode="flat"
              onClose={() => toggleRecoveryProgram(program)}
              style={styles.activeChip}
              closeIcon={() => (
                <MaterialCommunityIcons
                  name="close"
                  size={16}
                  color={theme.colors.onSecondaryContainer}
                />
              )}
              disabled={isApplying}>
              {program}
            </Chip>
          ))}
          {filters.availability.map(avail => (
            <Chip
              key={avail}
              mode="flat"
              onClose={() => toggleAvailability(avail)}
              style={styles.activeChip}
              closeIcon={() => (
                <MaterialCommunityIcons
                  name="close"
                  size={16}
                  color={theme.colors.onSecondaryContainer}
                />
              )}
              disabled={isApplying}>
              {avail}
            </Chip>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  clearButton: {
    marginLeft: 8,
  },
  clearButtonContent: {
    paddingHorizontal: 8,
  },
  activeFiltersContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
  },
  activeChip: {
    marginRight: 8,
  },
});
