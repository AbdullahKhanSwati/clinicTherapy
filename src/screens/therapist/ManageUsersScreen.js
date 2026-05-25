import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
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

const INK = '#1A2332';

/**
 * ManageUsersScreen — single screen used for the Children, Teens and Parents
 * admin modules. Filters users by role and shows assignment chips
 * (parents for children/teens, children for parents).
 *
 * route.params:
 *   - role: 'child' | 'teen' | 'family' (required)
 *   - title: optional override
 */
const ROLE_CONFIG = {
  child: {
    title: 'Children',
    eyebrow: 'CHILDREN MODULE',
    accent: '#9333EA',
    icon: 'smile',
    description:
      'Children registered in the system. Tap a child to view profile or assign a parent.',
    emptyTitle: 'No children yet',
    emptyText: 'Children appear here once parents register their kids.',
  },
  teen: {
    title: 'Teens',
    eyebrow: 'TEENS MODULE',
    accent: '#0891B2',
    icon: 'user',
    description:
      'Teens registered in the system. Tap a teen to view profile or assign a parent.',
    emptyTitle: 'No teens yet',
    emptyText: 'Teens appear here once they register.',
  },
  family: {
    title: 'Parents',
    eyebrow: 'PARENTS MODULE',
    accent: '#15803D',
    icon: 'users',
    description:
      'Parents and guardians. Tap a parent to manage which children are linked.',
    emptyTitle: 'No parents yet',
    emptyText: 'Parents appear here once they register.',
  },
  couples: {
    title: 'Couples Users',
    eyebrow: 'COUPLES MODULE',
    accent: '#D4536B',
    icon: 'heart',
    description:
      'Every user registered with the couples role. Use "Pair a Couple" to link two of them as partners.',
    emptyTitle: 'No couples users yet',
    emptyText: 'Couples users appear here once they register.',
  },
};

