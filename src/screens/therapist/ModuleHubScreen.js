import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
} from '../../constants/colors';
import dataStore from '../../utils/dataStore';
import { WORKSHEET_TEMPLATES } from '../../data/worksheetTemplates';

const INK = '#1A2332';

/**
 * ModuleHubScreen — admin view for a single audience module.
 *
 * For Children / Teens / Family / General → shows the 4 standard content
 *   categories filtered to that audience.
 *
 * For Couples → adds the 12-Week Gottman Program, Psychodynamic Suite,
 *   Date Ideas, and a Couple Management section (pairings, check-ins,
 *   repair requests, shared goals).
 */

const MODULE_CONFIG = {
  children: {
    audience: 'child',
    label: 'Children Module',
    description: 'Therapeutic content tailored for children ages 6-12.',
    accent: '#9333EA',
    icon: 'smile',
  },
  teens: {
    audience: 'teen',
    label: 'Teens Module',
    description: 'Reflective practice and emotional skills for adolescents.',
    accent: '#0891B2',
    icon: 'user',
  },
  couples: {
    audience: 'couples',
    label: 'Couples Module',
    description: 'Partner-sync programs, daily tools, and couple oversight.',
    accent: '#D4536B',
    icon: 'heart',
  },
  family: {
    audience: 'family',
    label: 'Family Module',
    description: 'Whole-family interventions and parent guides.',
    accent: '#15803D',
    icon: 'users',
  },
  general: {
    audience: 'all',
    label: 'General Library',
    description: 'Cross-audience content available to all roles.',
    accent: COLORS.gray600,
    icon: 'layers',
  },
};

const CONTENT_CARDS = [
  {
    id: 'worksheets',
    label: 'Worksheets',
    sub: 'Structured exercises and prompts',
    icon: 'file-text',
    contentType: 'worksheet',
  },
  {
    id: 'affirmations',
    label: 'Affirmations',
    sub: 'Daily statements for clients',
    icon: 'message-circle',
    contentType: 'affirmation',
  },
  {
    id: 'coping',
    label: 'Coping Tools',
    sub: 'Breathing, grounding, visualization',
    icon: 'shield',
    contentType: 'copingTool',
  },
  {
    id: 'resources',
    label: 'Resources',
    sub: 'Articles, videos, references',
    icon: 'book-open',
    contentType: 'resource',
  },
];

const COUPLES_EXTRAS = [
  {
    id: 'gottman',
    label: '12-Week Gottman Program',
    sub: 'Friendship → Conflict → Connection → Trust',
    icon: 'calendar',
    contentType: 'worksheet',
    programId: 'gottman_12week',
  },
  {
    id: 'psyd',
    label: 'Psychodynamic Suite',
    sub: 'Triggers, defenses, transference, repair',
    icon: 'compass',
    contentType: 'worksheet',
    programId: 'psychodynamic_suite',
  },
  {
    id: 'dates',
    label: 'Date Ideas',
    sub: 'Connection prompts for partners',
    icon: 'star',
    contentType: 'dateIdea',
  },
];

const COUPLES_MANAGEMENT = [
  {
    id: 'pair_new',
    label: 'Pair a Couple',
    sub: 'Manually link two users as partners',
    icon: 'user-plus',
    target: 'AdminPairCouple',
  },
  {
    id: 'pairings',
    label: 'Couple Pairings',
    sub: 'See all linked partners',
    icon: 'link',
    target: 'CoupleManagement',
    section: 'pairings',
  },
  {
    id: 'checkins',
    label: 'Daily Check-Ins',
    sub: 'Mood / connection / stress trends',
    icon: 'activity',
    target: 'CoupleManagement',
    section: 'checkins',
  },
  {
    id: 'repairs',
    label: 'Repair Requests',
    sub: 'Repair activity per couple',
    icon: 'rotate-ccw',
    target: 'CoupleManagement',
    section: 'repairs',
  },
  {
    id: 'goals',
    label: 'Shared Goals',
    sub: 'Couple-level commitments',
    icon: 'target',
    target: 'CoupleManagement',
    section: 'goals',
  },
];

