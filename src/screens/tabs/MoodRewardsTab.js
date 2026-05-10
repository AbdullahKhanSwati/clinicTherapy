import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../constants/colors';
import dataStore from '../../utils/dataStore';
import { tryCatch } from '../../utils/safeOperations';

const MOOD_EMOJIS = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  anxious: '😰',
  excited: '🤩',
  calm: '😌',
  okay: '😐',
};

export default function MoodRewardsTab({ navigation }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayMood, setTodayMood] = useState(null);
  const [streak, setStreak] = useState(7);
  const [totalPoints, setTotalPoints] = useState(850);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await tryCatch(async () => {
      setLoading(true);
      await dataStore.initialize();
      const user = await dataStore.getCurrentUser();
      setCurrentUser(user);

      // Mock mood data
      setTodayMood({ emoji: '😊', label: 'Happy', intensity: 8 });

      // Mock badges
      setBadges([
        { id: 1, title: 'Happy Start', emoji: '⭐', unlocked: true, earnedDate: '2 days ago' },
        { id: 2, title: 'Brave Heart', emoji: '💪', unlocked: true, earnedDate: '1 day ago' },
        { id: 3, title: 'Peace Master', emoji: '☮️', unlocked: false, progress: 60 },
        { id: 4, title: 'Joy Seeker', emoji: '🎉', unlocked: false, progress: 40 },
        { id: 5, title: 'Resilience Hero', emoji: '🦸', unlocked: false, progress: 80 },
        { id: 6, title: 'Mindful Mind', emoji: '🧠', unlocked: false, progress: 50 },
      ]);

      setLoading(false);
    }, null);
  };

  const handleMoodClick = (mood) => {
    navigation.navigate('MoodCheckIn', { moodPreset: mood });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const moodOptions = [
    { key: 'happy', label: 'Happy' },
    { key: 'sad', label: 'Sad' },
    { key: 'angry', label: 'Angry' },
    { key: 'anxious', label: 'Anxious' },
    { key: 'excited', label: 'Excited' },
    { key: 'calm', label: 'Calm' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mood & Rewards</Text>
          <Text style={styles.subtitle}>Track your journey and earn achievements</Text>
        </View>

        {/* Mood Check-in Section */}
        <View style={styles.moodCheckSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>How are you feeling today?</Text>
            {todayMood && <Text style={styles.alreadyChecked}>✓ Already checked</Text>}
          </View>

          <View style={styles.moodGrid}>
            {moodOptions.map((mood) => (
              <TouchableOpacity
                key={mood.key}
                style={[
                  styles.moodOption,
                  todayMood?.label === mood.label && styles.moodOptionActive,
                ]}
                onPress={() => handleMoodClick(mood.key)}
                activeOpacity={0.8}
              >
                <Text style={styles.moodEmoji}>{MOOD_EMOJIS[mood.key]}</Text>
                <Text style={styles.moodLabel}>{mood.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: COLORS.accent4 + '15' }]}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statName}>Day Streak</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: COLORS.accent1 + '15' }]}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statValue}>{totalPoints}</Text>
            <Text style={styles.statName}>Total Points</Text>
          </View>
        </View>

        {/* Rewards Section */}
        <View style={styles.badgesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Badges</Text>
            <Text style={styles.badgeCount}>{badges.filter((b) => b.unlocked).length} unlocked</Text>
          </View>

          <View style={styles.badgesGrid}>
            {badges.map((badge) => (
              <TouchableOpacity
                key={badge.id}
                style={[
                  styles.badgeCard,
                  !badge.unlocked && styles.badgeCardLocked,
                ]}
                onPress={() => {
                  if (badge.unlocked) {
                    navigation.navigate('Badges');
                  }
                }}
                activeOpacity={0.8}
              >
                <View style={styles.badgeContent}>
                  <Text style={[styles.badgeEmoji, !badge.unlocked && styles.badgeEmojiLocked]}>
                    {badge.emoji}
                  </Text>
                  <Text style={styles.badgeTitle}>{badge.title}</Text>

                  {badge.unlocked ? (
                    <Text style={styles.badgeDate}>{badge.earnedDate}</Text>
                  ) : (
                    <View style={styles.badgeProgress}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${badge.progress}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressPercent}>{badge.progress}%</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Encouragement Card */}
        <View style={styles.encouragementCard}>
          <Text style={styles.encouragementEmoji}>🌟</Text>
          <Text style={styles.encouragementTitle}>You&apos;re doing amazing!</Text>
          <Text style={styles.encouragementText}>
            Keep tracking your moods and completing worksheets to unlock more rewards.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
  },
  moodCheckSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  alreadyChecked: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.success,
    fontWeight: '600',
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  moodOption: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  moodLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.gray700,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '700',
    color: COLORS.gray700,
  },
  statName: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
    fontWeight: '500',
  },
  badgesSection: {
    marginBottom: SPACING.lg,
  },
  badgeCount: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.success,
    fontWeight: '600',
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  badgeCard: {
    width: '31%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.sm,
    borderWidth: 2,
    borderColor: COLORS.gray200,
  },
  badgeCardLocked: {
    opacity: 0.6,
  },
  badgeContent: {
    alignItems: 'center',
    width: '100%',
  },
  badgeEmoji: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  badgeEmojiLocked: {
    opacity: 0.5,
    fontSize: 32,
  },
  badgeTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.gray700,
    textAlign: 'center',
  },
  badgeDate: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.success,
    marginTop: SPACING.xs,
    fontWeight: '500',
  },
  badgeProgress: {
    width: '100%',
    marginTop: SPACING.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.gray200,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.warning,
    borderRadius: 2,
  },
  progressPercent: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    textAlign: 'center',
    fontWeight: '500',
  },
  encouragementCard: {
    backgroundColor: COLORS.accent5 + '15',
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent5,
  },
  encouragementEmoji: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  encouragementTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  encouragementText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray600,
    textAlign: 'center',
    lineHeight: 20,
  },
});
