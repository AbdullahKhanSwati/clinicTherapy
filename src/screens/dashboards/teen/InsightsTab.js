import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useFocusEffect,
  useNavigation,
  DrawerActions,
} from '@react-navigation/native';
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from '../../../constants/colors';
import {
  listMyMoodEntries,
  listMyJournalEntries,
  listMyAssignments,
  listResponsesFor,
  getCurrentUserId,
  listWorksheets,
} from '../../../services/api';

const MOOD_EMOJIS = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  anxious: '😰',
  calm: '😌',
  excited: '🤩',
  confused: '😕',
  overwhelmed: '😩',
  okay: '🙂',
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

const DAY_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// -- helpers ------------------------------------------------------------------

const toDayKey = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

const dayKeyOfDate = (d) =>
  `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

const moodScoreOf = (mood) => MOOD_SCORE[mood] ?? 5;

const buildLast7Days = (moods) => {
  // Group moods by yyyy-m-d key. Each cell holds the AVERAGE score for
  // moods logged on that calendar day.
  const byDay = new Map();
  (moods || []).forEach((m) => {
    if (!m?.date) return;
    const key = toDayKey(m.date);
    if (!key) return;
    const arr = byDay.get(key) || [];
    arr.push(m);
    byDay.set(key, arr);
  });

  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dayKeyOfDate(d);
    const entries = byDay.get(key) || [];
    const score =
      entries.length === 0
        ? 0
        : entries.reduce((s, m) => s + moodScoreOf(m.mood), 0) / entries.length;
    // Pick the latest mood for that day to set the displayed emoji.
    const latest = entries[0];
    out.push({
      label: DAY_SHORT[d.getDay()],
      date: d,
      isToday: i === 0,
      value: Math.round(score * 10) / 10,
      mood: latest?.mood || null,
      count: entries.length,
    });
  }
  return out;
};

const computeStreak = (moods) => {
  const days = new Set(
    (moods || [])
      .map((m) => (m?.date ? toDayKey(m.date) : null))
      .filter(Boolean)
  );
  let streak = 0;
  const cursor = new Date();
  while (days.has(dayKeyOfDate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

const distinctDaysIn = (rows, withinDays) => {
  const cutoff = Date.now() - withinDays * 86400000;
  const days = new Set();
  (rows || []).forEach((r) => {
    const d = r?.date || r?.createdAt || r?.completedDate;
    if (!d) return;
    const t = new Date(d).getTime();
    if (t < cutoff) return;
    days.add(toDayKey(d));
  });
  return days.size;
};

const daysSince = (iso) => {
  if (!iso) return null;
  const diffMs = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(diffMs / 86400000));
};

// -----------------------------------------------------------------------------

export default function TeenInsightsTab() {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [moods, setMoods] = useState([]);
  const [journals, setJournals] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [responses, setResponses] = useState([]);
  const [worksheets, setWorksheets] = useState({});

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          setLoading(true);
          const uid = await getCurrentUserId();
          const [m, j, a, ws] = await Promise.all([
            listMyMoodEntries(),
            listMyJournalEntries(),
            listMyAssignments(),
            listWorksheets(),
          ]);
          const r = uid ? await listResponsesFor(uid) : [];
          if (cancelled) return;
          setMoods(m || []);
          setJournals(j || []);
          setAssignments(a || []);
          setResponses(r || []);
          const map = {};
          (ws || []).forEach((w) => {
            map[w.id] = w;
          });
          setWorksheets(map);
        } catch (e) {
          console.log('[Teen InsightsTab] load error', e);
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  // ----- Derived metrics ----------------------------------------------------

  const weeklyChart = useMemo(() => buildLast7Days(moods), [moods]);

  // Average over the last 7 calendar days (days with entries only)
  const avgScore = useMemo(() => {
    const days = weeklyChart.filter((d) => d.count > 0);
    if (days.length === 0) return 0;
    const sum = days.reduce((s, d) => s + d.value, 0);
    return Math.round((sum / days.length) * 10) / 10;
  }, [weeklyChart]);

  // Average for the 7 days BEFORE the latest 7, to compute a trend
  const prevAvgScore = useMemo(() => {
    const cutoff = Date.now() - 7 * 86400000;
    const start = Date.now() - 14 * 86400000;
    const window = (moods || []).filter((m) => {
      const t = new Date(m.date).getTime();
      return t < cutoff && t >= start;
    });
    if (window.length === 0) return 0;
    const sum = window.reduce((s, m) => s + moodScoreOf(m.mood), 0);
    return Math.round((sum / window.length) * 10) / 10;
  }, [moods]);

  const trend = useMemo(() => {
    if (avgScore === 0 || prevAvgScore === 0) return 0;
    return Math.round((avgScore - prevAvgScore) * 10) / 10;
  }, [avgScore, prevAvgScore]);

  // Mood distribution
  const topMoods = useMemo(() => {
    const counts = {};
    (moods || []).forEach((m) => {
      if (!m?.mood) return;
      counts[m.mood] = (counts[m.mood] || 0) + 1;
    });
    const total = (moods || []).length || 1;
    return Object.entries(counts)
      .map(([mood, n]) => ({
        mood,
        n,
        pct: Math.round((n / total) * 100),
      }))
      .sort((a, b) => b.n - a.n)
      .slice(0, 5);
  }, [moods]);

  // Engagement
  const streak = useMemo(() => computeStreak(moods), [moods]);
  const activeDays30 = useMemo(
    () =>
      distinctDaysIn(
        [
          ...(moods || []),
          ...(journals || []),
          ...(responses || []).filter((r) => r.completedAt),
        ],
        30
      ),
    [moods, journals, responses]
  );
  const daysSinceLastMood = useMemo(() => {
    const latest = (moods || [])[0]?.date;
    return daysSince(latest);
  }, [moods]);

  // Worksheets — use the proper enum values, not the legacy 'in-progress'
  const wsBreakdown = useMemo(() => {
    const total = assignments.length;
    const completed = assignments.filter((a) => a.status === 'completed').length;
    const inProgress = assignments.filter((a) => a.status === 'in_progress').length;
    const notStarted = assignments.filter(
      (a) => a.status === 'not_started' || !a.status
    ).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, notStarted, pct };
  }, [assignments]);

  // Best / hardest day in the last 7
  const bestDay = useMemo(() => {
    const days = weeklyChart.filter((d) => d.count > 0);
    if (days.length === 0) return null;
    return days.reduce((a, b) => (b.value > a.value ? b : a));
  }, [weeklyChart]);
  const hardestDay = useMemo(() => {
    const days = weeklyChart.filter((d) => d.count > 0);
    if (days.length === 0) return null;
    return days.reduce((a, b) => (b.value < a.value ? b : a));
  }, [weeklyChart]);

  // Recent activity feed (latest 6 across moods, journals, completions)
  const activityFeed = useMemo(() => {
    const items = [];
    (moods || []).forEach((m) =>
      items.push({
        id: `m-${m.id}`,
        kind: 'mood',
        date: m.date || m.createdAt,
        title: `Logged ${m.mood} mood`,
        emoji: MOOD_EMOJIS[m.mood] || '🙂',
      })
    );
    (journals || []).forEach((j) =>
      items.push({
        id: `j-${j.id}`,
        kind: 'journal',
        date: j.date || j.createdAt,
        title: j.title || 'Journal entry',
        emoji: '📔',
      })
    );
    (responses || [])
      .filter((r) => r.completedAt)
      .forEach((r) => {
        const ass = assignments.find((a) => a.id === r.assignmentId);
        const w = ass ? worksheets[ass.worksheetId] : null;
        items.push({
          id: `r-${r.id}`,
          kind: 'worksheet',
          date: r.completedAt,
          title: `Finished ${w?.title || 'a worksheet'}`,
          emoji: '✅',
        });
      });
    return items
      .filter((x) => x.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6);
  }, [moods, journals, responses, assignments, worksheets]);

  const heroCaption = useMemo(() => {
    if (avgScore === 0) return 'Log a mood to start tracking';
    if (trend > 0.5) return 'Trending up — keep going! 🌱';
    if (trend < -0.5) return 'Tougher week. Be gentle with yourself.';
    if (avgScore >= 7) return 'Steady positive week';
    if (avgScore >= 5) return 'A balanced week — small wins matter';
    return "Hard week — you're not alone";
  }, [avgScore, trend]);

  // -- Render ----------------------------------------------------------------

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.menuBtn} onPress={openDrawer}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Insights</Text>
            <Text style={styles.headerSub}>Your wellbeing, at a glance</Text>
          </View>
        </View>

        {loading && (
          <View style={{ paddingVertical: SPACING.lg, alignItems: 'center' }}>
            <ActivityIndicator color={COLORS.primary} />
          </View>
        )}

        {/* Score hero */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreCardLeft}>
            <Text style={styles.scoreLabel}>WEEKLY MOOD SCORE</Text>
            <View style={styles.scoreValueRow}>
              <Text style={styles.scoreValue}>
                {avgScore > 0 ? avgScore : '—'}
              </Text>
              <Text style={styles.scoreOutOf}>/10</Text>
              {trend !== 0 && (
                <View
                  style={[
                    styles.trendPill,
                    {
                      backgroundColor:
                        trend > 0
                          ? 'rgba(34,197,94,0.2)'
                          : 'rgba(239,68,68,0.2)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.trendText,
                      { color: trend > 0 ? '#86EFAC' : '#FCA5A5' },
                    ]}
                  >
                    {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.scoreCaption}>{heroCaption}</Text>
          </View>
          <View style={styles.scoreRing}>
            <View style={styles.scoreRingInner}>
              <Text style={styles.scoreRingEmoji}>
                {avgScore >= 7
                  ? '😊'
                  : avgScore >= 5
                  ? '😌'
                  : avgScore > 0
                  ? '😔'
                  : '🫧'}
              </Text>
            </View>
          </View>
        </View>

        {/* Stat tiles */}
        <View style={styles.statRow}>
          <View style={styles.statTile}>
            <Text style={styles.statEmoji}>📊</Text>
            <Text style={styles.statBig}>{moods.length}</Text>
            <Text style={styles.statSmall}>Check-ins</Text>
          </View>
          <View style={styles.statTile}>
            <Text style={styles.statEmoji}>✅</Text>
            <Text style={styles.statBig}>{wsBreakdown.completed}</Text>
            <Text style={styles.statSmall}>Completed</Text>
          </View>
          <View style={styles.statTile}>
            <Text style={styles.statEmoji}>📔</Text>
            <Text style={styles.statBig}>{journals.length}</Text>
            <Text style={styles.statSmall}>Journals</Text>
          </View>
        </View>

        {/* Engagement strip */}
        <View style={styles.engagementCard}>
          <View style={styles.engagementItem}>
            <Text style={styles.engagementBig}>{streak}</Text>
            <Text style={styles.engagementLabel}>
              day{streak === 1 ? '' : 's'} streak
            </Text>
          </View>
          <View style={styles.engagementDivider} />
          <View style={styles.engagementItem}>
            <Text style={styles.engagementBig}>{activeDays30}</Text>
            <Text style={styles.engagementLabel}>active days · 30d</Text>
          </View>
          <View style={styles.engagementDivider} />
          <View style={styles.engagementItem}>
            <Text style={styles.engagementBig}>
              {daysSinceLastMood == null
                ? '—'
                : daysSinceLastMood === 0
                ? 'Today'
                : `${daysSinceLastMood}d`}
            </Text>
            <Text style={styles.engagementLabel}>last check-in</Text>
          </View>
        </View>

        {/* 7-day calendar mood chart */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Mood Trend</Text>
              <Text style={styles.cardSub}>Last 7 days</Text>
            </View>
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>WEEK</Text>
            </View>
          </View>

          {moods.length === 0 ? (
            <View style={styles.inlineEmpty}>
              <Text style={styles.inlineEmptyEmoji}>📈</Text>
              <Text style={styles.inlineEmptyText}>
                Log your first mood to see the trend.
              </Text>
            </View>
          ) : (
            <>
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
                                ? d.isToday
                                  ? COLORS.primary
                                  : COLORS.primaryLighter
                                : COLORS.gray200,
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.chartDay,
                          d.isToday && { color: COLORS.primary },
                        ]}
                      >
                        {d.label}
                      </Text>
                      {d.mood ? (
                        <Text style={styles.chartMoodEmoji}>
                          {MOOD_EMOJIS[d.mood] || '·'}
                        </Text>
                      ) : (
                        <Text style={styles.chartMoodEmoji}> </Text>
                      )}
                    </View>
                  );
                })}
              </View>

              {(bestDay || hardestDay) && (
                <View style={styles.bestRow}>
                  {bestDay && (
                    <Text style={styles.bestText}>
                      <Text style={styles.bestLabel}>BEST · </Text>
                      {bestDay.label}{' '}
                      {bestDay.mood ? MOOD_EMOJIS[bestDay.mood] : ''} ·{' '}
                      {bestDay.value}/10
                    </Text>
                  )}
                  {hardestDay && bestDay && hardestDay !== bestDay && (
                    <Text style={[styles.bestText, { marginLeft: SPACING.md }]}>
                      <Text style={styles.bestLabel}>HARDEST · </Text>
                      {hardestDay.label}{' '}
                      {hardestDay.mood ? MOOD_EMOJIS[hardestDay.mood] : ''} ·{' '}
                      {hardestDay.value}/10
                    </Text>
                  )}
                </View>
              )}
            </>
          )}
        </View>

        {/* Mood distribution */}
        {topMoods.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Your Top Moods</Text>
                <Text style={styles.cardSub}>
                  Across {moods.length} check-in
                  {moods.length === 1 ? '' : 's'}
                </Text>
              </View>
            </View>
            <View style={styles.moodChips}>
              {topMoods.map((m) => (
                <View key={m.mood} style={styles.moodChip}>
                  <Text style={styles.moodChipEmoji}>
                    {MOOD_EMOJIS[m.mood] || '🙂'}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <View style={styles.moodChipRow}>
                      <Text style={styles.moodChipLabel}>
                        {(m.mood || '').charAt(0).toUpperCase() +
                          (m.mood || '').slice(1)}
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

        {/* Worksheet progress */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Worksheet Progress</Text>
              <Text style={styles.cardSub}>
                {wsBreakdown.total === 0
                  ? 'Nothing assigned yet'
                  : `${wsBreakdown.completed} of ${wsBreakdown.total} done`}
              </Text>
            </View>
            <Text style={styles.cardPct}>{wsBreakdown.pct}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${wsBreakdown.pct}%` },
              ]}
            />
          </View>
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItem}>
              <View
                style={[styles.breakdownDot, { backgroundColor: COLORS.success }]}
              />
              <Text style={styles.breakdownText}>
                {wsBreakdown.completed} done
              </Text>
            </View>
            <View style={styles.breakdownItem}>
              <View
                style={[styles.breakdownDot, { backgroundColor: COLORS.warning }]}
              />
              <Text style={styles.breakdownText}>
                {wsBreakdown.inProgress} in progress
              </Text>
            </View>
            <View style={styles.breakdownItem}>
              <View
                style={[styles.breakdownDot, { backgroundColor: COLORS.gray400 }]}
              />
              <Text style={styles.breakdownText}>
                {wsBreakdown.notStarted} not started
              </Text>
            </View>
          </View>
        </View>

        {/* Recent activity */}
        {activityFeed.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Recent Activity</Text>
                <Text style={styles.cardSub}>The last things you did</Text>
              </View>
            </View>
            {activityFeed.map((item, i) => (
              <View
                key={item.id}
                style={[
                  styles.activityRow,
                  i < activityFeed.length - 1 && styles.activityRowBorder,
                ]}
              >
                <Text style={styles.activityEmoji}>{item.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.activityDate}>
                    {new Date(item.date).toLocaleString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

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
              {wsBreakdown.inProgress + wsBreakdown.notStarted} active worksheet
              {wsBreakdown.inProgress + wsBreakdown.notStarted === 1 ? '' : 's'}
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
  trendPill: {
    marginLeft: SPACING.md,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  trendText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4 },
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
    marginBottom: SPACING.md,
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

  /* Engagement strip */
  engagementCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  engagementItem: { flex: 1, alignItems: 'center' },
  engagementBig: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '800',
    color: COLORS.gray700,
    letterSpacing: -0.3,
  },
  engagementLabel: {
    fontSize: 10,
    color: COLORS.gray500,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginTop: 2,
    textAlign: 'center',
  },
  engagementDivider: { width: 1, backgroundColor: COLORS.gray100, marginVertical: 2 },

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
  cardPct: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },

  inlineEmpty: { alignItems: 'center', paddingVertical: SPACING.lg },
  inlineEmptyEmoji: { fontSize: 28, marginBottom: SPACING.sm },
  inlineEmptyText: {
    fontSize: 12,
    color: COLORS.gray500,
    fontWeight: '500',
    textAlign: 'center',
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

  bestRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  bestText: { fontSize: 11, color: COLORS.gray600, marginTop: 4 },
  bestLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.gray500,
    letterSpacing: 0.8,
  },

  /* Mood distribution */
  moodChips: {},
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

  /* Worksheet breakdown */
  progressTrack: {
    height: 8,
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
  },
  breakdownRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
    marginTop: 4,
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  breakdownText: { fontSize: 12, color: COLORS.gray600, fontWeight: '600' },

  /* Activity feed */
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  activityRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  activityEmoji: { fontSize: 22, marginRight: SPACING.md },
  activityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: 2,
    letterSpacing: -0.1,
  },
  activityDate: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
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
