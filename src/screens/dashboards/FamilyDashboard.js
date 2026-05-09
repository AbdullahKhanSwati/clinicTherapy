import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/colors';
import dataStore from '../../utils/dataStore';

export default function FamilyDashboard({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await dataStore.initialize();
        const user = await dataStore.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('[v0] Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userRole');
    await AsyncStorage.removeItem('userEmail');
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  const FAMILY_MEMBERS = [
    { id: 1, name: 'Emma', role: 'Child', mood: '😊', lastActive: '30 min ago' },
    { id: 2, name: 'Tom', role: 'Teen', mood: '😐', lastActive: '2 hours ago' },
    { id: 3, name: 'Sarah', role: 'Parent', mood: '😌', lastActive: 'online' },
  ];

  const PARENTING_TOPICS = [
    { id: 1, title: 'Handling Tantrums', progress: 60 },
    { id: 2, title: 'Setting Boundaries', progress: 45 },
    { id: 3, title: 'Emotional Validation', progress: 75 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>👨‍👩‍👧‍👦 Family Hub</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('Progress')}
            >
              <Text style={styles.headerIcon}>📊</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={styles.headerIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Family Members</Text>
          {FAMILY_MEMBERS.map(member => (
            <View key={member.id} style={styles.memberCard}>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>
              <Text style={styles.memberMood}>{member.mood}</Text>
              <Text style={styles.memberStatus}>{member.lastActive}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Parenting Resources</Text>
          {PARENTING_TOPICS.map(topic => (
            <View key={topic.id} style={styles.topicRow}>
              <Text style={styles.topicName}>{topic.title}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressBarFill, { width: topic.progress + '%' }]} />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Family Milestones</Text>
          <View style={styles.milestone}>
            <Text style={styles.milestoneIcon}>🎉</Text>
            <View>
              <Text style={styles.milestoneTitle}>Emma completed Anxiety Management</Text>
              <Text style={styles.milestoneDate}>2 days ago</Text>
            </View>
          </View>
          <View style={styles.milestone}>
            <Text style={styles.milestoneIcon}>⭐</Text>
            <View>
              <Text style={styles.milestoneTitle}>Tom reached 10-day streak</Text>
              <Text style={styles.milestoneDate}>1 week ago</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Family Check-in</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Schedule Weekly Check-in</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary]}>
            <Text style={styles.actionButtonTextSecondary}>View Family Reports</Text>
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
  headerButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLighter,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: TYPOGRAPHY.lg,
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
  memberCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  memberRole: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginTop: 2,
  },
  memberMood: {
    fontSize: TYPOGRAPHY.lg,
  },
  memberStatus: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
  },
  topicRow: {
    marginBottom: SPACING.md,
  },
  topicName: {
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
  milestone: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    gap: SPACING.md,
  },
  milestoneIcon: {
    fontSize: TYPOGRAPHY.lg,
  },
  milestoneTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '500',
    color: COLORS.gray700,
  },
  milestoneDate: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginTop: 2,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
  },
  actionButtonSecondary: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  actionButtonTextSecondary: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
  },
});
