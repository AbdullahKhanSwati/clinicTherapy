import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/colors';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.logoSection}>
          <Image
            source={{ uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-05-04%20at%2010.19.30%20PM-g9H64wtPL69WZcaK2vnfRcAbVCAUWU.jpeg' }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Therapy Companion</Text>
          <Text style={styles.subtitle}>Your Personal Mental Health Support</Text>
        </View>

        <View style={styles.contentSection}>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>🧠</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Interactive Worksheets</Text>
              <Text style={styles.featureDesc}>CBT and DBT-based therapeutic exercises</Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>📊</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Progress Tracking</Text>
              <Text style={styles.featureDesc}>Monitor your emotional journey with insights</Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>🤝</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Shared Care</Text>
              <Text style={styles.featureDesc}>Connect with loved ones and therapists</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.secondaryButtonText}>Create Account</Text>
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
    paddingBottom: SPACING['2xl'],
  },
  logoSection: {
    alignItems: 'center',
    marginTop: SPACING['3xl'],
    marginBottom: SPACING['3xl'],
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY['3xl'],
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.gray500,
    textAlign: 'center',
  },
  contentSection: {
    marginVertical: SPACING['2xl'],
    gap: SPACING.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
  },
  featureIcon: {
    fontSize: TYPOGRAPHY['2xl'],
    marginTop: 2,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  featureDesc: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
    lineHeight: 20,
  },
  buttonSection: {
    gap: SPACING.md,
    marginTop: SPACING['2xl'],
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: COLORS.gray100,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
  },
});
