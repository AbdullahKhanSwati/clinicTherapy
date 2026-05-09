import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/colors';

const DEMO_USERS = [
  { email: 'child@therapy.com', role: 'child', name: 'Emma (Child)' },
  { email: 'teen@therapy.com', role: 'teen', name: 'Alex (Teen)' },
  { email: 'couple1@therapy.com', role: 'couples', name: 'John & Sarah' },
  { email: 'parent@therapy.com', role: 'family', name: 'Parent Dashboard' },
  { email: 'therapist@therapy.com', role: 'therapist', name: 'Dr. Smith' },
];

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = async (role) => {
    setLoading(true);
    try {
      await AsyncStorage.setItem('userToken', 'demo_token_' + role);
      await AsyncStorage.setItem('userRole', role);
      await AsyncStorage.setItem('userEmail', email || 'demo@therapy.com');
      navigation.reset({ index: 0, routes: [{ name: role + 'Dashboard' }] });
    } catch (error) {
      Alert.alert('Error', 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would authenticate against a backend
      // For demo, we'll just set some mock data
      const demoUser = DEMO_USERS.find(u => u.email === email);
      if (demoUser) {
        await AsyncStorage.setItem('userToken', 'demo_token_' + demoUser.role);
        await AsyncStorage.setItem('userRole', demoUser.role);
        await AsyncStorage.setItem('userEmail', email);
        navigation.reset({ index: 0, routes: [{ name: demoUser.role + 'Dashboard' }] });
      } else {
        Alert.alert('Error', 'User not found. Try a demo account below.');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
            placeholderTextColor={COLORS.gray400}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
            placeholderTextColor={COLORS.gray400}
          />

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.divider}>OR</Text>

          <Text style={styles.demoTitle}>Quick Demo Access</Text>
          <Text style={styles.demoSubtitle}>Select a role to explore the app:</Text>

          {DEMO_USERS.map((user) => (
            <TouchableOpacity
              key={user.role}
              style={styles.demoButton}
              onPress={() => handleDemoLogin(user.role)}
              disabled={loading}
            >
              <View style={styles.demoButtonContent}>
                <Text style={styles.demoButtonLabel}>{user.name}</Text>
                <Text style={styles.demoButtonArrow}>→</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footerSection}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}>Sign up</Text>
          </TouchableOpacity>
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
  formSection: {
    marginVertical: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.gray700,
    backgroundColor: COLORS.gray50,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
  },
  divider: {
    textAlign: 'center',
    color: COLORS.gray400,
    marginVertical: SPACING.lg,
    fontSize: TYPOGRAPHY.sm,
  },
  demoTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  demoSubtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
    marginBottom: SPACING.md,
  },
  demoButton: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.gray50,
  },
  demoButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  demoButtonLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '500',
    color: COLORS.primary,
  },
  demoButtonArrow: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.primary,
  },
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING['2xl'],
  },
  footerText: {
    color: COLORS.gray600,
    fontSize: TYPOGRAPHY.sm,
  },
  footerLink: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.sm,
  },
});
