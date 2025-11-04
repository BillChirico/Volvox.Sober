import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Surface, HelperText, Menu } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfileData } from '../../store/slices/onboardingSlice';
import { useNavigation } from '@react-navigation/native';
import * as Yup from 'yup';

const sponsorProfileSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  yearsSober: Yup.number()
    .min(1, 'Must have at least 1 year sober')
    .required('Years sober is required'),
  maxSponsees: Yup.number()
    .min(1, 'Must be willing to sponsor at least 1 person')
    .max(20, 'Maximum 20 sponsees')
    .required('Maximum sponsees is required'),
  availability: Yup.string().required('Availability is required'),
  approach: Yup.string()
    .max(200, 'Approach must be less than 200 characters')
    .required('Sponsorship approach is required'),
  bio: Yup.string().max(500, 'Bio must be less than 500 characters'),
});

const availabilityOptions = ['1-2 days', '3-5 days', 'Daily'];

const SponsorProfileScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const profileData = useSelector((state: any) => state.onboarding.profileData);

  const [formData, setFormData] = useState({
    name: profileData.name || '',
    city: profileData.location.city || '',
    state: profileData.location.state || '',
    programType: profileData.programType || 'AA',
    yearsSober: profileData.yearsSober?.toString() || '',
    maxSponsees: profileData.maxSponsees?.toString() || '',
    availability: profileData.availability || '',
    approach: profileData.approach || '',
    bio: profileData.bio || '',
  });

  const [showAvailabilityMenu, setShowAvailabilityMenu] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAndContinue = async () => {
    try {
      await sponsorProfileSchema.validate(
        {
          name: formData.name,
          city: formData.city,
          state: formData.state,
          yearsSober: parseInt(formData.yearsSober),
          maxSponsees: parseInt(formData.maxSponsees),
          availability: formData.availability,
          approach: formData.approach,
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
          yearsSober: parseInt(formData.yearsSober),
          maxSponsees: parseInt(formData.maxSponsees),
          availability: formData.availability,
          approach: formData.approach,
          bio: formData.bio,
        })
      );

      // Navigate to email verification
      navigation.navigate('EmailVerification' as never);
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
          Create Your Sponsor Profile
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Help sponsees understand your experience and sponsorship style.
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

        <TextInput
          label="Years Sober *"
          value={formData.yearsSober}
          onChangeText={(text) => setFormData({ ...formData, yearsSober: text })}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
          error={!!errors.yearsSober}
        />
        <HelperText type="error" visible={!!errors.yearsSober}>
          {errors.yearsSober}
        </HelperText>

        <TextInput
          label="Maximum Sponsees *"
          value={formData.maxSponsees}
          onChangeText={(text) => setFormData({ ...formData, maxSponsees: text })}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
          error={!!errors.maxSponsees}
        />
        <HelperText type="error" visible={!!errors.maxSponsees}>
          {errors.maxSponsees}
        </HelperText>

        <Menu
          visible={showAvailabilityMenu}
          onDismiss={() => setShowAvailabilityMenu(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setShowAvailabilityMenu(true)}
              style={styles.input}
            >
              {formData.availability || 'Select Availability *'}
            </Button>
          }
        >
          {availabilityOptions.map((option) => (
            <Menu.Item
              key={option}
              onPress={() => {
                setFormData({ ...formData, availability: option });
                setShowAvailabilityMenu(false);
              }}
              title={option}
            />
          ))}
        </Menu>
        <HelperText type="error" visible={!!errors.availability}>
          {errors.availability}
        </HelperText>

        <TextInput
          label="Sponsorship Approach *"
          value={formData.approach}
          onChangeText={(text) => setFormData({ ...formData, approach: text })}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
          error={!!errors.approach}
        />
        <HelperText type="info" visible={true}>
          {formData.approach.length}/200 characters
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

const styles = StyleSheet.create({
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
    color: '#666',
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 24,
    paddingVertical: 8,
  },
});

export default SponsorProfileScreen;
