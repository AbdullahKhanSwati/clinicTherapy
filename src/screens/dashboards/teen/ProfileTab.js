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
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from '../../../constants/colors';
import dataStore from '../../../utils/dataStore';
import { useAuth } from '../../../../App';

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

export default function TeenProfileTab() {
  const navigation = useNavigation();
  const { signOut } = useAuth();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ moods: 0, journals: 0, completed: 0 });

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          await dataStore.initialize();
          const u = await dataStore.getCurrentUser();
          if (cancelled) return;
          setUser(u);
          if (u) {
            const [m, j, a] = await Promise.all([
              dataStore.getMoodEntriesByUser(u.id),
              dataStore.getJournalEntriesByUser(u.id),
              dataStore.getAssignmentsByClient(u.id),
            ]);
            if (cancelled) return;
            setStats({
              moods: (m || []).length,
              journals: (j || []).length,
              completed: (a || []).filter((x) => x.status === 'completed').length,
            });
          }
        } catch (e) {
          console.log('[Teen ProfileTab] load error', e);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  const MENU_GROUPS = [
    {
      label: 'Personal',
      items: [
        { id: 'avatar', emoji: '🎨', label: 'Customize Avatar', screen: 'AvatarCustomizer' },
        { id: 'journal', emoji: '📔', label: 'Journal History', screen: 'Journal' },
      ],
    },
    {
      label: 'Wellness',
      items: [
        { id: 'progress', emoji: '📊', label: 'My Progress', screen: 'Progress' },
        { id: 'toolbox', emoji: '🧰', label: 'Coping Toolbox', screen: 'CopingToolbox' },
        { id: 'resources', emoji: '📚', label: 'Resources', screen: 'Resources' },
      ],
    },
    {
      label: 'Account',
      items: [
        { id: 'notifications', emoji: '🔔', label: 'Notifications', screen: 'Notifications' },
        { id: 'settings', emoji: '⚙️', label: 'Settings', screen: 'Settings' },
      ],
    },
  ];

  const profileColor = user?.profileColor || COLORS.primary;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.menuBtn} onPress={openDrawer}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Profile</Text>
            <Text style={styles.headerSub}>Manage your account</Text>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('AvatarCustomizer')}
          >
            <Text style={styles.editIcon}>✎</Text>
          </TouchableOpacity>
        </View>

        {/* Profile hero */}
        <View style={styles.profileHero}>
          <View style={styles.profileHeroBg} />
          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={() => navigation.navigate('AvatarCustomizer')}
            activeOpacity={0.85}
          >
            <View style={[styles.avatarRing, { backgroundColor: profileColor }]}>
              <View style={styles.avatarInner}>
                {user?.avatar ? (
                  <Text style={styles.avatarChar}>{user.avatar}</Text>
                ) : (
                  <Text style={styles.avatarLetter}>
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              {user?.accessory && ACCESSORY_EMOJI[user.accessory] ? (
                <Text style={styles.accessoryBadge}>
                  {ACCESSORY_EMOJI[user.accessory]}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>

          <Text style={styles.profileName}>{user?.name || 'Guest'}</Text>
          <Text style={styles.profileEmail}>{user?.email || ''}</Text>

          <View style={styles.profileTagsRow}>
            <View style={styles.profileTag}>
              <Text style={styles.profileTagText}>
                {user?.age ? `${user.age} years` : 'Teen'}
              </Text>
            </View>
            <View style={styles.profileTag}>
              <Text style={styles.profileTagText}>
                {(user?.emotionalFocus && user.emotionalFocus[0]) || 'Wellness'}
              </Text>
            </View>
          </View>

          {/* Stat strip */}
          <View style={styles.heroStats}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{stats.moods}</Text>
              <Text style={styles.heroStatLabel}>Check-ins</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{stats.journals}</Text>
              <Text style={styles.heroStatLabel}>Entries</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{stats.completed}</Text>
              <Text style={styles.heroStatLabel}>Completed</Text>
            </View>
          </View>
        </View>

        {/* Menu groups */}
        {MENU_GROUPS.map((group) => (
          <View key={group.label} style={styles.menuGroup}>
            <Text style={styles.menuGroupLabel}>{group.label}</Text>
            <View style={styles.menuCard}>
              {group.items.map((item, i) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    i < group.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={() => navigation.navigate(item.screen)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuIconBox}>
                    <Text style={styles.menuEmoji}>{item.emoji}</Text>
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuChev}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.logoutBtn} onPress={signOut} activeOpacity={0.85}>
          <Text style={styles.logoutIcon}>↩</Text>
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
    marginBottom: SPACING.lg,
  },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    ...SHADOWS.sm,
  },
  menuIcon: { fontSize: 20, color: COLORS.gray700, fontWeight: '700' },
  headerTitle: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '800',
    color: COLORS.gray700,
    letterSpacing: -0.5,
  },
  headerSub: { fontSize: TYPOGRAPHY.xs, color: COLORS.gray500, marginTop: 2 },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  editIcon: { fontSize: 18, color: COLORS.primary, fontWeight: '700' },

  /* Profile hero */
  profileHero: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    position: 'relative',
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  profileHeroBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: COLORS.surfaceAlt,
  },
  avatarWrap: { marginBottom: SPACING.md, zIndex: 1 },
  avatarRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  avatarInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarChar: { fontSize: 56 },
  avatarLetter: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -1,
  },
  accessoryBadge: { position: 'absolute', top: -8, right: -4, fontSize: 32 },

  profileName: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '800',
    color: COLORS.gray700,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  profileEmail: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
    marginBottom: SPACING.md,
  },
  profileTagsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  profileTag: {
    backgroundColor: COLORS.primaryLighter + '25',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    marginHorizontal: 4,
  },
  profileTagText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '700',
    color: COLORS.primary,
  },

  heroStats: {
    flexDirection: 'row',
    width: '100%',
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  heroStatItem: { flex: 1, alignItems: 'center' },
  heroStatValue: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '800',
    color: COLORS.gray700,
    letterSpacing: -0.4,
  },
  heroStatLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginTop: 2,
    fontWeight: '500',
  },
  heroStatDivider: { width: 1, backgroundColor: COLORS.gray200, marginVertical: 4 },

  /* Menu */
  menuGroup: { marginBottom: SPACING.lg },
  menuGroupLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  menuCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuEmoji: { fontSize: 18 },
  menuLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.gray700,
    fontWeight: '500',
  },
  menuChev: { fontSize: 24, color: COLORS.gray400 },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
    ...SHADOWS.sm,
  },
  logoutIcon: {
    fontSize: 18,
    color: COLORS.error,
    fontWeight: '700',
    marginRight: SPACING.sm,
  },
  logoutText: {
    color: COLORS.error,
    fontWeight: '700',
    fontSize: TYPOGRAPHY.base,
  },
  versionText: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray400,
    marginTop: SPACING.lg,
  },
});
