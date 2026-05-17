import React, { useState, useEffect } from 'react';
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
} from '../../../constants/colors';
import dataStore from '../../../utils/dataStore';
import { useAuth } from '../../../../App';

const BLUSH = '#D4536B';
const INK = '#1A2332';

const PARTNER_LOOKUP = {
  partner1: 'partner2',
  partner2: 'partner1',
};

const PRIMARY_NAV = [
  { id: 'home', label: 'Home', tab: 'Home' },
  { id: 'together', label: 'Together', tab: 'Together' },
  { id: 'insights', label: 'Insights', tab: 'Insights' },
  { id: 'profile', label: 'Profile', tab: 'Profile' },
];

const QUICK_LINKS = [
  { id: 'mood', label: 'Mood Check-In', screen: 'MoodCheckIn' },
  { id: 'journal', label: 'Couple Journal', screen: 'Journal' },
  { id: 'breath', label: 'Breathe Together', screen: 'BreathingExercise' },
  { id: 'affirm', label: 'Affirmations', screen: 'Affirmations' },
];

const MORE_LINKS = [
  { id: 'progress', label: 'Progress', screen: 'Progress' },
  { id: 'programs', label: 'Therapy Programs', screen: 'TherapyPrograms' },
  { id: 'toolbox', label: 'Coping Toolbox', screen: 'CopingToolbox' },
  { id: 'resources', label: 'Resources', screen: 'Resources' },
  { id: 'notifications', label: 'Notifications', screen: 'Notifications' },
  { id: 'settings', label: 'Settings', screen: 'Settings' },
];

export default function CouplesDrawerContent({ navigation }) {
  const { signOut } = useAuth();
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        await dataStore.initialize();
        const u = await dataStore.getCurrentUser();
        setUser(u);
        if (u) {
          const partnerId = PARTNER_LOOKUP[u.id];
          if (partnerId) {
            const p = await dataStore.getUserById(partnerId);
            setPartner(p);
          }
        }
      } catch (e) {
        console.log('[Couples DrawerContent] load error', e);
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

  const userName = (user?.name || 'You').split(' ')[0];
  const partnerName = (partner?.name || 'Partner').split(' ')[0];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Couple identity */}
        <View style={styles.profileBlock}>
          <View style={styles.dualAvatarRow}>
            <View
              style={[
                styles.dualAvatar,
                { backgroundColor: user?.profileColor || COLORS.primary },
              ]}
            >
              <Text style={styles.dualAvatarEmoji}>{user?.avatar || '👤'}</Text>
            </View>
            <Text style={styles.dualAmp}>&</Text>
            <View
              style={[
                styles.dualAvatar,
                { backgroundColor: partner?.profileColor || BLUSH },
              ]}
            >
              <Text style={styles.dualAvatarEmoji}>{partner?.avatar || '👤'}</Text>
            </View>
          </View>
          <Text style={styles.name}>
            {userName} <Text style={styles.nameAmp}>&</Text> {partnerName}
          </Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
          <View style={styles.roleBadge}>
            <View style={styles.roleDot} />
            <Text style={styles.roleText}>Couples Account</Text>
          </View>
        </View>

        {/* Primary nav */}
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
              <Text style={styles.navLabel}>{it.label}</Text>
              <Text style={styles.navChev}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
        <View style={styles.section}>
          {QUICK_LINKS.map((it, i) => (
            <TouchableOpacity
              key={it.id}
              style={[
                styles.linkItem,
                i < QUICK_LINKS.length - 1 && styles.linkItemBorder,
              ]}
              onPress={() => goToScreen(it.screen)}
              activeOpacity={0.7}
            >
              <Text style={styles.linkLabel}>{it.label}</Text>
              <Text style={styles.linkChev}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>MORE</Text>
        <View style={styles.section}>
          {MORE_LINKS.map((it, i) => (
            <TouchableOpacity
              key={it.id}
              style={[
                styles.linkItem,
                i < MORE_LINKS.length - 1 && styles.linkItemBorder,
              ]}
              onPress={() => goToScreen(it.screen)}
              activeOpacity={0.7}
            >
              <Text style={styles.linkLabel}>{it.label}</Text>
              <Text style={styles.linkChev}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.logoutBtn} onPress={signOut} activeOpacity={0.85}>
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
    paddingVertical: SPACING.xl,
    marginBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  dualAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  dualAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dualAvatarEmoji: { fontSize: 22 },
  dualAmp: {
    fontSize: 22,
    fontWeight: '300',
    color: COLORS.gray400,
    fontStyle: 'italic',
    marginHorizontal: SPACING.md,
  },
  name: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.4,
  },
  nameAmp: {
    fontWeight: '300',
    fontStyle: 'italic',
    color: COLORS.gray500,
  },
  email: {
    fontSize: 11,
    color: COLORS.gray500,
    marginTop: 2,
    marginBottom: SPACING.md,
    fontWeight: '500',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BLUSH + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BLUSH,
    marginRight: 6,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    color: BLUSH,
    letterSpacing: 0.6,
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
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  navItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  navLabel: {
    fontSize: 14,
    color: INK,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  navChev: { fontSize: 18, color: COLORS.gray400, fontWeight: '500' },

  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  linkItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  linkLabel: {
    fontSize: 13,
    color: INK,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  linkChev: { fontSize: 16, color: COLORS.gray400, fontWeight: '500' },

  logoutBtn: {
    margin: SPACING.lg,
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  logoutText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
