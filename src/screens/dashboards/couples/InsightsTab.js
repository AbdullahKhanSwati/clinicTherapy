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
} from '../../../constants/colors';
import { useAuth } from '../../../contexts/AuthContext';
import {
  listMyMoodEntries,
  listMyJournalEntries,
  listMyAssignments,
  listMoodEntries,
  getActivePairingForUser,
  getPartnerProfileForUser,
  listPartnerCheckinsForUser,
  listRepairRequestsForUser,
  listAppreciationsForUser,
  listSharedGoals,
} from '../../../services/api';

const BLUSH = '#D4536B';
const INK = '#1A2332';
const SAGE = '#7A8B7E';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

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

// Build a Mon..Sun mood-score series from a flat mood-entries list. Each cell
// holds the average score for that calendar day, or 0 if nothing was logged.
const buildWeek = (moods) => {
  const byDay = new Map();
  (moods || []).forEach((m) => {
    if (!m?.date) return;
    const d = new Date(m.date);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const arr = byDay.get(key) || [];
    arr.push(m);
    byDay.set(key, arr);
  });
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const entries = byDay.get(key) || [];
    const score =
      entries.length === 0
        ? 0
        : entries.reduce((s, m) => s + (MOOD_SCORE[m.mood] ?? 5), 0) /
          entries.length;
    out.push({ day: DAY_LABELS[(d.getDay() + 6) % 7], value: Math.round(score * 10) / 10 });
  }
  return out;
};

