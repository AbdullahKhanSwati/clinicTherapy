import React, { useState, useCallback, useMemo } from 'react';
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
  getCurrentProfile,
  listAllProfiles,
  listAssignments,
  listAllMoodEntries,
  listWorksheets,
} from '../../../services/api';

const INK = '#1A2332';
const ACCENT = COLORS.primary;
const DANGER = '#DC2626';
const WARNING = '#D97706';
const SUCCESS = '#15803D';

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

export default function TherapistOverviewTab() {
  const navigation = useNavigation();
  const [therapist, setTherapist] = useState(null);
  const [clients, setClients] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [allMoods, setAllMoods] = useState([]);
  const [worksheets, setWorksheets] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          setLoading(true);
          const u = await getCurrentProfile();
          if (cancelled) return;
          setTherapist(u);

          const allProfiles = await listAllProfiles();
          const clientList = (allProfiles || []).filter(
            (x) => x.role !== 'therapist' && x.role !== 'admin'
          );
          if (cancelled) return;
          setClients(clientList);

          const allAssignments = await listAssignments();
          if (cancelled) return;
          setAssignments(allAssignments || []);

          // "Completed" is derived from assignments whose status === 'completed'.
          // Shape it like the legacy completion records so downstream UI works.
          const completedFromAssignments = (allAssignments || [])
            .filter((a) => a.status === 'completed')
            .map((a) => ({
              id: a.id,
              userId: a.assigneeId,
              worksheetId: a.worksheetId,
              completedDate: a.updatedAt || a.createdAt,
              reviewedByTherapist: false,
            }));
          if (cancelled) return;
          setCompleted(completedFromAssignments);

          const allMoodEntries = await listAllMoodEntries();
          if (cancelled) return;
          setAllMoods(allMoodEntries || []);

          const allWS = await listWorksheets();
          if (cancelled) return;
          setWorksheets(allWS || []);
        } catch (e) {
          console.log('[Therapist OverviewTab] load error', e);
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

  const openClient = (client) => {
    navigation.navigate('ClientDetails', { clientId: client.id });
  };

  // ===== Metrics =====
  const metrics = useMemo(() => {
    const activeClients = clients.length;
    const completionRate =
      assignments.length > 0
        ? Math.round(
            (assignments.filter((a) => a.status === 'completed').length /
              assignments.length) *
              100
          )
        : 0;

    const moodScores = allMoods
      .map((m) => MOOD_SCORE[m.mood])
      .filter((s) => s != null);
    const avgMood =
      moodScores.length > 0
        ? Math.round(
            (moodScores.reduce((s, v) => s + v, 0) / moodScores.length) * 10
          ) / 10
        : 0;

    return { activeClients, completionRate, avgMood };
  }, [clients, assignments, allMoods]);

  // ===== At-risk / alerts =====
  const alerts = useMemo(() => {
    const list = [];
    // Overdue assignments (guarded against null dueDate)
    const overdue = assignments.filter(
      (a) =>
        a.status !== 'completed' &&
        a.dueDate &&
        new Date(a.dueDate) < new Date()
    );
    if (overdue.length > 0) {
      list.push({
        id: 'overdue',
        severity: 'danger',
        title: `${overdue.length} overdue worksheet${
          overdue.length === 1 ? '' : 's'
        }`,
        sub: 'Review and follow up with clients',
        action: () => navigation.navigate('Worksheets'),
      });
    }
    return list;
  }, [assignments, navigation]);

  // ===== Recent activity (completed worksheets, sorted by date) =====
  const recent = useMemo(() => {
    return [...completed]
      .sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate))
      .slice(0, 5)
      .map((c) => {
        const client = clients.find((x) => x.id === c.userId);
        const worksheet = worksheets.find((w) => w.id === c.worksheetId);
        return { ...c, client, worksheet };
      });
  }, [completed, clients, worksheets]);

  const therapistName = therapist?.name || 'Doctor';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={openDrawer}>
            <Feather name="menu" size={20} color={INK} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginHorizontal: SPACING.md }}>
            <Text style={styles.eyebrow}>CLINICIAN PORTAL</Text>
            <Text style={styles.headerName}>{therapistName}</Text>
          </View>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Feather name="bell" size={20} color={INK} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator color={INK} />
          </View>
        ) : (
          <>
            {/* Headline metrics */}
            <View style={styles.kpiGrid}>
              <KpiTile
                label="ACTIVE CLIENTS"
                value={metrics.activeClients}
                accent={ACCENT}
              />
              <KpiTile
                label="COMPLETION"
                value={`${metrics.completionRate}%`}
                accent={SUCCESS}
              />
              <KpiTile
                label="AVG MOOD"
                value={metrics.avgMood || '—'}
                accent={ACCENT}
                suffix="/10"
              />
              <KpiTile
                label="WORKSHEETS"
                value={assignments.length}
                accent={WARNING}
              />
            </View>

            {/* Alerts */}
            {alerts.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>REQUIRES ATTENTION</Text>
                {alerts.map((a) => (
                  <TouchableOpacity
                    key={a.id}
                    style={[
                      styles.alertCard,
                      a.severity === 'danger' && styles.alertCardDanger,
                      a.severity === 'warning' && styles.alertCardWarning,
                    ]}
                    onPress={a.action}
                    activeOpacity={0.85}
                  >
                    <View
                      style={[
                        styles.alertIcon,
                        a.severity === 'danger' && { backgroundColor: DANGER + '15' },
                        a.severity === 'warning' && {
                          backgroundColor: WARNING + '15',
                        },
                      ]}
                    >
                      <Feather
                        name={a.severity === 'danger' ? 'alert-circle' : 'clock'}
                        size={18}
                        color={a.severity === 'danger' ? DANGER : WARNING}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.alertTitle}>{a.title}</Text>
                      <Text style={styles.alertSub}>{a.sub}</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color={COLORS.gray400} />
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* Quick actions */}
            <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
            <View style={styles.quickGrid}>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => navigation.navigate('Clients')}
                activeOpacity={0.85}
              >
                <Feather name="users" size={20} color={INK} />
                <Text style={styles.quickActionText}>View Clients</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => navigation.navigate('Worksheets')}
                activeOpacity={0.85}
              >
                <Feather name="layers" size={20} color={INK} />
                <Text style={styles.quickActionText}>Content</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() =>
                  navigation.navigate('AssignWorksheet', { worksheetId: null })
                }
                activeOpacity={0.85}
              >
                <Feather name="send" size={20} color={INK} />
                <Text style={styles.quickActionText}>Assign</Text>
              </TouchableOpacity>
            </View>


            {/* Recent activity */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>RECENT ACTIVITY</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Clients')}>
                <Text style={styles.sectionAction}>View all</Text>
              </TouchableOpacity>
            </View>

            {recent.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No recent activity</Text>
              </View>
            ) : (
              <View style={styles.activityCard}>
                {recent.map((r, i) => (
                  <TouchableOpacity
                    key={r.id}
                    style={[
                      styles.activityRow,
                      i < recent.length - 1 && styles.activityRowBorder,
                    ]}
                    onPress={() =>
                      navigation.navigate('WorksheetResponse', {
                        assignmentId: r.id,
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <View style={styles.activityDot} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.activityText}>
                        <Text style={styles.activityHighlight}>
                          {r.client?.name || 'Client'}
                        </Text>{' '}
                        completed{' '}
                        <Text style={styles.activityHighlight}>
                          {r.worksheet?.title || 'a worksheet'}
                        </Text>
                      </Text>
                      <Text style={styles.activityTime}>
                        {new Date(r.completedDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={16} color={COLORS.gray400} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const KpiTile = ({ label, value, accent, suffix }) => (
  <View style={styles.kpiTile}>
    <View style={[styles.kpiBar, { backgroundColor: accent }]} />
    <Text style={styles.kpiLabel}>{label}</Text>
    <View style={styles.kpiValueRow}>
      <Text style={styles.kpiValue}>{value}</Text>
      {suffix && <Text style={styles.kpiSuffix}>{suffix}</Text>}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },

  header: {
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
  headerName: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.6,
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DANGER,
  },

  loadingBlock: { padding: SPACING.xl, alignItems: 'center' },

  /* KPIs */
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  kpiTile: {
    width: '48.5%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    position: 'relative',
    overflow: 'hidden',
  },
  kpiBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 3,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
    marginBottom: SPACING.sm,
  },
  kpiValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  kpiValue: {
    fontSize: 28,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.8,
  },
  kpiSuffix: {
    fontSize: 14,
    color: COLORS.gray400,
    fontWeight: '500',
    marginLeft: 3,
  },

  /* Section */
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionAction: {
    fontSize: 12,
    fontWeight: '700',
    color: ACCENT,
  },
  sectionMeta: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray400,
    letterSpacing: 1.2,
  },

  /* Alerts */
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  alertCardDanger: { borderLeftWidth: 3, borderLeftColor: DANGER },
  alertCardWarning: { borderLeftWidth: 3, borderLeftColor: WARNING },
  alertIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: INK,
    marginBottom: 2,
    letterSpacing: -0.1,
  },
  alertSub: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
  },

  /* Quick actions */
  quickGrid: {
    flexDirection: 'row',
    marginBottom: SPACING.xl,
  },
  quickAction: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: INK,
    marginTop: 6,
    letterSpacing: 0.2,
  },

  /* Schedule */
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  sessionTime: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: INK,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.md,
  },
  sessionTimeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.2,
  },
  sessionClient: {
    fontSize: 14,
    fontWeight: '700',
    color: INK,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  sessionType: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
  },

  /* Activity */
  activityCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  activityRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SUCCESS,
    marginRight: SPACING.md,
  },
  activityText: {
    fontSize: 13,
    color: COLORS.gray600,
    lineHeight: 18,
  },
  activityHighlight: {
    color: INK,
    fontWeight: '700',
  },
  activityTime: {
    fontSize: 11,
    color: COLORS.gray400,
    marginTop: 2,
    fontWeight: '500',
  },

  /* Empty */
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.gray500,
    fontWeight: '500',
  },
});
