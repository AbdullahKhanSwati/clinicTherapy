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
  listCouplePairings,
  getProfileById,
  listPartnerCheckins,
  listRepairRequests,
  listSharedGoals,
  listAssignmentsFor,
  listWorksheets,
} from '../../services/api';

const INK = '#1A2332';
const BLUSH = '#D4536B';
const SUCCESS = '#15803D';
const DANGER = '#DC2626';

/**
 * CoupleDetailScreen — clinician's deep view into a single couple.
 *
 * Sections:
 *   - Hero with dual avatars + status
 *   - Practice metrics
 *   - Gottman 12-week program progress
 *   - Psychodynamic suite progress
 *   - Recent check-ins (both partners)
 *   - Repair activity timeline
 *   - Shared goals
 */
export default function CoupleDetailScreen({ route, navigation }) {
  const { pairingId } = route?.params || {};
  const [pairing, setPairing] = useState(null);
  const [partnerA, setPartnerA] = useState(null);
  const [partnerB, setPartnerB] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [goals, setGoals] = useState([]);
  const [assignmentsA, setAssignmentsA] = useState([]);
  const [assignmentsB, setAssignmentsB] = useState([]);
  const [completedA, setCompletedA] = useState([]);
  const [completedB, setCompletedB] = useState([]);
  const [allWorksheets, setAllWorksheets] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const allPairings = await listCouplePairings();
      const p = allPairings.find((x) => x.id === pairingId);
      if (!p) {
        setLoading(false);
        return;
      }
      setPairing(p);

      const [a, b, allCheckins, allRepairs, allGoals, allWS] = await Promise.all([
        getProfileById(p.partnerAId),
        p.partnerBId ? getProfileById(p.partnerBId) : null,
        listPartnerCheckins(),
        listRepairRequests(),
        listSharedGoals(p.id),
        listWorksheets(),
      ]);
      setAllWorksheets(allWS || []);
      setPartnerA(a);
      setPartnerB(b);

      const memberIds = [p.partnerAId, p.partnerBId].filter(Boolean);
      setCheckins(
        (allCheckins || [])
          .filter((c) => memberIds.includes(c.userId))
          .sort((x, y) => new Date(y.date) - new Date(x.date))
      );
      setRepairs(
        (allRepairs || [])
          .filter(
            (r) =>
              memberIds.includes(r.fromUserId) ||
              memberIds.includes(r.toUserId)
          )
          .sort((x, y) => new Date(y.sentAt) - new Date(x.sentAt))
      );
      setGoals(allGoals || []);

      // Completed worksheets are derived from each partner's assignments
      // (status === 'completed'). Shape matches the legacy format.
      const toCompleted = (assignments) =>
        (assignments || [])
          .filter((x) => x.status === 'completed')
          .map((x) => ({
            id: x.id,
            userId: x.assigneeId,
            worksheetId: x.worksheetId,
            completedDate: x.updatedAt || x.createdAt,
          }));

      if (a) {
        const aA = await listAssignmentsFor(a.id);
        setAssignmentsA(aA || []);
        setCompletedA(toCompleted(aA));
      }
      if (b) {
        const aB = await listAssignmentsFor(b.id);
        setAssignmentsB(aB || []);
        setCompletedB(toCompleted(aB));
      }
    } catch (e) {
      console.log('[CoupleDetail] load', e);
    } finally {
      setLoading(false);
    }
  }, [pairingId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Every Gottman worksheet stores its week in `content.week`. We list all
  // worksheets with programId === 'gottman_12week' and sort by that.
  const gottmanProgress = useMemo(() => {
    const gottmanSheets = (allWorksheets || [])
      .filter((w) => w.programId === 'gottman_12week')
      .sort(
        (x, y) => (x.content?.week || 0) - (y.content?.week || 0)
      );
    const completedIds = new Set([
      ...completedA.map((c) => c.worksheetId),
      ...completedB.map((c) => c.worksheetId),
    ]);
    const weeks = gottmanSheets.map((ws) => ({
      week: ws.content?.week || 0,
      title: ws.title || `Week ${ws.content?.week || ''}`,
      phase: ws.content?.phase,
      complete: completedIds.has(ws.id),
    }));
    const total = weeks.length || 12; // fall back to 12 if no sheets seeded yet
    const done = weeks.filter((w) => w.complete).length;
    return { weeks, done, total, pct: Math.round((done / total) * 100) };
  }, [allWorksheets, completedA, completedB]);

  const psydProgress = useMemo(() => {
    const psydIds = (allWorksheets || [])
      .filter((w) => w.programId === 'psychodynamic_suite')
      .map((w) => w.id);
    const completedIds = new Set([
      ...completedA.map((c) => c.worksheetId),
      ...completedB.map((c) => c.worksheetId),
    ]);
    const done = psydIds.filter((id) => completedIds.has(id)).length;
    return {
      total: psydIds.length,
      done,
      pct: psydIds.length > 0 ? Math.round((done / psydIds.length) * 100) : 0,
    };
  }, [allWorksheets, completedA, completedB]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color={INK} />
        </View>
      </SafeAreaView>
    );
  }

  if (!pairing || !partnerA) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={20} color={INK} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>Couple not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isActive = pairing.status === 'active';
  const now = Date.now();
  const oneWeek = 7 * 86400000;
  const checkinsThisWeek = checkins.filter(
    (c) => now - new Date(c.date).getTime() < oneWeek
  ).length;
  const openRepairs = repairs.filter((r) => r.status === 'sent').length;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={20} color={INK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Couple
        </Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.dualAvatars}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: partnerA?.profileColor || COLORS.primary },
              ]}
            >
              <Text style={styles.avatarEmoji}>{partnerA?.avatar || '👤'}</Text>
            </View>
            <Text style={styles.amp}>&</Text>
            <View
              style={[
                styles.avatar,
                { backgroundColor: partnerB?.profileColor || BLUSH },
              ]}
            >
              <Text style={styles.avatarEmoji}>{partnerB?.avatar || '👤'}</Text>
            </View>
          </View>
          <Text style={styles.heroNames}>
            {partnerA?.name?.split(' ')[0] || '—'}{' '}
            <Text style={styles.heroAmp}>&</Text>{' '}
            {partnerB?.name?.split(' ')[0] || '—'}
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
                isActive ? { color: SUCCESS } : { color: COLORS.gray500 },
              ]}
            >
              {(pairing.status || 'pending').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.heroMeta}>
            Paired{' '}
            {new Date(pairing.pairedAt || pairing.createdAt).toLocaleDateString(
              'en-US',
              { month: 'long', day: 'numeric', year: 'numeric' }
            )}
          </Text>
        </View>

        {/* Action row */}
        <View style={styles.actionRow}>
          <ActionBtn
            icon="send"
            label="Assign"
            onPress={() =>
              navigation.navigate('AssignWorksheet', {
                clientId: partnerA?.id,
              })
            }
          />
          <ActionBtn
            icon="target"
            label="Goals"
            onPress={() =>
              navigation.navigate('CoupleSharedGoals', {
                pairingId: pairing.id,
              })
            }
          />
          <ActionBtn
            icon="edit-3"
            label="Note"
            onPress={() =>
              navigation.navigate('AddNote', { clientId: partnerA?.id })
            }
          />
        </View>

        {/* Practice metrics */}
        <Text style={styles.sectionLabel}>PRACTICE METRICS</Text>
        <View style={styles.metricsGrid}>
          <MetricCard
            label="CHECK-INS / WEEK"
            value={checkinsThisWeek}
            accent={INK}
          />
          <MetricCard
            label="OPEN REPAIRS"
            value={openRepairs}
            accent={openRepairs > 0 ? DANGER : INK}
          />
          <MetricCard
            label="GOTTMAN PROGRESS"
            value={`${gottmanProgress.pct}%`}
            accent={SUCCESS}
          />
          <MetricCard
            label="SHARED GOALS"
            value={goals.length}
            accent={INK}
          />
        </View>

        {/* Gottman progress bar */}
        {gottmanProgress.weeks.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>GOTTMAN PROGRAM</Text>
            <View style={styles.programCard}>
              <View style={styles.programHeader}>
                <Text style={styles.programLabel}>
                  Week {gottmanProgress.done} of {gottmanProgress.total}
                </Text>
                <Text style={styles.programPct}>{gottmanProgress.pct}%</Text>
              </View>
              <View style={styles.weeksRow}>
                {gottmanProgress.weeks.map((w) => (
                  <View
                    key={w.week}
                    style={[
                      styles.weekTick,
                      w.complete && styles.weekTickDone,
                    ]}
                  />
                ))}
              </View>
            </View>
          </>
        )}

        {/* Psychodynamic progress */}
        <Text style={styles.sectionLabel}>PSYCHODYNAMIC SUITE</Text>
        <View style={styles.programCard}>
          <View style={styles.programHeader}>
            <Text style={styles.programLabel}>
              {psydProgress.done} of {psydProgress.total} worksheets
            </Text>
            <Text style={styles.programPct}>{psydProgress.pct}%</Text>
          </View>
          <View style={styles.simpleProgressTrack}>
            <View
              style={[
                styles.simpleProgressFill,
                { width: `${psydProgress.pct}%` },
              ]}
            />
          </View>
        </View>

        {/* Recent check-ins */}
        <Text style={styles.sectionLabel}>RECENT CHECK-INS</Text>
        {checkins.length === 0 ? (
          <View style={styles.emptyInline}>
            <Text style={styles.emptyText}>No check-ins yet.</Text>
          </View>
        ) : (
          checkins.slice(0, 5).map((c) => {
            const author =
              c.userId === partnerA?.id
                ? partnerA?.name?.split(' ')[0]
                : partnerB?.name?.split(' ')[0];
            return (
              <View key={c.id} style={styles.checkinCard}>
                <View style={styles.checkinHeader}>
                  <Text style={styles.checkinAuthor}>{author}</Text>
                  <Text style={styles.checkinDate}>
                    {formatTimeAgo(c.date)}
                  </Text>
                </View>
                <View style={styles.checkinStats}>
                  <Stat label="MOOD" value={c.mood} />
                  <View style={styles.statDiv} />
                  <Stat label="CONNECTION" value={c.connection} />
                  <View style={styles.statDiv} />
                  <Stat label="STRESS" value={c.stress} />
                </View>
                {c.need ? (
                  <Text style={styles.checkinNote}>"{c.need}"</Text>
                ) : null}
              </View>
            );
          })
        )}

        {/* Repairs */}
        <Text style={styles.sectionLabel}>REPAIR HISTORY</Text>
        {repairs.length === 0 ? (
          <View style={styles.emptyInline}>
            <Text style={styles.emptyText}>No repair activity yet.</Text>
          </View>
        ) : (
          repairs.slice(0, 5).map((r) => {
            const isOpen = r.status === 'sent';
            const from =
              r.fromUserId === partnerA?.id
                ? partnerA?.name?.split(' ')[0]
                : partnerB?.name?.split(' ')[0];
            const to =
              r.toUserId === partnerA?.id
                ? partnerA?.name?.split(' ')[0]
                : partnerB?.name?.split(' ')[0];
            return (
              <View
                key={r.id}
                style={[
                  styles.repairCard,
                  isOpen && {
                    borderLeftWidth: 3,
                    borderLeftColor: DANGER,
                  },
                ]}
              >
                <View style={styles.checkinHeader}>
                  <Text style={styles.repairFrom}>
                    {from} → {to}
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
                <Text style={styles.repairMsg}>"{r.message}"</Text>
                <Text style={styles.checkinDate}>{formatTimeAgo(r.sentAt)}</Text>
              </View>
            );
          })
        )}

        {/* Shared goals */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>SHARED GOALS</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('CoupleSharedGoals', {
                pairingId: pairing.id,
              })
            }
          >
            <Text style={styles.sectionAction}>Manage</Text>
          </TouchableOpacity>
        </View>
        {goals.length === 0 ? (
          <View style={styles.emptyInline}>
            <Text style={styles.emptyText}>
              No shared goals. Tap "Manage" to add one.
            </Text>
          </View>
        ) : (
          goals.map((g) => (
            <View key={g.id} style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalTitle}>{g.title}</Text>
                <Text style={styles.goalPct}>{g.progress}%</Text>
              </View>
              {g.description ? (
                <Text style={styles.goalDesc} numberOfLines={2}>
                  {g.description}
                </Text>
              ) : null}
              <View style={styles.goalProgressTrack}>
                <View
                  style={[
                    styles.goalProgressFill,
                    { width: `${g.progress}%` },
                  ]}
                />
              </View>
            </View>
          ))
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const ActionBtn = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.85}>
    <Feather name={icon} size={16} color={INK} />
    <Text style={styles.actionBtnText}>{label}</Text>
  </TouchableOpacity>
);

