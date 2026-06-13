import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
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
  listMyAssignments,
  listWorksheets,
  listDateIdeas,
  listSharedGoals,
  getActivePairingForUser,
} from '../../../services/api';

const BLUSH = '#D4536B';
const INK = '#1A2332';
const CREAM = '#FAF7F2';

const STATUS_LABEL = {
  not_started: 'NOT STARTED',
  in_progress: 'IN PROGRESS',
  completed: 'COMPLETED',
};

const EXERCISES = [
  {
    id: 'comm',
    title: 'Active Listening',
    sub: 'Daily 10-minute practice',
    duration: '10 min',
    category: 'Communication',
    screen: 'CopingToolbox',
  },
  {
    id: 'conflict',
    title: 'Conflict Reset',
    sub: 'Pause and repair',
    duration: '15 min',
    category: 'Repair',
    screen: 'CopingToolbox',
  },
  {
    id: 'gratitude',
    title: 'Gratitude Share',
    sub: 'Three things daily',
    duration: '5 min',
    category: 'Connection',
    screen: 'Affirmations',
  },
  {
    id: 'visualize',
    title: 'Future Vision',
    sub: 'Build shared dreams',
    duration: '20 min',
    category: 'Growth',
    screen: 'Visualization',
  },
];

export default function CouplesTogetherTab() {
  const navigation = useNavigation();
  const { profile: user } = useAuth();
  const [activeSegment, setActiveSegment] = useState('worksheets');
  const [assignments, setAssignments] = useState([]);
  const [worksheetsById, setWorksheetsById] = useState({});
  const [dateIdeas, setDateIdeas] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        if (!user?.id) return;
        try {
          setLoading(true);
          const [assigns, allWS, ideas, pair] = await Promise.all([
            listMyAssignments(),
            listWorksheets(),
            listDateIdeas(),
            getActivePairingForUser(user.id),
          ]);
          if (cancelled) return;
          setAssignments(assigns || []);
          const map = {};
          (allWS || []).forEach((w) => { map[w.id] = w; });
          setWorksheetsById(map);
          setDateIdeas(ideas || []);

          if (pair?.id) {
            const g = await listSharedGoals(pair.id);
            if (!cancelled) setGoals(g || []);
          } else {
            setGoals([]);
          }
        } catch (e) {
          console.log('[Couples TogetherTab] load error', e);
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [user?.id])
  );

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  const openWorksheet = (a) => {
    const parent = navigation.getParent?.() || navigation;
    parent.navigate('Worksheet', {
      worksheetId: a.worksheetId,
      assignmentId: a.id,
    });
  };

  const segments = [
    { id: 'worksheets', label: 'Worksheets', count: assignments.length },
    { id: 'exercises',  label: 'Practices',  count: EXERCISES.length },
    { id: 'goals',      label: 'Goals',      count: goals.length },
    { id: 'dates',      label: 'Date Ideas', count: dateIdeas.length },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.iconBtn} onPress={openDrawer}>
          <Text style={styles.iconBtnText}>☰</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: SPACING.md }}>
          <Text style={styles.eyebrow}>WORKSPACE</Text>
          <Text style={styles.headerTitle}>Together</Text>
        </View>
      </View>

      <View style={styles.segmentBar}>
        {segments.map((s) => {
          const active = activeSegment === s.id;
          return (
            <TouchableOpacity
              key={s.id}
              style={[styles.segmentBtn, active && styles.segmentBtnActive]}
              onPress={() => setActiveSegment(s.id)}
              activeOpacity={0.85}
            >
              <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>
                {s.label}
              </Text>
              <Text style={[styles.segmentCount, active && styles.segmentCountActive]}>
                {s.count}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeSegment === 'worksheets' && (
          <>
            {loading ? (
              <ActivityIndicator
                style={{ marginTop: SPACING.xl }}
                size="large"
                color={BLUSH}
              />
            ) : assignments.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No worksheets assigned</Text>
                <Text style={styles.emptyText}>
                  Your therapist will assign couples worksheets for you to complete together.
                </Text>
              </View>
            ) : (
              assignments.map((a) => {
                const w = worksheetsById[a.worksheetId];
                if (!w) return null;
                const progress = a.progress ?? 0;
                const isDone = a.status === 'completed';
                const isProg = a.status === 'in_progress';
                const statusLabel = STATUS_LABEL[a.status] || 'NOT STARTED';
                const statusColor = isDone
                  ? COLORS.success
                  : isProg
                  ? COLORS.warning
                  : COLORS.gray400;
                return (
                  <TouchableOpacity
                    key={a.id}
                    style={styles.wsCard}
                    onPress={() => openWorksheet(a)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.wsTopRow}>
                      <Text style={styles.wsCategory}>
                        {(w.category || 'WORKSHEET').toUpperCase()}
                      </Text>
                      <View style={styles.wsStatusRow}>
                        <View
                          style={[styles.wsStatusDot, { backgroundColor: statusColor }]}
                        />
                        <Text style={[styles.wsStatusText, { color: statusColor }]}>
                          {statusLabel}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.wsTitle} numberOfLines={1}>
                      {w.title}
                    </Text>
                    {w.description ? (
                      <Text style={styles.wsDesc} numberOfLines={2}>
                        {w.description}
                      </Text>
                    ) : null}
                    <View style={styles.wsDivider} />
                    <View style={styles.wsFooter}>
                      <View style={styles.wsMetaRow}>
                        <Text style={styles.wsMetaLabel}>{w.estimatedTime}</Text>
                        <Text style={styles.wsMetaDot}>·</Text>
                        <Text style={styles.wsMetaLabel}>{progress}%</Text>
                      </View>
                      <Text style={styles.wsCta}>
                        {isDone ? 'Review' : isProg ? 'Continue' : 'Begin'} →
                      </Text>
                    </View>
                    <View style={styles.wsProgressTrack}>
                      <View
                        style={[
                          styles.wsProgressFill,
                          { width: `${progress}%`, backgroundColor: statusColor },
                        ]}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}

        {activeSegment === 'exercises' && (
          <>
            <View style={styles.exerciseIntro}>
              <Text style={styles.exerciseIntroEyebrow}>DAILY PRACTICES</Text>
              <Text style={styles.exerciseIntroTitle}>
                Small rituals that strengthen your bond
              </Text>
              <Text style={styles.exerciseIntroBody}>
                Choose one practice to commit to this week. Consistency beats intensity.
              </Text>
            </View>

            {EXERCISES.map((ex, idx) => (
              <TouchableOpacity
                key={ex.id}
                style={styles.exerciseRow}
                onPress={() => navigation.navigate(ex.screen)}
                activeOpacity={0.85}
              >
                <Text style={styles.exerciseNumber}>0{idx + 1}</Text>
                <View style={{ flex: 1 }}>
                  <View style={styles.exerciseTitleRow}>
                    <Text style={styles.exerciseCategory}>{ex.category.toUpperCase()}</Text>
                    <Text style={styles.exerciseDuration}>{ex.duration}</Text>
                  </View>
                  <Text style={styles.exerciseTitle}>{ex.title}</Text>
                  <Text style={styles.exerciseSub}>{ex.sub}</Text>
                </View>
                <Text style={styles.exerciseChev}>→</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => navigation.navigate('TherapyPrograms')}
              activeOpacity={0.85}
            >
              <Text style={styles.viewAllText}>View All Programs</Text>
              <Text style={styles.viewAllArrow}>→</Text>
            </TouchableOpacity>
          </>
        )}

        {activeSegment === 'goals' && (
          <>
            <View style={styles.exerciseIntro}>
              <Text style={styles.exerciseIntroEyebrow}>SHARED GOALS</Text>
              <Text style={styles.exerciseIntroTitle}>
                Things you're working on together
              </Text>
              <Text style={styles.exerciseIntroBody}>
                Your therapist sets these in your treatment plan. Tap one to see the brief.
              </Text>
            </View>

            {goals.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No shared goals yet</Text>
                <Text style={styles.emptyText}>
                  Your therapist hasn't set shared goals for the two of you yet.
                </Text>
              </View>
            ) : (
              goals.map((g, idx) => {
                const isDone = g.progress >= 100 || !!g.completedAt;
                const statusColor = isDone
                  ? COLORS.success
                  : g.progress > 0
                  ? COLORS.warning
                  : COLORS.gray400;
                return (
                  <View key={g.id} style={styles.wsCard}>
                    <View style={styles.wsTopRow}>
                      <Text style={styles.wsCategory}>
                        GOAL · {String(idx + 1).padStart(2, '0')}
                      </Text>
                      <View style={styles.wsStatusRow}>
                        <View
                          style={[styles.wsStatusDot, { backgroundColor: statusColor }]}
                        />
                        <Text style={[styles.wsStatusText, { color: statusColor }]}>
                          {isDone ? 'COMPLETED' : g.progress > 0 ? 'IN PROGRESS' : 'NOT STARTED'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.wsTitle} numberOfLines={2}>
                      {g.title}
                    </Text>
                    {g.description ? (
                      <Text style={styles.wsDesc} numberOfLines={3}>
                        {g.description}
                      </Text>
                    ) : null}
                    <View style={styles.wsDivider} />
                    <View style={styles.wsFooter}>
                      <Text style={styles.wsMetaLabel}>{g.progress || 0}% complete</Text>
                    </View>
                    <View style={styles.wsProgressTrack}>
                      <View
                        style={[
                          styles.wsProgressFill,
                          {
                            width: `${g.progress || 0}%`,
                            backgroundColor: statusColor,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}

        {activeSegment === 'dates' && (
          <>
            <View style={styles.dateIntro}>
              <Text style={styles.dateIntroEyebrow}>THIS WEEK</Text>
              <Text style={styles.dateIntroTitle}>Plan your next evening together</Text>
              <Text style={styles.dateIntroBody}>
                Pick something simple. Connection beats expense — what matters is undivided attention.
              </Text>
            </View>

            {dateIdeas.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No date ideas yet</Text>
                <Text style={styles.emptyText}>
                  Your therapist hasn't shared date ideas yet — check back soon.
                </Text>
              </View>
            ) : (
              dateIdeas.map((d, idx) => (
                <TouchableOpacity
                  key={d.id}
                  style={styles.dateCard}
                  activeOpacity={0.9}
                >
                  <Text style={styles.dateNumber}>
                    {String(idx + 1).padStart(2, '0')}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dateTag}>{(d.category || 'IDEA').toUpperCase()}</Text>
                    <Text style={styles.dateTitle}>{d.title}</Text>
                    <Text style={styles.dateSub}>
                      {d.description || d.body || ''}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
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

  segmentBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  segmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginRight: SPACING.xl,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  segmentBtnActive: {
    borderBottomColor: INK,
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray500,
    marginRight: 6,
  },
  segmentLabelActive: { color: INK, fontWeight: '800' },
  segmentCount: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gray400,
  },
  segmentCountActive: { color: BLUSH },

  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['2xl'],
    paddingTop: SPACING.md,
  },

  /* Worksheet cards */
  wsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  wsTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  wsCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: BLUSH,
    letterSpacing: 1.2,
  },
  wsStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wsStatusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  wsStatusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  wsTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: INK,
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  wsDesc: {
    fontSize: 13,
    color: COLORS.gray500,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  wsDivider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginBottom: SPACING.md,
  },
  wsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  wsMetaRow: { flexDirection: 'row', alignItems: 'center' },
  wsMetaLabel: { fontSize: 12, color: COLORS.gray500, fontWeight: '500' },
  wsMetaDot: {
    marginHorizontal: 6,
    color: COLORS.gray400,
    fontSize: 12,
  },
  wsCta: {
    fontSize: 13,
    fontWeight: '700',
    color: INK,
    letterSpacing: 0.2,
  },
  wsProgressTrack: {
    height: 2,
    backgroundColor: COLORS.gray100,
    borderRadius: 1,
    overflow: 'hidden',
  },
  wsProgressFill: { height: '100%' },

  /* Empty */
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: INK,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 20,
  },

  /* Exercises */
  exerciseIntro: {
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.xs,
  },
  exerciseIntroEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: BLUSH,
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  exerciseIntroTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '800',
    color: INK,
    marginBottom: 6,
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  exerciseIntroBody: {
    fontSize: 13,
    color: COLORS.gray500,
    lineHeight: 20,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  exerciseNumber: {
    fontSize: 28,
    fontWeight: '300',
    color: COLORS.gray300,
    marginRight: SPACING.lg,
    fontStyle: 'italic',
    letterSpacing: -1,
  },
  exerciseTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  exerciseCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: BLUSH,
    letterSpacing: 1.2,
  },
  exerciseDuration: {
    fontSize: 11,
    color: COLORS.gray400,
    fontWeight: '600',
  },
  exerciseTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: INK,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  exerciseSub: { fontSize: 12, color: COLORS.gray500, fontWeight: '500' },
  exerciseChev: {
    fontSize: 20,
    color: COLORS.gray400,
    marginLeft: SPACING.md,
    fontWeight: '500',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: INK,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.md,
  },
  viewAllText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
    marginRight: 6,
    letterSpacing: 0.3,
  },
  viewAllArrow: { color: COLORS.white, fontSize: 16, fontWeight: '600' },

  /* Date Ideas */
  dateIntro: {
    backgroundColor: CREAM,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#EFE6D8',
  },
  dateIntroEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: BLUSH,
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  dateIntroTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '800',
    color: INK,
    marginBottom: 6,
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  dateIntroBody: {
    fontSize: 13,
    color: COLORS.gray600,
    lineHeight: 20,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  dateNumber: {
    fontSize: 28,
    fontWeight: '300',
    color: COLORS.gray300,
    marginRight: SPACING.lg,
    fontStyle: 'italic',
    letterSpacing: -1,
  },
  dateTag: {
    fontSize: 9,
    fontWeight: '800',
    color: BLUSH,
    letterSpacing: 1,
    marginBottom: 4,
  },
  dateTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: INK,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  dateSub: {
    fontSize: 12,
    color: COLORS.gray500,
    lineHeight: 18,
  },
});
