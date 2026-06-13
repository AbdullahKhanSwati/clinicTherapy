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
} from '../../../constants/colors';
import { useAuth } from '../../../contexts/AuthContext';
import Avatar from '../../../components/Avatar';
import {
  listMyMoodEntries,
  listMyJournalEntries,
  listMyAssignments,
  getActivePairingForUser,
  getPartnerProfileForUser,
} from '../../../services/api';

const BLUSH = '#D4536B';
const INK = '#1A2332';
const SAGE = '#7A8B7E';

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

export default function CouplesProfileTab() {
  const navigation = useNavigation();
  const { signOut, profile: user } = useAuth();
  const [pairing, setPairing] = useState(null);
  const [partner, setPartner] = useState(null);
  const [stats, setStats] = useState({ moods: 0, journals: 0, completed: 0 });

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        if (!user?.id) return;
        try {
          const [p, partnerProfile, m, j, a] = await Promise.all([
            getActivePairingForUser(user.id),
            getPartnerProfileForUser(user.id),
            listMyMoodEntries(),
            listMyJournalEntries(),
            listMyAssignments(),
          ]);
          if (cancelled) return;
          setPairing(p);
          setPartner(partnerProfile);
          setStats({
            moods: (m || []).length,
            journals: (j || []).length,
            completed: (a || []).filter((x) => x.status === 'completed').length,
          });
        } catch (e) {
          console.log('[Couples ProfileTab] load error', e);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [user?.id])
  );

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  const openParent = (screen, params) => {
    const parent = navigation.getParent?.() || navigation;
    parent.navigate(screen, params);
  };

  const MENU_GROUPS = [
    {
      label: 'Couple',
      items: [
        { id: 'pairing', label: 'Partner Pairing', _kind: 'parent', screen: 'CouplePairing' },
        { id: 'avatar', label: 'Customize Avatar', _kind: 'stack', screen: 'AvatarCustomizer' },
        { id: 'journal', label: 'Couple Journal', _kind: 'stack', screen: 'Journal' },
      ],
    },
    {
      label: 'Daily Tools',
      items: [
        { id: 'checkin', label: 'Daily Check-In', _kind: 'parent', screen: 'DailyCheckIn' },
        { id: 'appreciation', label: 'Appreciation Exchange', _kind: 'parent', screen: 'AppreciationExchange' },
        { id: 'repair', label: 'Send Repair Request', _kind: 'parent', screen: 'RepairRequest' },
        { id: 'pause', label: 'We Need a Pause', _kind: 'parent', screen: 'ConflictPause' },
      ],
    },
    {
      label: 'Wellness',
      items: [
        { id: 'progress', label: 'Progress Report', _kind: 'stack', screen: 'Progress' },
        { id: 'toolbox', label: 'Coping Toolbox', _kind: 'stack', screen: 'CopingToolbox' },
        { id: 'resources', label: 'Resources', _kind: 'stack', screen: 'Resources' },
      ],
    },
    {
      label: 'Account',
      items: [
        { id: 'notifications', label: 'Notifications', _kind: 'stack', screen: 'Notifications' },
        { id: 'settings', label: 'Settings', _kind: 'stack', screen: 'Settings' },
      ],
    },
  ];

  const userColor = user?.profileColor || COLORS.primary;
  const partnerColor = partner?.profileColor || BLUSH;
  const userName = (user?.name || 'You').split(' ')[0];
  const partnerName = (partner?.name || 'Partner').split(' ')[0];
  const isPaired = !!partner;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.iconBtn} onPress={openDrawer}>
            <Text style={styles.iconBtnText}>☰</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Text style={styles.eyebrow}>ACCOUNT</Text>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('AvatarCustomizer')}
          >
            <Text style={styles.iconBtnText}>✎</Text>
          </TouchableOpacity>
        </View>

        {/* Pairing card — refined */}
        <View style={styles.pairingCard}>
          <View style={styles.pairingAvatars}>
            <View style={styles.pairAvatarWrap}>
              <Avatar
                value={user?.avatar}
                name={user?.name}
                size={64}
                backgroundColor={userColor}
                emojiSize={30}
              />
              {user?.accessory && ACCESSORY_EMOJI[user.accessory] ? (
                <Text style={styles.pairAccessory}>
                  {ACCESSORY_EMOJI[user.accessory]}
                </Text>
              ) : null}
            </View>
            <Text style={styles.pairAmp}>&</Text>
            <View style={styles.pairAvatarWrap}>
              <Avatar
                value={partner?.avatar}
                name={partner?.name}
                size={64}
                backgroundColor={partnerColor}
                emojiSize={30}
              />
              {partner?.accessory && ACCESSORY_EMOJI[partner.accessory] ? (
                <Text style={styles.pairAccessory}>
                  {ACCESSORY_EMOJI[partner.accessory]}
                </Text>
              ) : null}
            </View>
          </View>

          <Text style={styles.pairingEyebrow}>
            {isPaired ? 'PARTNERED' : 'NOT YET PAIRED'}
          </Text>
          <Text style={styles.pairingTitle}>
            {userName} <Text style={styles.pairingAmpInline}>&</Text> {partnerName}
          </Text>
          <Text style={styles.pairingMeta}>
            {isPaired && pairing?.pairedAt
              ? `Paired ${new Date(pairing.pairedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}`
              : 'Ask your therapist to pair you with your partner'}
          </Text>

          <View
            style={[
              styles.pairingStatusBadge,
              !isPaired && { backgroundColor: COLORS.gray100 },
            ]}
          >
            <View
              style={[
                styles.pairingStatusDot,
                !isPaired && { backgroundColor: COLORS.gray400 },
              ]}
            />
            <Text
              style={[
                styles.pairingStatusText,
                !isPaired && { color: COLORS.gray500 },
              ]}
            >
              {isPaired ? 'Pairing active' : 'Pairing inactive'}
            </Text>
          </View>
        </View>

        {/* Personal profile */}
        <Text style={styles.sectionLabel}>YOUR PROFILE</Text>
        <View style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <View style={styles.profileAvatarWrap}>
              <Avatar
                value={user?.avatar}
                name={user?.name}
                size={56}
                backgroundColor={userColor}
                emojiSize={26}
              />
              {user?.accessory && ACCESSORY_EMOJI[user.accessory] ? (
                <Text style={styles.profileAccessory}>
                  {ACCESSORY_EMOJI[user.accessory]}
                </Text>
              ) : null}
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.lg }}>
              <Text style={styles.profileName}>{user?.name || 'Guest'}</Text>
              <Text style={styles.profileEmail}>{user?.email || ''}</Text>
              <View style={styles.profileTagsRow}>
                {user?.age ? (
                  <View style={styles.profileTag}>
                    <Text style={styles.profileTagText}>{user.age} years</Text>
                  </View>
                ) : null}
                <View style={styles.profileTag}>
                  <Text style={styles.profileTagText}>Couples</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.profileStats}>
            <View style={styles.profileStatItem}>
              <Text style={styles.profileStatValue}>{stats.moods}</Text>
              <Text style={styles.profileStatLabel}>CHECK-INS</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStatItem}>
              <Text style={styles.profileStatValue}>{stats.journals}</Text>
              <Text style={styles.profileStatLabel}>ENTRIES</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStatItem}>
              <Text style={styles.profileStatValue}>{stats.completed}</Text>
              <Text style={styles.profileStatLabel}>DONE</Text>
            </View>
          </View>
        </View>

        {MENU_GROUPS.map((group) => (
          <View key={group.label} style={styles.menuGroup}>
            <Text style={styles.menuGroupLabel}>{group.label.toUpperCase()}</Text>
            <View style={styles.menuCard}>
              {group.items.map((item, i) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    i < group.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={() =>
                    item._kind === 'parent'
                      ? openParent(item.screen)
                      : navigation.navigate(item.screen)
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuChev}>→</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.logoutBtn} onPress={signOut} activeOpacity={0.85}>
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
    marginBottom: SPACING.xl,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  iconBtnText: { fontSize: 18, color: INK, fontWeight: '600' },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: BLUSH,
    letterSpacing: 1.4,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.6,
  },

  /* Pairing */
  pairingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  pairingAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  pairAvatarWrap: { position: 'relative' },
  pairAccessory: {
    position: 'absolute',
    top: -6,
    right: -2,
    fontSize: 20,
  },
  pairAmp: {
    fontSize: 28,
    fontWeight: '300',
    color: COLORS.gray400,
    fontStyle: 'italic',
    marginHorizontal: SPACING.lg,
  },
  pairingEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: BLUSH,
    marginBottom: 4,
  },
  pairingTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  pairingAmpInline: {
    fontWeight: '300',
    fontStyle: 'italic',
    color: COLORS.gray500,
  },
  pairingMeta: {
    fontSize: 12,
    color: COLORS.gray500,
    marginBottom: SPACING.md,
    fontWeight: '500',
    textAlign: 'center',
  },
  pairingStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SAGE + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
  },
  pairingStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SAGE,
    marginRight: 6,
  },
  pairingStatusText: {
    fontSize: 11,
    color: SAGE,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  /* Sections */
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
    marginBottom: SPACING.md,
  },

  /* Personal profile */
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  profileAvatarWrap: { position: 'relative' },
  profileAccessory: {
    position: 'absolute',
    top: -4,
    right: -2,
    fontSize: 18,
  },
  profileName: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.4,
  },
  profileEmail: {
    fontSize: 12,
    color: COLORS.gray500,
    marginTop: 2,
    marginBottom: SPACING.sm,
  },
  profileTagsRow: {
    flexDirection: 'row',
  },
  profileTag: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: 6,
  },
  profileTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray600,
    letterSpacing: 0.5,
  },
  profileStats: {
    flexDirection: 'row',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  profileStatItem: { flex: 1, alignItems: 'center' },
  profileStatValue: {
    fontSize: 22,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.5,
  },
  profileStatLabel: {
    fontSize: 10,
    color: COLORS.gray500,
    marginTop: 4,
    fontWeight: '700',
    letterSpacing: 1,
  },
  profileStatDivider: {
    width: 1,
    backgroundColor: COLORS.gray100,
    marginVertical: 4,
  },

  /* Menu */
  menuGroup: { marginBottom: SPACING.xl },
  menuGroupLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
    marginBottom: SPACING.sm,
  },
  menuCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  menuLabel: {
    fontSize: 14,
    color: INK,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  menuChev: { fontSize: 18, color: COLORS.gray400, fontWeight: '500' },

  logoutBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  logoutText: {
    color: COLORS.error,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.gray400,
    marginTop: SPACING.lg,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
