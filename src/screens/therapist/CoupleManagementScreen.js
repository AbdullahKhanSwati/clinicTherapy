import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
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
import {
  listAllProfiles,
  listCouplePairings,
  listPartnerCheckins,
  listRepairRequests,
  listSharedGoals,
} from '../../services/api';

const INK = '#1A2332';
const BLUSH = '#D4536B';
const SUCCESS = '#15803D';
const WARNING = '#D97706';
const DANGER = '#DC2626';

const TABS = [
  { id: 'pairings', label: 'Pairings' },
  { id: 'checkins', label: 'Check-ins' },
  { id: 'repairs', label: 'Repairs' },
  { id: 'goals', label: 'Goals' },
];

/**
 * CoupleManagementScreen — clinician's overview of all couples.
 *
 * Sub-tabs: Pairings · Check-ins · Repair requests · Shared goals.
 * Each couple row shows live stats and links to the per-couple detail.
 */
export default function CoupleManagementScreen({ route, navigation }) {
  const initialSection = route?.params?.section || 'pairings';
  const [activeTab, setActiveTab] = useState(initialSection);

  const [pairings, setPairings] = useState([]);
  const [users, setUsers] = useState({});
  const [checkins, setCheckins] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [allProfiles, allPairings, allCheckins, allRepairs, allGoals] =
        await Promise.all([
          listAllProfiles(),
          listCouplePairings(),
          listPartnerCheckins(),
          listRepairRequests(),
          listSharedGoals(),
        ]);
      // listAllProfiles returns an array — build a lookup map keyed by id so
      // the rest of the screen (which does users[p.partnerAId]) keeps working.
      const userMap = Object.fromEntries(
        (allProfiles || []).map((p) => [p.id, p])
      );
      setUsers(userMap);
      setPairings(allPairings || []);
      setCheckins(allCheckins || []);
      setRepairs(allRepairs || []);
      setGoals(allGoals || []);
    } catch (e) {
      console.log('[CoupleManagement] load', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Build per-couple enrichment
  const enriched = useMemo(() => {
    return pairings.map((p) => {
      const a = users[p.partnerAId];
      const b = users[p.partnerBId];
      const memberIds = [p.partnerAId, p.partnerBId].filter(Boolean);
      const coupleCheckins = checkins.filter((c) =>
        memberIds.includes(c.userId)
      );
      const coupleRepairs = repairs.filter(
        (r) =>
          memberIds.includes(r.fromUserId) || memberIds.includes(r.toUserId)
      );
      const coupleGoals = goals.filter((g) => g.pairingId === p.id);

      const now = Date.now();
      const oneWeek = 7 * 86400000;
      const checkinsThisWeek = coupleCheckins.filter(
        (c) => now - new Date(c.date).getTime() < oneWeek
      ).length;
      const openRepairs = coupleRepairs.filter((r) => r.status === 'sent')
        .length;

      // Avg connection across both partners' last 7 days
      const recentConn = coupleCheckins
        .filter((c) => now - new Date(c.date).getTime() < oneWeek)
        .map((c) => c.connection)
        .filter(Boolean);
      const avgConnection =
        recentConn.length > 0
          ? Math.round(
              (recentConn.reduce((s, v) => s + v, 0) / recentConn.length) * 10
            ) / 10
          : null;

      return {
        ...p,
        partnerA: a,
        partnerB: b,
        checkins: coupleCheckins,
        repairs: coupleRepairs,
        goals: coupleGoals,
        checkinsThisWeek,
        openRepairs,
        avgConnection,
      };
    });
  }, [pairings, users, checkins, repairs, goals]);

  const activePairings = enriched.filter((p) => p.status === 'active');

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
          <Text style={styles.eyebrow}>COUPLES MODULE</Text>
          <Text style={styles.headerTitle}>Couple Management</Text>
        </View>
      </View>

      {/* Sub-tab bar */}
      <View style={styles.tabBar}>
        {TABS.map((t) => {
          const active = activeTab === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              style={[styles.tabBtn, active && styles.tabBtnActive]}
              onPress={() => setActiveTab(t.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.tabLabel, active && styles.tabLabelActive]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator color={INK} />
          </View>
        ) : activeTab === 'pairings' ? (
          <PairingsView
            couples={enriched}
            onOpen={(c) =>
              navigation.navigate('CoupleDetail', { pairingId: c.id })
            }
          />
        ) : activeTab === 'checkins' ? (
          <CheckinsView couples={activePairings} />
        ) : activeTab === 'repairs' ? (
          <RepairsView couples={activePairings} />
        ) : (
          <GoalsView
            couples={activePairings}
            onAdd={(c) =>
              navigation.navigate('CoupleSharedGoals', { pairingId: c.id })
            }
          />
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ===== PAIRINGS SECTION =====
const PairingsView = ({ couples, onOpen }) => {
  if (couples.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Feather name="link" size={32} color={COLORS.gray300} />
        <Text style={styles.emptyTitle}>No couples paired yet</Text>
        <Text style={styles.emptyText}>
          Pairings appear here when both partners are linked in the app.
        </Text>
      </View>
    );
  }

  return (
    <>
      <Text style={styles.sectionHint}>
        {couples.length} couple{couples.length === 1 ? '' : 's'} on your caseload
      </Text>
      {couples.map((c) => {
        const aName = c.partnerA?.name?.split(' ')[0] || 'Partner A';
        const bName = c.partnerB?.name?.split(' ')[0] || 'Partner B';
        const isActive = c.status === 'active';
        return (
          <TouchableOpacity
            key={c.id}
            style={styles.coupleCard}
            onPress={() => onOpen(c)}
            activeOpacity={0.9}
          >
            <View style={styles.coupleTop}>
              <View style={styles.dualAvatars}>
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor:
                        c.partnerA?.profileColor || COLORS.primary,
                    },
                  ]}
                >
                  <Text style={styles.avatarEmoji}>
                    {c.partnerA?.avatar || '👤'}
                  </Text>
                </View>
                <Text style={styles.amp}>&</Text>
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: c.partnerB?.profileColor || BLUSH,
                    },
                  ]}
                >
                  <Text style={styles.avatarEmoji}>
                    {c.partnerB?.avatar || '👤'}
                  </Text>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.coupleNames}>
                  {aName} <Text style={styles.coupleAmp}>&</Text> {bName}
                </Text>
                <View
                  style={[
                    styles.statusPill,
                    isActive
                      ? { backgroundColor: SUCCESS + '15' }
                      : { backgroundColor: COLORS.gray100 },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      isActive
                        ? { backgroundColor: SUCCESS }
                        : { backgroundColor: COLORS.gray400 },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      isActive
                        ? { color: SUCCESS }
                        : { color: COLORS.gray500 },
                    ]}
                  >
                    {(c.status || 'pending').toUpperCase()}
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color={COLORS.gray400} />
            </View>

            {isActive && (
              <View style={styles.coupleStats}>
                <Stat label="CHECK-INS / WK" value={c.checkinsThisWeek} />
                <View style={styles.statDivider} />
                <Stat
                  label="OPEN REPAIRS"
                  value={c.openRepairs}
                  highlight={c.openRepairs > 0 ? DANGER : null}
                />
                <View style={styles.statDivider} />
                <Stat label="GOALS" value={c.goals.length} />
                <View style={styles.statDivider} />
                <Stat
                  label="CONNECTION"
                  value={c.avgConnection ? `${c.avgConnection}/10` : '—'}
                />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </>
  );
};

// ===== CHECKINS SECTION =====
const CheckinsView = ({ couples }) => {
  // Flatten and sort all check-ins by date
  const allCheckins = useMemo(() => {
    const list = [];
    couples.forEach((c) => {
      c.checkins.forEach((ci) => {
        const author =
          ci.userId === c.partnerA?.id
            ? c.partnerA?.name?.split(' ')[0]
            : c.partnerB?.name?.split(' ')[0];
        list.push({ ...ci, couple: c, authorName: author });
      });
    });
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [couples]);

  if (allCheckins.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Feather name="activity" size={32} color={COLORS.gray300} />
        <Text style={styles.emptyTitle}>No check-ins yet</Text>
        <Text style={styles.emptyText}>
          When partners submit a daily check-in, you'll see it here.
        </Text>
      </View>
    );
  }

  return (
    <>
      <Text style={styles.sectionHint}>
        {allCheckins.length} check-in{allCheckins.length === 1 ? '' : 's'} across
        all couples
      </Text>
      {allCheckins.slice(0, 50).map((c) => (
        <View key={c.id} style={styles.checkinCard}>
          <View style={styles.checkinHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.checkinAuthor}>
                {c.authorName || 'Partner'}
              </Text>
              <Text style={styles.checkinMeta}>
                {c.couple.partnerA?.name?.split(' ')[0]} &{' '}
                {c.couple.partnerB?.name?.split(' ')[0]} ·{' '}
                {formatTimeAgo(c.date)}
              </Text>
            </View>
          </View>
          <View style={styles.checkinStats}>
            <Stat label="MOOD" value={c.mood} />
            <View style={styles.statDivider} />
            <Stat label="CONNECTION" value={c.connection} />
            <View style={styles.statDivider} />
            <Stat label="STRESS" value={c.stress} />
          </View>
          {c.need ? (
            <View style={styles.checkinNote}>
              <Text style={styles.checkinNoteLabel}>NEED</Text>
              <Text style={styles.checkinNoteText}>"{c.need}"</Text>
            </View>
          ) : null}
        </View>
      ))}
    </>
  );
};

// ===== REPAIRS SECTION =====
const RepairsView = ({ couples }) => {
  const allRepairs = useMemo(() => {
    const list = [];
    couples.forEach((c) => {
      c.repairs.forEach((r) => {
        const from =
          r.fromUserId === c.partnerA?.id
            ? c.partnerA?.name?.split(' ')[0]
            : c.partnerB?.name?.split(' ')[0];
        const to =
          r.toUserId === c.partnerA?.id
            ? c.partnerA?.name?.split(' ')[0]
            : c.partnerB?.name?.split(' ')[0];
        list.push({ ...r, couple: c, fromName: from, toName: to });
      });
    });
    return list.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
  }, [couples]);

  if (allRepairs.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Feather name="rotate-ccw" size={32} color={COLORS.gray300} />
        <Text style={styles.emptyTitle}>No repair activity yet</Text>
        <Text style={styles.emptyText}>
          Repair requests between partners appear here once they begin using the
          feature.
        </Text>
      </View>
    );
  }

  return (
    <>
      <Text style={styles.sectionHint}>
        {allRepairs.length} repair request{allRepairs.length === 1 ? '' : 's'}
      </Text>
      {allRepairs.map((r) => {
        const isOpen = r.status === 'sent';
        return (
          <View
            key={r.id}
            style={[
              styles.repairCard,
              isOpen && { borderLeftColor: DANGER, borderLeftWidth: 3 },
            ]}
          >
            <View style={styles.repairHeader}>
              <Text style={styles.repairFrom}>
                {r.fromName} → {r.toName}
              </Text>
              <View
                style={[
                  styles.statusPill,
                  isOpen
                    ? { backgroundColor: DANGER + '15' }
                    : { backgroundColor: SUCCESS + '15' },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    isOpen ? { color: DANGER } : { color: SUCCESS },
                  ]}
                >
                  {isOpen ? 'OPEN' : 'ACKNOWLEDGED'}
                </Text>
              </View>
            </View>
            <Text style={styles.repairMessage}>"{r.message}"</Text>
            {r.response ? (
              <View style={styles.repairResponse}>
                <Text style={styles.repairResponseLabel}>REPLY</Text>
                <Text style={styles.repairResponseText}>"{r.response}"</Text>
              </View>
            ) : null}
            <Text style={styles.repairDate}>
              {formatTimeAgo(r.sentAt)} ·{' '}
              {r.couple.partnerA?.name?.split(' ')[0]} &{' '}
              {r.couple.partnerB?.name?.split(' ')[0]}
            </Text>
          </View>
        );
      })}
    </>
  );
};

// ===== GOALS SECTION =====
const GoalsView = ({ couples, onAdd }) => {
  if (couples.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Feather name="target" size={32} color={COLORS.gray300} />
        <Text style={styles.emptyTitle}>No couples paired yet</Text>
      </View>
    );
  }

  return (
    <>
      <Text style={styles.sectionHint}>
        Shared goals per couple. Tap a couple to manage their goals.
      </Text>
      {couples.map((c) => (
        <TouchableOpacity
          key={c.id}
          style={styles.goalCoupleCard}
          onPress={() => onAdd(c)}
          activeOpacity={0.9}
        >
          <View style={styles.goalCoupleHeader}>
            <View style={styles.dualAvatars}>
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor:
                      c.partnerA?.profileColor || COLORS.primary,
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                  },
                ]}
              >
                <Text style={[styles.avatarEmoji, { fontSize: 18 }]}>
                  {c.partnerA?.avatar || '👤'}
                </Text>
              </View>
              <Text style={[styles.amp, { fontSize: 22 }]}>&</Text>
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor: c.partnerB?.profileColor || BLUSH,
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                  },
                ]}
              >
                <Text style={[styles.avatarEmoji, { fontSize: 18 }]}>
                  {c.partnerB?.avatar || '👤'}
                </Text>
              </View>
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.sm }}>
              <Text style={styles.goalCoupleNames}>
                {c.partnerA?.name?.split(' ')[0]} &{' '}
                {c.partnerB?.name?.split(' ')[0]}
              </Text>
              <Text style={styles.goalCoupleMeta}>
                {c.goals.length} active goal{c.goals.length === 1 ? '' : 's'}
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={COLORS.gray400} />
          </View>
          {c.goals.length > 0 && (
            <View style={styles.goalList}>
              {c.goals.slice(0, 2).map((g) => (
                <View key={g.id} style={styles.goalRow}>
                  <Text style={styles.goalTitle} numberOfLines={1}>
                    {g.title}
                  </Text>
                  <Text style={styles.goalProgress}>{g.progress}%</Text>
                </View>
              ))}
              {c.goals.length > 2 && (
                <Text style={styles.goalMore}>
                  +{c.goals.length - 2} more
                </Text>
              )}
            </View>
          )}
        </TouchableOpacity>
      ))}
    </>
  );
};

