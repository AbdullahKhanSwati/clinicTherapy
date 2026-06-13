import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/colors';
import {
  listMyMoodEntries,
  listMyBadges,
  listMyAssignments,
} from '../../services/api';
import TabScreenHeader from '../../components/TabScreenHeader';

const MOOD_EMOJIS = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  anxious: '😰',
  calm: '😌',
  excited: '🤩',
  confused: '😕',
  overwhelmed: '😩',
};

const toDayKey = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};
const dayKeyOfDate = (d) =>
  `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

// Count consecutive days back from today that have at least one mood entry.
const computeStreak = (moods) => {
  const days = new Set(
    (moods || []).map((m) => toDayKey(m.date)).filter(Boolean)
  );
  let streak = 0;
  const cursor = new Date();
  while (days.has(dayKeyOfDate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

export default function MoodRewardsTab({ navigation }) {
  const [moods, setMoods] = useState([]);
  const [badgeCount, setBadgeCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          const [m, b, a] = await Promise.all([
            listMyMoodEntries(),
            listMyBadges(),
            listMyAssignments(),
          ]);
          if (cancelled) return;
          setMoods(m || []);
          setBadgeCount((b || []).length);
          setCompletedCount(
            (a || []).filter((x) => x.status === 'completed').length
          );
        } catch (e) {
          console.log('[MoodRewardsTab] load error', e);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const recentMoods = useMemo(() => (moods || []).slice(0, 7), [moods]);
  const streak = useMemo(() => computeStreak(moods), [moods]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TabScreenHeader title="Mood & Rewards" subtitle="Track how you're feeling" />

        <TouchableOpacity
          style={styles.checkInCard}
          onPress={() => navigation.navigate('MoodCheckIn')}
        >
          <Text style={styles.checkInEmoji}>💭</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.checkInTitle}>Quick Mood Check-In</Text>
            <Text style={styles.checkInSubtitle}>How are you feeling right now?</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Moods</Text>
          {recentMoods.length === 0 ? (
            <Text style={styles.emptyText}>No mood check-ins yet. Tap above to start!</Text>
          ) : (
            <View style={styles.moodRow}>
              {recentMoods.map((m) => (
                <Text key={m.id} style={styles.moodBubble}>
                  {MOOD_EMOJIS[m.mood] || '😐'}
                </Text>
              ))}
            </View>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { marginRight: SPACING.sm }]}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>
              {streak === 1 ? 'day streak' : 'day streak'}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📊</Text>
            <Text style={styles.statValue}>{moods.length}</Text>
            <Text style={styles.statLabel}>
              total check-{moods.length === 1 ? 'in' : 'ins'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.badgesCard}
          onPress={() => navigation.navigate('Badges')}
          activeOpacity={0.9}
        >
          <View style={styles.badgesIconBox}>
            <Text style={styles.badgesIcon}>🏆</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.badgesTitle}>Your Badges</Text>
            <Text style={styles.badgesSub}>
              {badgeCount > 0
                ? `${badgeCount} earned · keep going!`
                : 'Earn badges as you check in'}
            </Text>
          </View>
          <Text style={styles.badgesChev}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.progressLink}
          onPress={() => navigation.navigate('Progress')}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.progressTitle}>My Progress</Text>
            <Text style={styles.progressSub}>
              {completedCount} worksheet{completedCount === 1 ? '' : 's'} completed
            </Text>
          </View>
          <Text style={styles.progressArrow}>→</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  checkInCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  checkInEmoji: { fontSize: 40, marginRight: SPACING.md },
  checkInTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: COLORS.white,
  },
  checkInSubtitle: { fontSize: TYPOGRAPHY.sm, color: COLORS.white, opacity: 0.9 },
  arrow: { fontSize: TYPOGRAPHY.xl, color: COLORS.white },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: SPACING.md,
  },
  emptyText: { fontSize: TYPOGRAPHY.sm, color: COLORS.gray500 },
  moodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  moodBubble: { fontSize: 32 },

  statsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  statEmoji: { fontSize: 28, marginBottom: 4 },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    fontWeight: '600',
    marginTop: 2,
  },

  badgesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  badgesIconBox: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.accent4 + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  badgesIcon: { fontSize: 26 },
  badgesTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: 2,
  },
  badgesSub: { fontSize: TYPOGRAPHY.xs, color: COLORS.gray500 },
  badgesChev: { fontSize: 28, color: COLORS.gray400 },

  progressLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  progressTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: 2,
  },
  progressSub: { fontSize: TYPOGRAPHY.xs, color: COLORS.gray500 },
  progressArrow: { fontSize: TYPOGRAPHY.lg, color: COLORS.primary, fontWeight: '700' },
});
