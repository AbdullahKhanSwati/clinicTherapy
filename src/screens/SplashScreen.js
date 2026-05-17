import React from 'react';
import { View, StyleSheet, Image, Text, ActivityIndicator } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/colors';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      {/* Decorative soft circles for depth — match the brand teal */}
      <View style={[styles.decor, styles.decorTop]} />
      <View style={[styles.decor, styles.decorBottom]} />

      <View style={styles.center}>
        <View style={styles.iconWrap}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.appName}>Therapy Companion</Text>
        <Text style={styles.tagline}>Your safe space to grow</Text>
      </View>

      <View style={styles.bottom}>
        <ActivityIndicator size="small" color={COLORS.white} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  decor: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.25,
  },
  decorTop: {
    width: 320,
    height: 320,
    top: -90,
    right: -100,
  },
  decorBottom: {
    width: 380,
    height: 380,
    bottom: -120,
    left: -120,
    opacity: 0.18,
  },

  center: {
    alignItems: 'center',
    zIndex: 1,
  },
  iconWrap: {
    width: 132,
    height: 132,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  icon: {
    width: 110,
    height: 110,
    borderRadius: 24,
  },
  appName: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  tagline: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.white,
    opacity: 0.85,
    letterSpacing: 0.4,
    fontWeight: '500',
  },

  bottom: {
    position: 'absolute',
    bottom: 56,
    alignItems: 'center',
    zIndex: 1,
  },
});
