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
import dataStore from '../../../utils/dataStore';

const INK = '#1A2332';
const SAGE = '#15803D';
const WARNING = '#D97706';
const DANGER = '#DC2626';

const MOOD_EMOJI = {
  happy: '😊', sad: '😢', angry: '😠', anxious: '😰',
  calm: '😌', excited: '🤩', confused: '😕', overwhelmed: '😩', okay: '🙂',
};

export default function ParentChildrenTab() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [enriched, setEnriched] = useState([]);
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

          if (u && Array.isArray(u.children) && u.children.length > 0) {
            const list = await Promise.all(
              u.children.map(async (id) => {
                const child = await dataStore.getUserById(id);
                if (!child) return null;
                const [assignments, moods, completed] = await Promise.all([
                  dataStore.getAssignmentsByClient(id),
                  dataStore.getMoodEntriesByUser(id),
                  dataStore.getCompletedWorksheetsByUser(id),
                ]);
                const completedCount = (assignments || []).filter(
                  (a) => a.status === 'completed'
                ).length;
                const total = (assignments || []).length;
                const completionPct =
                  total > 0 ? Math.round((completedCount / total) * 100) : 0;
                const hasOverdue = (assignments || []).some(
                  (a) =>
                    a.status !== 'completed' && new Date(a.dueDate) < new Date()
                );
                return {
                  child,
                  latestMood: (moods || [])[0],
                  moodCount: (moods || []).length,
                  completedCount,
                  total,
                  completionPct,
                  hasOverdue,
                  completedTotal: (completed || []).length,
                };
              })
            );
            if (cancelled) return;
            setEnriched(list.filter(Boolean));
          }
        } catch (e) {
          console.log('[Parent ChildrenTab] load error', e);
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.iconBtn} onPress={openDrawer}>
          <Feather name="menu" size={20} color={INK} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: SPACING.md }}>
          <Text style={styles.eyebrow}>YOUR FAMILY</Text>
          <Text style={styles.headerTitle}>Children</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator color={INK} />
          </View>
        ) : enriched.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="users" size={32} color={COLORS.gray300} />
            <Text style={styles.emptyTitle}>No children linked yet</Text>
            <Text style={styles.emptyText}>
              Your therapist will link your children to your account. Once
              linked, you'll see their progress here.
            </Text>
          </View>
        ) : (
          enriched.map((c) => (
            <TouchableOpacity
              key={c.child.id}
              style={styles.childCard}
              onPress={() =>
                navigation.navigate('ChildDetail', { childId: c.child.id })
              }
              activeOpacity={0.9}
            >
              <View style={styles.childTop}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: c.child.profileColor || SAGE },
                  ]}
                >
                  <Text style={styles.avatarEmoji}>
                    {c.child.avatar || '👤'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.childNameRow}>
                    <Text style={styles.childName} numberOfLines={1}>
                      {c.child.name}
                    </Text>
                    {c.hasOverdue && (
                      <View style={styles.overdueDot} />
                    )}
                  </View>
                  <View style={styles.childMetaRow}>
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleBadgeText}>
                        {(c.child.role || '').toUpperCase()}
                      </Text>
                    </View>
                    {c.child.age && (
                      <Text style={styles.childAge}>· {c.child.age} yrs</Text>
                    )}
                  </View>
                  {c.child.emotionalFocus && (
                    <Text style={styles.childFocus} numberOfLines={1}>
                      Focus: {c.child.emotionalFocus.join(', ')}
                    </Text>
                  )}
                </View>
                <Feather
                  name="chevron-right"
                  size={20}
                  color={COLORS.gray400}
                />
              </View>

              {/* Latest mood + progress */}
              <View style={styles.childStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {c.latestMood
                      ? MOOD_EMOJI[c.latestMood.mood] || '🙂'
                      : '—'}
                  </Text>
                  <Text style={styles.statLabel}>LATEST MOOD</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{c.completedCount}</Text>
                  <Text style={styles.statLabel}>COMPLETED</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{c.moodCount}</Text>
                  <Text style={styles.statLabel}>CHECK-INS</Text>
                </View>
              </View>

              {/* Progress bar */}
              <View style={styles.progressRow}>
                <View style={styles.progressLabelRow}>
                  <Text style={styles.progressLabelText}>
                    {c.completedCount} of {c.total} worksheets
                  </Text>
                  <Text style={styles.progressPct}>{c.completionPct}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${c.completionPct}%`,
                        backgroundColor:
                          c.completionPct >= 70
                            ? SAGE
                            : c.completionPct >= 30
                            ? WARNING
                            : INK,
                      },
                    ]}
                  />
                </View>
              </View>

              {c.hasOverdue && (
                <View style={styles.overdueBanner}>
                  <Feather
                    name="alert-circle"
                    size={12}
                    color={DANGER}
                  />
                  <Text style={styles.overdueText}>
                    Overdue worksheet — gentle reminder may help
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))
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
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: SAGE,
    letterSpacing: 1.4,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.6,
  },

  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },

  loadingBlock: { padding: SPACING.xl, alignItems: 'center' },

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

  /* Child card */
  childCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  childTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarEmoji: { fontSize: 26 },
  childNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  childName: {
    fontSize: 15,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.3,
    flex: 1,
  },
  overdueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DANGER,
    marginLeft: 6,
  },
  childMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  roleBadge: {
    backgroundColor: SAGE + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: SAGE,
    letterSpacing: 0.6,
  },
  childAge: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '600',
    marginLeft: 6,
  },
  childFocus: {
    fontSize: 11,
    color: COLORS.gray500,
    fontStyle: 'italic',
    marginTop: 2,
  },

  childStats: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.gray200,
    marginVertical: 4,
  },

  progressRow: {},
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabelText: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '600',
  },
  progressPct: {
    fontSize: 12,
    color: INK,
    fontWeight: '800',
  },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },

  overdueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.md,
  },
  overdueText: {
    fontSize: 11,
    fontWeight: '700',
    color: DANGER,
    marginLeft: 4,
    letterSpacing: 0.1,
  },
});
