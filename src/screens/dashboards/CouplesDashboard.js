import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/colors';

export default function CouplesDashboard({ navigation }) {
  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userRole');
    await AsyncStorage.removeItem('userEmail');
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  const SHARED_ACTIVITIES = [
    { id: 1, title: 'Emotionally Focused Therapy', progress: 50 },
    { id: 2, title: 'Communication Skills', progress: 70 },
    { id: 3, title: 'Conflict Resolution', progress: 40 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>💑 Couples Therapy</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Relationship Score</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreNumber}>78</Text>
            <Text style={styles.scoreLabel}>out of 100</Text>
          </View>
          <View style={styles.scoreBar}>
            <View style={[styles.scoreBarFill, { width: '78%' }]} />
          </View>
          <Text style={styles.scoreMessage}>Your relationship is strong and improving! 💪</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Shared Exercises</Text>
          {SHARED_ACTIVITIES.map(activity => (
            <View key={activity.id} style={styles.activityRow}>
              <Text style={styles.activityName}>{activity.title}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressBarFill, { width: activity.progress + '%' }]} />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Communication Log</Text>
          <View style={styles.logEntry}>
            <Text style={styles.logDate}>Today</Text>
            <Text style={styles.logMessage}>Great conversation about our future plans</Text>
          </View>
          <View style={styles.logEntry}>
            <Text style={styles.logDate}>Yesterday</Text>
            <Text style={styles.logMessage}>Worked through a conflict successfully</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Next Session</Text>
          <View style={styles.sessionCard}>
            <Text style={styles.sessionIcon}>📅</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.sessionTitle}>Emotionally Focused Therapy</Text>
              <Text style={styles.sessionTime}>Thursday, May 16 at 6:00 PM</Text>
            </View>
            <TouchableOpacity style={styles.sessionButton}>
              <Text style={styles.sessionButtonText}>Join</Text>
            </TouchableOpacity>
          </View>
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
    paddingTop: SPACING.lg,
    paddingBottom: SPACING['2xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  greeting: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '700',
    color: COLORS.primary,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  logoutText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.md,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  scoreNumber: {
    fontSize: TYPOGRAPHY['3xl'],
    fontWeight: '700',
    color: COLORS.primary,
  },
  scoreLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
  },
  scoreBar: {
    height: 8,
    backgroundColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: COLORS.success,
  },
  scoreMessage: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.success,
    fontWeight: '500',
    textAlign: 'center',
  },
  activityRow: {
    marginBottom: SPACING.md,
  },
  activityName: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '500',
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  logEntry: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  logDate: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginBottom: 2,
  },
  logMessage: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray700,
  },
  sessionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  sessionIcon: {
    fontSize: TYPOGRAPHY['2xl'],
  },
  sessionTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  sessionTime: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginTop: 2,
  },
  sessionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  sessionButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
  },
});
