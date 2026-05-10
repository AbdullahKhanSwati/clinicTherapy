import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../constants/colors';
import { MOOD_ENTRIES, JOURNAL_ENTRIES, WORKSHEET_ASSIGNMENTS, BADGES_DATA } from '../../data/mockData';
import dataStore from '../../utils/dataStore';
import { tryCatch } from '../../utils/safeOperations';

export default function HomeTab({ navigation }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayMood, setTodayMood] = useState(null);
  const [streak, setStreak] = useState(0);
  const [assignedWorksheets, setAssignedWorksheets] = useState([]);
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    await tryCatch(async () => {
      setLoading(true);
      await dataStore.initialize();
      const user = await dataStore.getCurrentUser();
      setCurrentUser(user);

      // Get today's mood from mock data
      const todayMoodEntry = MOOD_ENTRIES.find(
        m => m.userId === user?.id && 
        new Date(m.date).toDateString() === new Date().toDateString()
      );
      
      if (todayMoodEntry) {
        setTodayMood({
          emoji: { happy: '😊', sad: '😢', angry: '😠', anxious: '😰', excited: '🤩', okay: '😐', calm: '😌' }[todayMoodEntry.mood] || '😐',
          label: todayMoodEntry.mood.charAt(0).toUpperCase() + todayMoodEntry.mood.slice(1),
          color: { happy: COLORS.success, sad: COLORS.error, angry: COLORS.error, anxious: COLORS.warning, excited: COLORS.accent1, okay: COLORS.gray500, calm: COLORS.accent3 }[todayMoodEntry.mood] || COLORS.gray500,
          intensity: todayMoodEntry.intensity,
        });
      } else {
        setTodayMood({ emoji: '🤔', label: 'Not checked', color: COLORS.gray500, intensity: 0 });
      }

      // Calculate streak
      setStreak(7);

      // Get assigned worksheets
      const worksheets = WORKSHEET_ASSIGNMENTS.filter(a => a.clientId === user?.id && a.status !== 'completed');
      setAssignedWorksheets(worksheets.slice(0, 3));

      setLoading(false);
    }, null);
  };

  const handlePressActivity = (activityId) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate based on activity
    if (activityId === 1) {
      navigation.navigate('MoodCheckIn');
    } else if (activityId === 2) {
      navigation.navigate('Progress');
    } else if (activityId === 3) {
      navigation.navigate('Journal');
    } else if (activityId === 4) {
      navigation.navigate('Badges');
    }
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

  const ACTIVITIES = [
    {
      id: 1,
      title: 'Mood Check',
      emoji: '😊',
      color: COLORS.accent1,
      description: 'How are you feeling?',
    },
    {
      id: 2,
      title: 'Progress',
      emoji: '📈',
      color: COLORS.accent3,
      description: 'Track your journey',
    },
    {
      id: 3,
      title: 'Journal',
      emoji: '📝',
      color: COLORS.accent4,
      description: 'Write your thoughts',
    },
    {
      id: 4,
      title: 'Badges',
      emoji: '🏆',
      color: COLORS.accent5,
      description: 'See your rewards',
    },
  ];

  const unlockedBadges = BADGES_DATA.filter(b => b.unlocked).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {currentUser?.name || 'Friend'}! 👋</Text>
            <Text style={styles.subGreeting}>Welcome back to your wellness space</Text>
          </View>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>{currentUser?.avatar || '👧'}</Text>
          </View>
        </View>

        {/* Today's Mood Card */}
        <TouchableOpacity 
          style={styles.moodCard}
          onPress={() => navigation.navigate('MoodCheckIn')}
          activeOpacity={0.8}
        >
          <View style={styles.moodHeader}>
            <Text style={styles.moodLabel}>Today's Mood</Text>
            <Text style={styles.streakBadge}>🔥 {streak} day streak!</Text>
          </View>
          <View style={[styles.moodDisplay, { borderBottomColor: todayMood?.color }]}>
            <Text style={styles.moodEmoji}>{todayMood?.emoji}</Text>
            <View>
              <Text style={styles.moodTitle}>{todayMood?.label}</Text>
              <Text style={styles.moodTime}>
                {todayMood?.label === 'Not checked' ? 'Tap to check in' : 'Just now'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { borderTopColor: COLORS.accent1 }]}>
            <Text style={styles.statEmoji}>✅</Text>
            <Text style={styles.statNumber}>
              {WORKSHEET_ASSIGNMENTS.filter(a => a.clientId === currentUser?.id && a.status === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>Worksheets</Text>
          </View>
          <View style={[styles.statCard, { borderTopColor: COLORS.accent3 }]}>
            <Text style={styles.statEmoji}>📖</Text>
            <Text style={styles.statNumber}>
              {JOURNAL_ENTRIES.filter(j => j.userId === currentUser?.id).length}
            </Text>
            <Text style={styles.statLabel}>Journals</Text>
          </View>
          <View style={[styles.statCard, { borderTopColor: COLORS.accent5 }]}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statNumber}>{unlockedBadges}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
        </View>

        {/* Quick Activities */}
        <Text style={styles.sectionTitle}>Quick Start</Text>
        <View style={styles.activitiesGrid}>
          {ACTIVITIES.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={[
                styles.activityCard,
                { borderLeftColor: activity.color },
              ]}
              onPress={() => handlePressActivity(activity.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.activityIconBg, { backgroundColor: activity.color + '15' }]}>
                <Text style={styles.activityIcon}>{activity.emoji}</Text>
              </View>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityDesc}>{activity.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Assigned Worksheets Section */}
        {assignedWorksheets.length > 0 && (
          <View style={styles.worksheetsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Assignments</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Worksheets')}>
                <Text style={styles.viewAll}>See all →</Text>
              </TouchableOpacity>
            </View>
            {assignedWorksheets.map((assignment) => (
              <TouchableOpacity
                key={assignment.id}
                style={styles.worksheetItem}
                onPress={() => navigation.navigate('Worksheets')}
                activeOpacity={0.7}
              >
                <View style={styles.worksheetItemContent}>
                  <Text style={styles.worksheetItemTitle}>{assignment.notes || 'Worksheet'}</Text>
                  <Text style={styles.worksheetItemCategory}>
                    Status: {assignment.status === 'pending' ? '📝 New' : '⏳ In Progress'}
                  </Text>
                </View>
                <Text style={styles.worksheetItemArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Recommended Action */}
        <View style={styles.actionCard}>
          <Text style={styles.actionIcon}>💡</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Keep the Momentum!</Text>
            <Text style={styles.actionDesc}>
              {assignedWorksheets.length > 0 
                ? `You have ${assignedWorksheets.length} worksheet(s) waiting for you`
                : 'Check in with your mood today!'}
            </Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </View>

        {/* Footer Message */}
        <View style={styles.footerMessage}>
          <Text style={styles.footerEmoji}>✨</Text>
          <Text style={styles.footerText}>Remember, every small step counts. You&apos;re doing great! 🌟</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  greeting: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  subGreeting: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  avatar: {
    fontSize: 32,
  },
  moodCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  moodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  moodLabel: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  streakBadge: {
    fontSize: TYPOGRAPHY.sm,
    backgroundColor: COLORS.accent4 + '20',
    color: COLORS.gray700,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    overflow: 'hidden',
  },
  moodDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: SPACING.md,
    borderBottomWidth: 3,
  },
  moodEmoji: {
    fontSize: 48,
    marginRight: SPACING.lg,
  },
  moodTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  moodTime: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    borderTopWidth: 4,
    ...SHADOWS.sm,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  statNumber: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '700',
    color: COLORS.gray700,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  viewAll: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  activityCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    ...SHADOWS.sm,
  },
  activityIconBg: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  activityIcon: {
    fontSize: 24,
  },
  activityTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  activityDesc: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
  },
  worksheetsSection: {
    marginBottom: SPACING.xl,
  },
  worksheetItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  worksheetItemContent: {
    flex: 1,
  },
  worksheetItemTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  worksheetItemCategory: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
  },
  worksheetItemArrow: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.primary,
    marginLeft: SPACING.md,
  },
  actionCard: {
    backgroundColor: COLORS.primary + '15',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  actionIcon: {
    fontSize: 32,
    marginRight: SPACING.lg,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  actionDesc: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
  },
  actionArrow: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.primary,
    fontWeight: '600',
  },
  footerMessage: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.accent5 + '10',
    borderRadius: 12,
    marginBottom: SPACING.xl,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent5,
  },
  footerEmoji: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  footerText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray600,
    textAlign: 'center',
    lineHeight: 20,
  },
});
