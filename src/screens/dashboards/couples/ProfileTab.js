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
import dataStore from '../../../utils/dataStore';
import { useAuth } from '../../../../App';

const BLUSH = '#D4536B';
const INK = '#1A2332';
const SAGE = '#7A8B7E';

const PARTNER_LOOKUP = {
  partner1: 'partner2',
  partner2: 'partner1',
};

export default function CouplesProfileTab() {
  const navigation = useNavigation();
  const { signOut } = useAuth();
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [stats, setStats] = useState({ moods: 0, journals: 0, completed: 0 });

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          await dataStore.initialize();
          const u = await dataStore.getCurrentUser();
          if (cancelled) return;
          setUser(u);
          if (u) {
            const partnerId = PARTNER_LOOKUP[u.id];
            if (partnerId) {
              const p = await dataStore.getUserById(partnerId);
              if (!cancelled) setPartner(p);
            }
            const [m, j, a] = await Promise.all([
              dataStore.getMoodEntriesByUser(u.id),
              dataStore.getJournalEntriesByUser(u.id),
              dataStore.getAssignmentsByClient(u.id),
            ]);
            if (cancelled) return;
            setStats({
              moods: (m || []).length,
              journals: (j || []).length,
              completed: (a || []).filter((x) => x.status === 'completed').length,
            });
          }
        } catch (e) {
          console.log('[Couples ProfileTab] load error', e);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  const MENU_GROUPS = [
    {
      label: 'Couple',
      items: [
        { id: 'avatar', label: 'Customize Avatar', screen: 'AvatarCustomizer' },
        { id: 'journal', label: 'Couple Journal', screen: 'Journal' },
      ],
    },
    {
      label: 'Wellness',
      items: [
        { id: 'progress', label: 'Progress Report', screen: 'Progress' },
        { id: 'toolbox', label: 'Coping Toolbox', screen: 'CopingToolbox' },
        { id: 'resources', label: 'Resources', screen: 'Resources' },
      ],
    },
    {
      label: 'Account',
      items: [
        { id: 'notifications', label: 'Notifications', screen: 'Notifications' },
        { id: 'settings', label: 'Settings', screen: 'Settings' },
      ],
    },
  ];

  const userColor = user?.profileColor || COLORS.primary;
  const partnerColor = partner?.profileColor || BLUSH;
  const userName = (user?.name || 'You').split(' ')[0];
  const partnerName = (partner?.name || 'Partner').split(' ')[0];

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
            <View style={[styles.pairAvatar, { backgroundColor: userColor }]}>
              <Text style={styles.pairAvatarEmoji}>{user?.avatar || '👤'}</Text>
            </View>
            <Text style={styles.pairAmp}>&</Text>
            <View style={[styles.pairAvatar, { backgroundColor: partnerColor }]}>
              <Text style={styles.pairAvatarEmoji}>{partner?.avatar || '👤'}</Text>
            </View>
          </View>

          <Text style={styles.pairingEyebrow}>PARTNERED</Text>
          <Text style={styles.pairingTitle}>
            {userName} <Text style={styles.pairingAmpInline}>&</Text> {partnerName}
          </Text>
          <Text style={styles.pairingMeta}>
            {user?.relationshipStatus
              ? user.relationshipStatus.charAt(0).toUpperCase() +
                user.relationshipStatus.slice(1)
              : 'Together'}{' '}
            · Connected since 2023
          </Text>

          <View style={styles.pairingStatusBadge}>
            <View style={styles.pairingStatusDot} />
            <Text style={styles.pairingStatusText}>Pairing active</Text>
          </View>
        </View>

        {/* Personal profile */}
        <Text style={styles.sectionLabel}>YOUR PROFILE</Text>
        <View style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <View style={[styles.profileAvatar, { backgroundColor: userColor }]}>
              <Text style={styles.profileAvatarEmoji}>{user?.avatar || '👤'}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.lg }}>
              <Text style={styles.profileName}>{user?.name || 'Guest'}</Text>
              <Text style={styles.profileEmail}>{user?.email || ''}</Text>
              <View style={styles.profileTagsRow}>
                {user?.age && (
                  <View style={styles.profileTag}>
                    <Text style={styles.profileTagText}>{user.age} years</Text>
                  </View>
                )}
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
                  onPress={() => navigation.navigate(item.screen)}
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
  pairAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pairAvatarEmoji: { fontSize: 30 },
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
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarEmoji: { fontSize: 26 },
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
