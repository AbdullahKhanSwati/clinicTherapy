import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
} from '../../../constants/colors';
import dataStore from '../../../utils/dataStore';
import { useAuth } from '../../../../App';

const INK = '#1A2332';
const SAGE = '#15803D';

const PRIMARY_NAV = [
  { id: 'home', label: 'Home', icon: 'home', tab: 'Home' },
  { id: 'children', label: 'My Children', icon: 'users', tab: 'Children' },
  { id: 'insights', label: 'Family Insights', icon: 'bar-chart-2', tab: 'Insights' },
  { id: 'profile', label: 'Profile', icon: 'user', tab: 'Profile' },
];

const QUICK_LINKS = [
  { id: 'progress', label: 'Progress', icon: 'trending-up', screen: 'Progress' },
  { id: 'journal', label: 'Family Journal', icon: 'book', screen: 'Journal' },
  { id: 'resources', label: 'Resources', icon: 'book-open', screen: 'Resources' },
  { id: 'toolbox', label: 'Coping Toolbox', icon: 'shield', screen: 'CopingToolbox' },
  { id: 'affirmations', label: 'Affirmations', icon: 'message-circle', screen: 'Affirmations' },
];

const SETTINGS_LINKS = [
  { id: 'notifications', label: 'Notifications', icon: 'bell', screen: 'Notifications' },
  { id: 'settings', label: 'Settings', icon: 'settings', screen: 'Settings' },
];

export default function ParentDrawerContent({ navigation }) {
  const { signOut } = useAuth();
  const [user, setUser] = useState(null);
  const [childCount, setChildCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        await dataStore.initialize();
        const u = await dataStore.getCurrentUser();
        setUser(u);
        setChildCount((u?.children || []).length);
      } catch (e) {
        console.log('[Parent DrawerContent] load error', e);
      }
    })();
  }, []);

  const goToTab = (tabName) => {
    navigation.navigate('DashboardTabs', { screen: tabName });
    navigation.closeDrawer?.();
  };

  const goToScreen = (screenName) => {
    navigation.navigate(screenName);
    navigation.closeDrawer?.();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile block */}
        <View style={styles.profileBlock}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: user?.profileColor || SAGE },
            ]}
          >
            <Text style={styles.avatarEmoji}>{user?.avatar || '👤'}</Text>
          </View>
          <Text style={styles.name}>{user?.name || 'Parent'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
          <View style={styles.roleBadge}>
            <View style={styles.roleDot} />
            <Text style={styles.roleText}>
              Parent · {childCount} {childCount === 1 ? 'child' : 'children'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          {PRIMARY_NAV.map((it, i) => (
            <TouchableOpacity
              key={it.id}
              style={[
                styles.navItem,
                i < PRIMARY_NAV.length - 1 && styles.navItemBorder,
              ]}
              onPress={() => goToTab(it.tab)}
              activeOpacity={0.7}
            >
              <View style={styles.navIconBox}>
                <Feather name={it.icon} size={16} color={INK} />
              </View>
              <Text style={styles.navLabel}>{it.label}</Text>
              <Feather name="chevron-right" size={18} color={COLORS.gray400} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>QUICK ACCESS</Text>
        <View style={styles.section}>
          {QUICK_LINKS.map((it, i) => (
            <TouchableOpacity
              key={it.id}
              style={[
                styles.navItem,
                i < QUICK_LINKS.length - 1 && styles.navItemBorder,
              ]}
              onPress={() => goToScreen(it.screen)}
              activeOpacity={0.7}
            >
              <View style={styles.navIconBox}>
                <Feather name={it.icon} size={16} color={INK} />
              </View>
              <Text style={styles.navLabel}>{it.label}</Text>
              <Feather name="chevron-right" size={18} color={COLORS.gray400} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>SETTINGS</Text>
        <View style={styles.section}>
          {SETTINGS_LINKS.map((it, i) => (
            <TouchableOpacity
              key={it.id}
              style={[
                styles.navItem,
                i < SETTINGS_LINKS.length - 1 && styles.navItemBorder,
              ]}
              onPress={() => goToScreen(it.screen)}
              activeOpacity={0.7}
            >
              <View style={styles.navIconBox}>
                <Feather name={it.icon} size={16} color={INK} />
              </View>
              <Text style={styles.navLabel}>{it.label}</Text>
              <Feather name="chevron-right" size={18} color={COLORS.gray400} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.logoutBtn} onPress={signOut} activeOpacity={0.85}>
        <Feather name="log-out" size={16} color={COLORS.error} />
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarEmoji: { fontSize: 32 },
  name: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.3,
  },
  email: {
    fontSize: 11,
    color: COLORS.gray500,
    marginTop: 2,
    marginBottom: SPACING.sm,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SAGE + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SAGE,
    marginRight: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: SAGE,
    letterSpacing: 0.3,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },

  section: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  navItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  navIconBox: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  navLabel: {
    flex: 1,
    fontSize: 14,
    color: INK,
    fontWeight: '600',
    letterSpacing: -0.1,
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: SPACING.lg,
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
});