const USER_MANAGEMENT = {
  child: {
    label: 'Manage Children',
    sub: 'View profiles, assign parents',
    icon: 'users',
    target: 'ManageUsers',
    params: { role: 'child' },
  },
  teen: {
    label: 'Manage Teens',
    sub: 'View profiles, assign parents',
    icon: 'users',
    target: 'ManageUsers',
    params: { role: 'teen' },
  },
  couples: {
    label: 'Manage Couples Users',
    sub: 'See every couples-role account',
    icon: 'users',
    target: 'ManageUsers',
    params: { role: 'couples' },
  },
  family: {
    label: 'Manage Parents',
    sub: 'View profiles, link children',
    icon: 'users',
    target: 'ManageUsers',
    params: { role: 'family' },
  },
};

export default function ModuleHubScreen({ route, navigation }) {
  const moduleId = route?.params?.moduleId || 'general';
  const config = MODULE_CONFIG[moduleId] || MODULE_CONFIG.general;

  const [counts, setCounts] = useState({
    worksheet: 0,
    affirmation: 0,
    copingTool: 0,
    resource: 0,
    dateIdea: 0,
    gottman: 0,
    psyd: 0,
  });
  const [coupleStats, setCoupleStats] = useState({
    pairings: 0,
    checkinsThisWeek: 0,
    openRepairs: 0,
    sharedGoals: 0,
  });

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          await dataStore.initialize();
          const [
            affirmations,
            copingTools,
            resources,
            dateIdeas,
            customWorksheets,
            pairings,
            checkins,
            repairs,
            goals,
          ] = await Promise.all([
            dataStore.getAffirmations(),
            dataStore.getCopingTools(),
            dataStore.getResources(),
            dataStore.getDateIdeas(),
            dataStore.getCustomWorksheets(),
            dataStore.getCouplePairings(),
            dataStore.getPartnerCheckins(),
            dataStore.getRepairRequests(),
            dataStore.getSharedGoals(),
          ]);
          if (cancelled) return;

          const allWorksheets = [
            ...Object.values(WORKSHEET_TEMPLATES),
            ...(customWorksheets || []),
          ];

          const matchesAudience = (item) => {
            if (config.audience === 'all') return true;
            return (
              item.audience === config.audience ||
              item.targetAudience === config.audience ||
              item.audience === 'all'
            );
          };

          const filteredWorksheets = allWorksheets.filter((w) => {
            if (config.audience === 'all') return true;
            return w.targetAudience === config.audience;
          });

          const gottmanCount = filteredWorksheets.filter(
            (w) => w.programId === 'gottman_12week'
          ).length;
          const psydCount = filteredWorksheets.filter(
            (w) => w.programId === 'psychodynamic_suite'
          ).length;

          setCounts({
            worksheet: filteredWorksheets.length,
            affirmation: (affirmations || []).filter(matchesAudience).length,
            copingTool: (copingTools || []).filter(matchesAudience).length,
            resource: (resources || []).filter(matchesAudience).length,
            dateIdea: (dateIdeas || []).length,
            gottman: gottmanCount,
            psyd: psydCount,
          });

          if (config.audience === 'couples') {
            const now = Date.now();
            const oneWeek = 7 * 86400000;
            setCoupleStats({
              pairings: (pairings || []).filter((p) => p.status === 'active')
                .length,
              checkinsThisWeek: (checkins || []).filter(
                (c) => now - new Date(c.date).getTime() < oneWeek
              ).length,
              openRepairs: (repairs || []).filter((r) => r.status === 'sent')
                .length,
              sharedGoals: (goals || []).length,
            });
          }
        } catch (e) {
          console.log('[ModuleHub] load error', e);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [config.audience])
  );

  const openManage = (contentType, options = {}) => {
    navigation.navigate('ManageContent', {
      contentType,
      audience: config.audience === 'all' ? null : config.audience,
      programId: options.programId || null,
      moduleLabel: config.label,
    });
  };

  const openCreate = (contentType) => {
    if (contentType === 'worksheet') {
      navigation.navigate('CreateWorksheet', {
        defaultAudience: config.audience === 'all' ? 'teen' : config.audience,
      });
    } else if (contentType === 'affirmation') {
      navigation.navigate('CreateAffirmation', {
        defaultAudience: config.audience,
      });
    } else if (contentType === 'copingTool') {
      navigation.navigate('CreateCopingTool', {
        defaultAudience: config.audience,
      });
    } else if (contentType === 'resource') {
      navigation.navigate('CreateResource', {
        defaultAudience: config.audience,
      });
    } else if (contentType === 'dateIdea') {
      navigation.navigate('CreateDateIdea');
    }
  };

  const getCount = (card) => {
    if (card.programId === 'gottman_12week') return counts.gottman;
    if (card.programId === 'psychodynamic_suite') return counts.psyd;
    return counts[card.contentType] || 0;
  };

  const isCouples = config.audience === 'couples';
  const userMgmt = USER_MANAGEMENT[config.audience];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={20} color={INK} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: SPACING.md }}>
          <Text style={[styles.eyebrow, { color: config.accent }]}>MODULE</Text>
          <Text style={styles.headerTitle}>{config.label}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { backgroundColor: config.accent }]}>
          <View style={styles.heroDecor} />
          <Feather name={config.icon} size={32} color={COLORS.white} />
          <Text style={styles.heroTitle}>{config.label}</Text>
          <Text style={styles.heroDescription}>{config.description}</Text>
          {isCouples && (
            <View style={styles.heroStats}>
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatValue}>{coupleStats.pairings}</Text>
                <Text style={styles.heroStatLabel}>PAIRINGS</Text>
              </View>
              <View style={styles.heroStatDiv} />
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatValue}>
                  {coupleStats.checkinsThisWeek}
                </Text>
                <Text style={styles.heroStatLabel}>CHECK-INS / WK</Text>
              </View>
              <View style={styles.heroStatDiv} />
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatValue}>
                  {coupleStats.openRepairs}
                </Text>
                <Text style={styles.heroStatLabel}>OPEN REPAIRS</Text>
              </View>
            </View>
          )}
        </View>

        <Text style={styles.sectionLabel}>CORE CONTENT</Text>
        {CONTENT_CARDS.map((card) => {
          const count = getCount(card);
          return (
            <ContentCard
              key={card.id}
              card={card}
              count={count}
              accent={config.accent}
              onView={() => openManage(card.contentType)}
              onCreate={() => openCreate(card.contentType)}
            />
          );
        })}

        {userMgmt && (
          <>
            <Text style={styles.sectionLabel}>USER MANAGEMENT</Text>
            <Text style={styles.sectionDescription}>
              See every {config.audience === 'family' ? 'parent' : config.audience}{' '}
              in the system and manage their{' '}
              {config.audience === 'family'
                ? 'linked children'
                : 'parent assignments'}.
            </Text>
            <TouchableOpacity
              style={styles.mgmtCard}
              onPress={() =>
                navigation.navigate(userMgmt.target, userMgmt.params)
              }
              activeOpacity={0.9}
            >
              <View
                style={[
                  styles.mgmtIcon,
                  { backgroundColor: config.accent + '15' },
                ]}
              >
                <Feather name={userMgmt.icon} size={18} color={config.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.mgmtLabel}>{userMgmt.label}</Text>
                <Text style={styles.mgmtSub}>{userMgmt.sub}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={COLORS.gray400} />
            </TouchableOpacity>
          </>
        )}

        {isCouples && (
          <>
            <Text style={styles.sectionLabel}>COUPLES PROGRAMS</Text>
            {COUPLES_EXTRAS.map((card) => {
              const count = getCount(card);
              return (
                <ContentCard
                  key={card.id}
                  card={card}
                  count={count}
                  accent={config.accent}
                  onView={() =>
                    openManage(card.contentType, { programId: card.programId })
                  }
                  onCreate={() => openCreate(card.contentType)}
                />
              );
            })}

            <Text style={styles.sectionLabel}>COUPLE MANAGEMENT</Text>
            <Text style={styles.sectionDescription}>
              See and manage every couple's pairing, check-ins, repair history
              and shared goals.
            </Text>
            {COUPLES_MANAGEMENT.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={styles.mgmtCard}
                onPress={() =>
                  navigation.navigate(
                    card.target,
                    card.section ? { section: card.section } : undefined
                  )
                }
                activeOpacity={0.9}
              >
                <View
                  style={[
                    styles.mgmtIcon,
                    { backgroundColor: config.accent + '15' },
                  ]}
                >
                  <Feather name={card.icon} size={18} color={config.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mgmtLabel}>{card.label}</Text>
                  <Text style={styles.mgmtSub}>{card.sub}</Text>
                </View>
                {card.id === 'pairings' && (
                  <View style={styles.mgmtBadge}>
                    <Text style={styles.mgmtBadgeText}>
                      {coupleStats.pairings}
                    </Text>
                  </View>
                )}
                {card.id === 'repairs' && coupleStats.openRepairs > 0 && (
                  <View style={[styles.mgmtBadge, { backgroundColor: '#DC2626' }]}>
                    <Text style={[styles.mgmtBadgeText, { color: COLORS.white }]}>
                      {coupleStats.openRepairs}
                    </Text>
                  </View>
                )}
                {card.id === 'goals' && (
                  <View style={styles.mgmtBadge}>
                    <Text style={styles.mgmtBadgeText}>
                      {coupleStats.sharedGoals}
                    </Text>
                  </View>
                )}
                <Feather name="chevron-right" size={20} color={COLORS.gray400} />
              </TouchableOpacity>
            ))}
          </>
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const ContentCard = ({ card, count, accent, onView, onCreate }) => (
  <View style={styles.contentCard}>
    <TouchableOpacity
      style={styles.contentMain}
      onPress={onView}
      activeOpacity={0.85}
    >
      <View style={[styles.contentIcon, { backgroundColor: accent + '15' }]}>
        <Feather name={card.icon} size={20} color={accent} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.contentTopRow}>
          <Text style={styles.contentLabel}>{card.label}</Text>
          <View style={styles.contentCountBadge}>
            <Text style={styles.contentCountText}>{count}</Text>
          </View>
        </View>
        <Text style={styles.contentSub}>{card.sub}</Text>
      </View>
      <Feather name="chevron-right" size={20} color={COLORS.gray400} />
    </TouchableOpacity>
    <View style={styles.contentActions}>
      <TouchableOpacity
        style={styles.contentActionBtn}
        onPress={onCreate}
        activeOpacity={0.7}
      >
        <Feather name="plus" size={13} color={INK} />
        <Text style={styles.contentActionText}>Create new</Text>
      </TouchableOpacity>
      <View style={styles.contentActionDivider} />
      <TouchableOpacity
        style={styles.contentActionBtn}
        onPress={onView}
        activeOpacity={0.7}
      >
        <Feather name="list" size={13} color={INK} />
        <Text style={styles.contentActionText}>View all</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
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
    letterSpacing: 1.4,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.5,
  },

  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },

  /* Hero */
  heroCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  heroDecor: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  heroTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
    marginTop: SPACING.md,
    marginBottom: 4,
  },
  heroDescription: {
    fontSize: 13,
    color: COLORS.white,
    opacity: 0.9,
    lineHeight: 19,
  },
  heroStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    marginTop: SPACING.lg,
  },
  heroStatItem: { flex: 1, alignItems: 'center' },
  heroStatValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  heroStatLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.white,
    opacity: 0.85,
    letterSpacing: 0.8,
    marginTop: 2,
  },
  heroStatDiv: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginVertical: 4,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
    marginBottom: 4,
    marginTop: SPACING.md,
  },
  sectionDescription: {
    fontSize: 12,
    color: COLORS.gray500,
    lineHeight: 17,
    marginBottom: SPACING.md,
  },

  /* Content card */
  contentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    overflow: 'hidden',
  },
  contentMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  contentIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  contentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  contentLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.3,
    flex: 1,
  },
  contentCountBadge: {
    minWidth: 28,
    paddingHorizontal: 6,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.gray600,
    letterSpacing: -0.2,
  },
  contentSub: {
    fontSize: 12,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  contentActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  contentActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm + 2,
  },
  contentActionDivider: {
    width: 1,
    backgroundColor: COLORS.gray100,
  },
  contentActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: INK,
    marginLeft: 6,
    letterSpacing: 0.1,
  },

  /* Management card */
  mgmtCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  mgmtIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  mgmtLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  mgmtSub: {
    fontSize: 12,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  mgmtBadge: {
    minWidth: 24,
    paddingHorizontal: 6,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  mgmtBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.gray600,
    letterSpacing: -0.2,
  },
});
