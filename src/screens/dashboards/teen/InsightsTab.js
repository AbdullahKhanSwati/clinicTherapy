import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, DrawerActions } from '@react-navigation/native';
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from '../../../constants/colors';
import dataStore from '../../../utils/dataStore';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

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

const MOOD_SCORE = {
  excited: 9,
  happy: 8,
  calm: 7,
  okay: 5,
  confused: 4,
  sad: 3,
  anxious: 3,
  angry: 2,
  overwhelmed: 1,
};

export default function TeenInsightsTab() {
  const navigation = useNavigation();
  const [moods, setMoods] = useState([]);
  const [journals, setJournals] = useState([]);
  const [assignments, setAssignments] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          await dataStore.initialize();
          const u = await dataStore.getCurrentUser();
          if (!u || cancelled) return;
          const [m, j, a] = await Promise.all([
            dataStore.getMoodEntriesByUser(u.id),
            dataStore.getJournalEntriesByUser(u.id),
            dataStore.getAssignmentsByClient(u.id),
          ]);
          if (cancelled) return;
          setMoods(m || []);
          setJournals(j || []);
          setAssignments(a || []);
        } catch (e) {
          console.log('[Teen InsightsTab] load error', e);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  // Build a 7-day mood chart from the most recent entries (fallback uses sample bars)
  const weeklyChart = useMemo(() => {
    if (!moods || moods.length === 0) {
      return DAY_LABELS.map((d) => ({ day: d, value: 0, mood: null }));
    }
    const recent = [...moods]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 7)
      .reverse();
    const filled = DAY_LABELS.map((d, i) => {
      const entry = recent[i];
      if (!entry) return { day: d, value: 0, mood: null };
      return {
        day: d,
        value: MOOD_SCORE[entry.mood] || 5,
        mood: entry.mood,
      };
    });
    return filled;
  }, [moods]);

  const avgScore = useMemo(() => {
    const valid = weeklyChart.filter((d) => d.value > 0);
    if (valid.length === 0) return 0;
    return Math.round(
      (valid.reduce((s, d) => s + d.value, 0) / valid.length) * 10
    ) / 10;
  }, [weeklyChart]);

  const completedCount = assignments.filter((a) => a.status === 'completed').length;
  const inProgressCount = assignments.filter((a) => a.status === 'in-progress').length;

  // Top mood frequencies
  const topMoods = useMemo(() => {
    const counts = {};
    moods.forEach((m) => {
      counts[m.mood] = (counts[m.mood] || 0) + 1;
    });
    const total = moods.length || 1;
    return Object.entries(counts)
      .map(([mood, n]) => ({
        mood,
        n,
        pct: Math.round((n / total) * 100),
      }))
      .sort((a, b) => b.n - a.n)
      .slice(0, 4);
  }, [moods]);

  // Mock top triggers (would come from notes/tags in production)
  const TOP_TRIGGERS = [
    { id: 1, label: 'School pressure', pct: 45, color: COLORS.accent1 },
    { id: 2, label: 'Sleep deprivation', pct: 30, color: COLORS.accent2 },
    { id: 3, label: 'Social situations', pct: 25, color: COLORS.accent5 },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.menuBtn} onPress={openDrawer}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Insights</Text>
            <Text style={styles.headerSub}>Your wellbeing, at a glance</Text>
          </View>
        </View>

        {/* Score hero */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreCardLeft}>
            <Text style={styles.scoreLabel}>WEEKLY MOOD SCORE</Text>
            <View style={styles.scoreValueRow}>
              <Text style={styles.scoreValue}>
                {avgScore > 0 ? avgScore : '—'}
              </Text>
              <Text style={styles.scoreOutOf}>/10</Text>
            </View>
            <Text style={styles.scoreCaption}>
              {avgScore >= 7
                ? 'Trending up — keep going! 🌱'
                : avgScore >= 5
                ? 'Steady week — small wins matter'
                : avgScore > 0
                ? 'Tough week. You\'re not alone.'
                : 'Log a mood to start tracking'}
            </Text>
          </View>
          <View style={styles.scoreRing}>
            <View style={styles.scoreRingInner}>
              <Text style={styles.scoreRingEmoji}>
                {avgScore >= 7 ? '😊' : avgScore >= 5 ? '😌' : avgScore > 0 ? '😔' : '🫧'}
              </Text>
            </View>
          </View>
        </View>

        {/* Stat row */}
        <View style={styles.statRow}>
          <View style={styles.statTile}>
            <Text style={[styles.statEmoji, { color: COLORS.primary }]}>📊</Text>
            <Text style={styles.statBig}>{moods.length}</Text>
            <Text style={styles.statSmall}>Check-ins</Text>
          </View>
          <View style={styles.statTile}>
            <Text style={[styles.statEmoji, { color: COLORS.accent3 }]}>✅</Text>
            <Text style={styles.statBig}>{completedCount}</Text>
            <Text style={styles.statSmall}>Completed</Text>
          </View>
          <View style={styles.statTile}>
            <Text style={[styles.statEmoji, { color: COLORS.accent5 }]}>📔</Text>
            <Text style={styles.statBig}>{journals.length}</Text>
            <Text style={styles.statSmall}>Journals</Text>
          </View>
        </View>

        {/* Mood chart */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Mood Trend</Text>
              <Text style={styles.cardSub}>Last 7 check-ins</Text>
            </View>
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>WEEK</Text>
            </View>
          </View>

          <View style={styles.chartWrap}>
            {weeklyChart.map((d, i) => {
              const heightPct = d.value ? (d.value / 10) * 100 : 8;
              const isLatest = i === weeklyChart.length - 1;
              return (
                <View key={i} style={styles.chartCol}>
                  <View style={styles.chartBarSlot}>
                    <View
                      style={[
                        styles.chartBar,
                        {
                          height: `${heightPct}%`,
                          backgroundColor: d.value
                            ? isLatest
                              ? COLORS.primary
                              : COLORS.primaryLighter
                            : COLORS.gray200,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.chartDay}>{d.day}</Text>
                  {d.mood ? (
                    <Text style={styles.chartMoodEmoji}>{MOOD_EMOJIS[d.mood]}</Text>
                  ) : (
                    <Text style={styles.chartMoodEmoji}> </Text>
                  )}
                </View>
              );
            })}
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: COLORS.primary }]}
              />
              <Text style={styles.legendText}>Today</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: COLORS.primaryLighter },
                ]}
              />
              <Text style={styles.legendText}>This week</Text>
            </View>
          </View>
        </View>

        {/* Mood distribution */}
        {topMoods.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Your Top Moods</Text>
                <Text style={styles.cardSub}>What you've felt most</Text>
              </View>
            </View>
            <View style={styles.moodChips}>
              {topMoods.map((m) => (
                <View key={m.mood} style={styles.moodChip}>
                  <Text style={styles.moodChipEmoji}>{MOOD_EMOJIS[m.mood]}</Text>
                  <View style={{ flex: 1 }}>
                    <View style={styles.moodChipRow}>
                      <Text style={styles.moodChipLabel}>
                        {m.mood.charAt(0).toUpperCase() + m.mood.slice(1)}
                      </Text>
                      <Text style={styles.moodChipPct}>{m.pct}%</Text>
                    </View>
                    <View style={styles.moodBarTrack}>
                      <View
                        style={[styles.moodBarFill, { width: `${m.pct}%` }]}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Top triggers */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Common Triggers</Text>
              <Text style={styles.cardSub}>What activates anxious feelings</Text>
            </View>
          </View>
          {TOP_TRIGGERS.map((t) => (
            <View key={t.id} style={styles.triggerRow}>
              <View style={[styles.triggerDot, { backgroundColor: t.color }]} />
              <Text style={styles.triggerLabel}>{t.label}</Text>
              <View style={styles.triggerBarTrack}>
                <View
                  style={[
                    styles.triggerBarFill,
                    { width: `${t.pct}%`, backgroundColor: t.color },
                  ]}
                />
              </View>
              <Text style={styles.triggerPct}>{t.pct}%</Text>
            </View>
          ))}
        </View>

        {/* Active goals card */}
        <TouchableOpacity
          style={styles.goalCard}
          onPress={() => navigation.navigate('Progress')}
          activeOpacity={0.9}
        >
          <View style={styles.goalIconBox}>
            <Text style={styles.goalIcon}>🎯</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.goalTitle}>
              {inProgressCount} active worksheet{inProgressCount === 1 ? '' : 's'}
            </Text>
            <Text style={styles.goalSub}>View full progress report</Text>
          </View>
          <Text style={styles.goalChev}>→</Text>
        </TouchableOpacity>

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    ...SHADOWS.sm,
  },
  menuIcon: { fontSize: 20, color: COLORS.gray700, fontWeight: '700' },
  headerTitle: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '800',
    color: COLORS.gray700,
    letterSpacing: -0.5,
  },
  headerSub: { fontSize: TYPOGRAPHY.xs, color: COLORS.gray500, marginTop: 2 },

  /* Score hero */
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray700,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  scoreCardLeft: { flex: 1 },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: COLORS.primaryLighter,
    marginBottom: 6,
  },
  scoreValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -1,
  },
  scoreOutOf: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.gray400,
    fontWeight: '600',
    marginLeft: 4,
  },
  scoreCaption: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray300,
    lineHeight: 20,
  },
  scoreRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  scoreRingInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreRingEmoji: { fontSize: 36 },

  /* Stat row */
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statTile: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    marginHorizontal: 4,
    ...SHADOWS.sm,
  },
  statEmoji: { fontSize: 22, marginBottom: 4 },
  statBig: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '800',
    color: COLORS.gray700,
    letterSpacing: -0.4,
  },
  statSmall: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    fontWeight: '500',
    marginTop: 2,
  },

  /* Card */
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '800',
    color: COLORS.gray700,
    letterSpacing: -0.2,
  },
  cardSub: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginTop: 2,
  },
  cardBadge: {
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  cardBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray600,
    letterSpacing: 0.8,
  },

  /* Chart */
  chartWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
    marginBottom: SPACING.md,
  },
  chartCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
  },
  chartBarSlot: {
    flex: 1,
    width: '60%',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  chartBar: {
    width: '100%',
    borderRadius: BORDER_RADIUS.sm,
    minHeight: 6,
  },
  chartDay: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '700',
    marginBottom: 2,
  },
  chartMoodEmoji: { fontSize: 12 },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
  },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendText: { fontSize: TYPOGRAPHY.xs, color: COLORS.gray500, fontWeight: '500' },

  /* Mood distribution */
  moodChips: { gap: SPACING.md },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  moodChipEmoji: { fontSize: 26, marginRight: SPACING.md },
  moodChipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  moodChipLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  moodChipPct: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '700',
    color: COLORS.gray500,
  },
  moodBarTrack: {
    height: 6,
    backgroundColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  moodBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
  },

  /* Triggers */
  triggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  triggerDot: { width: 10, height: 10, borderRadius: 5, marginRight: SPACING.sm },
  triggerLabel: {
    flex: 1.2,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray700,
    fontWeight: '500',
  },
  triggerBarTrack: {
    flex: 1.5,
    height: 6,
    backgroundColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginHorizontal: SPACING.sm,
  },
  triggerBarFill: { height: '100%', borderRadius: BORDER_RADIUS.full },
  triggerPct: {
    minWidth: 36,
    textAlign: 'right',
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray600,
    fontWeight: '700',
  },

  /* Goal card */
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  goalIconBox: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  goalIcon: { fontSize: 22 },
  goalTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 2,
  },
  goalSub: { fontSize: TYPOGRAPHY.xs, color: COLORS.white, opacity: 0.85 },
  goalChev: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.white,
    fontWeight: '700',
    marginLeft: SPACING.sm,
  },
});
