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
import dataStore from '../../../utils/dataStore';

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

const PARTNER_LOOKUP = {
  partner1: 'partner2',
  partner2: 'partner1',
};

const BREAKDOWN = [
  { id: 'comm', label: 'Communication', score: 82 },
  { id: 'trust', label: 'Trust', score: 88 },
  { id: 'intimacy', label: 'Intimacy', score: 70 },
  { id: 'growth', label: 'Shared Growth', score: 75 },
];

const GROWTH_AREAS = [
  {
    id: 1,
    title: 'Active Listening',
    pct: 65,
    note: 'Up 12% from last month',
    trend: 'up',
  },
  {
    id: 2,
    title: 'Conflict Repair',
    pct: 48,
    note: 'Practice paused this week',
    trend: 'flat',
  },
  {
    id: 3,
    title: 'Gratitude Sharing',
    pct: 82,
    note: 'New 14-day streak',
    trend: 'up',
  },
];

export default function CouplesInsightsTab() {
  const navigation = useNavigation();
  const [userMoods, setUserMoods] = useState([]);
  const [partnerMoods, setPartnerMoods] = useState([]);
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
          setUserMoods(m || []);
          setJournals(j || []);
          setAssignments(a || []);

          const partnerId = PARTNER_LOOKUP[u.id];
          if (partnerId) {
            const pm = await dataStore.getMoodEntriesByUser(partnerId);
            if (!cancelled) setPartnerMoods(pm || []);
          }
        } catch (e) {
          console.log('[Couples InsightsTab] load error', e);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  const userChart = useMemo(() => {
    const recent = [...userMoods]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 7)
      .reverse();
    return DAY_LABELS.map((d, i) => ({
      day: d,
      value: recent[i] ? MOOD_SCORE[recent[i].mood] || 5 : 0,
    }));
  }, [userMoods]);

  const partnerChart = useMemo(() => {
    const recent = [...partnerMoods]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 7)
      .reverse();
    return DAY_LABELS.map((d, i) => ({
      day: d,
      value: recent[i] ? MOOD_SCORE[recent[i].mood] || 5 : 0,
    }));
  }, [partnerMoods]);

  const completedCount = assignments.filter((a) => a.status === 'completed').length;
  const overallScore = Math.round(
    BREAKDOWN.reduce((s, b) => s + b.score, 0) / BREAKDOWN.length
  );

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
          <View style={styles.scoreTrendRow}>
            <View style={styles.scoreTrendBadge}>
              <Text style={styles.scoreTrendArrow}>↑</Text>
              <Text style={styles.scoreTrendText}>5 from last week</Text>
            </View>
          </View>
          <Text style={styles.scoreCaption}>
            {overallScore >= 80
              ? 'Strong and growing. Keep nurturing the small daily moments.'
              : overallScore >= 60
              ? 'Solid foundation. Small consistent habits compound over time.'
              : 'Worth investing in. Start with one practice this week.'}
          </Text>

          <View style={styles.scoreFooter}>
            <View style={styles.scoreFooterCol}>
              <Text style={styles.scoreFooterValue}>{userMoods.length}</Text>
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
          {BREAKDOWN.map((b, i) => (
            <View
              key={b.id}
              style={[
                styles.breakdownRow,
                i < BREAKDOWN.length - 1 && styles.breakdownRowBorder,
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
              <Text style={styles.legendText}>Partner</Text>
            </View>
          </View>

          <View style={styles.chartWrap}>
            {DAY_LABELS.map((d, i) => {
              const youH = userChart[i].value ? (userChart[i].value / 10) * 100 : 4;
              const partnerH = partnerChart[i].value
                ? (partnerChart[i].value / 10) * 100
                : 4;
              return (
                <View key={i} style={styles.chartCol}>
                  <View style={styles.chartBarSlot}>
                    <View style={styles.dualBarRow}>
                      <View
                        style={[
                          styles.dualBar,
                          {
                            height: `${youH}%`,
                            backgroundColor: userChart[i].value
                              ? INK
                              : COLORS.gray100,
                          },
                        ]}
                      />
                      <View
                        style={[
                          styles.dualBar,
                          {
                            height: `${partnerH}%`,
                            backgroundColor: partnerChart[i].value
                              ? BLUSH
                              : COLORS.gray100,
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
          {GROWTH_AREAS.map((g, i) => (
            <View
              key={g.id}
              style={[
                styles.growthRow,
                i < GROWTH_AREAS.length - 1 && styles.growthRowBorder,
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
