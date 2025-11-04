import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Surface, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { supabaseClient } from '../../services/supabase';
import ProfilePhotoUpload from '../../components/ProfilePhotoUpload';
import * as Yup from 'yup';

const profileSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  bio: Yup.string().max(500, 'Bio must be less than 500 characters'),
});

interface ProfileData {
  id: string;
  name: string;
  location: {
    city: string;
    state: string;
  };
  bio: string;
  profile_photo_url?: string;
}

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    state: '',
    bio: '',
    profile_photo_url: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      if (!session?.user) {
        return;
      }

      setUserId(session.user.id);

      const { data, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      setFormData({
        name: data.name || '',
        city: data.location?.city || '',
        state: data.location?.state || '',
        bio: data.bio || '',
        profile_photo_url: data.profile_photo_url || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Validate form data
      await profileSchema.validate(
        {
          name: formData.name,
          city: formData.city,
          state: formData.state,
          bio: formData.bio,
        },
        { abortEarly: false }
      );

      setSaving(true);

      // Optimistic update - update local state immediately
      const updateData = {
        name: formData.name,
        location: {
          city: formData.city,
          state: formData.state,
        },
        bio: formData.bio,
      };

      // Update database
      const { error } = await supabaseClient
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        throw error;
      }

      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors: Record<string, string> = {};
        error.inner.forEach((err) => {
          if (err.path) {
            validationErrors[err.path] = err.message;
          }
        });
        setErrors(validationErrors);
      } else {
        console.error('Error saving profile:', error);
        Alert.alert('Error', 'Failed to update profile. Please try again.');
        // Rollback optimistic update by reloading
        loadProfile();
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUploadComplete = (photoUrl: string) => {
    setFormData({ ...formData, profile_photo_url: photoUrl });
  };

  if (loading) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.surface}>
        <Text variant="headlineMedium" style={styles.title}>
          Edit Profile
        </Text>

        <ProfilePhotoUpload
          userId={userId}
          currentPhotoUrl={formData.profile_photo_url}
          onUploadComplete={handlePhotoUploadComplete}
        />

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
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={styles.saveButton}
        >
          Save Changes
        </Button>

        <Button mode="text" onPress={() => navigation.goBack()} disabled={saving}>
          Cancel
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
    marginBottom: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    marginBottom: 8,
  },
  saveButton: {
    marginTop: 24,
    marginBottom: 12,
    paddingVertical: 8,
  },
});

export default EditProfileScreen;
