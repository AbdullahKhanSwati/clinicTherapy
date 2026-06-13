import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from '../../../constants/colors';
import { useAuth } from '../../../contexts/AuthContext';
import Avatar from '../../../components/Avatar';

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

const PRIMARY_NAV = [
  { id: 'home', emoji: '🏠', label: 'Home', tab: 'Home' },
  { id: 'tools', emoji: '🧰', label: 'Tools', tab: 'Tools' },
  { id: 'insights', emoji: '📊', label: 'Insights', tab: 'Insights' },
  { id: 'profile', emoji: '👤', label: 'Profile', tab: 'Profile' },
];

// `tab` = the bottom-tab the screen lives under; `screen` = the inner stack
// screen name. The drawer pushes onto the tab's stack via nested navigation.
const QUICK_LINKS = [
  { id: 'mood',    emoji: '🫧', label: 'Mood Check-In',     tab: 'Home',     screen: 'MoodCheckIn' },
  { id: 'journal', emoji: '📔', label: 'New Journal Entry', tab: 'Home',     screen: 'Journal' },
  { id: 'breath',  emoji: '🌬️', label: 'Quick Breath',      tab: 'Tools',    screen: 'BreathingExercise' },
  { id: 'toolbox', emoji: '🧰', label: 'Coping Toolbox',    tab: 'Tools',    screen: 'CopingToolbox' },
];

const MORE_LINKS = [
  { id: 'progress',      emoji: '📈', label: 'Progress',          tab: 'Insights', screen: 'Progress' },
  { id: 'programs',      emoji: '🎯', label: 'Therapy Programs',  tab: 'Tools',    screen: 'TherapyPrograms' },
  { id: 'resources',     emoji: '📚', label: 'Resources',         tab: 'Profile',  screen: 'Resources' },
  { id: 'notifications', emoji: '🔔', label: 'Notifications',     tab: 'Home',     screen: 'Notifications' },
  { id: 'settings',      emoji: '⚙️', label: 'Settings',          tab: 'Profile',  screen: 'Settings' },
];

export default function TeenDrawerContent({ navigation }) {
  // Read the live profile straight from AuthContext. The moment the avatar
  // is updated anywhere (e.g. AvatarCustomizer calls refreshProfile()) this
  // component re-renders with the new value — no local fetch needed.
  const { signOut, profile: user } = useAuth();

  const goToTab = (tabName) => {
    navigation.navigate('DashboardTabs', { screen: tabName });
    navigation.closeDrawer?.();
  };

  // Drawer items now route via the tab navigator: drawer → DashboardTabs →
  // <tab> → <inner stack screen>. That way the screens registered inside
  // HomeStack / ToolsStack / InsightsStack / ProfileStack are actually
  // reachable from the drawer.
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
        {/* Profile block */}
        <View style={styles.profileBlock}>
          <View style={styles.avatarWrap}>
            <Avatar
              value={user?.avatar}
              name={user?.name}
              size={72}
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
            <Text style={styles.roleText}>Teen Account</Text>
          </View>
        </View>

        {/* Primary nav */}
        <View style={styles.section}>
          {PRIMARY_NAV.map((it) => (
            <TouchableOpacity
              key={it.id}
              style={styles.navItem}
              onPress={() => goToTab(it.tab)}
              activeOpacity={0.7}
            >
              <Text style={styles.navEmoji}>{it.emoji}</Text>
              <Text style={styles.navLabel}>{it.label}</Text>
              <Text style={styles.navChev}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionLabel}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          {QUICK_LINKS.map((it) => (
            <TouchableOpacity
              key={it.id}
              style={styles.quickTile}
              onPress={() => goToTabbedScreen(it.tab, it.screen)}
              activeOpacity={0.85}
            >
              <Text style={styles.quickEmoji}>{it.emoji}</Text>
              <Text style={styles.quickLabel} numberOfLines={2}>
                {it.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* More */}
        <Text style={styles.sectionLabel}>More</Text>
        <View style={styles.section}>
          {MORE_LINKS.map((it, i) => (
            <TouchableOpacity
              key={it.id}
              style={[
                styles.linkItem,
                i < MORE_LINKS.length - 1 && styles.linkItemBorder,
              ]}
              onPress={() => goToTabbedScreen(it.tab, it.screen)}
              activeOpacity={0.7}
            >
              <Text style={styles.linkEmoji}>{it.emoji}</Text>
              <Text style={styles.linkLabel}>{it.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.logoutBtn} onPress={signOut} activeOpacity={0.85}>
        <Text style={styles.logoutIcon}>↩</Text>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xl },

  profileBlock: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  accessoryBadge: {
    position: 'absolute',
    top: -8,
    right: -6,
    fontSize: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  avatarChar: { fontSize: 36 },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  name: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '800',
    color: COLORS.gray700,
    letterSpacing: -0.3,
  },
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

  section: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  navEmoji: { fontSize: 22, marginRight: SPACING.md },
  navLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.gray700,
    fontWeight: '600',
  },
  navChev: { fontSize: 24, color: COLORS.gray400 },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },

  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  quickTile: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  quickEmoji: { fontSize: 24, marginBottom: 4 },
  quickLabel: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
    color: COLORS.gray700,
    textAlign: 'center',
  },

  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  linkItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  linkEmoji: { fontSize: 18, marginRight: SPACING.md },
  linkLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray700,
    fontWeight: '500',
  },

  logoutBtn: {
    flexDirection: 'row',
    margin: SPACING.lg,
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  logoutIcon: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    marginRight: SPACING.sm,
  },
  logoutText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
  },
});