export default function CouplesInsightsTab() {
  const navigation = useNavigation();
  const { profile: user } = useAuth();
  const [partner, setPartner] = useState(null);
  const [userMoods, setUserMoods] = useState([]);
  const [partnerMoods, setPartnerMoods] = useState([]);
  const [userCheckins, setUserCheckins] = useState([]);
  const [partnerCheckins, setPartnerCheckins] = useState([]);
  const [journals, setJournals] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [appreciations, setAppreciations] = useState([]);
  const [goals, setGoals] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        if (!user?.id) return;
        try {
          const pair = await getActivePairingForUser(user.id);
          let partnerProfile = null;
          if (pair) {
            partnerProfile = await getPartnerProfileForUser(user.id);
          }
          if (cancelled) return;
          setPartner(partnerProfile);

          const [m, j, a, myCheckins, repairList, apprs] = await Promise.all([
            listMyMoodEntries(),
            listMyJournalEntries(),
            listMyAssignments(),
            listPartnerCheckinsForUser(user.id),
            listRepairRequestsForUser(user.id),
            listAppreciationsForUser(user.id),
          ]);
          if (cancelled) return;
          setUserMoods(m || []);
          setJournals(j || []);
          setAssignments(a || []);
          setUserCheckins(myCheckins || []);
          setRepairs(repairList || []);
          setAppreciations(apprs || []);

          if (partnerProfile) {
            const [pm, pc] = await Promise.all([
              listMoodEntries(partnerProfile.id),
              listPartnerCheckinsForUser(partnerProfile.id),
            ]);
            if (cancelled) return;
            setPartnerMoods(pm || []);
            setPartnerCheckins(pc || []);
          } else {
            setPartnerMoods([]);
            setPartnerCheckins([]);
          }

          if (pair?.id) {
            const g = await listSharedGoals(pair.id);
            if (!cancelled) setGoals(g || []);
          } else {
            setGoals([]);
          }
        } catch (e) {
          console.log('[Couples InsightsTab] load error', e);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [user?.id])
  );

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  const userChart = useMemo(() => buildWeek(userMoods), [userMoods]);
  const partnerChart = useMemo(() => buildWeek(partnerMoods), [partnerMoods]);

  // Real "Four Pillars" derived from partner check-ins (mood/connection/stress)
  // + journal and appreciation flow.
  const pillars = useMemo(() => {
    const all = [...(userCheckins || []), ...(partnerCheckins || [])];
    const last14 = all.filter(
      (c) =>
        Date.now() - new Date(c.date || c.createdAt).getTime() < 14 * 86400000
    );
    const avgOf = (key) => {
      const vals = last14.map((c) => c[key]).filter((v) => typeof v === 'number');
      if (vals.length === 0) return 0;
      return Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10);
    };

    // Communication ≈ connection
    const communication = avgOf('connection');
    // Trust ≈ inverted stress (lower stress → more trust)
    const stressAvg = avgOf('stress');
    const trust = stressAvg ? Math.max(0, 100 - stressAvg) : 0;
    // Intimacy ≈ appreciation exchange volume in last 30 days (scaled)
    const recentApps = (appreciations || []).filter(
      (a) => Date.now() - new Date(a.createdAt).getTime() < 30 * 86400000
    ).length;
    const intimacy = Math.min(100, recentApps * 8);
    // Shared growth ≈ goal progress (average across active goals) + journal cadence
    const goalAvg =
      goals.length === 0
        ? 0
        : Math.round(
            goals.reduce((s, g) => s + (g.progress || 0), 0) / goals.length
          );
    const journalBoost = Math.min(20, (journals.length || 0) * 2);
    const growth = Math.min(100, goalAvg + journalBoost);

    return [
      { id: 'comm', label: 'Communication', score: communication },
      { id: 'trust', label: 'Trust', score: trust },
      { id: 'intimacy', label: 'Intimacy', score: intimacy },
      { id: 'growth', label: 'Shared Growth', score: growth },
    ];
  }, [userCheckins, partnerCheckins, appreciations, journals, goals]);

  const completedCount = assignments.filter((a) => a.status === 'completed').length;
  const overallScore = pillars.length
    ? Math.round(pillars.reduce((s, p) => s + p.score, 0) / pillars.length)
    : 0;

  // Trend: compare current vs previous 7-day average of mood+connection
  const trend = useMemo(() => {
    const allCheckins = [...userCheckins, ...partnerCheckins];
    const last7 = allCheckins.filter(
      (c) => Date.now() - new Date(c.date || c.createdAt).getTime() < 7 * 86400000
    );
    const prev7 = allCheckins.filter((c) => {
      const t = Date.now() - new Date(c.date || c.createdAt).getTime();
      return t >= 7 * 86400000 && t < 14 * 86400000;
    });
    const avg = (arr) => {
      const nums = arr.flatMap((c) =>
        [c.mood, c.connection].filter((v) => typeof v === 'number')
      );
      if (nums.length === 0) return 0;
      return nums.reduce((s, v) => s + v, 0) / nums.length;
    };
    const now = avg(last7);
    const before = avg(prev7);
    if (now === 0 || before === 0) return 0;
    return Math.round((now - before) * 10) / 10;
  }, [userCheckins, partnerCheckins]);

  // Growth Areas derived from real data
  const growthAreas = useMemo(() => {
    const openRepairs = repairs.filter((r) => r.status === 'sent').length;
    const resolvedRepairs = repairs.filter(
      (r) => r.status === 'acknowledged' || r.status === 'resolved'
    ).length;
    const repairTotal = openRepairs + resolvedRepairs;
    const repairPct =
      repairTotal === 0 ? 0 : Math.round((resolvedRepairs / repairTotal) * 100);

    const recentApps = appreciations.filter(
      (a) => Date.now() - new Date(a.createdAt).getTime() < 14 * 86400000
    ).length;
    const appPct = Math.min(100, recentApps * 12);

    const goalPct = goals.length
      ? Math.round(
          goals.reduce((s, g) => s + (g.progress || 0), 0) / goals.length
        )
      : 0;

    return [
      {
        id: 1,
        title: 'Conflict Repair',
        pct: repairPct,
        note:
          repairTotal === 0
            ? 'No repair requests sent yet'
            : `${resolvedRepairs} of ${repairTotal} resolved`,
        trend: repairPct >= 60 ? 'up' : repairPct > 0 ? 'flat' : 'flat',
      },
      {
        id: 2,
        title: 'Appreciation Flow',
        pct: appPct,
        note:
          recentApps === 0
            ? 'Send one to get started'
            : `${recentApps} in the last 14 days`,
        trend: recentApps >= 5 ? 'up' : recentApps > 0 ? 'flat' : 'flat',
      },
      {
        id: 3,
        title: 'Shared Goals',
        pct: goalPct,
        note:
          goals.length === 0
            ? 'No goals set yet'
            : `Across ${goals.length} goal${goals.length === 1 ? '' : 's'}`,
        trend: goalPct >= 50 ? 'up' : goalPct > 0 ? 'flat' : 'flat',
      },
    ];
  }, [repairs, appreciations, goals]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.iconBtn} onPress={openDrawer}>
            <Text style={styles.iconBtnText}>☰</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Text style={styles.eyebrow}>WELLNESS REPORT</Text>
            <Text style={styles.headerTitle}>Insights</Text>
          </View>
        </View>

        {/* Relationship Score hero — refined dark navy */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>RELATIONSHIP HEALTH INDEX</Text>
          <View style={styles.scoreValueRow}>
            <Text style={styles.scoreValue}>{overallScore}</Text>
            <Text style={styles.scoreOutOf}>/100</Text>
          </View>
          {trend !== 0 && (
            <View style={styles.scoreTrendRow}>
              <View
                style={[
                  styles.scoreTrendBadge,
                  trend < 0 && { backgroundColor: 'rgba(212,83,107,0.25)' },
                ]}
              >
                <Text
                  style={[
                    styles.scoreTrendArrow,
                    trend < 0 && { color: '#FBB7BF' },
                  ]}
                >
                  {trend > 0 ? '↑' : '↓'}
                </Text>
                <Text
                  style={[
                    styles.scoreTrendText,
                    trend < 0 && { color: '#FBB7BF' },
                  ]}
                >
                  {Math.abs(trend)} from last week
                </Text>
              </View>
            </View>
          )}
          <Text style={styles.scoreCaption}>
            {overallScore >= 80
              ? 'Strong and growing. Keep nurturing the small daily moments.'
              : overallScore >= 60
              ? 'Solid foundation. Small consistent habits compound over time.'
              : overallScore > 0
              ? 'Worth investing in. Start with one practice this week.'
              : 'Log a few check-ins to start tracking your bond.'}
          </Text>

          <View style={styles.scoreFooter}>
            <View style={styles.scoreFooterCol}>
              <Text style={styles.scoreFooterValue}>{userCheckins.length}</Text>
              <Text style={styles.scoreFooterLabel}>CHECK-INS</Text>
            </View>
            <View style={styles.scoreFooterDivider} />
            <View style={styles.scoreFooterCol}>
              <Text style={styles.scoreFooterValue}>{completedCount}</Text>
              <Text style={styles.scoreFooterLabel}>COMPLETED</Text>
            </View>
            <View style={styles.scoreFooterDivider} />
            <View style={styles.scoreFooterCol}>
              <Text style={styles.scoreFooterValue}>{journals.length}</Text>
              <Text style={styles.scoreFooterLabel}>ENTRIES</Text>
            </View>
          </View>
        </View>

        {/* Breakdown */}
        <Text style={styles.sectionLabel}>FOUR PILLARS</Text>
        <View style={styles.card}>
          {pillars.map((b, i) => (
            <View
              key={b.id}
              style={[
                styles.breakdownRow,
                i < pillars.length - 1 && styles.breakdownRowBorder,
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.breakdownLabel}>{b.label}</Text>
                <View style={styles.breakdownBarTrack}>
                  <View
                    style={[styles.breakdownBarFill, { width: `${b.score}%` }]}
                  />
                </View>
              </View>
              <Text style={styles.breakdownPct}>{b.score}</Text>
            </View>
          ))}
        </View>

        {/* Paired Mood Trend */}
        <View style={styles.cardHeaderInline}>
          <Text style={styles.sectionLabel}>MOOD TREND</Text>
          <Text style={styles.cardHeaderMeta}>LAST 7 DAYS</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: INK }]} />
              <Text style={styles.legendText}>You</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: BLUSH }]} />
              <Text style={styles.legendText}>
                {partner ? partner.name?.split(' ')[0] || 'Partner' : 'Partner'}
              </Text>
            </View>
          </View>

          <View style={styles.chartWrap}>
            {DAY_LABELS.map((d, i) => {
              const youVal = userChart[i]?.value || 0;
              const partnerVal = partnerChart[i]?.value || 0;
              const youH = youVal ? (youVal / 10) * 100 : 4;
              const partnerH = partnerVal ? (partnerVal / 10) * 100 : 4;
              return (
                <View key={i} style={styles.chartCol}>
                  <View style={styles.chartBarSlot}>
                    <View style={styles.dualBarRow}>
                      <View
                        style={[
                          styles.dualBar,
                          {
                            height: `${youH}%`,
                            backgroundColor: youVal ? INK : COLORS.gray100,
                          },
                        ]}
                      />
                      <View
                        style={[
                          styles.dualBar,
                          {
                            height: `${partnerH}%`,
                            backgroundColor: partnerVal ? BLUSH : COLORS.gray100,
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <Text style={styles.chartDay}>{d}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Growth Areas */}
        <Text style={styles.sectionLabel}>GROWTH AREAS</Text>
        <View style={styles.card}>
          {growthAreas.map((g, i) => (
            <View
              key={g.id}
              style={[
                styles.growthRow,
                i < growthAreas.length - 1 && styles.growthRowBorder,
              ]}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.growthTitleRow}>
                  <Text style={styles.growthTitle}>{g.title}</Text>
                  <View
                    style={[
                      styles.growthTrendBadge,
                      g.trend === 'up' && { backgroundColor: SAGE + '20' },
                      g.trend === 'flat' && { backgroundColor: COLORS.gray100 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.growthTrendText,
                        g.trend === 'up' && { color: SAGE },
                        g.trend === 'flat' && { color: COLORS.gray500 },
                      ]}
                    >
                      {g.trend === 'up' ? '↑' : g.trend === 'flat' ? '→' : '↓'} {g.pct}%
                    </Text>
                  </View>
                </View>
                <View style={styles.growthBarTrack}>
                  <View
                    style={[
                      styles.growthBarFill,
                      {
                        width: `${g.pct}%`,
                        backgroundColor: g.trend === 'up' ? SAGE : COLORS.gray300,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.growthNote}>{g.note}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Goal card */}
        <TouchableOpacity
          style={styles.goalCard}
          onPress={() => navigation.navigate('Progress')}
          activeOpacity={0.9}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.goalEyebrow}>FULL REPORT</Text>
            <Text style={styles.goalTitle}>View your complete progress timeline</Text>
            <Text style={styles.goalSub}>Detailed history and milestones</Text>
          </View>
          <View style={styles.goalArrow}>
            <Text style={styles.goalArrowText}>→</Text>
          </View>
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
  iconBtnText: { fontSize: 18, color: INK, fontWeight: '600' },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: BLUSH,
    letterSpacing: 1.4,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.6,
  },

  /* Score hero */
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
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -2.5,
    lineHeight: 70,
  },
  scoreOutOf: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
    marginLeft: 6,
  },
  scoreTrendRow: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  scoreTrendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(122, 139, 126, 0.25)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  scoreTrendArrow: {
    fontSize: 12,
    color: '#A8C4AB',
    fontWeight: '800',
    marginRight: 4,
  },
  scoreTrendText: {
    fontSize: 11,
    color: '#A8C4AB',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  scoreCaption: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  scoreFooter: {
    flexDirection: 'row',
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  scoreFooterCol: { flex: 1 },
  scoreFooterValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  scoreFooterLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
    marginTop: 2,
  },
  scoreFooterDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 4,
  },

  /* Section labels */
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
    marginBottom: SPACING.md,
  },
  cardHeaderInline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: SPACING.md,
  },
  cardHeaderMeta: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray400,
    letterSpacing: 1.2,
  },

  /* Cards */
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },

  /* Breakdown */
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  breakdownRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  breakdownLabel: {
    fontSize: 13,
    color: INK,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: -0.1,
  },
  breakdownBarTrack: {
    height: 4,
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: '100%',
    backgroundColor: INK,
    borderRadius: BORDER_RADIUS.full,
  },
  breakdownPct: {
    minWidth: 36,
    textAlign: 'right',
    fontSize: 18,
    color: INK,
    fontWeight: '800',
    marginLeft: SPACING.md,
    letterSpacing: -0.5,
  },

  /* Chart */
  chartLegend: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  legendDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  legendText: { fontSize: 11, color: COLORS.gray600, fontWeight: '600' },
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
    width: '80%',
    justifyContent: 'flex-end',
    marginBottom: SPACING.sm,
  },
  dualBarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: '100%',
  },
  dualBar: {
    width: 7,
    borderRadius: 3.5,
    minHeight: 4,
    marginHorizontal: 1.5,
  },
  chartDay: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  /* Growth */
  growthRow: {
    paddingVertical: SPACING.md,
  },
  growthRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  growthTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  growthTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: INK,
    letterSpacing: -0.1,
  },
  growthTrendBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
  },
  growthTrendText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  growthBarTrack: {
    height: 4,
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginBottom: 6,
  },
  growthBarFill: { height: '100%', borderRadius: BORDER_RADIUS.full },
  growthNote: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
  },

  /* Goal card */
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  goalEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: BLUSH,
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  goalTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: INK,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  goalSub: { fontSize: 12, color: COLORS.gray500, fontWeight: '500' },
  goalArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  goalArrowText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
});