export default function ManageUsersScreen({ route, navigation }) {
  const role = route?.params?.role || 'child';
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.child;

  const [users, setUsers] = useState({});
  const [pairings, setPairings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      await dataStore.initialize();
      const [allUsers, allPairings] = await Promise.all([
        dataStore.getUsers(),
        dataStore.getCouplePairings(),
      ]);
      setUsers(allUsers || {});
      setPairings(allPairings || []);
    } catch (e) {
      console.log('[ManageUsers] load', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const filtered = useMemo(() => {
    const list = Object.values(users || {}).filter(
      (u) => u && u.role === role
    );
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }, [users, role, query]);

  const getParentsOf = (childId) =>
    Object.values(users || {}).filter(
      (u) =>
        u?.role === 'family' &&
        Array.isArray(u.children) &&
        u.children.includes(childId)
    );

  const getChildrenOf = (parent) =>
    (parent?.children || [])
      .map((id) => users[id])
      .filter(Boolean);

  const getPartnerOf = (userId) => {
    const active = (pairings || []).find(
      (p) =>
        p.status === 'active' &&
        (p.partnerAId === userId || p.partnerBId === userId)
    );
    if (!active) return null;
    const partnerId =
      active.partnerAId === userId ? active.partnerBId : active.partnerAId;
    return users[partnerId] || null;
  };

  const openAssign = (user) => {
    if (role === 'family') {
      navigation.navigate('AssignChild', { parentId: user.id });
    } else if (role === 'couples') {
      navigation.navigate('AdminPairCouple');
    } else {
      navigation.navigate('AssignParent', { childId: user.id, role });
    }
  };

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
          <Text style={[styles.eyebrow, { color: config.accent }]}>
            {config.eyebrow}
          </Text>
          <Text style={styles.headerTitle}>Manage {config.title}</Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Feather name="search" size={16} color={COLORS.gray400} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${config.title.toLowerCase()}...`}
          placeholderTextColor={COLORS.gray400}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Feather name="x" size={16} color={COLORS.gray400} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.description}>{config.description}</Text>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: config.accent + '12' }]}>
            <Feather name={config.icon} size={18} color={config.accent} />
            <Text style={[styles.statValue, { color: config.accent }]}>
              {filtered.length}
            </Text>
            <Text style={styles.statLabel}>
              {config.title.toUpperCase()}
            </Text>
          </View>
          {(role === 'child' || role === 'teen') && (
            <>
              <View style={[styles.statCard, { backgroundColor: COLORS.gray50 }]}>
                <Feather name="link" size={18} color={INK} />
                <Text style={styles.statValue}>
                  {filtered.filter((u) => getParentsOf(u.id).length > 0).length}
                </Text>
                <Text style={styles.statLabel}>WITH PARENT</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: COLORS.gray50 }]}>
                <Feather name="alert-circle" size={18} color="#D97706" />
                <Text style={styles.statValue}>
                  {filtered.filter((u) => getParentsOf(u.id).length === 0).length}
                </Text>
                <Text style={styles.statLabel}>UNASSIGNED</Text>
              </View>
            </>
          )}
          {role === 'family' && (
            <View style={[styles.statCard, { backgroundColor: COLORS.gray50 }]}>
              <Feather name="users" size={18} color={INK} />
              <Text style={styles.statValue}>
                {filtered.reduce(
                  (sum, u) => sum + (u.children?.length || 0),
                  0
                )}
              </Text>
              <Text style={styles.statLabel}>LINKED KIDS</Text>
            </View>
          )}
          {role === 'couples' && (
            <>
              <View style={[styles.statCard, { backgroundColor: COLORS.gray50 }]}>
                <Feather name="heart" size={18} color={config.accent} />
                <Text style={styles.statValue}>
                  {filtered.filter((u) => getPartnerOf(u.id)).length}
                </Text>
                <Text style={styles.statLabel}>PAIRED</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: COLORS.gray50 }]}>
                <Feather name="alert-circle" size={18} color="#D97706" />
                <Text style={styles.statValue}>
                  {filtered.filter((u) => !getPartnerOf(u.id)).length}
                </Text>
                <Text style={styles.statLabel}>UNPAIRED</Text>
              </View>
            </>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator color={INK} />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name={config.icon} size={28} color={COLORS.gray300} />
            <Text style={styles.emptyTitle}>{config.emptyTitle}</Text>
            <Text style={styles.emptyText}>{config.emptyText}</Text>
          </View>
        ) : (
          filtered.map((u) => {
            const isParent = role === 'family';
            const isCouples = role === 'couples';
            let linked = [];
            let linkedLabel = 'LINKED';
            if (isParent) {
              linked = getChildrenOf(u);
              linkedLabel = 'CHILDREN';
            } else if (isCouples) {
              const partner = getPartnerOf(u.id);
              linked = partner ? [partner] : [];
              linkedLabel = 'PARTNER';
            } else {
              linked = getParentsOf(u.id);
              linkedLabel = 'PARENTS';
            }
            const assignLabel = isParent
              ? 'Assign'
              : isCouples
              ? 'Pair'
              : 'Link parent';
            return (
              <View key={u.id} style={styles.userCard}>
                <View style={styles.userTop}>
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: u.profileColor || config.accent },
                    ]}
                  >
                    <Text style={styles.avatarEmoji}>{u.avatar || '👤'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userName}>{u.name}</Text>
                    <Text style={styles.userMeta}>
                      {u.email || 'No email'}
                      {u.age ? ` · age ${u.age}` : ''}
                      {u.parentingRelationship
                        ? ` · ${u.parentingRelationship}`
                        : ''}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => openAssign(u)}
                    style={[
                      styles.assignBtn,
                      { backgroundColor: config.accent },
                    ]}
                    activeOpacity={0.85}
                  >
                    <Feather name="link" size={12} color={COLORS.white} />
                    <Text style={styles.assignBtnText}>{assignLabel}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.linkedBlock}>
                  <Text style={styles.linkedLabel}>{linkedLabel}</Text>
                  {linked.length === 0 ? (
                    <View style={styles.unassignedPill}>
                      <Feather name="alert-triangle" size={11} color="#D97706" />
                      <Text style={styles.unassignedText}>
                        {isCouples ? 'Not paired' : 'None linked'}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.chipsRow}>
                      {linked.map((p) => (
                        <View
                          key={p.id}
                          style={[
                            styles.chip,
                            {
                              backgroundColor:
                                (p.profileColor || config.accent) + '15',
                            },
                          ]}
                        >
                          <Text style={styles.chipEmoji}>{p.avatar || '👤'}</Text>
                          <Text style={styles.chipName}>
                            {p.name?.split(' ')[0]}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {u.emotionalFocus?.length ? (
                  <View style={styles.focusRow}>
                    {u.emotionalFocus.slice(0, 4).map((f) => (
                      <View key={f} style={styles.focusTag}>
                        <Text style={styles.focusTagText}>{f}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
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

  /* Search */
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.lg,
    height: 42,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 13,
    color: INK,
    paddingVertical: 0,
  },

  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },

  description: {
    fontSize: 12,
    color: COLORS.gray500,
    lineHeight: 17,
    marginBottom: SPACING.md,
  },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.5,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 0.8,
    marginTop: 2,
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

  /* User card */
  userCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  userTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarEmoji: { fontSize: 22 },
  userName: {
    fontSize: 15,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.3,
  },
  userMeta: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
    marginTop: 1,
  },
  assignBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
  },
  assignBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginLeft: 4,
  },

  /* Linked */
  linkedBlock: {
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  linkedLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    marginRight: 6,
    marginBottom: 4,
  },
  chipEmoji: { fontSize: 14, marginRight: 4 },
  chipName: {
    fontSize: 11,
    fontWeight: '700',
    color: INK,
  },
  unassignedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  unassignedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    marginLeft: 4,
  },

  focusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
  },
  focusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: 6,
    marginBottom: 4,
  },
  focusTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.gray600,
    letterSpacing: 0.2,
  },
});
