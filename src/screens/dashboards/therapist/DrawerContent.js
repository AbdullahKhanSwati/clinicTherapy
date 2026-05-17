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
const ACCENT = COLORS.primary;
const SUCCESS = '#15803D';

const PRIMARY_NAV = [
  { id: 'overview', label: 'Overview', icon: 'grid', tab: 'Overview' },
  { id: 'clients', label: 'Clients', icon: 'users', tab: 'Clients' },
  { id: 'worksheets', label: 'Content', icon: 'layers', tab: 'Worksheets' },
  { id: 'insights', label: 'Analytics', icon: 'bar-chart-2', tab: 'Insights' },
  { id: 'profile', label: 'Profile', icon: 'user', tab: 'Profile' },
];

const QUICK_LINKS = [
  { id: 'assign', label: 'Assign Worksheet', icon: 'send', screen: 'AssignWorksheet' },
  { id: 'new_worksheet', label: 'Create Worksheet', icon: 'file-plus', screen: 'CreateWorksheet' },
  { id: 'new_affirmation', label: 'Create Affirmation', icon: 'message-circle', screen: 'CreateAffirmation' },
  { id: 'new_coping', label: 'Create Coping Tool', icon: 'shield', screen: 'CreateCopingTool' },
  { id: 'new_resource', label: 'Create Resource', icon: 'book-open', screen: 'CreateResource' },
];

const SETTINGS_LINKS = [
  { id: 'notifications', label: 'Notifications', icon: 'bell', screen: 'Notifications' },
  { id: 'settings', label: 'Settings', icon: 'settings', screen: 'Settings' },
];

export default function TherapistDrawerContent({ navigation }) {
  const { signOut } = useAuth();
  const [therapist, setTherapist] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        await dataStore.initialize();
        const u = await dataStore.getCurrentUser();
        setTherapist(u);
      } catch (e) {
        console.log('[Therapist DrawerContent] load error', e);
      }
    })();
  }, []);

  const goToTab = (tabName) => {
    navigation.navigate('DashboardTabs', { screen: tabName });
    navigation.closeDrawer?.();
  };

  const goToScreen = (screenName) => {
    if (screenName === 'AssignWorksheet') {
      const parent = navigation.getParent?.();
      (parent || navigation).navigate('AssignWorksheet', { worksheetId: null });
    } else {
      const parent = navigation.getParent?.();
      (parent || navigation).navigate(screenName);
    }
    navigation.closeDrawer?.();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile header */}
        <View style={styles.profileBlock}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(therapist?.name || 'D').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{therapist?.name || 'Doctor'}</Text>
          <Text style={styles.email}>{therapist?.email || ''}</Text>
          <View style={styles.verifiedBadge}>
            <View style={styles.verifiedDot} />
            <Text style={styles.verifiedText}>Clinician</Text>
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
              <View style={styles.navIconBox}>
                <Feather name={it.icon} size={16} color={INK} />
              </View>
              <Text style={styles.navLabel}>{it.label}</Text>
              <Feather name="chevron-right" size={18} color={COLORS.gray400} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  name: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.4,
  },
  email: {
    fontSize: 11,
    color: COLORS.gray500,
    marginTop: 2,
    marginBottom: SPACING.sm,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SUCCESS + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  verifiedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SUCCESS,
    marginRight: 6,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: SUCCESS,
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
