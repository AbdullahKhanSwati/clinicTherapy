import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from '../constants/colors';

const PROGRAM_DETAILS = {
  cbt: {
    id: 'cbt',
    title: 'Cognitive Behavioral Therapy',
    emoji: '🧠',
    tagline: 'Rewire negative thought loops',
    description:
      'CBT is a structured, evidence-based approach that helps you identify the connection between thoughts, feelings, and behaviors — and reshape patterns that no longer serve you.',
    duration: '8 weeks',
    sessions: 8,
    difficulty: 'Moderate',
    accent: COLORS.primary,
    benefits: [
      'Recognize and challenge anxious thoughts',
      'Break unhelpful behavior cycles',
      'Build lasting coping skills',
      'Tools you can use for the rest of your life',
    ],
    modules: [
      { week: 1, title: 'Foundations of CBT', sub: 'Thoughts, feelings, actions' },
      { week: 2, title: 'Thought Records', sub: 'Catch the inner critic' },
      { week: 3, title: 'Cognitive Distortions', sub: 'Spot the patterns' },
      { week: 4, title: 'Evidence Gathering', sub: 'Test your thoughts' },
      { week: 5, title: 'Behavioral Activation', sub: 'Small daily wins' },
      { week: 6, title: 'Exposure Practice', sub: 'Face avoided situations' },
      { week: 7, title: 'Relapse Planning', sub: 'Stay on track' },
      { week: 8, title: 'Maintenance Toolkit', sub: 'Carry skills forward' },
    ],
  },
  dbt: {
    id: 'dbt',
    title: 'Dialectical Behavior Therapy',
    emoji: '🎯',
    tagline: 'Regulate emotion, tolerate distress',
    description:
      'DBT builds four core skill areas: mindfulness, distress tolerance, emotion regulation, and interpersonal effectiveness. Ideal if you struggle with intense emotions.',
    duration: '12 weeks',
    sessions: 12,
    difficulty: 'Intermediate',
    accent: '#FF6B6B',
    benefits: [
      'Cope with overwhelming emotions',
      'Reduce impulsive reactions',
      'Improve relationships',
      'Build a "wise mind" perspective',
    ],
    modules: [
      { week: 1, title: 'Intro to DBT', sub: 'The dialectic mindset' },
      { week: 2, title: 'Mindfulness', sub: 'Observe, describe, participate' },
      { week: 3, title: 'Wise Mind', sub: 'Emotion + reason' },
      { week: 4, title: 'Distress Tolerance I', sub: 'TIPP skills' },
      { week: 5, title: 'Distress Tolerance II', sub: 'Radical acceptance' },
      { week: 6, title: 'Emotion Regulation I', sub: 'Identify & name' },
      { week: 7, title: 'Emotion Regulation II', sub: 'Opposite action' },
      { week: 8, title: 'Interpersonal Skills I', sub: 'DEAR MAN' },
      { week: 9, title: 'Interpersonal Skills II', sub: 'GIVE & FAST' },
      { week: 10, title: 'Integration', sub: 'Combine the four pillars' },
      { week: 11, title: 'Crisis Survival', sub: 'When emotions spike' },
      { week: 12, title: 'Building a Life', sub: 'Long-term practice' },
    ],
  },
  mindfulness: {
    id: 'mindfulness',
    title: 'Mindfulness & Meditation',
    emoji: '🧘',
    tagline: 'Be where your feet are',
    description:
      'Mindfulness training reduces anxiety by teaching you to notice thoughts without being controlled by them. Includes guided practices for daily life.',
    duration: '6 weeks',
    sessions: 6,
    difficulty: 'Beginner',
    accent: '#4ECDC4',
    benefits: [
      'Reduce reactivity and stress',
      'Improve focus and sleep',
      'Build a daily 5-minute habit',
      'Carry calm into hard moments',
    ],
    modules: [
      { week: 1, title: 'What is Mindfulness?', sub: 'Beginner orientation' },
      { week: 2, title: 'Body Scan', sub: 'Reconnect with the body' },
      { week: 3, title: 'Breath Awareness', sub: 'Anchor in the now' },
      { week: 4, title: 'Working with Thoughts', sub: 'Watch them pass' },
      { week: 5, title: 'Loving-Kindness', sub: 'Compassion practice' },
      { week: 6, title: 'Daily Integration', sub: 'Make it stick' },
    ],
  },
  ace: {
    id: 'ace',
    title: 'Acceptance & Commitment Therapy',
    emoji: '🌱',
    tagline: 'Accept what is, commit to what matters',
    description:
      'ACT helps you stop fighting painful thoughts and instead anchor your life in your values. Less struggle, more meaningful action.',
    duration: '10 weeks',
    sessions: 10,
    difficulty: 'Intermediate',
    accent: '#95E1D3',
    benefits: [
      'Clarify what matters most',
      'Stop avoiding difficult emotions',
      'Take values-aligned action',
      'Build psychological flexibility',
    ],
    modules: [
      { week: 1, title: 'Creative Hopelessness', sub: 'What hasn\'t worked' },
      { week: 2, title: 'Acceptance', sub: 'Make space for pain' },
      { week: 3, title: 'Defusion', sub: 'Watch thoughts pass' },
      { week: 4, title: 'Present Moment', sub: 'Be here now' },
      { week: 5, title: 'Self-as-Context', sub: 'The observing self' },
      { week: 6, title: 'Values', sub: 'What matters most' },
      { week: 7, title: 'Committed Action I', sub: 'Small steps' },
      { week: 8, title: 'Committed Action II', sub: 'Sustain momentum' },
      { week: 9, title: 'Integration', sub: 'Live the model' },
      { week: 10, title: 'Maintenance', sub: 'Long-term practice' },
    ],
  },
  social: {
    id: 'social',
    title: 'Social Skills Training',
    emoji: '👥',
    tagline: 'Build confidence in connection',
    description:
      'Learn evidence-based skills for clear communication, healthy boundaries, conflict, and authentic relationships.',
    duration: '8 weeks',
    sessions: 8,
    difficulty: 'Moderate',
    accent: '#F38181',
    benefits: [
      'Communicate clearly and kindly',
      'Set healthy boundaries',
      'Navigate conflict without escalation',
      'Build deeper connections',
    ],
    modules: [
      { week: 1, title: 'Communication Basics', sub: 'I-statements & active listening' },
      { week: 2, title: 'Assertiveness', sub: 'Honest, kind, clear' },
      { week: 3, title: 'Boundaries', sub: 'Saying no with care' },
      { week: 4, title: 'Conflict Skills', sub: 'Stay regulated' },
      { week: 5, title: 'Empathy Practice', sub: 'Walk in their shoes' },
      { week: 6, title: 'Repair Conversations', sub: 'Reconnect after rupture' },
      { week: 7, title: 'Building Closeness', sub: 'Deepen connections' },
      { week: 8, title: 'Maintenance', sub: 'Keep skills sharp' },
    ],
  },
  sleep: {
    id: 'sleep',
    title: 'Sleep & Wellness',
    emoji: '😴',
    tagline: 'Reset your nights, reclaim your days',
    description:
      'A 4-week protocol combining CBT-I, sleep hygiene, and gentle wind-down rituals to help you sleep better, naturally.',
    duration: '4 weeks',
    sessions: 4,
    difficulty: 'Beginner',
    accent: '#AA96DA',
    benefits: [
      'Fall asleep faster',
      'Stay asleep through the night',
      'Wake refreshed',
      'Reduce reliance on sleep aids',
    ],
    modules: [
      { week: 1, title: 'Sleep Foundations', sub: 'Circadian rhythm basics' },
      { week: 2, title: 'Sleep Hygiene', sub: 'Environment & routine' },
      { week: 3, title: 'CBT-I Techniques', sub: 'Sleep restriction & stimulus control' },
      { week: 4, title: 'Sustainability', sub: 'Long-term habits' },
    ],
  },
};