const Stat = ({ label, value, highlight }) => (
  <View style={styles.statItem}>
    <Text
      style={[
        styles.statValue,
        highlight && { color: highlight },
      ]}
    >
      {value}
    </Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const formatTimeAgo = (iso) => {
  const ms = Date.now() - new Date(iso).getTime();
  const hours = Math.round(ms / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

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
    color: BLUSH,
    letterSpacing: 1.4,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.5,
  },

  /* Sub-tab bar */
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
    marginBottom: SPACING.md,
  },
  tabBtn: {
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.sm,
    marginRight: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tabBtnActive: {
    borderBottomColor: INK,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray500,
  },
  tabLabelActive: { color: INK, fontWeight: '800' },

  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },

  sectionHint: {
    fontSize: 12,
    color: COLORS.gray500,
    marginBottom: SPACING.md,
    fontWeight: '500',
  },

  loadingBlock: { padding: SPACING.xl, alignItems: 'center' },

  /* Empty */
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: INK,
    marginTop: SPACING.md,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 17,
  },

  /* Couple card */
  coupleCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  coupleTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dualAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: { fontSize: 22 },
  amp: {
    fontSize: 22,
    fontWeight: '300',
    color: COLORS.gray400,
    fontStyle: 'italic',
    marginHorizontal: SPACING.sm,
  },
  coupleNames: {
    fontSize: 15,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  coupleAmp: {
    fontWeight: '300',
    fontStyle: 'italic',
    color: COLORS.gray500,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  coupleStats: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.4,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 0.8,
    marginTop: 2,
  },
  statDivider: { width: 1, backgroundColor: COLORS.gray100, marginVertical: 2 },

  /* Check-ins */
  checkinCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  checkinHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  checkinAuthor: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
    marginBottom: 2,
  },
  checkinMeta: { fontSize: 11, color: COLORS.gray500, fontWeight: '500' },
  checkinStats: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  checkinNote: {
    backgroundColor: COLORS.gray50,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  checkinNoteLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.gray500,
    letterSpacing: 1,
    marginBottom: 4,
  },
  checkinNoteText: {
    fontSize: 12,
    color: INK,
    fontStyle: 'italic',
    lineHeight: 17,
  },

  /* Repairs */
  repairCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  repairHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  repairFrom: {
    fontSize: 13,
    fontWeight: '800',
    color: INK,
  },
  repairMessage: {
    fontSize: 13,
    color: INK,
    fontStyle: 'italic',
    lineHeight: 19,
    marginBottom: SPACING.sm,
  },
  repairResponse: {
    backgroundColor: COLORS.gray50,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  repairResponseLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.gray500,
    letterSpacing: 1,
    marginBottom: 4,
  },
  repairResponseText: {
    fontSize: 12,
    color: INK,
    fontStyle: 'italic',
    lineHeight: 17,
  },
  repairDate: { fontSize: 11, color: COLORS.gray500, fontWeight: '500' },

  /* Goals */
  goalCoupleCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  goalCoupleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalCoupleNames: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.2,
  },
  goalCoupleMeta: {
    fontSize: 12,
    color: COLORS.gray500,
    fontWeight: '500',
    marginTop: 2,
  },
  goalList: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  goalTitle: { fontSize: 13, color: INK, fontWeight: '500', flex: 1 },
  goalProgress: {
    fontSize: 13,
    color: SUCCESS,
    fontWeight: '800',
    marginLeft: SPACING.sm,
  },
  goalMore: {
    fontSize: 11,
    color: COLORS.gray500,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
