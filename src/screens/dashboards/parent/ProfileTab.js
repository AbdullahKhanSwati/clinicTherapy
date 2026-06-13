import React, { useState, useCallback } from 'react';
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
import { useAuth } from '../../../contexts/AuthContext';
import Avatar from '../../../components/Avatar';
import { getChildrenForParent } from '../../../services/api';

const INK = '#1A2332';
const SAGE = '#15803D';

const ACCESSORY_EMOJI = {
  none: '',
  crown: '👑',
  star: '⭐',
  sparkles: '✨',
  flower: '🌸',
  heart: '💖',
  hat: '🎩',
  rainbow: '🌈',
};

export default function ParentProfileTab() {
  const navigation = useNavigation();
  const { signOut, profile: user } = useAuth();
  const [children, setChildren] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        if (!user?.id) return;
        try {
          const kids = await getChildrenForParent(user.id);
          if (!cancelled) setChildren(kids || []);
        } catch (e) {
          console.log('[Parent ProfileTab] load error', e);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [user?.id])
  );

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  // FamilyDashboard registers Resources/Progress/etc. on its outer parent
  // (ParentRoot) stack, so we navigate through the parent navigator.
  const goToParent = (screenName) => {
    const parent = navigation.getParent?.() || navigation;
    parent.navigate(screenName);
  };

  // Children is a sibling tab — bubble up to the tab navigator.
  const goToTab = (tabName) => {
    const parent = navigation.getParent?.() || navigation;
    parent.navigate(tabName);
  };

  const MENU_GROUPS = [
    {
      label: 'Family',
      items: [
        { id: 'children', label: 'My Children', _kind: 'tab', target: 'Children' },
        { id: 'avatar', label: 'Customize Avatar', _kind: 'parent', target: 'AvatarCustomizer' },
      ],
    },
    {
      label: 'Wellness',
      items: [
        { id: 'progress', label: 'Progress Report', _kind: 'parent', target: 'Progress' },
        { id: 'resources', label: 'Resources', _kind: 'parent', target: 'Resources' },
        { id: 'toolbox', label: 'Coping Toolbox', _kind: 'parent', target: 'CopingToolbox' },
        { id: 'journal', label: 'Family Journal', _kind: 'parent', target: 'Journal' },
      ],
    },
    {
      label: 'Account',
      items: [
        { id: 'notifications', label: 'Notifications', _kind: 'parent', target: 'Notifications' },
        { id: 'settings', label: 'Settings', _kind: 'parent', target: 'Settings' },
      ],
    },
  ];

  const dispatchItem = (item) => {
    if (item._kind === 'tab') goToTab(item.target);
    else goToParent(item.target);
  };

  const profileColor = user?.profileColor || SAGE;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.iconBtn} onPress={openDrawer}>
            <Feather name="menu" size={20} color={INK} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Text style={styles.eyebrow}>ACCOUNT</Text>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => goToParent('AvatarCustomizer')}
          >
            <Feather name="edit-2" size={18} color={INK} />
          </TouchableOpacity>
        </View>

        {/* Profile hero */}
        <View style={styles.profileHero}>
          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={() => goToParent('AvatarCustomizer')}
            activeOpacity={0.85}
          >
            <Avatar
              value={user?.avatar}
              name={user?.name}
              size={80}
              backgroundColor={profileColor}
              emojiSize={38}
            />
            {user?.accessory && ACCESSORY_EMOJI[user.accessory] ? (
              <Text style={styles.accessoryBadge}>
                {ACCESSORY_EMOJI[user.accessory]}
              </Text>
            ) : null}
          </TouchableOpacity>
          <Text style={styles.profileName}>{user?.name || 'Parent'}</Text>
          <Text style={styles.profileEmail}>{user?.email || ''}</Text>

          {user?.parentingRelationship ? (
            <View style={styles.relationshipBadge}>
              <Text style={styles.relationshipText}>
                {user.parentingRelationship.toUpperCase()}
              </Text>
            </View>
          ) : null}

          {/* Children chips */}
          {children.length > 0 && (
            <View style={styles.childrenChips}>
              <Text style={styles.childrenLabel}>YOUR CHILDREN</Text>
              <View style={styles.chipsRow}>
                {children.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.childChip,
                      { backgroundColor: (c.profileColor || SAGE) + '15' },
                    ]}
                    onPress={() => {
                      const parent = navigation.getParent?.() || navigation;
                      parent.navigate('ChildDetail', { childId: c.id });
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.childChipEmoji}>
                      {c.avatar && !/^https?:\/\//i.test(c.avatar)
                        ? c.avatar
                        : '👤'}
                    </Text>
                    <Text style={styles.childChipName}>
                      {c.name?.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Menu */}
        {MENU_GROUPS.map((group) => (
          <View key={group.label} style={styles.menuGroup}>
            <Text style={styles.menuGroupLabel}>
              {group.label.toUpperCase()}
            </Text>
            <View style={styles.menuCard}>
              {group.items.map((item, i) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    i < group.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={() => dispatchItem(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Feather name="chevron-right" size={18} color={COLORS.gray400} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={signOut}
          activeOpacity={0.85}
        >
          <Feather name="log-out" size={16} color={COLORS.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Therapy Companion · v0.1</Text>
        <View style={{ height: SPACING.lg }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },

  headerRow: {
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

  profileHero: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  accessoryBadge: {
    position: 'absolute',
    top: -8,
    right: -4,
    fontSize: 28,
  },
  profileName: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.5,
  },
  profileEmail: {
    fontSize: 12,
    color: COLORS.gray500,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  relationshipBadge: {
    backgroundColor: SAGE + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  relationshipText: {
    fontSize: 10,
    fontWeight: '800',
    color: SAGE,
    letterSpacing: 0.8,
  },

  childrenChips: {
    width: '100%',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    alignItems: 'center',
  },
  childrenLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.2,
    marginBottom: SPACING.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  childChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    marginHorizontal: 3,
    marginBottom: 4,
  },
  childChipEmoji: { fontSize: 14, marginRight: 4 },
  childChipName: {
    fontSize: 11,
    fontWeight: '700',
    color: INK,
  },

  menuGroup: { marginBottom: SPACING.xl },
  menuGroupLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
    marginBottom: SPACING.sm,
  },
  menuCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  menuLabel: {
    fontSize: 14,
    color: INK,
    fontWeight: '600',
    letterSpacing: -0.1,
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  logoutText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.2,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.gray400,
    marginTop: SPACING.lg,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
