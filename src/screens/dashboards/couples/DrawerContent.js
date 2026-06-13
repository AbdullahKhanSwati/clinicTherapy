import React, { useEffect, useState } from 'react';
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
import { useAuth } from '../../../contexts/AuthContext';
import Avatar from '../../../components/Avatar';
import { getPartnerProfileForUser } from '../../../services/api';

const BLUSH = '#D4536B';
const INK = '#1A2332';

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
  { id: 'home', label: 'Home', tab: 'Home' },
  { id: 'together', label: 'Together', tab: 'Together' },
  { id: 'insights', label: 'Insights', tab: 'Insights' },
  { id: 'profile', label: 'Profile', tab: 'Profile' },
];

// Quick links open modal screens that live on the outer (Root) stack via the
// parent navigator. Relationship links and "more" links go to the Profile
// tab's inner stack (where AvatarCustomizer/Settings/etc. are registered).
const QUICK_LINKS = [
  { id: 'checkin',      label: 'Daily Check-In',       _kind: 'parent', screen: 'DailyCheckIn' },
  { id: 'appreciation', label: 'Send Appreciation',    _kind: 'parent', screen: 'AppreciationExchange' },
  { id: 'repair',       label: 'Send Repair Request',  _kind: 'parent', screen: 'RepairRequest' },
  { id: 'pause',        label: 'We Need a Pause',      _kind: 'parent', screen: 'ConflictPause' },
];

const RELATIONSHIP_LINKS = [
  { id: 'pairing', label: 'Manage Partner Pairing', _kind: 'parent', screen: 'CouplePairing' },
  { id: 'journal', label: 'Couple Journal',         _kind: 'tab',    tab: 'Profile', screen: 'Journal' },
  { id: 'mood',    label: 'Mood Check-In',          _kind: 'tab',    tab: 'Home',    screen: 'MoodCheckIn' },
];

const MORE_LINKS = [
  { id: 'progress',      label: 'Progress',         _kind: 'tab', tab: 'Profile', screen: 'Progress' },
  { id: 'programs',      label: 'Therapy Programs', _kind: 'tab', tab: 'Together', screen: 'TherapyPrograms' },
  { id: 'toolbox',       label: 'Coping Toolbox',   _kind: 'tab', tab: 'Profile', screen: 'CopingToolbox' },
  { id: 'breath',        label: 'Breathing',        _kind: 'tab', tab: 'Together', screen: 'BreathingExercise' },
  { id: 'affirm',        label: 'Affirmations',     _kind: 'tab', tab: 'Together', screen: 'Affirmations' },
  { id: 'resources',     label: 'Resources',        _kind: 'tab', tab: 'Profile', screen: 'Resources' },
  { id: 'notifications', label: 'Notifications',    _kind: 'tab', tab: 'Profile', screen: 'Notifications' },
  { id: 'settings',      label: 'Settings',         _kind: 'tab', tab: 'Profile', screen: 'Settings' },
];

export default function CouplesDrawerContent({ navigation }) {
  const { signOut, profile: user } = useAuth();
  const [partner, setPartner] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.id) return;
      try {
        const p = await getPartnerProfileForUser(user.id);
        if (!cancelled) setPartner(p);
      } catch (e) {
        console.log('[Couples DrawerContent] partner load error', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

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

  const goToParent = (screenName, params) => {
    const parent = navigation.getParent?.();
    (parent || navigation).navigate(screenName, params);
    navigation.closeDrawer?.();
  };

  const dispatch = (item) => {
    if (item._kind === 'parent') return goToParent(item.screen);
    if (item._kind === 'tab')    return goToTabbedScreen(item.tab, item.screen);
    return navigation.navigate(item.screen);
  };

  const userName = (user?.name || 'You').split(' ')[0];
  const partnerName = (partner?.name || 'Partner').split(' ')[0];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Couple identity */}
        <View style={styles.profileBlock}>
          <View style={styles.dualAvatarRow}>
            <View style={styles.dualAvatarWrap}>
              <Avatar
                value={user?.avatar}
                name={user?.name}
                size={48}
                backgroundColor={user?.profileColor || COLORS.primary}
                emojiSize={22}
              />
              {user?.accessory && ACCESSORY_EMOJI[user.accessory] ? (
                <Text style={styles.accessoryBadge}>
                  {ACCESSORY_EMOJI[user.accessory]}
                </Text>
              ) : null}
            </View>
            <Text style={styles.dualAmp}>&</Text>
            <View style={styles.dualAvatarWrap}>
              <Avatar
                value={partner?.avatar}
                name={partner?.name}
                size={48}
                backgroundColor={partner?.profileColor || BLUSH}
                emojiSize={22}
              />
              {partner?.accessory && ACCESSORY_EMOJI[partner.accessory] ? (
                <Text style={styles.accessoryBadge}>
                  {ACCESSORY_EMOJI[partner.accessory]}
                </Text>
              ) : null}
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

        <Text style={styles.sectionLabel}>DAILY TOOLS</Text>
        <View style={styles.section}>
          {QUICK_LINKS.map((it, i) => (
            <TouchableOpacity
              key={it.id}
              style={[
                styles.linkItem,
                i < QUICK_LINKS.length - 1 && styles.linkItemBorder,
              ]}
              onPress={() => dispatch(it)}
              activeOpacity={0.7}
            >
              <Text style={styles.linkLabel}>{it.label}</Text>
              <Text style={styles.linkChev}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>RELATIONSHIP</Text>
        <View style={styles.section}>
          {RELATIONSHIP_LINKS.map((it, i) => (
            <TouchableOpacity
              key={it.id}
              style={[
                styles.linkItem,
                i < RELATIONSHIP_LINKS.length - 1 && styles.linkItemBorder,
              ]}
              onPress={() => dispatch(it)}
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
              onPress={() => dispatch(it)}
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
  dualAvatarWrap: { position: 'relative' },
  accessoryBadge: {
    position: 'absolute',
    top: -6,
    right: -2,
    fontSize: 16,
  },
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
