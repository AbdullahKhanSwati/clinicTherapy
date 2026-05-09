import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/colors';
import { useAuth } from '../../../App';

export default function ChildDashboard() {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [moodToday, setMoodToday] = useState('happy');

  const handleLogout = async () => {
    await signOut();
  };

  const ACTIVITIES = [
    { id: 1, title: 'Feelings Explorer', emoji: '🎨', color: COLORS.accent1 },
    { id: 2, title: 'Breathing Game', emoji: '🌬️', color: COLORS.accent2 },
    { id: 3, title: 'Joy Journal', emoji: '📔', color: COLORS.accent3 },
    { id: 4, title: 'Monster Talk', emoji: '👹', color: COLORS.primaryLight },
  ];

  const BADGES = [
    { id: 1, title: 'Happy Start', emoji: '⭐', unlocked: true },
    { id: 2, title: 'Brave Heart', emoji: '💪', unlocked: true },
    { id: 3, title: 'Peace Master', emoji: '☮️', unlocked: false },
    { id: 4, title: 'Joy Seeker', emoji: '🎉', unlocked: false },
  ];

  const MOOD_OPTIONS = [
    { value: 'sad', emoji: '😢', label: 'Sad' },
    { value: 'okay', emoji: '😐', label: 'Okay' },
    { value: 'happy', emoji: '😊', label: 'Happy' },
    { value: 'excited', emoji: '🤩', label: 'Excited' },
  ];

  if (activeTab === 'journal') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>My Joy Journal</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => setActiveTab('home')}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.journalEntry}>
            <Text style={styles.journalDate}>Today's Happy Moments</Text>
            <View style={styles.journalCard}>
              <Text style={styles.journalIcon}>☀️</Text>
              <Text style={styles.journalText}>I played with my friend at recess!</Text>
            </View>
            <View style={styles.journalCard}>
              <Text style={styles.journalIcon}>🍪</Text>
              <Text style={styles.journalText}>Mom made my favorite cookies</Text>
            </View>
            <View style={styles.journalCard}>
              <Text style={styles.journalIcon}>📚</Text>
              <Text style={styles.journalText}>I finished reading a cool book</Text>
            </View>
          </View>
        </ScrollView>
        <View style={styles.tabBar}>
          {['home', 'journal', 'badges'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={styles.tabLabel}>
                {tab === 'home' ? '🏠 Home' : tab === 'journal' ? '📔 Journal' : '🏆 Badges'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (activeTab === 'badges') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>My Badges</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => setActiveTab('home')}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.badgesGrid}>
            {BADGES.map(badge => (
              <View key={badge.id} style={[styles.badgeCard, !badge.unlocked && styles.badgeCardLocked]}>
                <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
                <Text style={styles.badgeTitle}>{badge.title}</Text>
                {!badge.unlocked && <Text style={styles.badgeLock}>🔒</Text>}
              </View>
            ))}
          </View>
        </ScrollView>
        <View style={styles.tabBar}>
          {['home', 'journal', 'badges'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={styles.tabLabel}>
                {tab === 'home' ? '🏠 Home' : tab === 'journal' ? '📔 Journal' : '🏆 Badges'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hey Friend! 👋</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>How are you feeling today?</Text>
          <View style={styles.moodGrid}>
            {MOOD_OPTIONS.map(mood => (
              <TouchableOpacity
                key={mood.value}
                style={[
                  styles.moodButton,
                  moodToday === mood.value && styles.moodButtonActive,
                ]}
                onPress={() => setMoodToday(mood.value)}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={styles.moodLabel}>{mood.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fun Activities</Text>
          <View style={styles.activitiesGrid}>
            {ACTIVITIES.map(activity => (
              <TouchableOpacity
                key={activity.id}
                style={[styles.activityCard, { borderLeftColor: activity.color, borderLeftWidth: 4 }]}
              >
                <Text style={styles.activityEmoji}>{activity.emoji}</Text>
                <Text style={styles.activityTitle}>{activity.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Streak</Text>
          <View style={styles.streakContainer}>
            <Text style={styles.streakNumber}>7</Text>
            <Text style={styles.streakLabel}>Days in a row!</Text>
            <Text style={styles.streakMessage}>Keep it up! 🌟</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.tabBar}>
        {['home', 'journal', 'badges'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={styles.tabLabel}>
              {tab === 'home' ? '🏠 Home' : tab === 'journal' ? '📔 Journal' : '🏆 Badges'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
    paddingBottom: 80,
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
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '700',
    color: COLORS.primary,
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
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: SPACING.md,
  },
  moodButton: {
    alignItems: 'center',
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray50,
    borderWidth: 2,
    borderColor: COLORS.gray200,
  },
  moodButtonActive: {
    backgroundColor: COLORS.primaryLighter,
    borderColor: COLORS.primary,
  },
  moodEmoji: {
    fontSize: TYPOGRAPHY['2xl'],
    marginBottom: SPACING.xs,
  },
  moodLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray700,
    fontWeight: '500',
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  activityCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  activityEmoji: {
    fontSize: TYPOGRAPHY['2xl'],
    marginBottom: SPACING.sm,
  },
  activityTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '500',
    color: COLORS.gray700,
    textAlign: 'center',
  },
  streakContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  streakNumber: {
    fontSize: TYPOGRAPHY['3xl'],
    fontWeight: '700',
    color: COLORS.primary,
  },
  streakLabel: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.gray600,
    marginTop: SPACING.sm,
  },
  streakMessage: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
    marginTop: SPACING.sm,
  },
  journalEntry: {
    gap: SPACING.md,
  },
  journalDate: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.md,
  },
  journalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  journalIcon: {
    fontSize: TYPOGRAPHY['2xl'],
  },
  journalText: {
    flex: 1,
    color: COLORS.gray700,
    fontSize: TYPOGRAPHY.sm,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  badgeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  badgeCardLocked: {
    backgroundColor: COLORS.gray50,
    borderColor: COLORS.gray300,
  },
  badgeEmoji: {
    fontSize: 40,
    marginBottom: SPACING.md,
  },
  badgeTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.gray700,
    textAlign: 'center',
  },
  badgeLock: {
    fontSize: TYPOGRAPHY.lg,
    marginTop: SPACING.sm,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  tabItem: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemActive: {
    backgroundColor: COLORS.primaryLighter,
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
    color: COLORS.gray700,
  },
});
