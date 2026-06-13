import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../../components/Avatar';
import TabScreenHeader from '../../components/TabScreenHeader';

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

export default function ProfileTab({ navigation }) {
  // Live profile from AuthContext so avatar/color/accessory changes show instantly.
  const { signOut, profile: user } = useAuth();

  const MENU = [
    { id: 'avatar', emoji: '🎨', label: 'Customize Avatar', screen: 'AvatarCustomizer' },
    { id: 'toolbox', emoji: '🧰', label: 'Coping Toolbox', screen: 'CopingToolbox' },
    { id: 'progress', emoji: '📊', label: 'My Progress', screen: 'Progress' },
    { id: 'journal', emoji: '📔', label: 'Journal', screen: 'Journal' },
    { id: 'resources', emoji: '📚', label: 'Resources', screen: 'Resources' },
    { id: 'notifications', emoji: '🔔', label: 'Notifications', screen: 'Notifications' },
    { id: 'settings', emoji: '⚙️', label: 'Settings', screen: 'Settings' },
  ];

  const profileColor = user?.profileColor || COLORS.primary;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TabScreenHeader title="Profile" />
        <View style={styles.profileBlock}>
          <TouchableOpacity
            onPress={() => navigation.navigate('AvatarCustomizer')}
            activeOpacity={0.85}
          >
            <View style={[styles.avatarRing, { backgroundColor: profileColor }]}>
              <Avatar
                value={user?.avatar}
                name={user?.name}
                size={84}
                backgroundColor={profileColor}
                emojiSize={48}
              />
              {user?.accessory && ACCESSORY_EMOJI[user.accessory] ? (
                <Text style={styles.accessoryBadge}>
                  {ACCESSORY_EMOJI[user.accessory]}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{user?.name || 'Guest'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
          <View style={styles.roleBadge}>
            <View style={styles.roleDot} />
            <Text style={styles.roleText}>Child Account</Text>
          </View>
        </View>

        <View style={styles.menuCard}>
          {MENU.map((m, i) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.menuItem, i < MENU.length - 1 && styles.menuItemBorder]}
              onPress={() => navigation.navigate(m.screen)}
            >
              <Text style={styles.menuEmoji}>{m.emoji}</Text>
              <Text style={styles.menuLabel}>{m.label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  profileBlock: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  accessoryBadge: {
    position: 'absolute',
    top: -6,
    right: -2,
    fontSize: 28,
  },
  name: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: 2,
  },
  email: { fontSize: TYPOGRAPHY.sm, color: COLORS.gray500, marginBottom: SPACING.sm },
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
  menuCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  menuEmoji: { fontSize: 22, marginRight: SPACING.md },
  menuLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.gray700,
    fontWeight: '500',
  },
  menuArrow: { fontSize: TYPOGRAPHY.xl, color: COLORS.gray400 },
  logoutBtn: {
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  logoutText: { color: COLORS.white, fontSize: TYPOGRAPHY.base, fontWeight: '700' },
});
