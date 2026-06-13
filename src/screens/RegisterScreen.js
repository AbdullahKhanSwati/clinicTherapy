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

const ROLES = [
  { id: 'child',   label: 'Child',   sub: 'For kids age 6–12',                 color: '#9333EA', emoji: '🧒' },
  { id: 'teen',    label: 'Teen',    sub: 'For teenagers',                      color: '#0891B2', emoji: '🧑' },
  { id: 'couples', label: 'Partner', sub: 'You + your partner each sign up',    color: '#D4536B', emoji: '💞' },
  { id: 'family',  label: 'Parent',  sub: 'For a parent / guardian',            color: '#15803D', emoji: '👨‍👩‍👧' },
];

export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth();
  const [role, setRole] = useState('child');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName  = name.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      Alert.alert('Missing info', 'Please fill in name, email and password.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'The two passwords do not match.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Password too short', 'Use at least 8 characters.');
      return;
    }

    const metadata = {
      name: trimmedName,
      role,
      avatar: ROLES.find((r) => r.id === role)?.emoji || '👤',
      profile_color: ROLES.find((r) => r.id === role)?.color || '#1A2332',
    };
    if (age) {
      const ageNum = parseInt(age, 10);
      if (!Number.isNaN(ageNum)) metadata.age = String(ageNum);
    }

    setLoading(true);
    try {
      const data = await signUp({
        email: trimmedEmail,
        password,
        metadata,
      });

      if (!data?.session) {
        // Email confirmation is enabled in Supabase
        Alert.alert(
          'Check your email',
          'We sent a confirmation link to your email. Confirm to finish signing up.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      }
      // If session exists, App.js auth listener will route automatically
    } catch (error) {
      const msg = error?.message || 'Registration failed';
      if (/already registered/i.test(msg) || /already exists/i.test(msg)) {
        Alert.alert('Email in use', 'An account with this email already exists.');
      } else {
        Alert.alert('Registration failed', msg);
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Therapy Companion</Text>
          </View>

          <Text style={styles.sectionLabel}>I AM A</Text>
          <View style={styles.roleGrid}>
            {ROLES.map((r) => {
              const selected = role === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  style={[
                    styles.roleCard,
                    selected && {
                      borderColor: r.color,
                      backgroundColor: r.color + '10',
                    },
                  ]}
                  onPress={() => setRole(r.id)}
                  activeOpacity={0.85}
                  disabled={loading}
                >
                  <Text style={styles.roleEmoji}>{r.emoji}</Text>
                  <Text style={[styles.roleLabel, selected && { color: r.color }]}>
                    {r.label}
                  </Text>
                  <Text style={styles.roleSub}>{r.sub}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {role === 'couples' && (
            <View style={styles.infoBanner}>
              <Text style={styles.infoBannerTitle}>How partner accounts work</Text>
              <Text style={styles.infoBannerText}>
                You and your partner each create your own account. After both
                of you have signed up, your therapist will link the two
                accounts so you can share check-ins, repair requests and
                goals.
              </Text>
            </View>
          )}

          <View style={styles.formSection}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Jordan Lee"
              value={name}
              onChangeText={setName}
              editable={!loading}
              placeholderTextColor={COLORS.gray400}
            />

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

            {(role === 'child' || role === 'teen') && (
              <>
                <Text style={styles.label}>Age</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 9"
                  value={age}
                  onChangeText={setAge}
                  editable={!loading}
                  keyboardType="number-pad"
                  placeholderTextColor={COLORS.gray400}
                />
              </>
            )}

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="At least 8 characters"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
              placeholderTextColor={COLORS.gray400}
            />

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!loading}
              placeholderTextColor={COLORS.gray400}
            />

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? 'Creating...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerSection}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING['2xl'],
  },
  header: { marginBottom: SPACING.lg },
  title: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: { fontSize: TYPOGRAPHY.base, color: COLORS.gray500 },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },

  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },

  infoBanner: {
    backgroundColor: '#D4536B12',
    borderLeftWidth: 3,
    borderLeftColor: '#D4536B',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  infoBannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D4536B',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  infoBannerText: {
    fontSize: 12,
    color: COLORS.gray700,
    lineHeight: 17,
  },
  roleCard: {
    width: '48%',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.gray50,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  roleEmoji: { fontSize: 30, marginBottom: 6 },
  roleLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.gray700,
    letterSpacing: -0.2,
  },
  roleSub: {
    fontSize: 10,
    color: COLORS.gray500,
    textAlign: 'center',
    marginTop: 3,
  },

  formSection: { marginVertical: SPACING.sm },
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
    marginTop: SPACING.xl,
  },
  footerText: { color: COLORS.gray600, fontSize: TYPOGRAPHY.sm },
  footerLink: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.sm,
  },
});
