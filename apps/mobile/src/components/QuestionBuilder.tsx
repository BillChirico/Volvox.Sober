/**
 * QuestionBuilder Component
 * Dynamic form for adding/editing/removing check-in questions
 */

import React from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native'

interface QuestionBuilderProps {
  questions: string[]
  onChange: (questions: string[]) => void
  maxQuestions?: number
  minQuestions?: number
}

export const QuestionBuilder: React.FC<QuestionBuilderProps> = ({
  questions,
  onChange,
  maxQuestions = 5,
  minQuestions = 1,
}) => {
  const handleAddQuestion = () => {
    if (questions.length < maxQuestions) {
      onChange([...questions, ''])
    }
  }

  const handleRemoveQuestion = (index: number) => {
    if (questions.length > minQuestions) {
      const newQuestions = questions.filter((_, i) => i !== index)
      onChange(newQuestions)
    }
  }

  const handleUpdateQuestion = (index: number, value: string) => {
    const newQuestions = [...questions]
    newQuestions[index] = value
    onChange(newQuestions)
  }

  const canAddMore = questions.length < maxQuestions
  const canRemove = questions.length > minQuestions

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Check-In Questions</Text>
        <Text style={styles.counter}>
          {questions.length} / {maxQuestions}
        </Text>
      </View>

      <Text style={styles.description}>
        These questions will be asked during each check-in
      </Text>

      <View style={styles.questionsContainer}>
        {questions.map((question, index) => (
          <View key={index} style={styles.questionRow}>
            <View style={styles.questionNumber}>
              <Text style={styles.questionNumberText}>{index + 1}</Text>
            </View>

            <TextInput
              style={styles.questionInput}
              value={question}
              onChangeText={(text) => handleUpdateQuestion(index, text)}
              placeholder={`Question ${index + 1}`}
              placeholderTextColor="#8E8E93"
              multiline
              maxLength={200}
            />

            {canRemove && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveQuestion(index)}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {canAddMore && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddQuestion}
        >
          <Text style={styles.addButtonText}>+ Add Question</Text>
        </TouchableOpacity>
      )}

      {!canAddMore && (
        <Text style={styles.maxQuestionsText}>
          Maximum {maxQuestions} questions reached
        </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  counter: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  questionsContainer: {
    gap: 12,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  questionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  questionNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  questionInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 100,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  removeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  addButton: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  maxQuestionsText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    fontStyle: 'italic',
  },
})
