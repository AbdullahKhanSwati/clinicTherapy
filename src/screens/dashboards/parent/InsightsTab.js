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
import { Feather } from '@expo/vector-icons';
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
} from '../../../constants/colors';
import dataStore from '../../../utils/dataStore';

const INK = '#1A2332';
const SAGE = '#15803D';

const MOOD_SCORE = {
  excited: 9, happy: 8, calm: 7, okay: 5,
  confused: 4, sad: 3, anxious: 3, angry: 2, overwhelmed: 1,
};

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function ParentInsightsTab() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [allMoods, setAllMoods] = useState([]);
  const [allCompleted, setAllCompleted] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          await dataStore.initialize();
          const u = await dataStore.getCurrentUser();
          if (cancelled) return;
          setUser(u);

          if (u && Array.isArray(u.children) && u.children.length > 0) {
            const kids = (
              await Promise.all(u.children.map((id) => dataStore.getUserById(id)))
            ).filter(Boolean);
            if (cancelled) return;
            setChildren(kids);

            const moods = [];
            const completed = [];
            await Promise.all(
              kids.map(async (k) => {
                const [m, c] = await Promise.all([
                  dataStore.getMoodEntriesByUser(k.id),
                  dataStore.getCompletedWorksheetsByUser(k.id),
                ]);
                (m || []).forEach((entry) =>
                  moods.push({ ...entry, child: k })
                );
                (c || []).forEach((entry) =>
                  completed.push({ ...entry, child: k })
                );
              })
            );
            if (cancelled) return;
            setAllMoods(moods);
            setAllCompleted(completed);
          }
        } catch (e) {
          console.log('[Parent InsightsTab] load error', e);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  // Family-wide weekly mood chart — avg across all children's last 7 entries
  const weeklyChart = useMemo(() => {
    if (allMoods.length === 0) {
      return DAY_LABELS.map((d) => ({ day: d, value: 0 }));
    }
    const recent = [...allMoods]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 7)
      .reverse();
    return DAY_LABELS.map((d, i) => ({
      day: d,
      value: recent[i] ? MOOD_SCORE[recent[i].mood] || 5 : 0,
    }));
  }, [allMoods]);

  const avgScore = useMemo(() => {
    const v = weeklyChart.filter((d) => d.value > 0);
    if (v.length === 0) return 0;
    return (
      Math.round(
        (v.reduce((s, d) => s + d.value, 0) / v.length) * 10
      ) / 10
    );
  }, [weeklyChart]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.iconBtn} onPress={openDrawer}>
            <Feather name="menu" size={20} color={INK} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Text style={styles.eyebrow}>FAMILY OVERVIEW</Text>
            <Text style={styles.headerTitle}>Insights</Text>
          </View>
        </View>

        {/* Family score hero */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>FAMILY WELLBEING SCORE</Text>
          <View style={styles.scoreValueRow}>
            <Text style={styles.scoreValue}>
              {avgScore > 0 ? avgScore : '—'}
            </Text>
            <Text style={styles.scoreOutOf}>/10</Text>
          </View>
          <Text style={styles.scoreCaption}>
            {avgScore >= 7
              ? 'Your family is doing well overall. Keep nurturing.'
              : avgScore >= 5
              ? 'Steady week. Small consistent check-ins help.'
              : avgScore > 0
              ? 'A tougher stretch. Consider extra connection time.'
              : 'Encourage your kids to log a mood for personalized insights.'}
          </Text>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <StatCard
            label="CHECK-INS"
            value={allMoods.length}
            color={SAGE}
            icon="activity"
          />
          <StatCard
            label="WORKSHEETS"
            value={allCompleted.length}
            color={INK}
            icon="check-circle"
          />
          <StatCard
            label="CHILDREN"
            value={children.length}
            color={COLORS.primary}
            icon="users"
          />
        </View>

        {/* Mood chart */}
        <Text style={styles.sectionLabel}>FAMILY MOOD TREND · LAST 7</Text>
        <View style={styles.card}>
          <View style={styles.chartWrap}>
            {weeklyChart.map((d, i) => {
              const heightPct = d.value ? (d.value / 10) * 100 : 6;
              return (
                <View key={i} style={styles.chartCol}>
                  <View style={styles.chartBarSlot}>
                    <View
                      style={[
                        styles.chartBar,
                        {
                          height: `${heightPct}%`,
                          backgroundColor: d.value
                            ? SAGE
                            : COLORS.gray200,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.chartDay}>{d.day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Per-child snapshot */}
        <Text style={styles.sectionLabel}>PER-CHILD SNAPSHOT</Text>
        {children.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              When your children are linked, you'll see their individual
              progress here.
            </Text>
          </View>
        ) : (
          children.map((k) => {
            const childMoods = allMoods.filter((m) => m.child.id === k.id);
            const childCompleted = allCompleted.filter(
              (c) => c.child.id === k.id
            );
            const childMoodScores = childMoods
              .map((m) => MOOD_SCORE[m.mood])
              .filter(Boolean);
            const childAvg =
              childMoodScores.length > 0
                ? Math.round(
                    (childMoodScores.reduce((s, v) => s + v, 0) /
                      childMoodScores.length) *
                      10
                  ) / 10
                : null;
            return (
              <View key={k.id} style={styles.snapshotCard}>
                <View
                  style={[
                    styles.snapshotAvatar,
                    { backgroundColor: k.profileColor || SAGE },
                  ]}
                >
                  <Text style={styles.snapshotAvatarText}>
                    {k.avatar || '👤'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.snapshotName}>{k.name}</Text>
                  <Text style={styles.snapshotMeta}>
                    {childMoods.length} check-ins · {childCompleted.length}{' '}
                    completed
                  </Text>
                </View>
                <View style={styles.snapshotScore}>
                  <Text style={styles.snapshotScoreValue}>
                    {childAvg || '—'}
                  </Text>
                  <Text style={styles.snapshotScoreLabel}>AVG MOOD</Text>
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const StatCard = ({ label, value, color, icon }) => (
  <View style={styles.statCard}>
    <View style={[styles.statBar, { backgroundColor: color }]} />
    <Feather name={icon} size={16} color={color} />
    <Text style={styles.statCardValue}>{value}</Text>
    <Text style={styles.statCardLabel}>{label}</Text>
  </View>
);

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
    marginBottom: SPACING.xl,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: SAGE,
    letterSpacing: 1.4,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.6,
  },

  scoreCard: {
    backgroundColor: INK,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: SPACING.md,
  },
  scoreValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -2,
  },
  scoreOutOf: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    marginLeft: 4,
  },
  scoreCaption: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 19,
  },

  statsGrid: {
    flexDirection: 'row',
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    position: 'relative',
    overflow: 'hidden',
  },
  statBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 3,
  },
  statCardValue: {
    fontSize: 26,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.5,
    marginTop: 4,
  },
  statCardLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1,
    marginTop: 2,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
    marginBottom: SPACING.md,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },

  chartWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
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
    borderRadius: 4,
    minHeight: 6,
  },
  chartDay: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '700',
  },

  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.gray500,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  snapshotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  snapshotAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  snapshotAvatarText: { fontSize: 22 },
  snapshotName: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  snapshotMeta: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  snapshotScore: {
    alignItems: 'flex-end',
  },
  snapshotScoreValue: {
    fontSize: 22,
    fontWeight: '800',
    color: SAGE,
    letterSpacing: -0.5,
  },
  snapshotScoreLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 0.8,
    marginTop: 2,
  },
});
