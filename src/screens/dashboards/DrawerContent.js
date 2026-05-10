import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/colors';
import dataStore from '../../utils/dataStore';
import { useAuth } from '../../../App';

const ITEMS = [
  { id: 'home', emoji: '🏠', label: 'Home', tab: 'Home' },
  { id: 'worksheets', emoji: '📋', label: 'Worksheets', tab: 'Worksheets' },
  { id: 'mood', emoji: '😊', label: 'Mood & Rewards', tab: 'Mood' },
  { id: 'profile', emoji: '👤', label: 'Profile', tab: 'Profile' },
];

const SHORTCUTS = [
  { id: 'toolbox', emoji: '🧰', label: 'Coping Toolbox', screen: 'CopingToolbox' },
  { id: 'avatar', emoji: '🎨', label: 'My Avatar', screen: 'AvatarCustomizer' },
  { id: 'progress', emoji: '📊', label: 'Progress', screen: 'Progress' },
  { id: 'journal', emoji: '📔', label: 'Journal', screen: 'Journal' },
  { id: 'settings', emoji: '⚙️', label: 'Settings', screen: 'Settings' },
];

export default function DrawerContent({ navigation }) {
  const { signOut } = useAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        await dataStore.initialize();
        const u = await dataStore.getCurrentUser();
        setUser(u);
      } catch (e) {
        console.log('[DrawerContent] load error', e);
      }
    })();
  }, []);

  const goToTab = (tabName) => {
    navigation.navigate('DashboardTabs', { screen: tabName });
    navigation.closeDrawer?.();
  };

  const goToScreen = (screenName) => {
    const parent = navigation.getParent?.();
    (parent || navigation).navigate(screenName);
    navigation.closeDrawer?.();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileBlock}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name || 'Guest'}</Text>
          <Text style={styles.role}>{user?.role || 'child'}</Text>
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
            <TouchableOpacity key={it.id} style={styles.item} onPress={() => goToScreen(it.screen)}>
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
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  avatarText: { fontSize: 26, fontWeight: '700', color: COLORS.white },
  name: { fontSize: TYPOGRAPHY.lg, fontWeight: '700', color: COLORS.gray700 },
  role: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginTop: 2,
    textTransform: 'capitalize',
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
