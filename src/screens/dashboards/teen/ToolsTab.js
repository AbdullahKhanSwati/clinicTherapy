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
  SHADOWS,
} from '../../../constants/colors';
import dataStore from '../../../utils/dataStore';
import { WORKSHEET_TEMPLATES } from '../../../data/worksheetTemplates';

const STATUS_PROGRESS = { pending: 0, 'in-progress': 50, completed: 100 };

const COPING_TOOLS = [
  {
    id: 'breathing',
    title: 'Breathing',
    sub: '4-7-8, box breathing',
    emoji: '🌬️',
    color: '#E8F8FA',
    accent: COLORS.primary,
    screen: 'BreathingExercise',
  },
  {
    id: 'grounding',
    title: 'Grounding',
    sub: '5-4-3-2-1 senses',
    emoji: '🌿',
    color: '#E8FAF1',
    accent: COLORS.accent3,
    screen: 'GroundingExercise',
  },
  {
    id: 'visualization',
    title: 'Visualize',
    sub: 'Safe place imagery',
    emoji: '🌅',
    color: '#FFF4E0',
    accent: COLORS.accent2,
    screen: 'Visualization',
  },
  {
    id: 'affirmations',
    title: 'Affirmations',
    sub: 'Build inner strength',
    emoji: '💬',
    color: '#F2EEFF',
    accent: COLORS.accent5,
    screen: 'Affirmations',
  },
];

