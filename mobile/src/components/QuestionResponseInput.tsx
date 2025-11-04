/**
 * QuestionResponseInput Component
 * Single question with text input for sponsee responses
 */

import React from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'

interface QuestionResponseInputProps {
  questionNumber: number
  question: string
  answer: string
  onAnswerChange: (answer: string) => void
  placeholder?: string
  maxLength?: number
}

export const QuestionResponseInput: React.FC<QuestionResponseInputProps> = ({
  questionNumber,
  question,
  answer,
  onAnswerChange,
  placeholder = 'Type your answer...',
  maxLength = 500,
}) => {
  const remainingChars = maxLength - answer.length
  const isNearLimit = remainingChars < 50

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.questionNumber}>
          <Text style={styles.questionNumberText}>{questionNumber}</Text>
        </View>
        <Text style={styles.question}>{question}</Text>
      </View>

      <TextInput
        style={[
          styles.input,
          answer.length > 0 && styles.inputFilled,
        ]}
        value={answer}
        onChangeText={onAnswerChange}
        placeholder={placeholder}
        placeholderTextColor="#8E8E93"
        multiline
        maxLength={maxLength}
        textAlignVertical="top"
      />

      <View style={styles.footer}>
        <Text style={[styles.charCount, isNearLimit && styles.charCountWarning]}>
          {remainingChars} characters remaining
        </Text>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  questionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  question: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 22,
  },
  input: {
    minHeight: 100,
    maxHeight: 200,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
  },
  inputFilled: {
    borderColor: '#007AFF',
    backgroundColor: '#FFFFFF',
  },
  footer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  charCount: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
  },
  charCountWarning: {
    color: '#FF9500',
    fontWeight: '500',
  },
})
