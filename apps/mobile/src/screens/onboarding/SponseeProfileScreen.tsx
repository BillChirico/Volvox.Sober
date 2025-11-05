import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, TextInput, Button, Surface, HelperText } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfileData } from '../../store/slices/onboardingSlice';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Yup from 'yup';

const sponseeProfileSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  sobrietyDate: Yup.date()
    .required('Sobriety date is required')
    .max(new Date(), 'Sobriety date cannot be in the future'),
  stepProgress: Yup.number()
    .min(0, 'Step progress must be between 0 and 12')
    .max(12, 'Step progress must be between 0 and 12')
    .required('Step progress is required'),
  bio: Yup.string().max(500, 'Bio must be less than 500 characters'),
});

const SponseeProfileScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const profileData = useSelector((state: any) => state.onboarding.profileData);
  const role = useSelector((state: any) => state.onboarding.role);

  const [formData, setFormData] = useState({
    name: profileData.name || '',
    city: profileData.location.city || '',
    state: profileData.location.state || '',
    programType: profileData.programType || 'AA',
    sobrietyDate: profileData.sobrietyDate ? new Date(profileData.sobrietyDate) : new Date(),
    stepProgress: profileData.stepProgress?.toString() || '0',
    bio: profileData.bio || '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData({ ...formData, sobrietyDate: selectedDate });
    }
  };

  const validateAndContinue = async () => {
    try {
      await sponseeProfileSchema.validate(
        {
          name: formData.name,
          city: formData.city,
          state: formData.state,
          sobrietyDate: formData.sobrietyDate,
          stepProgress: parseInt(formData.stepProgress),
          bio: formData.bio,
        },
        { abortEarly: false }
      );

      // Update Redux store
      dispatch(
        updateProfileData({
          name: formData.name,
          location: {
            city: formData.city,
            state: formData.state,
          },
          programType: formData.programType,
          sobrietyDate: formData.sobrietyDate.toISOString(),
          stepProgress: parseInt(formData.stepProgress),
          bio: formData.bio,
        })
      );

      // Navigate based on role
      if (role === 'both') {
        navigation.navigate('SponsorProfile' as never);
      } else {
        navigation.navigate('EmailVerification' as never);
      }
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors: Record<string, string> = {};
        error.inner.forEach((err) => {
          if (err.path) {
            validationErrors[err.path] = err.message;
          }
        });
        setErrors(validationErrors);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.surface}>
        <Text variant="headlineMedium" style={styles.title}>
          Create Your Sponsee Profile
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Help sponsors understand your journey and recovery goals.
        </Text>

        <TextInput
          label="Name *"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          mode="outlined"
          style={styles.input}
          error={!!errors.name}
        />
        <HelperText type="error" visible={!!errors.name}>
          {errors.name}
        </HelperText>

        <TextInput
          label="City *"
          value={formData.city}
          onChangeText={(text) => setFormData({ ...formData, city: text })}
          mode="outlined"
          style={styles.input}
          error={!!errors.city}
        />
        <HelperText type="error" visible={!!errors.city}>
          {errors.city}
        </HelperText>

        <TextInput
          label="State *"
          value={formData.state}
          onChangeText={(text) => setFormData({ ...formData, state: text })}
          mode="outlined"
          style={styles.input}
          error={!!errors.state}
        />
        <HelperText type="error" visible={!!errors.state}>
          {errors.state}
        </HelperText>

        <Button
          mode="outlined"
          onPress={() => setShowDatePicker(true)}
          style={styles.input}
        >
          Sobriety Date: {formData.sobrietyDate.toLocaleDateString()}
        </Button>
        <HelperText type="error" visible={!!errors.sobrietyDate}>
          {errors.sobrietyDate}
        </HelperText>

        {showDatePicker && (
          <DateTimePicker
            value={formData.sobrietyDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        <TextInput
          label="Step Progress (0-12) *"
          value={formData.stepProgress}
          onChangeText={(text) => setFormData({ ...formData, stepProgress: text })}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
          error={!!errors.stepProgress}
        />
        <HelperText type="error" visible={!!errors.stepProgress}>
          {errors.stepProgress}
        </HelperText>

        <TextInput
          label="Bio"
          value={formData.bio}
          onChangeText={(text) => setFormData({ ...formData, bio: text })}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.input}
          error={!!errors.bio}
        />
        <HelperText type="info" visible={true}>
          {formData.bio.length}/500 characters
        </HelperText>

        <Button
          mode="contained"
          onPress={validateAndContinue}
          style={styles.button}
        >
          Continue
        </Button>
      </Surface>
    </ScrollView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
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
    fontWeight: 'bold',
  },
  subtitle: {
    marginBottom: 24,
    color: theme.colors.onSurfaceVariant,
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 24,
    paddingVertical: 8,
  },
});

export default SponseeProfileScreen;
