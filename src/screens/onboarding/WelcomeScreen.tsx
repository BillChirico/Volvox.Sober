import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, RadioButton, Button, Surface } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { setRole, UserRole } from '../../store/slices/onboardingSlice';
import { useNavigation } from '@react-navigation/native';

const WelcomeScreen: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const handleContinue = () => {
    if (selectedRole) {
      dispatch(setRole(selectedRole as UserRole));

      // Navigate to appropriate profile form based on role
      if (selectedRole === 'sponsee') {
        navigation.navigate('SponseeProfile' as never);
      } else if (selectedRole === 'sponsor') {
        navigation.navigate('SponsorProfile' as never);
      } else {
        // For 'both', navigate to sponsee first, then sponsor
        navigation.navigate('SponseeProfile' as never);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.surface}>
        <Text variant="headlineLarge" style={styles.title}>
          Welcome to Volvox Sober
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          How would you like to participate in our recovery community?
        </Text>

        <RadioButton.Group
          onValueChange={value => setSelectedRole(value as UserRole)}
          value={selectedRole}>
          <Surface style={styles.option}>
            <RadioButton.Item
              label="I need a sponsor"
              value="sponsee"
              mode="android"
              labelStyle={styles.optionLabel}
            />
            <Text variant="bodyMedium" style={styles.optionDescription}>
              Connect with experienced sponsors who can guide you through your recovery journey.
            </Text>
          </Surface>

          <Surface style={styles.option}>
            <RadioButton.Item
              label="I want to sponsor others"
              value="sponsor"
              mode="android"
              labelStyle={styles.optionLabel}
            />
            <Text variant="bodyMedium" style={styles.optionDescription}>
              Share your experience and help others on their path to recovery.
            </Text>
          </Surface>

          <Surface style={styles.option}>
            <RadioButton.Item
              label="Both"
              value="both"
              mode="android"
              labelStyle={styles.optionLabel}
            />
            <Text variant="bodyMedium" style={styles.optionDescription}>
              Seek guidance while also supporting others in their recovery.
            </Text>
          </Surface>
        </RadioButton.Group>

        <Button
          mode="contained"
          onPress={handleContinue}
          disabled={!selectedRole}
          style={styles.button}>
          Continue
        </Button>
      </Surface>
    </ScrollView>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    surface: {
      margin: 16,
      padding: 24,
      borderRadius: 8,
      elevation: 2,
    },
    title: {
      marginBottom: 8,
      textAlign: 'center',
      fontWeight: 'bold',
    },
    subtitle: {
      marginBottom: 32,
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
    },
    option: {
      marginBottom: 16,
      padding: 12,
      borderRadius: 8,
      elevation: 1,
    },
    optionLabel: {
      fontSize: 16,
      fontWeight: '600',
    },
    optionDescription: {
      marginLeft: 52,
      marginTop: 4,
      color: theme.colors.onSurfaceVariant,
    },
    button: {
      marginTop: 24,
      paddingVertical: 8,
    },
  });

export default WelcomeScreen;
