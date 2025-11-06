/**
 * RoleSelector Component
 * Allows users to select their role: sponsor, sponsee, or both
 * Feature: 002-app-screens
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, RadioButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../theme/ThemeContext';
import type { UserRole } from '../../types/profile';

export interface RoleSelectorProps {
  /** Currently selected role */
  selectedRole: UserRole | null;
  /** Callback when role is selected */
  onRoleSelect: (role: UserRole) => void;
}

interface RoleOption {
  value: UserRole;
  title: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: 'sponsor',
    title: 'Sponsor',
    description: 'I want to support others in their recovery journey',
    icon: 'account-supervisor',
  },
  {
    value: 'sponsee',
    title: 'Sponsee',
    description: "I'm looking for guidance and support in my recovery",
    icon: 'account-star',
  },
  {
    value: 'both',
    title: 'Both',
    description: 'I want to give and receive support',
    icon: 'account-multiple',
  },
];

/**
 * Role selector component for onboarding
 */
export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onRoleSelect,
}) => {
  const { theme } = useAppTheme();

  return (
    <View style={styles.container}>
      <Text
        variant="headlineSmall"
        style={[styles.title, { color: theme.colors.onSurface }]}
      >
        Choose Your Role
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
      >
        How would you like to participate in the recovery community?
      </Text>

      <RadioButton.Group
        onValueChange={(value) => onRoleSelect(value as UserRole)}
        value={selectedRole || ''}
      >
        {ROLE_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => onRoleSelect(option.value)}
            accessible={true}
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedRole === option.value }}
            accessibilityLabel={`${option.title}: ${option.description}`}
          >
            <Card
              style={[
                styles.roleCard,
                selectedRole === option.value && {
                  borderColor: theme.colors.primary,
                  borderWidth: 2,
                  backgroundColor: theme.colors.primaryContainer,
                },
              ]}
              elevation={selectedRole === option.value ? 4 : 1}
            >
              <Card.Content>
                <View style={styles.roleHeader}>
                  <MaterialCommunityIcons
                    name={option.icon}
                    size={32}
                    color={
                      selectedRole === option.value
                        ? theme.colors.primary
                        : theme.colors.onSurfaceVariant
                    }
                  />
                  <View style={styles.roleText}>
                    <Text
                      variant="titleLarge"
                      style={{
                        color:
                          selectedRole === option.value
                            ? theme.colors.onPrimaryContainer
                            : theme.colors.onSurface,
                        fontWeight: '600',
                      }}
                    >
                      {option.title}
                    </Text>
                    <Text
                      variant="bodyMedium"
                      style={{
                        color:
                          selectedRole === option.value
                            ? theme.colors.onPrimaryContainer
                            : theme.colors.onSurfaceVariant,
                        marginTop: 4,
                      }}
                    >
                      {option.description}
                    </Text>
                  </View>
                  <RadioButton.Android
                    value={option.value}
                    status={selectedRole === option.value ? 'checked' : 'unchecked'}
                    color={theme.colors.primary}
                  />
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </RadioButton.Group>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    marginBottom: 8,
    fontWeight: '600',
  },
  subtitle: {
    marginBottom: 24,
  },
  roleCard: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleText: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
});
