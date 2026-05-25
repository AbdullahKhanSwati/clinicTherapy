import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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
const SAGE = '#15803D';

/**
 * AssignChildScreen — picker for linking a parent to one or more children/teens.
 *
 * route.params:
 *   - parentId (required)
 */
export default function AssignChildScreen({ route, navigation }) {
  const parentId = route?.params?.parentId;

  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [draftChildIds, setDraftChildIds] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      await dataStore.initialize();
      const allUsers = await dataStore.getUsers();
      setUsers(allUsers || {});
    } catch (e) {
      console.log('[AssignChild] load', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const parent = users[parentId];
  const allKids = useMemo(
    () =>
      Object.values(users || {}).filter(
        (u) => u?.role === 'child' || u?.role === 'teen'
      ),
    [users]
  );

  const currentChildIds = useMemo(
    () => parent?.children || [],
    [parent]
  );
  const selectedIds = draftChildIds ?? currentChildIds;

  const toggleChild = (childId) => {
    const base = draftChildIds ?? currentChildIds;
    const next = base.includes(childId)
      ? base.filter((id) => id !== childId)
      : [...base, childId];
    setDraftChildIds(next);
  };

  const dirty = useMemo(() => {
    if (draftChildIds === null) return false;
    const a = [...currentChildIds].sort().join(',');
    const b = [...draftChildIds].sort().join(',');
    return a !== b;
  }, [draftChildIds, currentChildIds]);

  const save = async () => {
    if (!dirty || !parent) return;
    try {
      setWorking(true);
      const allUsers = { ...users };
      allUsers[parentId] = {
        ...parent,
        children: [...draftChildIds],
      };
      await dataStore.setUsers(allUsers);
      setUsers(allUsers);
      setDraftChildIds(null);
      Alert.alert('Saved', 'Child assignment updated.');
    } catch (e) {
      console.log('[AssignChild] save', e);
      Alert.alert('Error', 'Could not save the assignment.');
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingBlock}>
          <ActivityIndicator color={INK} />
        </View>
      </SafeAreaView>
    );
  }

  if (!parent) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={20} color={INK} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { marginLeft: SPACING.md }]}>
            Not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.eyebrow}>PARENT · ASSIGN CHILDREN</Text>
          <Text style={styles.headerTitle}>Link Children</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.parentHero}>
          <View
            style={[
              styles.heroAvatar,
              { backgroundColor: parent.profileColor || SAGE },
            ]}
          >
            <Text style={styles.heroAvatarEmoji}>{parent.avatar || '👤'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroName}>{parent.name}</Text>
            <Text style={styles.heroMeta}>
              {parent.parentingRelationship
                ? parent.parentingRelationship + ' · '
                : ''}
              {parent.email || 'No email'}
            </Text>
            <Text style={styles.heroSub}>
              {selectedIds.length} child{selectedIds.length === 1 ? '' : 'ren'}{' '}
              selected
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>SELECT CHILDREN / TEENS</Text>
        <Text style={styles.sectionHint}>
          Tap to toggle. Parents can be linked to one or more children.
        </Text>

        {allKids.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="smile" size={28} color={COLORS.gray300} />
            <Text style={styles.emptyTitle}>No children or teens yet</Text>
            <Text style={styles.emptyText}>
              Register a user with role "child" or "teen" first.
            </Text>
          </View>
        ) : (
          allKids.map((k) => {
            const selected = selectedIds.includes(k.id);
            const otherParents = Object.values(users || {}).filter(
              (u) =>
                u?.role === 'family' &&
                u.id !== parentId &&
                (u.children || []).includes(k.id)
            );
            return (
              <TouchableOpacity
                key={k.id}
                style={[styles.kidRow, selected && styles.kidRowActive]}
                onPress={() => toggleChild(k.id)}
                activeOpacity={0.85}
              >
                <View
                  style={[
                    styles.kidAvatar,
                    { backgroundColor: k.profileColor || SAGE },
                  ]}
                >
                  <Text style={styles.kidAvatarEmoji}>{k.avatar || '👤'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.kidNameRow}>
                    <Text style={styles.kidName}>{k.name}</Text>
                    <View
                      style={[
                        styles.rolePill,
                        k.role === 'teen'
                          ? { backgroundColor: '#0891B215' }
                          : { backgroundColor: '#9333EA15' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.rolePillText,
                          k.role === 'teen'
                            ? { color: '#0891B2' }
                            : { color: '#9333EA' },
                        ]}
                      >
                        {k.role.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.kidMeta}>
                    {k.email || 'No email'}
                    {k.age ? ` · age ${k.age}` : ''}
                  </Text>
                  {otherParents.length > 0 && (
                    <Text style={styles.kidSub}>
                      Also linked to:{' '}
                      {otherParents.map((p) => p.name?.split(' ')[0]).join(', ')}
                    </Text>
                  )}
                </View>
                <View
                  style={[
                    styles.checkBox,
                    selected && styles.checkBoxActive,
                  ]}
                >
                  {selected ? (
                    <Feather name="check" size={14} color={COLORS.white} />
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerBtn, styles.footerBtnSecondary]}
          onPress={() => setDraftChildIds(null)}
          disabled={!dirty || working}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.footerBtnSecondaryText,
              (!dirty || working) && { opacity: 0.4 },
            ]}
          >
            Reset
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.footerBtn,
            styles.footerBtnPrimary,
            (!dirty || working) && styles.footerBtnDisabled,
          ]}
          onPress={save}
          disabled={!dirty || working}
          activeOpacity={0.85}
        >
          {working ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <>
              <Feather name="save" size={14} color={COLORS.white} />
              <Text style={styles.footerBtnPrimaryText}>Save Assignment</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
    color: SAGE,
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
    paddingBottom: SPACING.xl,
  },

  loadingBlock: {
    padding: SPACING.xl,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },

  /* Parent hero */
  parentHero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  heroAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  heroAvatarEmoji: { fontSize: 28 },
  heroName: {
    fontSize: 16,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.4,
  },
  heroMeta: {
    fontSize: 12,
    color: COLORS.gray500,
    fontWeight: '500',
    marginTop: 2,
  },
  heroSub: {
    fontSize: 11,
    color: SAGE,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.3,
  },

  /* Section */
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 12,
    color: COLORS.gray500,
    marginBottom: SPACING.md,
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

  /* Kid row */
  kidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  kidRowActive: {
    borderColor: SAGE,
    backgroundColor: SAGE + '08',
  },
  kidAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  kidAvatarEmoji: { fontSize: 22 },
  kidNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  kidName: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.2,
    marginRight: SPACING.sm,
  },
  rolePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  rolePillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  kidMeta: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  kidSub: {
    fontSize: 10,
    color: COLORS.gray400,
    fontStyle: 'italic',
    marginTop: 2,
  },

  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBoxActive: {
    backgroundColor: SAGE,
    borderColor: SAGE,
  },

  /* Footer */
  footer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    backgroundColor: COLORS.surface,
  },
  footerBtn: {
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  footerBtnSecondary: {
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.gray100,
    marginRight: SPACING.sm,
  },
  footerBtnSecondaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray600,
    letterSpacing: 0.2,
  },
  footerBtnPrimary: {
    flex: 1,
    backgroundColor: SAGE,
  },
  footerBtnDisabled: { opacity: 0.4 },
  footerBtnPrimaryText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.3,
    marginLeft: 6,
  },
});
