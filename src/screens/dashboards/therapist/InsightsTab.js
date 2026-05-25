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
const ACCENT = COLORS.primary;
const SUCCESS = '#15803D';
const WARNING = '#D97706';
const DANGER = '#DC2626';

const ROLE_COLORS = {
  child: '#9333EA',
  teen: '#0891B2',
  couples: '#D4536B',
  family: '#15803D',
};

const ROLE_LABELS = {
  child: 'Children',
  teen: 'Teens',
  couples: 'Couples',
  family: 'Family',
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

export default function TherapistInsightsTab() {
  const navigation = useNavigation();
  const [clients, setClients] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [moods, setMoods] = useState([]);
  const [completed, setCompleted] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          await dataStore.initialize();
          const [users, a, m, c] = await Promise.all([
            dataStore.getUsers(),
            dataStore.getWorksheetAssignments(),
            dataStore.getMoodEntries(),
            dataStore.getWorksheetsCompleted(),
          ]);
          if (cancelled) return;
          setClients(
            Object.values(users || {}).filter((u) => u.role !== 'therapist')
          );
          setAssignments(a || []);
          setMoods(m || []);
          setCompleted(c || []);
        } catch (e) {
          console.log('[Therapist InsightsTab] load error', e);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  // ===== Caseload distribution =====
  const distribution = useMemo(() => {
    const map = {};
    clients.forEach((c) => {
      map[c.role] = (map[c.role] || 0) + 1;
    });
    const total = clients.length || 1;
    return Object.entries(map)
      .map(([role, count]) => ({
        role,
        count,
        pct: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [clients]);

  // ===== Engagement scoring per client =====
  const engagement = useMemo(() => {
    return clients
      .map((c) => {
        const clientAssignments = assignments.filter((a) => a.clientId === c.id);
        const completedCount = clientAssignments.filter(
          (a) => a.status === 'completed'
        ).length;
        const completionRate =
          clientAssignments.length > 0
            ? Math.round((completedCount / clientAssignments.length) * 100)
            : 0;
        const moodCount = moods.filter((m) => m.userId === c.id).length;
        const engagementScore = Math.round(
          (completionRate * 0.6) + Math.min(moodCount * 5, 40)
        );
        return { ...c, completionRate, moodCount, engagementScore };
      })
      .sort((a, b) => b.engagementScore - a.engagementScore);
  }, [clients, assignments, moods]);

  const topEngaged = engagement.slice(0, 3);
  const atRisk = engagement.filter((c) => c.engagementScore < 30).slice(0, 3);

  // ===== Practice-wide avg mood per role =====
  const moodByRole = useMemo(() => {
    const buckets = {};
    moods.forEach((m) => {
      const client = clients.find((c) => c.id === m.userId);
      if (!client) return;
      if (!buckets[client.role]) buckets[client.role] = [];
      buckets[client.role].push(MOOD_SCORE[m.mood] || 5);
    });
    return Object.entries(buckets).map(([role, scores]) => ({
      role,
      avg: scores.length
        ? Math.round((scores.reduce((s, v) => s + v, 0) / scores.length) * 10) /
          10
        : 0,
      count: scores.length,
    }));
  }, [moods, clients]);

  // ===== Worksheet completion velocity (last 7 days) =====
  const weekActivity = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });
    return days.map((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const count = completed.filter((c) => {
        const cd = new Date(c.completedDate);
        return cd >= d && cd < next;
      }).length;
      return {
        day: d.toLocaleDateString('en-US', { weekday: 'short' })[0],
        count,
      };
    });
  }, [completed]);

  const maxDay = Math.max(...weekActivity.map((d) => d.count), 1);

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
            <Text style={styles.eyebrow}>PRACTICE ANALYTICS</Text>
            <Text style={styles.headerTitle}>Insights</Text>
          </View>
        </View>

        {/* Snapshot card */}
        <View style={styles.snapshotCard}>
          <Text style={styles.snapshotLabel}>PRACTICE SNAPSHOT</Text>
          <View style={styles.snapshotRow}>
            <View style={styles.snapshotItem}>
              <Text style={styles.snapshotValue}>{clients.length}</Text>
              <Text style={styles.snapshotItemLabel}>CLIENTS</Text>
            </View>
            <View style={styles.snapshotDivider} />
            <View style={styles.snapshotItem}>
              <Text style={styles.snapshotValue}>{completed.length}</Text>
              <Text style={styles.snapshotItemLabel}>WORKSHEETS</Text>
            </View>
            <View style={styles.snapshotDivider} />
            <View style={styles.snapshotItem}>
              <Text style={styles.snapshotValue}>{moods.length}</Text>
              <Text style={styles.snapshotItemLabel}>CHECK-INS</Text>
            </View>
          </View>
        </View>

        {/* Weekly activity chart */}
        <Text style={styles.sectionLabel}>COMPLETION VELOCITY · LAST 7 DAYS</Text>
        <View style={styles.card}>
          <View style={styles.chartWrap}>
            {weekActivity.map((d, i) => {
              const heightPct = (d.count / maxDay) * 100 || 4;
              return (
                <View key={i} style={styles.chartCol}>
                  <View style={styles.chartBarSlot}>
                    <View
                      style={[
                        styles.chartBar,
                        {
                          height: `${heightPct}%`,
                          backgroundColor:
                            d.count > 0 ? INK : COLORS.gray100,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.chartDay}>{d.day}</Text>
                  <Text style={styles.chartCount}>{d.count}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Caseload distribution */}
        <Text style={styles.sectionLabel}>CASELOAD COMPOSITION</Text>
        <View style={styles.card}>
          {distribution.length === 0 ? (
            <Text style={styles.emptyText}>No clients yet</Text>
          ) : (
            distribution.map((d, i) => (
              <View
                key={d.role}
                style={[
                  styles.distRow,
                  i < distribution.length - 1 && styles.distRowBorder,
                ]}
              >
                <View
                  style={[
                    styles.distDot,
                    { backgroundColor: ROLE_COLORS[d.role] || COLORS.gray500 },
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <View style={styles.distTitleRow}>
                    <Text style={styles.distLabel}>
                      {ROLE_LABELS[d.role] || d.role}
                    </Text>
                    <Text style={styles.distCount}>
                      {d.count} · {d.pct}%
                    </Text>
                  </View>
                  <View style={styles.distBarTrack}>
                    <View
                      style={[
                        styles.distBarFill,
                        {
                          width: `${d.pct}%`,
                          backgroundColor: ROLE_COLORS[d.role] || COLORS.gray500,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Average mood by role */}
        {moodByRole.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>AVERAGE MOOD BY ROLE</Text>
            <View style={styles.card}>
              {moodByRole.map((m, i) => (
                <View
                  key={m.role}
                  style={[
                    styles.moodRoleRow,
                    i < moodByRole.length - 1 && styles.distRowBorder,
                  ]}
                >
                  <View
                    style={[
                      styles.distDot,
                      { backgroundColor: ROLE_COLORS[m.role] || COLORS.gray500 },
                    ]}
                  />
                  <Text style={styles.moodRoleLabel}>
                    {ROLE_LABELS[m.role] || m.role}
                  </Text>
                  <View style={styles.moodRoleScore}>
                    <Text style={styles.moodRoleScoreValue}>{m.avg}</Text>
                    <Text style={styles.moodRoleScoreSuffix}>/10</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Top engaged */}
        {topEngaged.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>TOP ENGAGED</Text>
            <View style={styles.card}>
              {topEngaged.map((c, i) => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.engagedRow,
                    i < topEngaged.length - 1 && styles.distRowBorder,
                  ]}
                  onPress={() =>
                    navigation.navigate('ClientDetails', { clientId: c.id })
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.engagedRank}>0{i + 1}</Text>
                  <View
                    style={[
                      styles.engagedAvatar,
                      { backgroundColor: c.profileColor || ACCENT },
                    ]}
                  >
                    <Text style={styles.engagedAvatarText}>
                      {c.avatar || '👤'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.engagedName} numberOfLines={1}>
                      {c.name}
                    </Text>
                    <Text style={styles.engagedMeta}>
                      {c.completionRate}% completion · {c.moodCount} check-ins
                    </Text>
                  </View>
                  <View style={styles.engagedScore}>
                    <Text style={[styles.engagedScoreText, { color: SUCCESS }]}>
                      {c.engagementScore}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* At risk */}
        {atRisk.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>AT RISK · LOW ENGAGEMENT</Text>
            <View style={styles.card}>
              {atRisk.map((c, i) => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.engagedRow,
                    i < atRisk.length - 1 && styles.distRowBorder,
                  ]}
                  onPress={() =>
                    navigation.navigate('ClientDetails', { clientId: c.id })
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.atRiskIcon}>
                    <Feather name="alert-triangle" size={14} color={DANGER} />
                  </View>
                  <View
                    style={[
                      styles.engagedAvatar,
                      { backgroundColor: c.profileColor || ACCENT },
                    ]}
                  >
                    <Text style={styles.engagedAvatarText}>
                      {c.avatar || '👤'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.engagedName} numberOfLines={1}>
                      {c.name}
                    </Text>
                    <Text style={styles.engagedMeta}>
                      {c.completionRate}% completion · needs follow-up
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={COLORS.gray400} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

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
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: ACCENT,
    letterSpacing: 1.4,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.6,
  },

  /* Snapshot */
  snapshotCard: {
    backgroundColor: INK,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  snapshotLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: SPACING.md,
  },
  snapshotRow: {
    flexDirection: 'row',
  },
  snapshotItem: { flex: 1 },
  snapshotValue: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -1.2,
  },
  snapshotItemLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
    marginTop: 4,
  },
  snapshotDivider: {
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

  /* Card */
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },

  /* Chart */
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
    width: '70%',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  chartBar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  chartDay: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '700',
  },
  chartCount: {
    fontSize: 12,
    fontWeight: '800',
    color: INK,
    marginTop: 2,
  },

  /* Distribution */
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  distRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  distDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.md,
  },
  distTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  distLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: INK,
  },
  distCount: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray500,
  },
  distBarTrack: {
    height: 4,
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  distBarFill: { height: '100%', borderRadius: BORDER_RADIUS.full },

  /* Mood role row */
  moodRoleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  moodRoleLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: INK,
  },
  moodRoleScore: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  moodRoleScoreValue: {
    fontSize: 18,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.4,
  },
  moodRoleScoreSuffix: {
    fontSize: 11,
    color: COLORS.gray400,
    fontWeight: '600',
    marginLeft: 2,
  },

  /* Engaged */
  engagedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  engagedRank: {
    fontSize: 14,
    fontWeight: '300',
    color: COLORS.gray400,
    fontStyle: 'italic',
    width: 28,
  },
  engagedAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  engagedAvatarText: { fontSize: 18 },
  engagedName: {
    fontSize: 13,
    fontWeight: '700',
    color: INK,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  engagedMeta: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  engagedScore: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  engagedScoreText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  atRiskIcon: {
    width: 28,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 13,
    color: COLORS.gray500,
    textAlign: 'center',
    fontWeight: '500',
    paddingVertical: SPACING.md,
  },
});
