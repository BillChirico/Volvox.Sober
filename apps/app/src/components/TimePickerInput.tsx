/**
 * TimePickerInput Component
 * Time selection with timezone display and next scheduled preview
 */

import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'

interface TimePickerInputProps {
  time: string // HH:MM format (24-hour)
  timezone: string // IANA timezone
  onChange: (time: string) => void
  label?: string
}

export const TimePickerInput: React.FC<TimePickerInputProps> = ({
  time,
  timezone,
  onChange,
  label = 'Check-In Time',
}) => {
  const [showPicker, setShowPicker] = useState(false)

  // Convert time string to Date object
  const getDateFromTime = (timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    return date
  }

  // Format time for display (12-hour format)
  const formatTime12Hour = (timeStr: string): string => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  // Calculate next scheduled time
  const getNextScheduledTime = (): string => {
    const [hours, minutes] = time.split(':').map(Number)
    const now = new Date()
    const nextScheduled = new Date(now)
    nextScheduled.setHours(hours, minutes, 0, 0)

    // If time has passed today, show tomorrow
    if (nextScheduled <= now) {
      nextScheduled.setDate(nextScheduled.getDate() + 1)
      return `Tomorrow at ${formatTime12Hour(time)}`
    }

    return `Today at ${formatTime12Hour(time)}`
  }

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios') // Keep open on iOS

    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0')
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0')
      onChange(`${hours}:${minutes}`)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={styles.timeButton}
        onPress={() => setShowPicker(true)}
      >
        <View style={styles.timeContent}>
          <Text style={styles.timeText}>{formatTime12Hour(time)}</Text>
          <Text style={styles.timezoneText}>{timezone}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <View style={styles.nextScheduledContainer}>
        <Text style={styles.nextScheduledLabel}>Next check-in:</Text>
        <Text style={styles.nextScheduledTime}>{getNextScheduledTime()}</Text>
      </View>

      {showPicker && (
        <DateTimePicker
          value={getDateFromTime(time)}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
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
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  timeContent: {
    flex: 1,
  },
  timeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  timezoneText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  chevron: {
    fontSize: 24,
    color: '#8E8E93',
  },
  nextScheduledContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  nextScheduledLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  nextScheduledTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
})
