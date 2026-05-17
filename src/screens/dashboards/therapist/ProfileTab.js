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

export default function TherapistProfileTab() {
  const navigation = useNavigation();
  const { signOut } = useAuth();
  const [therapist, setTherapist] = useState(null);
  const [stats, setStats] = useState({ clients: 0, assignments: 0, notes: 0 });

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          await dataStore.initialize();
          const u = await dataStore.getCurrentUser();
          if (cancelled) return;
          setTherapist(u);

          if (u) {
            const [users, a, notes] = await Promise.all([
              dataStore.getUsers(),
              dataStore.getAssignmentsByTherapist(u.id),
              dataStore.getTherapistNotes(),
            ]);
            if (cancelled) return;
            setStats({
              clients: Object.values(users || {}).filter(
                (x) => x.role !== 'therapist'
              ).length,
              assignments: (a || []).length,
              notes: (notes || []).filter((n) => n.therapistId === u.id).length,
            });
          }
        } catch (e) {
          console.log('[Therapist ProfileTab] load error', e);
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
      label: 'Practice',
      items: [
        { id: 'clients', label: 'My Clients', icon: 'users' },
        { id: 'worksheets', label: 'Worksheet Library', icon: 'file-text' },
        { id: 'insights', label: 'Practice Analytics', icon: 'bar-chart-2' },
      ],
    },
    {
      label: 'Account',
      items: [
        { id: 'notifications', label: 'Notifications', icon: 'bell', screen: 'Notifications' },
        { id: 'settings', label: 'Settings', icon: 'settings', screen: 'Settings' },
      ],
    },
  ];

  const handleMenuPress = (item) => {
    if (item.id === 'clients') {
      navigation.navigate('Clients');
    } else if (item.id === 'worksheets') {
      navigation.navigate('Worksheets');
    } else if (item.id === 'insights') {
      navigation.navigate('Insights');
    } else if (item.screen) {
      navigation.navigate(item.screen);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.iconBtn} onPress={openDrawer}>
            <Feather name="menu" size={20} color={INK} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Text style={styles.eyebrow}>ACCOUNT</Text>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>
        </View>

        {/* Profile hero */}
        <View style={styles.profileHero}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {(therapist?.name || 'D').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.profileName}>{therapist?.name || 'Doctor'}</Text>
          <Text style={styles.profileEmail}>{therapist?.email || ''}</Text>

          <View style={styles.verifiedBadge}>
            <View style={styles.verifiedDot} />
            <Text style={styles.verifiedText}>Verified Clinician</Text>
          </View>

          {therapist?.specializations && therapist.specializations.length > 0 && (
            <View style={styles.specRow}>
              {therapist.specializations.map((spec, i) => (
                <View key={i} style={styles.specTag}>
                  <Text style={styles.specTagText}>{spec}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.clients}</Text>
              <Text style={styles.statLabel}>CLIENTS</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.assignments}</Text>
              <Text style={styles.statLabel}>ASSIGNMENTS</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.notes}</Text>
              <Text style={styles.statLabel}>NOTES</Text>
            </View>
          </View>
        </View>

        {MENU_GROUPS.map((group) => (
          <View key={group.label} style={styles.menuGroup}>
            <Text style={styles.menuGroupLabel}>
              {group.label.toUpperCase()}
            </Text>
            <View style={styles.menuCard}>
              {group.items.map((item, i) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    i < group.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={() => handleMenuPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuIconBox}>
                    <Feather name={item.icon} size={16} color={INK} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Feather name="chevron-right" size={18} color={COLORS.gray400} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={signOut}
          activeOpacity={0.85}
        >
          <Feather name="log-out" size={16} color={COLORS.error} />
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
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: ACCENT,
    letterSpacing: 1.4,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.6,
  },

  profileHero: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  profileAvatarText: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -1,
  },
  profileName: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 12,
    color: COLORS.gray500,
    marginBottom: SPACING.md,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SUCCESS + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  verifiedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SUCCESS,
    marginRight: 6,
  },
  verifiedText: {
    fontSize: 11,
    color: SUCCESS,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  specRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  specTag: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    marginHorizontal: 3,
    marginBottom: 4,
  },
  specTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray600,
    letterSpacing: 0.4,
  },

  statsRow: {
    flexDirection: 'row',
    width: '100%',
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.gray500,
    marginTop: 4,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statDivider: {
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
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  menuIconBox: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuLabel: {
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
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.sm,
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
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.gray400,
    marginTop: SPACING.lg,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
