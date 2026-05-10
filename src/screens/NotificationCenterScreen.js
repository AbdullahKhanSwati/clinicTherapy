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
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/colors';
import dataStore from '../utils/dataStore';

const NOTIFICATION_TYPES = {
  WORKSHEET_ASSIGNED: { icon: '📋', label: 'Worksheet Assigned', color: COLORS.primary },
  PROGRESS_UPDATE: { icon: '📈', label: 'Progress Update', color: COLORS.success },
  MOOD_ALERT: { icon: '⚠️', label: 'Mood Alert', color: COLORS.warning },
  SESSION_REMINDER: { icon: '📅', label: 'Session Reminder', color: COLORS.info },
  THERAPIST_NOTE: { icon: '💬', label: 'Message from Therapist', color: COLORS.primary },
  ACHIEVEMENT: { icon: '🏆', label: 'Achievement Unlocked', color: COLORS.success },
};

export default function NotificationCenterScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    worksheetNotifications: true,
    progressUpdates: true,
    moodAlerts: true,
    sessionReminders: true,
    therapistMessages: true,
    achievements: true,
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      await dataStore.initialize();
      const mockNotifications = [
        {
          id: 1,
          type: 'WORKSHEET_ASSIGNED',
          title: 'New Worksheet Available',
          message: 'Your therapist assigned "Cognitive Restructuring" worksheet',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          read: false,
        },
        {
          id: 2,
          type: 'PROGRESS_UPDATE',
          title: 'Great Progress!',
          message: 'You have completed 5 worksheets this week. Keep it up!',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          read: false,
        },
        {
          id: 3,
          type: 'SESSION_REMINDER',
          title: 'Upcoming Session',
          message: 'Your therapy session is tomorrow at 2:00 PM',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          read: true,
        },
        {
          id: 4,
          type: 'ACHIEVEMENT',
          title: 'Achievement Unlocked',
          message: 'You earned the "Consistent" badge for completing worksheets daily',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          read: true,
        },
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('[v0] Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const togglePreference = (key) => {
    setPreferences({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Notifications</Text>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🔔</Text>
              <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
          ) : (
            notifications.map(notif => {
              const typeInfo = NOTIFICATION_TYPES[notif.type];
              return (
                <View
                  key={notif.id}
                  style={[
                    styles.notificationCard,
                    !notif.read && styles.notificationCardUnread,
                  ]}
                >
                  <TouchableOpacity
                    style={styles.notificationContent}
                    onPress={() => markAsRead(notif.id)}
                  >
                    <Text style={styles.notificationIcon}>{typeInfo.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.notificationTitle}>{notif.title}</Text>
                      <Text style={styles.notificationMessage}>{notif.message}</Text>
                      <Text style={styles.notificationTime}>
                        {notif.timestamp.toLocaleDateString()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteNotification(notif.id)}
                  >
                    <Text style={styles.deleteText}>✕</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
          {Object.entries(preferences).map(([key, value]) => {
            const label = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase());
            return (
              <View key={key} style={styles.preferenceRow}>
                <Text style={styles.preferenceLabel}>{label}</Text>
                <Switch
                  value={value}
                  onValueChange={() => togglePreference(key)}
                  trackColor={{ false: COLORS.gray300, true: COLORS.primaryLight }}
                  thumbColor={value ? COLORS.primary : COLORS.gray400}
                />
              </View>
            );
          })}
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
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  backButton: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    marginRight: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '700',
    color: COLORS.gray900,
    flex: 1,
  },
  badge: {
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.xs,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.md,
  },
  notificationCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.gray200,
  },
  notificationCardUnread: {
    backgroundColor: COLORS.primaryLighter,
    borderLeftColor: COLORS.primary,
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    gap: SPACING.md,
  },
  notificationIcon: {
    fontSize: 24,
    marginTop: SPACING.xs,
  },
  notificationTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  notificationMessage: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray600,
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray400,
  },
  deleteButton: {
    justifyContent: 'center',
    paddingLeft: SPACING.md,
  },
  deleteText: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.gray400,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.gray500,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  preferenceLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray700,
  },
});
