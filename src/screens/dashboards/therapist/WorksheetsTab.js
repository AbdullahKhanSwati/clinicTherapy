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
import { Feather } from '@expo/vector-icons';
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
} from '../../../constants/colors';
import {
  listAffirmations,
  listCopingTools,
  listResources,
  listDateIdeas,
  listWorksheets,
  listCouplePairings,
  listPartnerCheckins,
  listRepairRequests,
  listAllProfiles,
} from '../../../services/api';

const INK = '#1A2332';
const ACCENT = COLORS.primary;
const SUCCESS = '#15803D';
const DANGER = '#DC2626';

// Each module groups content/data by audience.
const MODULES = [
  {
    id: 'children',
    audience: 'child',
    label: 'Children',
    sub: 'Ages 6-12 · Play-based therapy',
    icon: 'smile',
    accent: '#9333EA',
  },
  {
    id: 'teens',
    audience: 'teen',
    label: 'Teens',
    sub: 'Ages 13-18 · Reflective practice',
    icon: 'user',
    accent: '#0891B2',
  },
  {
    id: 'couples',
    audience: 'couples',
    label: 'Couples',
    sub: 'Partner sync · Gottman & psychodynamic',
    icon: 'heart',
    accent: '#D4536B',
  },
  {
    id: 'family',
    audience: 'family',
    label: 'Family / Parents',
    sub: 'Family-level interventions',
    icon: 'users',
    accent: '#15803D',
  },
  {
    id: 'general',
    audience: 'all',
    label: 'General Library',
    sub: 'Cross-audience content',
    icon: 'layers',
    accent: COLORS.gray600,
  },
];

const ZERO_STATS = {
  users: 0,
  worksheets: 0,
  affirmations: 0,
  copingTools: 0,
  resources: 0,
  dateIdeas: 0,
};

