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
const SAGE = '#15803D';

export default function ParentProfileTab() {
  const navigation = useNavigation();
  const { signOut } = useAuth();
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          await dataStore.initialize();
          const u = await dataStore.getCurrentUser();
          if (cancelled) return;
          setUser(u);
          if (u?.children?.length) {
            const list = await Promise.all(
              u.children.map((id) => dataStore.getUserById(id))
            );
            if (!cancelled) setChildren(list.filter(Boolean));
          }
        } catch (e) {
          console.log('[Parent ProfileTab] load error', e);
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
      label: 'Family',
      items: [
        { id: 'children', label: 'My Children', screen: 'Children' },
        { id: 'avatar', label: 'Customize Avatar', screen: 'AvatarCustomizer' },
      ],
    },
    {
      label: 'Wellness',
      items: [
        { id: 'progress', label: 'Progress Report', screen: 'Progress' },
        { id: 'resources', label: 'Resources', screen: 'Resources' },
        { id: 'toolbox', label: 'Coping Toolbox', screen: 'CopingToolbox' },
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
          <View
            style={[
              styles.avatar,
              { backgroundColor: user?.profileColor || SAGE },
            ]}
          >
            <Text style={styles.avatarEmoji}>{user?.avatar || '👤'}</Text>
          </View>
          <Text style={styles.profileName}>{user?.name || 'Parent'}</Text>
          <Text style={styles.profileEmail}>{user?.email || ''}</Text>

          {user?.parentingRelationship && (
            <View style={styles.relationshipBadge}>
              <Text style={styles.relationshipText}>
                {user.parentingRelationship.toUpperCase()}
              </Text>
            </View>
          )}

          {/* Children chips */}
          {children.length > 0 && (
            <View style={styles.childrenChips}>
              <Text style={styles.childrenLabel}>YOUR CHILDREN</Text>
              <View style={styles.chipsRow}>
                {children.map((c) => (
                  <View
                    key={c.id}
                    style={[
                      styles.childChip,
                      { backgroundColor: (c.profileColor || SAGE) + '15' },
                    ]}
                  >
                    <Text style={styles.childChipEmoji}>{c.avatar || '👤'}</Text>
                    <Text style={styles.childChipName}>
                      {c.name?.split(' ')[0]}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Menu */}
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
                  onPress={() => navigation.navigate(item.screen)}
                  activeOpacity={0.7}
                >
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
    color: SAGE,
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
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarEmoji: { fontSize: 38 },
  profileName: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.5,
  },
  profileEmail: {
    fontSize: 12,
    color: COLORS.gray500,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  relationshipBadge: {
    backgroundColor: SAGE + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  relationshipText: {
    fontSize: 10,
    fontWeight: '800',
    color: SAGE,
    letterSpacing: 0.8,
  },

  childrenChips: {
    width: '100%',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    alignItems: 'center',
  },
  childrenLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.2,
    marginBottom: SPACING.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  childChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    marginHorizontal: 3,
    marginBottom: 4,
  },
  childChipEmoji: { fontSize: 14, marginRight: 4 },
  childChipName: {
    fontSize: 11,
    fontWeight: '700',
    color: INK,
  },

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

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.gray400,
    marginTop: SPACING.lg,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
