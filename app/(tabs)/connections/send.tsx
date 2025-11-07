/**
 * Send Connection Request Screen
 * Send a connection request to a potential sponsor
 * Migrated from src/screens/connections/SendRequestScreen.tsx
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Surface, Avatar, Snackbar, useTheme } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSendRequestMutation } from '../../../src/store/api/connectionsApi';

const SendRequestScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ sponsorId: string; sponsorName: string; sponsorPhotoUrl?: string }>();
  const { sponsorId, sponsorName, sponsorPhotoUrl } = params;

  const [message, setMessage] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [sendRequest, { isLoading }] = useSendRequestMutation();

  const handleSendRequest = async () => {
    if (!sponsorId) {
      setSnackbarMessage('Missing sponsor information');
      setSnackbarVisible(true);
      return;
    }

    try {
      await sendRequest({
        sponsor_id: sponsorId,
        introduction_message: message.trim() || undefined,
      }).unwrap();

      setSnackbarMessage(`Request sent to ${sponsorName}`);
      setSnackbarVisible(true);

      // Navigate back after short delay
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      setSnackbarMessage(error.data?.message || 'Failed to send request');
      setSnackbarVisible(true);
    }
  };

  const characterCount = message.length;
  const maxCharacters = 200;
  const isOverLimit = characterCount > maxCharacters;

  const styles = createStyles(theme);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.surface}>
          {/* Sponsor Info */}
          <View style={styles.sponsorInfo}>
            {sponsorPhotoUrl ? (
              <Avatar.Image size={80} source={{ uri: sponsorPhotoUrl }} />
            ) : (
              <Avatar.Icon size={80} icon="account" />
            )}
            <Text variant="headlineSmall" style={styles.sponsorName}>
              {sponsorName}
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Send a connection request to start your sponsorship journey
            </Text>
          </View>

          {/* Optional Message */}
          <View style={styles.messageSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Introduce Yourself (Optional)
            </Text>
            <Text variant="bodySmall" style={styles.hint}>
              Share a bit about yourself and why you'd like to connect
            </Text>

            <TextInput
              mode="outlined"
              multiline
              numberOfLines={6}
              value={message}
              onChangeText={setMessage}
              placeholder="Hi, I'm interested in working with you as my sponsor..."
              style={styles.textInput}
              maxLength={maxCharacters + 50} // Allow typing beyond limit to show error
            />

            <Text
              variant="bodySmall"
              style={[styles.characterCount, isOverLimit && styles.characterCountError]}>
              {characterCount} / {maxCharacters} characters
            </Text>
          </View>

          {/* Guidelines */}
          <Surface style={styles.guidelines} elevation={0}>
            <Text variant="labelMedium" style={styles.guidelinesTitle}>
              ℹ️ What to Include:
            </Text>
            <Text variant="bodySmall" style={styles.guidelineItem}>
              • Your sobriety goals and what you're looking for in a sponsor
            </Text>
            <Text variant="bodySmall" style={styles.guidelineItem}>
              • How you found their profile (if applicable)
            </Text>
            <Text variant="bodySmall" style={styles.guidelineItem}>
              • Your availability and commitment level
            </Text>
          </Surface>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={() => router.back()}
              style={styles.cancelButton}
              disabled={isLoading}>
              Cancel
            </Button>

            <Button
              mode="contained"
              onPress={handleSendRequest}
              style={styles.sendButton}
              loading={isLoading}
              disabled={isLoading || isOverLimit}
              icon="send">
              Send Request
            </Button>
          </View>

          {/* Info Note */}
          <Text variant="bodySmall" style={styles.infoNote}>
            The sponsor will receive a notification and can accept or decline your request.
          </Text>
        </Surface>
      </ScrollView>

      {/* Snackbar for feedback */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}>
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    scrollContent: {
      flexGrow: 1,
    },
    surface: {
      margin: 16,
      padding: 24,
      borderRadius: 8,
      elevation: 2,
    },
    sponsorInfo: {
      alignItems: 'center',
      marginBottom: 24,
    },
    sponsorName: {
      marginTop: 16,
      marginBottom: 8,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    subtitle: {
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
    },
    messageSection: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontWeight: 'bold',
      marginBottom: 4,
    },
    hint: {
      color: theme.colors.onSurfaceVariant,
      marginBottom: 12,
    },
    textInput: {
      marginBottom: 8,
    },
    characterCount: {
      textAlign: 'right',
      color: theme.colors.onSurfaceVariant,
    },
    characterCountError: {
      color: '#d32f2f',
    },
    guidelines: {
      backgroundColor: '#e3f2fd',
      padding: 16,
      borderRadius: 8,
      marginBottom: 24,
    },
    guidelinesTitle: {
      fontWeight: 'bold',
      marginBottom: 8,
      color: '#1976d2',
    },
    guidelineItem: {
      marginBottom: 4,
      color: '#555',
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    cancelButton: {
      flex: 1,
    },
    sendButton: {
      flex: 1,
    },
    infoNote: {
      textAlign: 'center',
      color: '#999',
      fontStyle: 'italic',
    },
  });

export default SendRequestScreen;
