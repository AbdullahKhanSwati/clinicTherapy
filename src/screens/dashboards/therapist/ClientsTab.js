import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
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
const ACCENT = COLORS.primary;
const SUCCESS = '#15803D';
const WARNING = '#D97706';

const ROLE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'child', label: 'Children' },
  { id: 'teen', label: 'Teens' },
  { id: 'couples', label: 'Couples' },
  { id: 'family', label: 'Family' },
];

const ROLE_BADGE = {
  child: { label: 'CHILD', color: '#9333EA' },
  teen: { label: 'TEEN', color: '#0891B2' },
  couples: { label: 'COUPLES', color: '#D4536B' },
  family: { label: 'FAMILY', color: '#15803D' },
};

export default function TherapistClientsTab() {
  const navigation = useNavigation();
  const [clients, setClients] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          setLoading(true);
          await dataStore.initialize();
          const allUsers = await dataStore.getUsers();
          if (cancelled) return;
          const clientList = Object.values(allUsers || {}).filter(
            (x) => x.role !== 'therapist'
          );
          setClients(clientList);

          const [a, m] = await Promise.all([
            dataStore.getWorksheetAssignments(),
            dataStore.getMoodEntries(),
          ]);
          if (cancelled) return;
          setAssignments(a || []);
          setMoods(m || []);
        } catch (e) {
          console.log('[Therapist ClientsTab] load error', e);
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
    const parent = navigation.getParent?.() || navigation;
    parent.navigate('ClientDetails', { clientId: client.id });
  };

  const enriched = useMemo(() => {
    return clients.map((c) => {
      const clientAssignments = assignments.filter((a) => a.clientId === c.id);
      const completed = clientAssignments.filter(
        (a) => a.status === 'completed'
      ).length;
      const total = clientAssignments.length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      const lastMood = moods
        .filter((m) => m.userId === c.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      const hasOverdue = clientAssignments.some(
        (a) => a.status !== 'completed' && new Date(a.dueDate) < new Date()
      );
      return {
        ...c,
        progress,
        completed,
        total,
        lastMood,
        hasOverdue,
      };
    });
  }, [clients, assignments, moods]);

  const filtered = useMemo(() => {
    return enriched.filter((c) => {
      const matchesFilter = filter === 'all' || c.role === filter;
      const matchesSearch =
        !search.trim() ||
        c.name.toLowerCase().includes(search.toLowerCase().trim()) ||
        c.email?.toLowerCase().includes(search.toLowerCase().trim());
      return matchesFilter && matchesSearch;
    });
  }, [enriched, filter, search]);

  const counts = useMemo(() => {
    const map = { all: enriched.length };
    ROLE_FILTERS.slice(1).forEach((f) => {
      map[f.id] = enriched.filter((c) => c.role === f.id).length;
    });
    return map;
  }, [enriched]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.iconBtn} onPress={openDrawer}>
          <Feather name="menu" size={20} color={INK} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: SPACING.md }}>
          <Text style={styles.eyebrow}>CASELOAD</Text>
          <Text style={styles.headerTitle}>Clients</Text>
        </View>
        <View style={styles.totalBadge}>
          <Text style={styles.totalBadgeText}>{enriched.length}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Feather
          name="search"
          size={16}
          color={COLORS.gray400}
          style={{ marginRight: SPACING.sm }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email"
          placeholderTextColor={COLORS.gray400}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Feather name="x" size={16} color={COLORS.gray500} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {ROLE_FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setFilter(f.id)}
              activeOpacity={0.85}
            >
              <Text
                style={[styles.filterChipText, active && styles.filterChipTextActive]}
              >
                {f.label}
              </Text>
              <Text
                style={[
                  styles.filterChipCount,
                  active && styles.filterChipCountActive,
                ]}
              >
                {counts[f.id] || 0}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator color={INK} />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="users" size={32} color={COLORS.gray300} />
            <Text style={styles.emptyTitle}>No clients found</Text>
            <Text style={styles.emptyText}>
              {search ? 'Try a different search term' : 'Adjust your filters'}
            </Text>
          </View>
        ) : (
          filtered.map((c) => {
            const badge = ROLE_BADGE[c.role] || {
              label: c.role.toUpperCase(),
              color: COLORS.gray500,
            };
            return (
              <TouchableOpacity
                key={c.id}
                style={styles.clientCard}
                onPress={() => openClient(c)}
                activeOpacity={0.9}
              >
                <View style={styles.clientTopRow}>
                  <View
                    style={[
                      styles.clientAvatar,
                      { backgroundColor: c.profileColor || ACCENT },
                    ]}
                  >
                    <Text style={styles.clientAvatarText}>{c.avatar || '👤'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.clientNameRow}>
                      <Text style={styles.clientName} numberOfLines={1}>
                        {c.name}
                      </Text>
                      {c.hasOverdue && (
                        <View style={styles.overdueDot} />
                      )}
                    </View>
                    <View style={styles.clientMetaRow}>
                      <View
                        style={[styles.roleBadge, { backgroundColor: badge.color + '15' }]}
                      >
                        <Text style={[styles.roleBadgeText, { color: badge.color }]}>
                          {badge.label}
                        </Text>
                      </View>
                      {c.age && (
                        <Text style={styles.clientAge}>· {c.age} yrs</Text>
                      )}
                    </View>
                    <Text style={styles.clientEmail} numberOfLines={1}>
                      {c.email}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={20} color={COLORS.gray400} />
                </View>

                <View style={styles.clientProgressRow}>
                  <View style={styles.clientProgressLabel}>
                    <Text style={styles.clientProgressLabelText}>
                      {c.completed} / {c.total} worksheets
                    </Text>
                    <Text style={styles.clientProgressPct}>{c.progress}%</Text>
                  </View>
                  <View style={styles.clientProgressTrack}>
                    <View
                      style={[
                        styles.clientProgressFill,
                        {
                          width: `${c.progress}%`,
                          backgroundColor:
                            c.progress >= 70
                              ? SUCCESS
                              : c.progress >= 30
                              ? WARNING
                              : ACCENT,
                        },
                      ]}
                    />
                  </View>
                </View>

                {c.hasOverdue && (
                  <View style={styles.overdueBanner}>
                    <Feather name="alert-circle" size={12} color="#DC2626" />
                    <Text style={styles.overdueText}>
                      Overdue worksheet — needs follow-up
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
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
  totalBadge: {
    minWidth: 32,
    paddingHorizontal: SPACING.sm,
    height: 24,
    borderRadius: 12,
    backgroundColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: -0.2,
  },

  /* Search */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: INK,
    fontWeight: '500',
    paddingVertical: 4,
  },

  /* Filter chips */
  filterScroll: {
    flexGrow: 0,
    marginBottom: SPACING.md,
  },
  filterRow: {
    paddingHorizontal: SPACING.lg,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    marginRight: 6,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  filterChipActive: {
    backgroundColor: INK,
    borderColor: INK,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray600,
    marginRight: 6,
  },
  filterChipTextActive: { color: COLORS.white },
  filterChipCount: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray400,
  },
  filterChipCountActive: { color: 'rgba(255,255,255,0.7)' },

  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },

  loadingBlock: { padding: SPACING.xl, alignItems: 'center' },

  /* Client card */
  clientCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  clientTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  clientAvatarText: { fontSize: 24 },
  clientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  clientName: {
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
    backgroundColor: '#DC2626',
    marginLeft: 6,
  },
  clientMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  clientAge: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '600',
    marginLeft: 6,
  },
  clientEmail: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
  },

  clientProgressRow: {
    marginTop: SPACING.sm,
  },
  clientProgressLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  clientProgressLabelText: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '600',
  },
  clientProgressPct: {
    fontSize: 12,
    color: INK,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  clientProgressTrack: {
    height: 4,
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  clientProgressFill: { height: '100%', borderRadius: BORDER_RADIUS.full },

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
    color: '#DC2626',
    marginLeft: 4,
    letterSpacing: 0.1,
  },

  /* Empty */
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.md,
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
    fontWeight: '500',
  },
});
