/**
 * Question Renderer Component - Dynamic rendering for different question types (T103)
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, useTheme, Chip } from 'react-native-paper';
import { StepQuestion } from '../services/stepsApi';

interface QuestionRendererProps {
  question: StepQuestion;
  value: string;
  onChange: (value: string) => void;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  value,
  onChange,
}) => {
  const theme = useTheme();
  const [bulletItems, setBulletItems] = useState<string[]>(() => {
    try {
      return value ? JSON.parse(value) : [];
    } catch {
      return [];
    }
  });
  const [newBulletItem, setNewBulletItem] = useState('');

  const handleAddBulletItem = () => {
    if (newBulletItem.trim()) {
      const updated = [...bulletItems, newBulletItem.trim()];
      setBulletItems(updated);
      onChange(JSON.stringify(updated));
      setNewBulletItem('');
    }
  };

  const handleRemoveBulletItem = (index: number) => {
    const updated = bulletItems.filter((_, i) => i !== index);
    setBulletItems(updated);
    onChange(JSON.stringify(updated));
  };

  const handleRatingSelect = (rating: number) => {
    onChange(rating.toString());
  };

  switch (question.type) {
    case 'long_text':
      return (
        <View style={styles.container}>
          <Text variant="bodyLarge" style={styles.questionText}>
            {question.text}
          </Text>
          <TextInput
            mode="outlined"
            multiline
            numberOfLines={6}
            value={value}
            onChangeText={onChange}
            placeholder="Type your answer here..."
            style={styles.textInput}
          />
        </View>
      );

    case 'bullet_list':
      return (
        <View style={styles.container}>
          <Text variant="bodyLarge" style={styles.questionText}>
            {question.text}
          </Text>

          {/* Existing bullet items */}
          <View style={styles.bulletList}>
            {bulletItems.map((item, index) => (
              <View key={index} style={styles.bulletItem}>
                <Text style={styles.bulletText}>• {item}</Text>
                <Button
                  mode="text"
                  onPress={() => handleRemoveBulletItem(index)}
                  compact
                >
                  Remove
                </Button>
              </View>
            ))}
          </View>

          {/* Add new bullet item */}
          <View style={styles.addBulletContainer}>
            <TextInput
              mode="outlined"
              value={newBulletItem}
              onChangeText={setNewBulletItem}
              placeholder="Add an item..."
              style={styles.bulletInput}
              onSubmitEditing={handleAddBulletItem}
            />
            <Button
              mode="contained"
              onPress={handleAddBulletItem}
              disabled={!newBulletItem.trim()}
              style={styles.addButton}
            >
              Add
            </Button>
          </View>
        </View>
      );

    case 'rating':
      return (
        <View style={styles.container}>
          <Text variant="bodyLarge" style={styles.questionText}>
            {question.text}
          </Text>
          <Text variant="bodySmall" style={styles.ratingLabel}>
            Rate from 1 (lowest) to 5 (highest)
          </Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <Chip
                key={rating}
                selected={value === rating.toString()}
                onPress={() => handleRatingSelect(rating)}
                style={styles.ratingChip}
                mode={value === rating.toString() ? 'flat' : 'outlined'}
              >
                {rating}
              </Chip>
            ))}
          </View>
        </View>
      );

    default:
      return (
        <View style={styles.container}>
          <Text>Unsupported question type: {question.type}</Text>
        </View>
      );
  }
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  questionText: {
    marginBottom: 12,
    fontWeight: '600',
    lineHeight: 24,
  },
  textInput: {
    minHeight: 120,
  },
  bulletList: {
    marginBottom: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  addBulletContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  bulletInput: {
    flex: 1,
  },
  addButton: {
    alignSelf: 'flex-end',
  },
  ratingLabel: {
    color: '#666',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingChip: {
    minWidth: 50,
  },
});
