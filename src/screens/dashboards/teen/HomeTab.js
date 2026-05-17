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

const MOOD_LABEL = {
  happy: 'Happy',
  sad: 'Sad',
  angry: 'Angry',
  anxious: 'Anxious',
  calm: 'Calm',
  excited: 'Excited',
  confused: 'Confused',
  overwhelmed: 'Overwhelmed',
};

const AFFIRMATIONS = [
  'You\'re doing better than you think.',
  'Progress, not perfection.',
  'Your feelings are valid.',
  'One small step counts.',
  'You are stronger than this moment.',
];

const STATUS_PROGRESS = { pending: 0, 'in-progress': 50, completed: 100 };

export default function TeenHomeTab() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [pending, setPending] = useState([]);
  const [recentMoods, setRecentMoods] = useState([]);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          setLoading(true);
          await dataStore.initialize();
          const u = await dataStore.getCurrentUser();
          if (cancelled) return;
          setUser(u);
          if (u) {
            const [all, moods, j] = await Promise.all([
              dataStore.getAssignmentsByClient(u.id),
              dataStore.getMoodEntriesByUser(u.id),
              dataStore.getJournalEntriesByUser(u.id),
            ]);
            if (cancelled) return;
            setPending((all || []).filter((a) => a.status !== 'completed'));
            setRecentMoods((moods || []).slice(0, 7));
            setJournals(j || []);
          }
        } catch (e) {
          console.log('[Teen HomeTab] load error', e);
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const openWorksheet = (a) => {
    const parent = navigation.getParent?.() || navigation;
    parent.navigate('Worksheet', {
      worksheetId: a.worksheetId,
      assignmentId: a.id,
    });
  };

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  const latestMood = recentMoods[0];
  const streak = recentMoods.length;
  const todaysAffirmation =
    AFFIRMATIONS[new Date().getDate() % AFFIRMATIONS.length];

  const firstName = (user?.name || 'Friend').split(' ')[0];
  const hour = new Date().getHours();
  const greetingPrefix =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const QUICK_ACTIONS = [
    {
      id: 'mood',
      label: 'Mood Check-In',
      sub: 'Log how you feel',
      emoji: '🫧',
      bg: COLORS.primary,
      fg: COLORS.white,
      onPress: () => navigation.navigate('MoodCheckIn'),
    },
    {
      id: 'journal',
      label: 'Journal',
      sub: 'Reflect & vent',
      emoji: '✍️',
      bg: '#1E293B',
      fg: COLORS.white,
      onPress: () => navigation.navigate('Journal'),
    },
    {
      id: 'breathe',
      label: 'Breathe',
      sub: '90-sec reset',
      emoji: '🌬️',
      bg: '#E8F8FA',
      fg: COLORS.gray700,
      accent: COLORS.primary,
      onPress: () => navigation.navigate('CopingToolbox'),
    },
    {
      id: 'progress',
      label: 'Progress',
      sub: 'See your stats',
      emoji: '📈',
      bg: '#FFF4E0',
      fg: COLORS.gray700,
      accent: COLORS.accent2,
      onPress: () => navigation.navigate('Insights'),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuBtn} onPress={openDrawer}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingSmall}>{greetingPrefix},</Text>
            <Text style={styles.greetingName}>{firstName} 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.notifIcon}>🔔</Text>
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Hero Mood Pulse Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroDecorTop} />
          <View style={styles.heroDecorBottom} />
          <View style={styles.heroContent}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroLabel}>TODAY'S PULSE</Text>
              <Text style={styles.heroTitle}>
                {latestMood
                  ? `Feeling ${MOOD_LABEL[latestMood.mood] || 'Okay'}`
                  : 'How are you?'}
              </Text>
              <Text style={styles.heroSub}>
                {latestMood
                  ? 'Tap below to log a new check-in'
                  : 'Take a moment to check in with yourself'}
              </Text>
              <TouchableOpacity
                style={styles.heroCta}
                onPress={() => navigation.navigate('MoodCheckIn')}
                activeOpacity={0.85}
              >
                <Text style={styles.heroCtaText}>
                  {latestMood ? 'Check In Again' : 'Start Check-In'}
                </Text>
                <Text style={styles.heroCtaArrow}>→</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.heroEmoji}>
              <Text style={styles.heroEmojiText}>
                {latestMood ? MOOD_EMOJIS[latestMood.mood] || '🙂' : '🫧'}
              </Text>
            </View>
          </View>
        </View>

        {/* Stat strip */}
        <View style={styles.statStrip}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Check-ins</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{pending.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{journals.length}</Text>
            <Text style={styles.statLabel}>Entries</Text>
          </View>
        </View>

        {/* Bento Quick Actions */}
        <Text style={styles.sectionLabel}>Quick Actions</Text>
        <View style={styles.bentoGrid}>
          {QUICK_ACTIONS.map((a) => (
            <TouchableOpacity
              key={a.id}
              style={[styles.bentoTile, { backgroundColor: a.bg }]}
              onPress={a.onPress}
              activeOpacity={0.85}
            >
              <Text style={styles.bentoEmoji}>{a.emoji}</Text>
              <Text style={[styles.bentoLabel, { color: a.fg }]}>{a.label}</Text>
              <Text
                style={[
                  styles.bentoSub,
                  { color: a.fg, opacity: a.fg === COLORS.white ? 0.75 : 0.6 },
                ]}
              >
                {a.sub}
              </Text>
              {a.accent ? (
                <View
                  style={[styles.bentoAccentDot, { backgroundColor: a.accent }]}
                />
              ) : null}
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue Where You Left Off */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Continue</Text>
          {pending.length > 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('Tools')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : pending.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyTitle}>You're all caught up</Text>
            <Text style={styles.emptyText}>
              No active worksheets right now. Take a moment to journal or breathe.
            </Text>
          </View>
        ) : (
          pending.slice(0, 2).map((a) => {
            const w = WORKSHEET_TEMPLATES[a.worksheetId];
            if (!w) return null;
            const progress = STATUS_PROGRESS[a.status] ?? 0;
            const cta = a.status === 'in-progress' ? 'Continue' : 'Start';
            return (
              <TouchableOpacity
                key={a.id}
                activeOpacity={0.9}
                style={styles.continueCard}
                onPress={() => openWorksheet(a)}
              >
                <View style={styles.continueRow}>
                  <View style={styles.continueIcon}>
                    <Text style={styles.continueIconText}>📋</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.continueTitle} numberOfLines={1}>
                      {w.title}
                    </Text>
                    <Text style={styles.continueMeta} numberOfLines={1}>
                      {w.category} · {w.estimatedTime}
                    </Text>
                  </View>
                </View>
                <View style={styles.progressRow}>
                  <View style={styles.progressTrack}>
                    <View
                      style={[styles.progressFill, { width: `${progress}%` }]}
                    />
                  </View>
                  <Text style={styles.progressPct}>{progress}%</Text>
                </View>
                <View style={styles.continueCta}>
                  <Text style={styles.continueCtaText}>{cta}</Text>
                  <Text style={styles.continueCtaArrow}>→</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* Today's Affirmation */}
        <View style={styles.affirmationCard}>
          <View style={styles.affirmationBadge}>
            <Text style={styles.affirmationBadgeText}>DAILY AFFIRMATION</Text>
          </View>
          <Text style={styles.affirmationText}>"{todaysAffirmation}"</Text>
          <View style={styles.affirmationFooter}>
            <Text style={styles.affirmationFooterText}>
              Take a breath. Read it twice.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Affirmations')}
            >
              <Text style={styles.affirmationLink}>More →</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },

  /* Header */
  header: {
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
  menuIcon: {
    fontSize: 20,
    color: COLORS.gray700,
    fontWeight: '700',
  },
  greetingSmall: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  greetingName: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '800',
    color: COLORS.gray700,
    letterSpacing: -0.5,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  notifIcon: { fontSize: 20 },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },

  /* Hero Card */
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    position: 'relative',
    ...SHADOWS.md,
  },
  heroDecorTop: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.35,
  },
  heroDecorBottom: {
    position: 'absolute',
    bottom: -50,
    right: 60,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryLighter,
    opacity: 0.25,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: COLORS.white,
    opacity: 0.85,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  heroSub: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.white,
    opacity: 0.85,
    marginBottom: SPACING.md,
    maxWidth: 220,
    lineHeight: 18,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  heroCtaText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: TYPOGRAPHY.sm,
    marginRight: 6,
  },
  heroCtaArrow: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
  },
  heroEmoji: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  heroEmojiText: { fontSize: 44 },

  /* Stat Strip */
  statStrip: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.xl,
    ...SHADOWS.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '800',
    color: COLORS.gray700,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.gray200,
    marginVertical: 6,
  },

  /* Sections */
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '800',
    color: COLORS.gray700,
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '700',
    color: COLORS.primary,
  },

  /* Bento Grid */
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bentoTile: {
    width: '48%',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    minHeight: 130,
    position: 'relative',
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  bentoEmoji: {
    fontSize: 30,
    marginBottom: SPACING.sm,
  },
  bentoLabel: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    marginBottom: 2,
  },
  bentoSub: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '500',
  },
  bentoAccentDot: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  /* Continue Cards */
  loadingBlock: { padding: SPACING.lg, alignItems: 'center' },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
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
  continueCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  continueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  continueIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  continueIconText: { fontSize: 20 },
  continueTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: 2,
  },
  continueMeta: { fontSize: TYPOGRAPHY.xs, color: COLORS.gray500 },
  progressRow: {
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
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
  },
  progressPct: {
    minWidth: 36,
    textAlign: 'right',
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    fontWeight: '700',
  },
  continueCta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  continueCtaText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 4,
  },
  continueCtaArrow: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.primary,
    fontWeight: '700',
  },

  /* Affirmation */
  affirmationCard: {
    backgroundColor: '#1E293B',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    marginTop: SPACING.lg,
    ...SHADOWS.md,
  },
  affirmationBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.md,
  },
  affirmationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: COLORS.primaryLighter,
  },
  affirmationText: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '600',
    color: COLORS.white,
    lineHeight: 26,
    marginBottom: SPACING.lg,
  },
  affirmationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  affirmationFooterText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray400,
  },
  affirmationLink: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '700',
    color: COLORS.primaryLighter,
  },
});
