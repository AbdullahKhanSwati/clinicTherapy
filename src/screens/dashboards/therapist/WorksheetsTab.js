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
import { WORKSHEET_TEMPLATES } from '../../../data/worksheetTemplates';

const INK = '#1A2332';
const ACCENT = COLORS.primary;

// Each module groups content/data by audience type.
// Couples gets extra modules (program tracking + couple management) because
// the spec calls for it.
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
    label: 'Family',
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

export default function TherapistContentTab() {
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    child: 0,
    teen: 0,
    couples: 0,
    family: 0,
    all: 0,
  });
  const [coupleStats, setCoupleStats] = useState({
    pairings: 0,
    activeCheckinsThisWeek: 0,
    openRepairs: 0,
  });
  const [totalCustom, setTotalCustom] = useState(0);

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
          ] = await Promise.all([
            dataStore.getAffirmations(),
            dataStore.getCopingTools(),
            dataStore.getResources(),
            dataStore.getDateIdeas(),
            dataStore.getCustomWorksheets(),
            dataStore.getCouplePairings(),
            dataStore.getPartnerCheckins(),
            dataStore.getRepairRequests(),
          ]);
          if (cancelled) return;

          const allWorksheets = [
            ...Object.values(WORKSHEET_TEMPLATES),
            ...(customWorksheets || []),
          ];

          const countFor = (aud) => {
            const ws = allWorksheets.filter((w) => w.targetAudience === aud).length;
            const af = (affirmations || []).filter(
              (a) => a.audience === aud || a.audience === 'all'
            ).length;
            const ct = (copingTools || []).filter(
              (a) => a.audience === aud || a.audience === 'all'
            ).length;
            const rs = (resources || []).filter(
              (a) => a.audience === aud || a.audience === 'all'
            ).length;
            const di = aud === 'couples' ? (dateIdeas || []).length : 0;
            return ws + af + ct + rs + di;
          };

          setStats({
            child: countFor('child'),
            teen: countFor('teen'),
            couples: countFor('couples'),
            family: countFor('family'),
            all:
              allWorksheets.length +
              (affirmations || []).length +
              (copingTools || []).length +
              (resources || []).length +
              (dateIdeas || []).length,
          });

          // Couples-specific stats
          const now = Date.now();
          const oneWeek = 7 * 86400000;
          const recentCheckins = (checkins || []).filter(
            (c) => now - new Date(c.date).getTime() < oneWeek
          ).length;
          setCoupleStats({
            pairings: (pairings || []).filter((p) => p.status === 'active')
              .length,
            activeCheckinsThisWeek: recentCheckins,
            openRepairs: (repairs || []).filter((r) => r.status === 'sent')
              .length,
          });

          setTotalCustom((customWorksheets || []).length);
        } catch (e) {
          console.log('[Therapist ContentTab] load error', e);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  // Use plain navigation.navigate() — React Navigation v7 automatically
  // bubbles the action up through the Tab → Drawer → Root hierarchy to find
  // ModuleHub / AssignWorksheet in the TherapistRoot stack.
  const openModule = (mod) => {
    navigation.navigate('ModuleHub', { moduleId: mod.id });
  };

  const openAssign = () => {
    navigation.navigate('AssignWorksheet', { worksheetId: null });
  };

  const grandTotal =
    stats.child + stats.teen + stats.couples + stats.family + stats.all;

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
        {/* Snapshot */}
        <View style={styles.snapshotCard}>
          <Text style={styles.snapshotLabel}>LIBRARY SNAPSHOT</Text>
          <View style={styles.snapshotRow}>
            <View style={styles.snapshotItem}>
              <Text style={styles.snapshotValue}>{stats.all}</Text>
              <Text style={styles.snapshotItemLabel}>TOTAL ITEMS</Text>
            </View>
            <View style={styles.snapshotDivider} />
            <View style={styles.snapshotItem}>
              <Text style={styles.snapshotValue}>{totalCustom}</Text>
              <Text style={styles.snapshotItemLabel}>CUSTOM</Text>
            </View>
            <View style={styles.snapshotDivider} />
            <View style={styles.snapshotItem}>
              <Text style={styles.snapshotValue}>{coupleStats.pairings}</Text>
              <Text style={styles.snapshotItemLabel}>COUPLES</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>SELECT A MODULE</Text>
        <Text style={styles.sectionDescription}>
          Each module groups the worksheets, affirmations, coping tools, resources
          and (for couples) sync data for that audience.
        </Text>

        {MODULES.map((mod) => (
          <TouchableOpacity
            key={mod.id}
            style={styles.moduleCard}
            onPress={() => openModule(mod)}
            activeOpacity={0.9}
          >
            <View
              style={[
                styles.moduleIcon,
                { backgroundColor: mod.accent + '15' },
              ]}
            >
              <Feather name={mod.icon} size={22} color={mod.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.moduleTopRow}>
                <Text style={styles.moduleLabel}>{mod.label}</Text>
                <View style={styles.moduleCountBadge}>
                  <Text style={styles.moduleCountText}>
                    {stats[mod.audience] || 0}
                  </Text>
                </View>
              </View>
              <Text style={styles.moduleSub}>{mod.sub}</Text>
              {mod.id === 'couples' && (
                <View style={styles.moduleExtras}>
                  <Text style={styles.moduleExtrasText}>
                    {coupleStats.pairings} active pairings · {coupleStats.openRepairs} open repairs · {coupleStats.activeCheckinsThisWeek} check-ins this week
                  </Text>
                </View>
              )}
            </View>
            <Feather name="chevron-right" size={20} color={COLORS.gray400} />
          </TouchableOpacity>
        ))}

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
  snapshotItem: { flex: 1 },
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

  /* Module cards */
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  moduleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  moduleTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  moduleLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.3,
    flex: 1,
  },
  moduleCountBadge: {
    minWidth: 32,
    paddingHorizontal: 6,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.gray600,
    letterSpacing: -0.2,
  },
  moduleSub: {
    fontSize: 12,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  moduleExtras: {
    marginTop: 4,
  },
  moduleExtrasText: {
    fontSize: 11,
    color: COLORS.gray500,
    fontStyle: 'italic',
  },
});