export default function ProgramDetailsScreen({ route, navigation }) {
  const programId = route?.params?.programId;
  const program = useMemo(() => PROGRAM_DETAILS[programId] || null, [programId]);
  const [enrolled, setEnrolled] = useState(programId === 'cbt' || programId === 'mindfulness');

  if (!program) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Program</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>🤔</Text>
          <Text style={styles.emptyTitle}>Program not found</Text>
          <Text style={styles.emptyText}>
            We couldn't load this program. Try going back and selecting it again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleEnrollToggle = () => setEnrolled((e) => !e);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Program
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.heroCard, { backgroundColor: program.accent }]}>
          <View style={styles.heroDecorTop} />
          <View style={styles.heroDecorBottom} />
          <Text style={styles.heroEmoji}>{program.emoji}</Text>
          {enrolled && (
            <View style={styles.enrolledBadge}>
              <View style={styles.enrolledDot} />
              <Text style={styles.enrolledText}>ENROLLED</Text>
            </View>
          )}
          <Text style={styles.heroTitle}>{program.title}</Text>
          <Text style={styles.heroTagline}>{program.tagline}</Text>

          <View style={styles.heroMetaRow}>
            <View style={styles.heroMetaItem}>
              <Text style={styles.heroMetaValue}>{program.duration}</Text>
              <Text style={styles.heroMetaLabel}>Duration</Text>
            </View>
            <View style={styles.heroMetaDivider} />
            <View style={styles.heroMetaItem}>
              <Text style={styles.heroMetaValue}>{program.sessions}</Text>
              <Text style={styles.heroMetaLabel}>Sessions</Text>
            </View>
            <View style={styles.heroMetaDivider} />
            <View style={styles.heroMetaItem}>
              <Text style={styles.heroMetaValue}>{program.difficulty}</Text>
              <Text style={styles.heroMetaLabel}>Level</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>ABOUT THIS PROGRAM</Text>
          <Text style={styles.cardBody}>{program.description}</Text>
        </View>

        {/* Benefits */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>WHAT YOU'LL GAIN</Text>
          {program.benefits.map((b, i) => (
            <View key={i} style={styles.benefitRow}>
              <View style={[styles.benefitDot, { backgroundColor: program.accent }]} />
              <Text style={styles.benefitText}>{b}</Text>
            </View>
          ))}
        </View>

        {/* Modules */}
        <Text style={styles.sectionLabel}>Weekly Modules</Text>
        {program.modules.map((m) => (
          <View key={m.week} style={styles.moduleCard}>
            <View
              style={[
                styles.moduleWeekBox,
                { backgroundColor: program.accent + '15' },
              ]}
            >
              <Text style={[styles.moduleWeekLabel, { color: program.accent }]}>
                WEEK
              </Text>
              <Text style={[styles.moduleWeekNumber, { color: program.accent }]}>
                {m.week}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.moduleTitle}>{m.title}</Text>
              <Text style={styles.moduleSub}>{m.sub}</Text>
            </View>
            <View style={styles.moduleStatus}>
              {enrolled && m.week === 1 ? (
                <View
                  style={[
                    styles.moduleStatusBadge,
                    { backgroundColor: COLORS.success + '15' },
                  ]}
                >
                  <Text style={[styles.moduleStatusText, { color: COLORS.success }]}>
                    ✓
                  </Text>
                </View>
              ) : (
                <Text style={styles.moduleLock}>○</Text>
              )}
            </View>
          </View>
        ))}

        {/* Enroll CTA */}
        <TouchableOpacity
          style={[
            styles.enrollBtn,
            { backgroundColor: enrolled ? COLORS.gray700 : program.accent },
          ]}
          onPress={handleEnrollToggle}
          activeOpacity={0.85}
        >
          <Text style={styles.enrollBtnText}>
            {enrolled ? 'Leave Program' : 'Enroll & Start Week 1'}
          </Text>
          <Text style={styles.enrollBtnArrow}>{enrolled ? '✕' : '→'}</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Programs are self-paced. Your therapist can review your progress at any time.
        </Text>

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
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  backIcon: { fontSize: 22, color: COLORS.gray700, fontWeight: '700' },
  headerTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '800',
    color: COLORS.gray700,
    flex: 1,
    textAlign: 'center',
    letterSpacing: -0.3,
  },

  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },

  /* Hero */
  heroCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    position: 'relative',
    ...SHADOWS.md,
  },
  heroDecorTop: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  heroDecorBottom: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  heroEmoji: { fontSize: 52, marginBottom: SPACING.md, zIndex: 1 },
  enrolledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.sm,
    zIndex: 1,
  },
  enrolledDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
    marginRight: 6,
  },
  enrolledText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
    marginBottom: 4,
    zIndex: 1,
  },
  heroTagline: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: SPACING.lg,
    zIndex: 1,
  },
  heroMetaRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    zIndex: 1,
  },
  heroMetaItem: { flex: 1, alignItems: 'center' },
  heroMetaValue: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '800',
    color: COLORS.white,
  },
  heroMetaLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.white,
    opacity: 0.85,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  heroMetaDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 4,
  },

  /* Cards */
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.2,
    marginBottom: SPACING.sm,
  },
  cardBody: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray700,
    lineHeight: 22,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  benefitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.md,
  },
  benefitText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray700,
    fontWeight: '500',
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

  /* Modules */
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  moduleWeekBox: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  moduleWeekLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  moduleWeekNumber: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  moduleTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: 2,
  },
  moduleSub: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
  },
  moduleStatus: { marginLeft: SPACING.sm },
  moduleStatusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleStatusText: { fontSize: 16, fontWeight: '800' },
  moduleLock: { fontSize: 22, color: COLORS.gray300 },

  /* Enroll CTA */
  enrollBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.lg,
    ...SHADOWS.md,
  },
  enrollBtnText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.base,
    fontWeight: '800',
    marginRight: 8,
    letterSpacing: -0.2,
  },
  enrollBtnArrow: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '800',
  },

  disclaimer: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray400,
    textAlign: 'center',
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    lineHeight: 18,
  },

  /* Empty state */
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.md },
  emptyTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '800',
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 22,
  },
});
