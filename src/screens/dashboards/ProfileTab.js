import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/colors';
import dataStore from '../../utils/dataStore';
import { useAuth } from '../../../App';
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
  const { signOut } = useAuth();
  const [user, setUser] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          await dataStore.initialize();
          const u = await dataStore.getCurrentUser();
          if (!cancelled) setUser(u);
        } catch (e) {
          console.log('[ProfileTab] load error', e);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const MENU = [
    { id: 'avatar', emoji: '🎨', label: 'Customize Avatar', screen: 'AvatarCustomizer' },
    { id: 'toolbox', emoji: '🧰', label: 'Coping Toolbox', screen: 'CopingToolbox' },
    { id: 'progress', emoji: '📊', label: 'My Progress', screen: 'Progress' },
    { id: 'journal', emoji: '📔', label: 'Journal', screen: 'Journal' },
    { id: 'resources', emoji: '📚', label: 'Resources', screen: 'Resources' },
    { id: 'notifications', emoji: '🔔', label: 'Notifications', screen: 'Notifications' },
    { id: 'settings', emoji: '⚙️', label: 'Settings', screen: 'Settings' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TabScreenHeader title="Profile" />
        <View style={styles.profileBlock}>
          <TouchableOpacity
            onPress={() => navigation.navigate('AvatarCustomizer')}
            activeOpacity={0.85}
          >
            <View
              style={[
                styles.avatarRing,
                { backgroundColor: user?.profileColor || COLORS.primary },
              ]}
            >
              <View style={styles.avatarInner}>
                {user?.avatar ? (
                  <Text style={styles.avatarChar}>{user.avatar}</Text>
                ) : (
                  <Text style={styles.avatarText}>
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
          <Text style={styles.name}>{user?.name || 'Guest'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
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
  avatarInner: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarChar: { fontSize: 48 },
  avatarText: { fontSize: 32, fontWeight: '700', color: COLORS.primary },
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
  email: { fontSize: TYPOGRAPHY.sm, color: COLORS.gray500 },
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