const MetricCard = ({ label, value, accent }) => (
  <View style={styles.metricCard}>
    <View style={[styles.metricBar, { backgroundColor: accent }]} />
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={[styles.metricValue, { color: accent }]}>{value}</Text>
  </View>
);

const Stat = ({ label, value }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const formatTimeAgo = (iso) => {
  const ms = Date.now() - new Date(iso).getTime();
  const hours = Math.round(ms / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 14, color: COLORS.error, fontWeight: '600' },

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
  headerTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: INK,
    textAlign: 'center',
    letterSpacing: -0.2,
  },

  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },

  /* Hero */
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  dualAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: { fontSize: 30 },
  amp: {
    fontSize: 28,
    fontWeight: '300',
    color: COLORS.gray400,
    fontStyle: 'italic',
    marginHorizontal: SPACING.lg,
  },
  heroNames: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.5,
    marginBottom: SPACING.sm,
  },
  heroAmp: {
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
    marginBottom: 6,
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
  heroMeta: { fontSize: 12, color: COLORS.gray500 },

  /* Actions */
  actionRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xl,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: INK,
    marginLeft: 6,
    letterSpacing: 0.2,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionAction: {
    fontSize: 12,
    fontWeight: '700',
    color: BLUSH,
  },

  /* Metric grid */
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  metricCard: {
    width: '48.5%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    position: 'relative',
    overflow: 'hidden',
  },
  metricBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 3,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  /* Program card */
  programCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  programLabel: { fontSize: 14, color: INK, fontWeight: '700' },
  programPct: { fontSize: 18, color: SUCCESS, fontWeight: '800' },
  weeksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  weekTick: {
    flex: 1,
    height: 8,
    marginHorizontal: 1,
    borderRadius: 2,
    backgroundColor: COLORS.gray100,
  },
  weekTickDone: { backgroundColor: SUCCESS },
  phaseLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  phaseLabel: {
    fontSize: 9,
    color: COLORS.gray500,
    fontWeight: '600',
  },
  simpleProgressTrack: {
    height: 6,
    backgroundColor: COLORS.gray100,
    borderRadius: 3,
    overflow: 'hidden',
  },
  simpleProgressFill: {
    height: '100%',
    backgroundColor: SUCCESS,
    borderRadius: 3,
  },

  /* Check-ins */
  checkinCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  checkinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  checkinAuthor: { fontSize: 13, fontWeight: '800', color: INK },
  checkinDate: { fontSize: 11, color: COLORS.gray500, fontWeight: '500' },
  checkinStats: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray50,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
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
  statDiv: { width: 1, backgroundColor: COLORS.gray200, marginVertical: 4 },
  checkinNote: {
    fontSize: 12,
    color: INK,
    fontStyle: 'italic',
    lineHeight: 17,
  },

  /* Repairs */
  repairCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  repairFrom: { fontSize: 13, fontWeight: '800', color: INK },
  repairMsg: {
    fontSize: 13,
    color: INK,
    fontStyle: 'italic',
    marginBottom: 4,
    lineHeight: 19,
  },

  /* Empty */
  emptyInline: {
    paddingVertical: SPACING.md,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.gray500,
    fontStyle: 'italic',
  },

  /* Goals */
  goalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  goalTitle: { fontSize: 13, fontWeight: '800', color: INK, flex: 1 },
  goalPct: { fontSize: 13, fontWeight: '800', color: SUCCESS },
  goalDesc: {
    fontSize: 11,
    color: COLORS.gray600,
    lineHeight: 16,
    marginBottom: 6,
  },
  goalProgressTrack: {
    height: 4,
    backgroundColor: COLORS.gray100,
    borderRadius: 2,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: SUCCESS,
  },
});
