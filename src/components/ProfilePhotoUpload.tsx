import React, { useState } from 'react';
import { View, StyleSheet, Image, Alert } from 'react-native';
import { Button, Avatar, ActivityIndicator } from 'react-native-paper';
import * as ImagePicker from 'react-native-image-picker';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import { supabaseClient } from '../services/supabase';

interface ProfilePhotoUploadProps {
  userId: string;
  currentPhotoUrl?: string | null;
  onUploadComplete: (photoUrl: string) => void;
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  userId,
  currentPhotoUrl,
  onUploadComplete,
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(currentPhotoUrl || null);
  const [isUploading, setIsUploading] = useState(false);

  const compressImage = async (imageUri: string): Promise<string> => {
    try {
      const resized = await ImageResizer.createResizedImage(
        imageUri,
        800, // maxWidth
        800, // maxHeight
        'JPEG',
        70, // quality (0-100)
        0, // rotation
        undefined, // outputPath
        false // keepMeta
      );
      return resized.uri;
    } catch (error) {
      console.error('Error compressing image:', error);
      throw error;
    }
  };

  const selectPhoto = async () => {
    const options: ImagePicker.ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 0.7,
      maxWidth: 800,
      maxHeight: 800,
    };

    ImagePicker.launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Failed to select image');
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];

        // Check file size (should be < 1MB after compression)
        if (asset.fileSize && asset.fileSize > 1024 * 1024) {
          Alert.alert(
            'Image Too Large',
            'Please select an image smaller than 1MB or we will compress it for you.'
          );
        }

        try {
          setIsUploading(true);

          // Compress image
          const compressedUri = await compressImage(asset.uri!);

          // Upload to Supabase Storage
          const fileExt = asset.fileName?.split('.').pop() || 'jpg';
          const fileName = `${userId}.${fileExt}`;

          // Convert URI to blob for upload
          const response = await fetch(compressedUri);
          const blob = await response.blob();

          const { data, error } = await supabaseClient.storage
            .from('profile-photos')
            .upload(fileName, blob, {
              contentType: asset.type || 'image/jpeg',
              upsert: true,
            });

          if (error) {
            throw error;
          }

          // Get public URL
          const {
            data: { publicUrl },
          } = supabaseClient.storage
            .from('profile-photos')
            .getPublicUrl(fileName);

          // Update user profile with photo URL
          const { error: updateError } = await supabaseClient
            .from('users')
            .update({ profile_photo_url: publicUrl })
            .eq('id', userId);

          if (updateError) {
            throw updateError;
          }

          setPhotoUrl(publicUrl);
          onUploadComplete(publicUrl);
          Alert.alert('Success', 'Profile photo uploaded successfully!');
        } catch (error) {
          console.error('Error uploading photo:', error);
          Alert.alert('Error', 'Failed to upload photo. Please try again.');
        } finally {
          setIsUploading(false);
        }
      }
    });
  };

  return (
    <View style={styles.container}>
      {isUploading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating={true} size="large" />
        </View>
      ) : (
        <>
          {photoUrl ? (
            <Avatar.Image size={120} source={{ uri: photoUrl }} />
          ) : (
            <Avatar.Icon size={120} icon="account" />
          )}
        </>
      )}

      <Button
        mode="outlined"
        onPress={selectPhoto}
        disabled={isUploading}
        style={styles.button}
      >
        {photoUrl ? 'Change Photo' : 'Upload Photo'}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  loadingContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    marginTop: 16,
  },
});

export default ProfilePhotoUpload;