export default function TherapistContentTab() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [moduleStats, setModuleStats] = useState({
    child: { ...ZERO_STATS },
    teen: { ...ZERO_STATS },
    couples: { ...ZERO_STATS },
    family: { ...ZERO_STATS },
    all: { ...ZERO_STATS },
  });
  const [coupleStats, setCoupleStats] = useState({
    activePairings: 0,
    checkinsThisWeek: 0,
    openRepairs: 0,
  });
  const [totals, setTotals] = useState({
    worksheets: 0,
    affirmations: 0,
    copingTools: 0,
    resources: 0,
    dateIdeas: 0,
    users: 0,
  });

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          setLoading(true);
          const [
            profiles,
            worksheets,
            affirmations,
            copingTools,
            resources,
            dateIdeas,
            pairings,
            checkins,
            repairs,
          ] = await Promise.all([
            listAllProfiles(),
            listWorksheets(),
            listAffirmations(),
            listCopingTools(),
            listResources(),
            listDateIdeas(),
            listCouplePairings(),
            listPartnerCheckins(),
            listRepairRequests(),
          ]);
          if (cancelled) return;

          // Map audience to role for user counts. 'family' role users are
          // parents; teens/children are their own roles. 'general' has no
          // role mapping — instead shows total non-clinician users.
          const usersByRole = {
            child: (profiles || []).filter((p) => p.role === 'child').length,
            teen: (profiles || []).filter((p) => p.role === 'teen').length,
            couples: (profiles || []).filter((p) => p.role === 'couples').length,
            family: (profiles || []).filter((p) => p.role === 'family').length,
            all: (profiles || []).filter(
              (p) => p.role !== 'therapist' && p.role !== 'admin'
            ).length,
          };

          // Unified rule (matches ModuleHubScreen): an item belongs to a
          // module if its audience strictly equals that module's audience.
          // 'all'-tagged content only appears under the General Library.
          const matches = (item, aud) => {
            const a = item.audience || item.targetAudience;
            return aud === 'all' ? true : a === aud;
          };

          const buildStats = (aud) => ({
            users: usersByRole[aud] || 0,
            worksheets: (worksheets || []).filter((w) => matches(w, aud)).length,
            affirmations: (affirmations || []).filter((a) => matches(a, aud))
              .length,
            copingTools: (copingTools || []).filter((c) => matches(c, aud))
              .length,
            resources: (resources || []).filter((r) => matches(r, aud)).length,
            // Date ideas are couples-only content — only count them under the
            // Couples module.
            dateIdeas: aud === 'couples' ? (dateIdeas || []).length : 0,
          });

          setModuleStats({
            child: buildStats('child'),
            teen: buildStats('teen'),
            couples: buildStats('couples'),
            family: buildStats('family'),
            all: buildStats('all'),
          });

          setTotals({
            users: usersByRole.all,
            worksheets: (worksheets || []).length,
            affirmations: (affirmations || []).length,
            copingTools: (copingTools || []).length,
            resources: (resources || []).length,
            dateIdeas: (dateIdeas || []).length,
          });

          const now = Date.now();
          const oneWeek = 7 * 86400000;
          setCoupleStats({
            activePairings: (pairings || []).filter((p) => p.status === 'active')
              .length,
            checkinsThisWeek: (checkins || []).filter(
              (c) => c.date && now - new Date(c.date).getTime() < oneWeek
            ).length,
            openRepairs: (repairs || []).filter((r) => r.status === 'sent').length,
          });
        } catch (e) {
          console.log('[Therapist ContentTab] load error', e);
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
  const openModule = (mod) => navigation.navigate('ModuleHub', { moduleId: mod.id });
  const openAssign = () => navigation.navigate('AssignWorksheet', { worksheetId: null });

  const grandLibraryItems =
    totals.worksheets +
    totals.affirmations +
    totals.copingTools +
    totals.resources +
    totals.dateIdeas;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.iconBtn} onPress={openDrawer}>
          <Feather name="menu" size={20} color={INK} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: SPACING.md }}>
          <Text style={styles.eyebrow}>CONTENT MODULES</Text>
          <Text style={styles.headerTitle}>Content</Text>
        </View>
        <TouchableOpacity
          style={styles.assignBtn}
          onPress={openAssign}
          activeOpacity={0.85}
        >
          <Feather name="send" size={14} color={COLORS.white} />
          <Text style={styles.assignBtnText}>Assign</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Library snapshot */}
        <View style={styles.snapshotCard}>
          <Text style={styles.snapshotLabel}>LIBRARY SNAPSHOT</Text>
          <View style={styles.snapshotRow}>
            <View style={styles.snapshotItem}>
              <Text style={styles.snapshotValue}>{totals.users}</Text>
              <Text style={styles.snapshotItemLabel}>USERS</Text>
            </View>
            <View style={styles.snapshotDivider} />
            <View style={styles.snapshotItem}>
              <Text style={styles.snapshotValue}>{grandLibraryItems}</Text>
              <Text style={styles.snapshotItemLabel}>CONTENT</Text>
            </View>
            <View style={styles.snapshotDivider} />
            <View style={styles.snapshotItem}>
              <Text style={styles.snapshotValue}>
                {coupleStats.activePairings}
              </Text>
              <Text style={styles.snapshotItemLabel}>COUPLES</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>SELECT A MODULE</Text>
        <Text style={styles.sectionDescription}>
          Tap a module to view and manage its worksheets, affirmations, coping
          tools, resources and (for couples) date ideas + sync data.
        </Text>

        {loading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator color={INK} />
          </View>
        ) : (
          MODULES.map((mod) => {
            const s = moduleStats[mod.audience] || ZERO_STATS;
            const totalItems =
              s.worksheets +
              s.affirmations +
              s.copingTools +
              s.resources +
              s.dateIdeas;

            return (
              <TouchableOpacity
                key={mod.id}
                style={[styles.moduleCard, { borderLeftColor: mod.accent }]}
                onPress={() => openModule(mod)}
                activeOpacity={0.9}
              >
                <View style={styles.moduleHeaderRow}>
                  <View
                    style={[
                      styles.moduleIcon,
                      { backgroundColor: mod.accent + '15' },
                    ]}
                  >
                    <Feather name={mod.icon} size={20} color={mod.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.moduleTopRow}>
                      <Text style={styles.moduleLabel}>{mod.label}</Text>
                      <View
                        style={[
                          styles.totalPill,
                          { backgroundColor: mod.accent + '15' },
                        ]}
                      >
                        <Text style={[styles.totalPillText, { color: mod.accent }]}>
                          {totalItems} items
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.moduleSub}>
                      {mod.audience !== 'all' && (
                        <Text style={styles.moduleUserCount}>
                          {s.users} {mod.audience === 'family' ? 'parent' : mod.audience}
                          {s.users === 1 ? '' : 's'} · {' '}
                        </Text>
                      )}
                      {mod.sub}
                    </Text>
                  </View>
                </View>

                {/* Per-content-type breakdown */}
                <View style={styles.statsGrid}>
                  <StatCell
                    label="Worksheets"
                    value={s.worksheets}
                    icon="file-text"
                    accent={mod.accent}
                  />
                  <View style={styles.statDivider} />
                  <StatCell
                    label="Affirmations"
                    value={s.affirmations}
                    icon="message-circle"
                    accent={mod.accent}
                  />
                  <View style={styles.statDivider} />
                  <StatCell
                    label="Coping"
                    value={s.copingTools}
                    icon="shield"
                    accent={mod.accent}
                  />
                  <View style={styles.statDivider} />
                  <StatCell
                    label="Resources"
                    value={s.resources}
                    icon="book-open"
                    accent={mod.accent}
                  />
                  {mod.audience === 'couples' && (
                    <>
                      <View style={styles.statDivider} />
                      <StatCell
                        label="Dates"
                        value={s.dateIdeas}
                        icon="star"
                        accent={mod.accent}
                      />
                    </>
                  )}
                </View>

                {/* Couples-only sync metrics */}
                {mod.id === 'couples' && (
                  <View style={styles.couplesFooter}>
                    <View style={styles.couplesFooterItem}>
                      <View
                        style={[styles.couplesDot, { backgroundColor: SUCCESS }]}
                      />
                      <Text style={styles.couplesFooterText}>
                        {coupleStats.activePairings} active pairing
                        {coupleStats.activePairings === 1 ? '' : 's'}
                      </Text>
                    </View>
                    <View style={styles.couplesFooterItem}>
                      <View style={[styles.couplesDot, { backgroundColor: INK }]} />
                      <Text style={styles.couplesFooterText}>
                        {coupleStats.checkinsThisWeek} check-in
                        {coupleStats.checkinsThisWeek === 1 ? '' : 's'} this week
                      </Text>
                    </View>
                    <View style={styles.couplesFooterItem}>
                      <View
                        style={[
                          styles.couplesDot,
                          {
                            backgroundColor:
                              coupleStats.openRepairs > 0 ? DANGER : COLORS.gray400,
                          },
                        ]}
                      />
                      <Text style={styles.couplesFooterText}>
                        {coupleStats.openRepairs} open repair
                        {coupleStats.openRepairs === 1 ? '' : 's'}
                      </Text>
                    </View>
                  </View>
                )}

                <View style={styles.openHintRow}>
                  <Text style={[styles.openHintText, { color: mod.accent }]}>
                    Open module
                  </Text>
                  <Feather name="chevron-right" size={16} color={mod.accent} />
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const StatCell = ({ label, value, icon, accent }) => (
  <View style={styles.statCell}>
    <Feather name={icon} size={13} color={accent} style={{ marginBottom: 4 }} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

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
  assignBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INK,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  assignBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
    letterSpacing: 0.2,
  },

  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
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
  snapshotRow: { flexDirection: 'row' },
  snapshotItem: { flex: 1, alignItems: 'center' },
  snapshotValue: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -1,
  },
  snapshotItemLabel: {
    fontSize: 9,
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

  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 12,
    color: COLORS.gray500,
    lineHeight: 17,
    marginBottom: SPACING.lg,
  },

  loadingBlock: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },

  /* Module cards */
  moduleCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    borderLeftWidth: 3,
  },
  moduleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  moduleIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  moduleTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  moduleLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.3,
    flex: 1,
  },
  totalPill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  totalPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  moduleSub: {
    fontSize: 12,
    color: COLORS.gray500,
    fontWeight: '500',
    lineHeight: 17,
  },
  moduleUserCount: {
    fontWeight: '700',
    color: INK,
    textTransform: 'capitalize',
  },

  /* Stats grid */
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.sm,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 0.4,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.gray100,
    marginVertical: 4,
  },

  /* Couples footer */
  couplesFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
  },
  couplesFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
    marginTop: 4,
  },
  couplesDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  couplesFooterText: {
    fontSize: 11,
    color: COLORS.gray600,
    fontWeight: '500',
  },

  openHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: SPACING.sm,
  },
  openHintText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginRight: 2,
  },
});
