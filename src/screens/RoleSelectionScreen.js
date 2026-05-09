import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/colors';

const ROLES = [
  {
    id: 'child',
    title: 'Child',
    description: 'Fun, game-based therapeutic exercises',
    icon: '🧒',
  },
  {
    id: 'teen',
    title: 'Teen',
    description: 'Anxiety management and social skills',
    icon: '👨‍🎓',
  },
  {
    id: 'couples',
    title: 'Couples',
    description: 'Premium psychodynamic therapy tools',
    icon: '💑',
  },
  {
    id: 'family',
    title: 'Family',
    description: 'Parenting tools and family dynamics',
    icon: '👨‍👩‍👧‍👦',
  },
  {
    id: 'therapist',
    title: 'Therapist',
    description: 'Client management dashboard',
    icon: '👩‍⚕️',
  },
];

export default function RoleSelectionScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = async (role) => {
    setLoading(true);
    try {
      await AsyncStorage.setItem('userRole', role);
      navigation.reset({ index: 0, routes: [{ name: role + 'Dashboard' }] });
    } catch (error) {
      console.error('Failed to select role:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Your Role</Text>
          <Text style={styles.subtitle}>Choose how you'll use Therapy Companion</Text>
        </View>

        <View style={styles.rolesList}>
          {ROLES.map((role) => (
            <TouchableOpacity
              key={role.id}
              style={styles.roleCard}
              onPress={() => handleRoleSelect(role.id)}
              disabled={loading}
            >
              <Text style={styles.roleIcon}>{role.icon}</Text>
              <Text style={styles.roleTitle}>{role.title}</Text>
              <Text style={styles.roleDescription}>{role.description}</Text>
              <View style={styles.roleArrow}>
                <Text style={styles.arrowText}>→</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING['2xl'],
    paddingBottom: SPACING['2xl'],
  },
  header: {
    marginBottom: SPACING['2xl'],
  },
  title: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.gray500,
  },
  rolesList: {
    gap: SPACING.md,
  },
  roleCard: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIcon: {
    fontSize: TYPOGRAPHY['2xl'],
    marginRight: SPACING.md,
  },
  roleTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
    flex: 1,
  },
  roleDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
    flex: 1,
  },
  roleArrow: {
    paddingLeft: SPACING.md,
  },
  arrowText: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.primary,
  },
});
