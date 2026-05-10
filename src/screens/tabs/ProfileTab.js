import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../constants/colors';
import dataStore from '../../utils/dataStore';
import { useAuth } from '../../../App';
import { tryCatch } from '../../utils/safeOperations';

export default function ProfileTab({ navigation }) {
  const { signOut } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [reminders, setReminders] = useState(true);

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const menuItems = [
    {
      id: 1,
      icon: '📊',
      title: 'My Progress',
      description: 'View your wellness journey',
      action: () => navigation.navigate('Progress'),
    },
    {
      id: 2,
      icon: '📝',
      title: 'Journal',
      description: 'Read your past entries',
      action: () => navigation.navigate('Journal'),
    },
    {
      id: 3,
      icon: '🏆',
      title: 'Achievements',
      description: 'View all your badges',
      action: () => navigation.navigate('Badges'),
    },
    {
      id: 4,
      icon: '💡',
      title: 'Resources',
      description: 'Helpful tips and articles',
      action: () => navigation.navigate('Resources'),
    },
    {
      id: 5,
      icon: '🔔',
      title: 'Notifications',
      description: 'Manage notification settings',
      toggleValue: notifications,
      onToggle: setNotifications,
    },
    {
      id: 6,
      icon: '⏰',
      title: 'Reminders',
      description: 'Get reminded to check in',
      toggleValue: reminders,
      onToggle: setReminders,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarEmoji}>{currentUser?.avatar || '👧'}</Text>
          </View>
          <Text style={styles.userName}>{currentUser?.name || 'Friend'}</Text>
          <Text style={styles.userEmail}>{currentUser?.email || 'user@example.com'}</Text>

          {currentUser?.age && (
            <View style={styles.userBadges}>
              <View style={styles.userBadge}>
                <Text style={styles.badgeIcon}>🎂</Text>
                <Text style={styles.badgeText}>Age {currentUser.age}</Text>
              </View>
              <View style={styles.userBadge}>
                <Text style={styles.badgeIcon}>⭐</Text>
                <Text style={styles.badgeText}>Member</Text>
              </View>
            </View>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statLabel}>Worksheets</Text>
            <Text style={styles.statNumber}>5</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statIcon}>📖</Text>
            <Text style={styles.statLabel}>Journals</Text>
            <Text style={styles.statNumber}>12</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={styles.statNumber}>7</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>My Content</Text>
          {menuItems.slice(0, 4).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemIcon}>{item.icon}</Text>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemDesc}>{item.description}</Text>
              </View>
              <Text style={styles.menuItemArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Settings Section */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Settings</Text>
          {menuItems.slice(4).map((item) => (
            <View key={item.id} style={styles.menuItem}>
              <Text style={styles.menuItemIcon}>{item.icon}</Text>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemDesc}>{item.description}</Text>
              </View>
              <Switch
                value={item.toggleValue}
                onValueChange={item.onToggle}
                trackColor={{ false: COLORS.gray300, true: COLORS.primary + '80' }}
                thumbColor={item.toggleValue ? COLORS.primary : COLORS.gray400}
              />
            </View>
          ))}
        </View>

        {/* Account Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.actionButtonIcon}>⚙️</Text>
            <Text style={styles.actionButtonText}>Account Settings</Text>
            <Text style={styles.actionButtonArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.actionButtonIcon}>💬</Text>
            <Text style={styles.actionButtonText}>Support & Feedback</Text>
            <Text style={styles.actionButtonArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonIcon}>👋</Text>
            <Text style={styles.logoutButtonText}>Logout</Text>
            <Text style={styles.logoutButtonArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
          <Text style={styles.footerText}>© 2024 Therapy Companion</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  avatarEmoji: {
    fontSize: 60,
  },
  userName: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
    marginBottom: SPACING.lg,
  },
  userBadges: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
  },
  badgeIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.sm,
  },
  stat: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginBottom: SPACING.xs,
  },
  statNumber: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '700',
    color: COLORS.gray700,
  },
  menuSection: {
    marginBottom: SPACING.xl,
  },
  menuSectionTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  menuItemIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  menuItemDesc: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
  },
  menuItemArrow: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.primary,
    marginLeft: SPACING.md,
  },
  actionsSection: {
    marginBottom: SPACING.xl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  actionButtonIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  actionButtonText: {
    flex: 1,
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  actionButtonArrow: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.primary,
  },
  logoutButton: {
    backgroundColor: COLORS.error + '10',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.error + '20',
  },
  logoutButtonIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  logoutButtonText: {
    flex: 1,
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.error,
  },
  logoutButtonArrow: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.error,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  footerText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginBottom: SPACING.xs,
  },
});
