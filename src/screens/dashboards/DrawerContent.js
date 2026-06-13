import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../../components/Avatar';

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

const ITEMS = [
  { id: 'home', emoji: '🏠', label: 'Home', tab: 'Home' },
  { id: 'worksheets', emoji: '📋', label: 'Worksheets', tab: 'Worksheets' },
  { id: 'mood', emoji: '😊', label: 'Mood & Rewards', tab: 'Mood' },
  { id: 'profile', emoji: '👤', label: 'Profile', tab: 'Profile' },
];

// Drawer items now route via the tab navigator: drawer → DashboardTabs →
// <tab> → <inner stack screen>. That way the screens registered inside the
// per-tab stacks are reachable from the drawer.
const SHORTCUTS = [
  { id: 'toolbox',  emoji: '🧰', label: 'Coping Toolbox', tab: 'Profile', screen: 'CopingToolbox' },
  { id: 'avatar',   emoji: '🎨', label: 'My Avatar',      tab: 'Profile', screen: 'AvatarCustomizer' },
  { id: 'progress', emoji: '📊', label: 'Progress',       tab: 'Profile', screen: 'Progress' },
  { id: 'journal',  emoji: '📔', label: 'Journal',        tab: 'Profile', screen: 'Journal' },
  { id: 'settings', emoji: '⚙️', label: 'Settings',       tab: 'Profile', screen: 'Settings' },
];

export default function DrawerContent({ navigation }) {
  // Live profile from AuthContext — updates when avatar/color/accessory change.
  const { signOut, profile: user } = useAuth();

  const goToTab = (tabName) => {
    navigation.navigate('DashboardTabs', { screen: tabName });
    navigation.closeDrawer?.();
  };

  const goToTabbedScreen = (tabName, screenName) => {
    navigation.navigate('DashboardTabs', {
      screen: tabName,
      params: { screen: screenName },
    });
    navigation.closeDrawer?.();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileBlock}>
          <View style={styles.avatarWrap}>
            <Avatar
              value={user?.avatar}
              name={user?.name}
              size={64}
              backgroundColor={user?.profileColor || COLORS.primary}
              style={SHADOWS.md}
            />
            {user?.accessory && ACCESSORY_EMOJI[user.accessory] ? (
              <Text style={styles.accessoryBadge}>
                {ACCESSORY_EMOJI[user.accessory]}
              </Text>
            ) : null}
          </View>
          <Text style={styles.name}>{user?.name || 'Guest'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
          <View style={styles.roleBadge}>
            <View style={styles.roleDot} />
            <Text style={styles.roleText}>Child Account</Text>
          </View>
        </View>

        <View style={styles.section}>
          {ITEMS.map((it) => (
            <TouchableOpacity key={it.id} style={styles.item} onPress={() => goToTab(it.tab)}>
              <Text style={styles.itemEmoji}>{it.emoji}</Text>
              <Text style={styles.itemLabel}>{it.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Shortcuts</Text>
        <View style={styles.section}>
          {SHORTCUTS.map((it) => (
            <TouchableOpacity
              key={it.id}
              style={styles.item}
              onPress={() => goToTabbedScreen(it.tab, it.screen)}
            >
              <Text style={styles.itemEmoji}>{it.emoji}</Text>
              <Text style={styles.itemLabel}>{it.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xl },
  profileBlock: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
    marginBottom: SPACING.lg,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  accessoryBadge: {
    position: 'absolute',
    top: -8,
    right: -4,
    fontSize: 22,
  },
  name: { fontSize: TYPOGRAPHY.lg, fontWeight: '700', color: COLORS.gray700 },
  email: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginTop: 2,
    marginBottom: SPACING.sm,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLighter + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.4,
  },
  sectionLabel: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '700',
    color: COLORS.gray500,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  section: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  itemEmoji: { fontSize: 22, marginRight: SPACING.md },
  itemLabel: { fontSize: TYPOGRAPHY.base, color: COLORS.gray700, fontWeight: '500' },
  logoutBtn: {
    margin: SPACING.lg,
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  logoutText: { color: COLORS.white, fontSize: TYPOGRAPHY.base, fontWeight: '700' },
});
