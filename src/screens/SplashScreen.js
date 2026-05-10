import React from 'react';
import { View, StyleSheet, Image, Text, ActivityIndicator } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/colors';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.appName}>Therapy Companion</Text>
        <Text style={styles.tagline}>Your safe space to grow</Text>
      </View>
      <ActivityIndicator
        size="small"
        color={COLORS.white}
        style={styles.spinner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: { alignItems: 'center' },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  logo: { width: 90, height: 90 },
  appName: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  tagline: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.white,
    opacity: 0.85,
  },
  spinner: { position: 'absolute', bottom: SPACING['3xl'] },
});
