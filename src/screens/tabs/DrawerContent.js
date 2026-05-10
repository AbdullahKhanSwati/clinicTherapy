import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../constants/colors';
import { useAuth } from '../../../App';
import dataStore from '../../utils/dataStore';
import { tryCatch } from '../../utils/safeOperations';

export default function DrawerContent(props) {
  const { signOut } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    await tryCatch(async () => {
      setLoading(true);
      await dataStore.initialize();
      const user = await dataStore.getCurrentUser();
      setCurrentUser(user);
      setLoading(false);
    }, null);
  };

  const handleLogout = async () => {
    await signOut();
  };

  const menuItems = [
    {
      id: 1,
      icon: '🏠',
      label: 'Home',
      onPress: () => {
        props.navigation.navigate('Home');
        props.navigation.closeDrawer();
      },
    },
    {
      id: 2,
      icon: '📋',
      label: 'Worksheets',
      onPress: () => {
        props.navigation.navigate('Worksheets');
        props.navigation.closeDrawer();
      },
    },
    {
      id: 3,
      icon: '😊',
      label: 'Mood & Rewards',
      onPress: () => {
        props.navigation.navigate('Mood');
        props.navigation.closeDrawer();
      },
    },
    {
      id: 4,
      icon: '👤',
      label: 'Profile',
      onPress: () => {
        props.navigation.navigate('Profile');
        props.navigation.closeDrawer();
      },
    },
  ];

  const settingsItems = [
    {
      id: 5,
      icon: '⚙️',
      label: 'Settings',
      onPress: () => {
        props.navigation.navigate('Settings');
        props.navigation.closeDrawer();
      },
    },
    {
      id: 6,
      icon: '💬',
      label: 'Support',
      onPress: () => {
        props.navigation.navigate('Notifications');
        props.navigation.closeDrawer();
      },
    },
    {
      id: 7,
      icon: 'ℹ️',
      label: 'About',
      onPress: () => {
        // Could add an About screen later
        alert('Therapy Companion v1.0.0\n\nA safe space for wellness.');
      },
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userContainer}>
          {loading ? (
            <View style={styles.avatarLoading}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>{currentUser?.avatar || '👧'}</Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{currentUser?.name || 'Friend'}</Text>
            <Text style={styles.userEmail}>{currentUser?.email || 'user@example.com'}</Text>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Menu Items */}
      <ScrollView
        style={styles.menuContainer}
        contentContainerStyle={styles.menuContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Navigation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Navigation</Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemIcon}>{item.icon}</Text>
              <Text style={styles.menuItemLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {settingsItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemIcon}>{item.icon}</Text>
              <Text style={styles.menuItemLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.divider} />
        
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutIcon}>👋</Text>
          <Text style={styles.logoutLabel}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>v1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
    ...SHADOWS.md,
  },
  avatarLoading: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginHorizontal: SPACING.lg,
  },
  menuContainer: {
    flex: 1,
  },
  menuContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '700',
    color: COLORS.gray500,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
    marginLeft: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  menuItemHover: {
    backgroundColor: COLORS.primary + '10',
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
    width: 24,
  },
  menuItemLabel: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.error + '10',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
    width: 24,
  },
  logoutLabel: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.error,
  },
  versionText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    textAlign: 'center',
  },
});
