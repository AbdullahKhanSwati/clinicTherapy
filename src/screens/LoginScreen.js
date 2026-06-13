import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !password) {
      Alert.alert('Missing info', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      await signIn({ email: trimmed, password });
      // Auth state listener in App.js handles navigation
    } catch (error) {
      const msg = error?.message || 'Login failed';
      if (/invalid login credentials/i.test(msg)) {
        Alert.alert('Invalid credentials', 'Email or password is incorrect.');
      } else if (/email not confirmed/i.test(msg)) {
        Alert.alert(
          'Email not confirmed',
          'Please check your inbox and confirm your email before signing in.'
        );
      } else {
        Alert.alert('Login failed', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
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
          </View>

          <View style={styles.footerSection}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  header: { marginBottom: SPACING['2xl'] },
  title: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: { fontSize: TYPOGRAPHY.base, color: COLORS.gray500 },
  formSection: { marginVertical: SPACING.lg },
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
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
  },
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING['2xl'],
  },
  footerText: { color: COLORS.gray600, fontSize: TYPOGRAPHY.sm },
  footerLink: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.sm,
  },
});
