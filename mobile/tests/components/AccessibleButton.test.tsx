import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { AccessibleButton } from '../../src/components/AccessibleButton';

describe('AccessibleButton', () => {
  describe('accessibilityLabel extraction', () => {
    it('should use explicit accessibilityLabel when provided', () => {
      const { getByLabelText } = render(
        <AccessibleButton accessibilityLabel="Custom Label" onPress={() => {}}>
          <Text>Different Text</Text>
        </AccessibleButton>
      );

      expect(getByLabelText('Custom Label')).toBeTruthy();
    });

    it('should extract text from string children', () => {
      const { getByLabelText } = render(
        <AccessibleButton onPress={() => {}}>
          Submit
        </AccessibleButton>
      );

      expect(getByLabelText('Submit')).toBeTruthy();
    });

    it('should extract text from Text component children', () => {
      const { getByLabelText } = render(
        <AccessibleButton onPress={() => {}}>
          <Text>Send Message</Text>
        </AccessibleButton>
      );

      expect(getByLabelText('Send Message')).toBeTruthy();
    });

    it('should extract text from nested View/Text structure', () => {
      const { getByLabelText } = render(
        <AccessibleButton onPress={() => {}}>
          <View>
            <Text>Go Back</Text>
          </View>
        </AccessibleButton>
      );

      expect(getByLabelText('Go Back')).toBeTruthy();
    });

    it('should concatenate multiple Text children with spaces', () => {
      const { getByLabelText } = render(
        <AccessibleButton onPress={() => {}}>
          <Text>Save</Text>
          <Text>Changes</Text>
        </AccessibleButton>
      );

      expect(getByLabelText('Save Changes')).toBeTruthy();
    });

    it('should NOT produce "[object Object]" for icon-only children', () => {
      const IconComponent = () => <View testID="icon" />;

      const { getByRole } = render(
        <AccessibleButton onPress={() => {}}>
          <IconComponent />
        </AccessibleButton>
      );

      const button = getByRole('button');

      // Should NOT have "[object Object]" as label
      expect(button.props.accessibilityLabel).not.toBe('[object Object]');

      // Should have empty string or undefined (requiring explicit label)
      expect(button.props.accessibilityLabel).toBeFalsy();
    });

    it('should extract text from mixed icon + text children', () => {
      const IconComponent = () => <View testID="icon" />;

      const { getByLabelText } = render(
        <AccessibleButton onPress={() => {}}>
          <IconComponent />
          <Text>Delete</Text>
        </AccessibleButton>
      );

      expect(getByLabelText('Delete')).toBeTruthy();
    });

    it('should handle complex nested structures', () => {
      const { getByLabelText } = render(
        <AccessibleButton onPress={() => {}}>
          <View>
            <View>
              <Text>Edit</Text>
            </View>
            <Text>Item</Text>
          </View>
        </AccessibleButton>
      );

      expect(getByLabelText('Edit Item')).toBeTruthy();
    });
  });

  describe('accessibility properties', () => {
    it('should be accessible by default', () => {
      const { getByRole } = render(
        <AccessibleButton accessibilityLabel="Test" onPress={() => {}}>
          <Text>Test</Text>
        </AccessibleButton>
      );

      expect(getByRole('button')).toBeTruthy();
    });

    it('should support accessibilityHint', () => {
      const { getByRole } = render(
        <AccessibleButton
          accessibilityLabel="Back"
          accessibilityHint="Navigate to previous screen"
          onPress={() => {}}
        >
          <Text>Back</Text>
        </AccessibleButton>
      );

      const button = getByRole('button');
      expect(button.props.accessibilityHint).toBe('Navigate to previous screen');
    });

    it('should support accessibilityRole', () => {
      const { getByRole } = render(
        <AccessibleButton
          accessibilityLabel="Submit"
          accessibilityRole="button"
          onPress={() => {}}
        >
          <Text>Submit</Text>
        </AccessibleButton>
      );

      expect(getByRole('button')).toBeTruthy();
    });
  });

  describe('button behavior', () => {
    it('should call onPress when pressed', () => {
      const onPress = jest.fn();
      const { getByLabelText } = render(
        <AccessibleButton accessibilityLabel="Test" onPress={onPress}>
          <Text>Test</Text>
        </AccessibleButton>
      );

      fireEvent.press(getByLabelText('Test'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });
});
