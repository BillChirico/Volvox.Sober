/**
 * RecurrenceSelector Component
 * Allows selection of check-in recurrence pattern (daily, weekly, custom)
 */

import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native'

interface RecurrenceSelectorProps {
  recurrence: 'daily' | 'weekly' | 'custom'
  customIntervalDays?: number
  onChange: (recurrence: 'daily' | 'weekly' | 'custom', customDays?: number) => void
}

export const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({
  recurrence,
  customIntervalDays = 7,
  onChange,
}) => {
  const handleRecurrenceChange = (newRecurrence: 'daily' | 'weekly' | 'custom') => {
    if (newRecurrence === 'custom') {
      onChange(newRecurrence, customIntervalDays)
    } else {
      onChange(newRecurrence)
    }
  }

  const handleCustomDaysChange = (text: string) => {
    const days = parseInt(text, 10)
    if (!isNaN(days) && days > 0 && days <= 365) {
      onChange('custom', days)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Check-In Frequency</Text>

      <View style={styles.optionsContainer}>
        {/* Daily Option */}
        <TouchableOpacity
          style={[
            styles.option,
            recurrence === 'daily' && styles.optionSelected,
          ]}
          onPress={() => handleRecurrenceChange('daily')}
        >
          <View style={styles.optionContent}>
            <Text
              style={[
                styles.optionTitle,
                recurrence === 'daily' && styles.optionTitleSelected,
              ]}
            >
              Daily
            </Text>
            <Text style={styles.optionDescription}>Every day</Text>
          </View>
          {recurrence === 'daily' && <View style={styles.checkmark}>✓</View>}
        </TouchableOpacity>

        {/* Weekly Option */}
        <TouchableOpacity
          style={[
            styles.option,
            recurrence === 'weekly' && styles.optionSelected,
          ]}
          onPress={() => handleRecurrenceChange('weekly')}
        >
          <View style={styles.optionContent}>
            <Text
              style={[
                styles.optionTitle,
                recurrence === 'weekly' && styles.optionTitleSelected,
              ]}
            >
              Weekly
            </Text>
            <Text style={styles.optionDescription}>Once a week</Text>
          </View>
          {recurrence === 'weekly' && <View style={styles.checkmark}>✓</View>}
        </TouchableOpacity>

        {/* Custom Option */}
        <TouchableOpacity
          style={[
            styles.option,
            recurrence === 'custom' && styles.optionSelected,
          ]}
          onPress={() => handleRecurrenceChange('custom')}
        >
          <View style={styles.optionContent}>
            <Text
              style={[
                styles.optionTitle,
                recurrence === 'custom' && styles.optionTitleSelected,
              ]}
            >
              Custom
            </Text>
            <Text style={styles.optionDescription}>
              Every {customIntervalDays} {customIntervalDays === 1 ? 'day' : 'days'}
            </Text>
          </View>
          {recurrence === 'custom' && <View style={styles.checkmark}>✓</View>}
        </TouchableOpacity>
      </View>

      {/* Custom Interval Input */}
      {recurrence === 'custom' && (
        <View style={styles.customInputContainer}>
          <Text style={styles.customInputLabel}>Every</Text>
          <TextInput
            style={styles.customInput}
            value={customIntervalDays.toString()}
            onChangeText={handleCustomDaysChange}
            keyboardType="number-pad"
            maxLength={3}
          />
          <Text style={styles.customInputLabel}>days</Text>
        </View>
      )}
    </View>
  )
}

// ============================================================
// Styles
// ============================================================

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: '#007AFF',
  },
  optionDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  checkmark: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 12,
  },
  customInputLabel: {
    fontSize: 16,
    color: '#000000',
  },
  customInput: {
    width: 80,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingHorizontal: 12,
    fontSize: 16,
    textAlign: 'center',
    color: '#000000',
  },
})