export default function TeenToolsTab() {
  const navigation = useNavigation();
  const [activeSegment, setActiveSegment] = useState('worksheets');
  const [assignments, setAssignments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          setLoading(true);
          await dataStore.initialize();
          const user = await dataStore.getCurrentUser();
          if (cancelled) return;
          if (user) {
            const list = await dataStore.getAssignmentsByClient(user.id);
            if (cancelled) return;
            setAssignments(list || []);
            try {
              const p = await dataStore.getAllPrograms?.();
              if (!cancelled && Array.isArray(p)) setPrograms(p);
            } catch (e) {
              // Optional API
            }
          }
        } catch (e) {
          console.log('[Teen ToolsTab] load error', e);
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

  const openWorksheet = (a) => {
    const parent = navigation.getParent?.() || navigation;
    parent.navigate('Worksheet', {
      worksheetId: a.worksheetId,
      assignmentId: a.id,
    });
  };

  const segments = [
    { id: 'worksheets', label: 'Worksheets', count: assignments.length },
    { id: 'coping', label: 'Coping', count: COPING_TOOLS.length },
    { id: 'programs', label: 'Programs', count: programs.length || 4 },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.menuBtn} onPress={openDrawer}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Tools</Text>
          <Text style={styles.headerSub}>Everything you need to work on yourself</Text>
        </View>
      </View>

      {/* Segmented Control */}
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
              <View
                style={[
                  styles.segmentCount,
                  active && styles.segmentCountActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentCountText,
                    active && styles.segmentCountTextActive,
                  ]}
                >
                  {s.count}
                </Text>
              </View>
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
                color={COLORS.primary}
              />
            ) : assignments.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>📋</Text>
                <Text style={styles.emptyTitle}>No worksheets yet</Text>
                <Text style={styles.emptyText}>
                  Your therapist will assign worksheets for you to complete here.
                </Text>
              </View>
            ) : (
              assignments.map((a) => {
                const w = WORKSHEET_TEMPLATES[a.worksheetId];
                if (!w) return null;
                const progress = STATUS_PROGRESS[a.status] ?? 0;
                const isDone = a.status === 'completed';
                const isProg = a.status === 'in-progress';
                const statusLabel = isDone
                  ? 'Completed'
                  : isProg
                  ? 'In Progress'
                  : 'New';
                const statusColor = isDone
                  ? COLORS.success
                  : isProg
                  ? COLORS.warning
                  : COLORS.primary;
                return (
                  <TouchableOpacity
                    key={a.id}
                    style={styles.wsCard}
                    onPress={() => openWorksheet(a)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.wsHeader}>
                      <View style={styles.wsIconBox}>
                        <Text style={styles.wsIcon}>📋</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.wsTitle} numberOfLines={1}>
                          {w.title}
                        </Text>
                        <Text style={styles.wsCategory} numberOfLines={1}>
                          {w.category} · {w.estimatedTime}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusPill,
                          { backgroundColor: statusColor + '15' },
                        ]}
                      >
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: statusColor },
                          ]}
                        />
                        <Text style={[styles.statusText, { color: statusColor }]}>
                          {statusLabel}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.wsDesc} numberOfLines={2}>
                      {w.description}
                    </Text>
                    <View style={styles.wsProgress}>
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${progress}%`, backgroundColor: statusColor },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressPct}>{progress}%</Text>
                    </View>
                    <View style={styles.wsFooter}>
                      <Text style={styles.wsCta}>
                        {isDone ? 'Review' : isProg ? 'Continue' : 'Start now'}
                      </Text>
                      <Text style={styles.wsArrow}>→</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}

        {activeSegment === 'coping' && (
          <>
            <View style={styles.copingHero}>
              <Text style={styles.copingHeroEmoji}>🧰</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.copingHeroTitle}>Coping Toolbox</Text>
                <Text style={styles.copingHeroSub}>
                  Quick exercises to ground you when you're overwhelmed
                </Text>
              </View>
            </View>
            <View style={styles.copingGrid}>
              {COPING_TOOLS.map((tool) => (
                <TouchableOpacity
                  key={tool.id}
                  style={[styles.copingCard, { backgroundColor: tool.color }]}
                  onPress={() => navigation.navigate(tool.screen)}
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      styles.copingDot,
                      { backgroundColor: tool.accent },
                    ]}
                  />
                  <Text style={styles.copingEmoji}>{tool.emoji}</Text>
                  <Text style={styles.copingTitle}>{tool.title}</Text>
                  <Text style={styles.copingSub}>{tool.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.viewAllToolboxBtn}
              onPress={() => navigation.navigate('CopingToolbox')}
              activeOpacity={0.85}
            >
              <Text style={styles.viewAllToolboxText}>Open Full Toolbox</Text>
              <Text style={styles.viewAllToolboxArrow}>→</Text>
            </TouchableOpacity>
          </>
        )}

        {activeSegment === 'programs' && (
          <>
            <TouchableOpacity
              style={styles.programHero}
              onPress={() => navigation.navigate('TherapyPrograms')}
              activeOpacity={0.9}
            >
              <View style={styles.programHeroLeft}>
                <Text style={styles.programHeroLabel}>STRUCTURED PROGRAMS</Text>
                <Text style={styles.programHeroTitle}>
                  Multi-week guided journeys
                </Text>
                <Text style={styles.programHeroSub}>
                  Evidence-based CBT & DBT tracks built for teens
                </Text>
                <View style={styles.programHeroCta}>
                  <Text style={styles.programHeroCtaText}>Browse Programs</Text>
                  <Text style={styles.programHeroArrow}>→</Text>
                </View>
              </View>
              <Text style={styles.programHeroEmoji}>🎯</Text>
            </TouchableOpacity>

            {[
              {
                id: 1,
                title: 'Anxiety Mastery',
                sub: '6-week CBT track',
                modules: 12,
                tag: 'POPULAR',
                emoji: '🌱',
              },
              {
                id: 2,
                title: 'Confidence Builder',
                sub: '4-week self-esteem program',
                modules: 8,
                tag: 'NEW',
                emoji: '💪',
              },
              {
                id: 3,
                title: 'Sleep & Stress',
                sub: '3-week wellness reset',
                modules: 6,
                tag: null,
                emoji: '🌙',
              },
              {
                id: 4,
                title: 'Social Skills',
                sub: '5-week DBT practice',
                modules: 10,
                tag: null,
                emoji: '🤝',
              },
            ].map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.programCard}
                onPress={() => navigation.navigate('TherapyPrograms')}
                activeOpacity={0.9}
              >
                <View style={styles.programIconBox}>
                  <Text style={styles.programIcon}>{p.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.programTitleRow}>
                    <Text style={styles.programTitle} numberOfLines={1}>
                      {p.title}
                    </Text>
                    {p.tag && (
                      <View
                        style={[
                          styles.programTag,
                          p.tag === 'NEW' && {
                            backgroundColor: COLORS.accent3 + '20',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.programTagText,
                            p.tag === 'NEW' && { color: COLORS.accent3 },
                          ]}
                        >
                          {p.tag}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.programSub} numberOfLines={1}>
                    {p.sub}
                  </Text>
                  <Text style={styles.programMeta}>{p.modules} modules</Text>
                </View>
                <Text style={styles.programChev}>›</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
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
  headerSub: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginTop: 2,
  },

  segmentBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    padding: 4,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  segmentBtnActive: {
    backgroundColor: COLORS.primary,
  },
  segmentLabel: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '700',
    color: COLORS.gray600,
    marginRight: 6,
  },
  segmentLabelActive: { color: COLORS.white },
  segmentCount: {
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
  },
  segmentCountActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  segmentCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
  },
  segmentCountTextActive: { color: COLORS.white },

  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['2xl'],
    paddingTop: SPACING.sm,
  },

  /* Worksheet cards */
  wsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  wsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  wsIconBox: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  wsIcon: { fontSize: 20 },
  wsTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: 2,
  },
  wsCategory: { fontSize: TYPOGRAPHY.xs, color: COLORS.gray500 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    marginLeft: SPACING.sm,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: { fontSize: 10, fontWeight: '700' },
  wsDesc: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray600,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  wsProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginRight: SPACING.sm,
  },
  progressFill: { height: '100%', borderRadius: BORDER_RADIUS.full },
  progressPct: {
    minWidth: 36,
    textAlign: 'right',
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    fontWeight: '700',
  },
  wsFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  wsCta: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 4,
  },
  wsArrow: { fontSize: TYPOGRAPHY.base, color: COLORS.primary, fontWeight: '700' },

  /* Empty card */
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.md,
    ...SHADOWS.sm,
  },
  emptyEmoji: { fontSize: 40, marginBottom: SPACING.sm },
  emptyTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 20,
  },

  /* Coping */
  copingHero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  copingHeroEmoji: { fontSize: 40, marginRight: SPACING.md },
  copingHeroTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: 2,
  },
  copingHeroSub: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    lineHeight: 18,
  },
  copingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  copingCard: {
    width: '48%',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    minHeight: 140,
    position: 'relative',
  },
  copingDot: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  copingEmoji: { fontSize: 30, marginBottom: SPACING.sm },
  copingTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: 2,
  },
  copingSub: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray600,
  },
  viewAllToolboxBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray700,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.md,
  },
  viewAllToolboxText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: TYPOGRAPHY.sm,
    marginRight: 6,
  },
  viewAllToolboxArrow: { color: COLORS.white, fontSize: TYPOGRAPHY.base, fontWeight: '700' },

  /* Programs */
  programHero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  programHeroLeft: { flex: 1 },
  programHeroLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: COLORS.primaryLighter,
    marginBottom: 6,
  },
  programHeroTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  programHeroSub: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray300,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  programHeroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  programHeroCtaText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: TYPOGRAPHY.sm,
    marginRight: 6,
  },
  programHeroArrow: { color: COLORS.white, fontSize: TYPOGRAPHY.base, fontWeight: '700' },
  programHeroEmoji: { fontSize: 56, marginLeft: SPACING.md },

  programCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  programIconBox: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  programIcon: { fontSize: 24 },
  programTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  programTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: COLORS.gray700,
    flex: 1,
  },
  programTag: {
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginLeft: SPACING.sm,
  },
  programTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.warning,
    letterSpacing: 0.6,
  },
  programSub: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray600,
    marginBottom: 2,
  },
  programMeta: { fontSize: 11, color: COLORS.gray500 },
  programChev: {
    fontSize: 28,
    color: COLORS.gray400,
    marginLeft: SPACING.sm,
  },
});
