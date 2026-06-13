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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
} from '../../constants/colors';
import { listAllProfiles, setParentsForChild } from '../../services/api';

const INK = '#1A2332';
const SAGE = '#15803D';
const DANGER = '#DC2626';

/**
 * AssignParentScreen — picker for linking a child/teen to one or more parents.
 *
 * route.params:
 *   - childId (required)
 *   - role: 'child' | 'teen' (optional, used for eyebrow)
 */
export default function AssignParentScreen({ route, navigation }) {
  const childId = route?.params?.childId;
  const role = route?.params?.role || 'child';

  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [draftParentIds, setDraftParentIds] = useState(null);
  const insets = useSafeAreaInsets();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const list = await listAllProfiles();
      const map = {};
      (list || []).forEach((p) => { map[p.id] = p; });
      setUsers(map);
    } catch (e) {
      console.log('[AssignParent] load', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const child = users[childId];
  const parents = useMemo(
    () => Object.values(users || {}).filter((u) => u?.role === 'family'),
    [users]
  );

  const currentParentIds = useMemo(
    () =>
      parents
        .filter((p) => (p.children || []).includes(childId))
        .map((p) => p.id),
    [parents, childId]
  );

  const selectedIds = draftParentIds ?? currentParentIds;

  const toggleParent = (parentId) => {
    const base = draftParentIds ?? currentParentIds;
    const next = base.includes(parentId)
      ? base.filter((id) => id !== parentId)
      : [...base, parentId];
    setDraftParentIds(next);
  };

  const dirty = useMemo(() => {
    if (draftParentIds === null) return false;
    const a = [...currentParentIds].sort().join(',');
    const b = [...draftParentIds].sort().join(',');
    return a !== b;
  }, [draftParentIds, currentParentIds]);

  const save = async () => {
    if (!dirty || !child) return;
    try {
      setWorking(true);
      await setParentsForChild(childId, draftParentIds);
      await load();
      setDraftParentIds(null);
      Alert.alert('Saved', 'Parent assignment updated.');
    } catch (e) {
      console.log('[AssignParent] save', e);
      Alert.alert('Error', e?.message || 'Could not save the assignment.');
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

  if (!child) {
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
          <Text style={styles.eyebrow}>
            {role === 'teen' ? 'TEEN' : 'CHILD'} · ASSIGN PARENT
          </Text>
          <Text style={styles.headerTitle}>Link a Parent</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Child summary */}
        <View style={styles.childCard}>
          <View
            style={[
              styles.childAvatar,
              { backgroundColor: child.profileColor || SAGE },
            ]}
          >
            <Text style={styles.childAvatarEmoji}>{child.avatar || '👤'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.childName}>{child.name}</Text>
            <Text style={styles.childMeta}>
              {child.role === 'teen' ? 'Teen' : 'Child'}
              {child.age ? ` · age ${child.age}` : ''}
            </Text>
            {child.emotionalFocus?.length ? (
              <View style={styles.focusRow}>
                {child.emotionalFocus.slice(0, 3).map((f) => (
                  <View key={f} style={styles.focusTag}>
                    <Text style={styles.focusTagText}>{f}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </View>

        <Text style={styles.sectionLabel}>SELECT PARENT(S)</Text>
        <Text style={styles.sectionHint}>
          Tap to toggle. A child can be linked to one or more parents.
        </Text>

        {parents.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="users" size={28} color={COLORS.gray300} />
            <Text style={styles.emptyTitle}>No parents registered</Text>
            <Text style={styles.emptyText}>
              Create a user with role "family" first.
            </Text>
          </View>
        ) : (
          parents.map((p) => {
            const selected = selectedIds.includes(p.id);
            const otherKids = (p.children || []).filter((id) => id !== childId)
              .length;
            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.parentRow, selected && styles.parentRowActive]}
                onPress={() => toggleParent(p.id)}
                activeOpacity={0.85}
              >
                <View
                  style={[
                    styles.parentAvatar,
                    { backgroundColor: p.profileColor || SAGE },
                  ]}
                >
                  <Text style={styles.parentAvatarEmoji}>
                    {p.avatar || '👤'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.parentName}>{p.name}</Text>
                  <Text style={styles.parentMeta}>
                    {p.parentingRelationship
                      ? p.parentingRelationship + ' · '
                      : ''}
                    {p.email || 'No email'}
                  </Text>
                  {otherKids > 0 && (
                    <Text style={styles.parentSub}>
                      Already linked to {otherKids} other{' '}
                      {otherKids === 1 ? 'child' : 'children'}
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

      <View style={[styles.footer, { paddingBottom: insets.bottom + SPACING.md }]}>
        <TouchableOpacity
          style={[styles.footerBtn, styles.footerBtnSecondary]}
          onPress={() => setDraftParentIds(null)}
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

  loadingBlock: { padding: SPACING.xl, alignItems: 'center', flex: 1, justifyContent: 'center' },

  /* Child card */
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  childAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  childAvatarEmoji: { fontSize: 28 },
  childName: {
    fontSize: 16,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.4,
  },
  childMeta: {
    fontSize: 12,
    color: COLORS.gray500,
    fontWeight: '500',
    marginTop: 2,
  },

  focusRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
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

  /* Parent row */
  parentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  parentRowActive: {
    borderColor: SAGE,
    backgroundColor: SAGE + '08',
  },
  parentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  parentAvatarEmoji: { fontSize: 22 },
  parentName: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.2,
  },
  parentMeta: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
    marginTop: 1,
  },
  parentSub: {
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
