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
import useSafeGoBack from '../hooks/useSafeGoBack';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/colors';
import {
  listMyNotifications,
  markNotificationRead,
  getCurrentUserId,
  markAllNotificationsRead,
} from '../services/api';

// Display config keyed by the lowercase DB enum values
const NOTIFICATION_TYPES = {
  worksheet_assigned: { icon: '📋', label: 'Worksheet Assigned', color: COLORS.primary },
  mood_alert:         { icon: '⚠️', label: 'Mood Alert',         color: COLORS.warning },
  therapist_note:     { icon: '💬', label: 'Therapist Note',     color: COLORS.primary },
  check_in_request:   { icon: '📅', label: 'Check-In Request',   color: COLORS.info || COLORS.primary },
  partner_activity:   { icon: '💞', label: 'Partner Activity',   color: COLORS.primary },
  badge_earned:       { icon: '🏆', label: 'Badge Earned',       color: COLORS.success },
  system:             { icon: '🔔', label: 'Notification',       color: COLORS.gray500 },
};

export default function NotificationCenterScreen({ navigation }) {
  const goBack = useSafeGoBack();
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
      const list = await listMyNotifications();
      // Adapt the camelCase API rows to the shape this screen renders.
      setNotifications(
        (list || []).map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.body || '',
          timestamp: new Date(n.createdAt),
          read: !!n.readAt,
        }))
      );
    } catch (error) {
      console.error('[Notifications] load error', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    // Optimistic UI flip + persist.
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await markNotificationRead(id);
    } catch (e) {
      console.log('[Notifications] mark read error', e);
    }
  };

  const markAllRead = async () => {
    try {
      const uid = await getCurrentUserId();
      if (!uid) return;
      await markAllNotificationsRead(uid);
      await loadNotifications();
    } catch (e) {
      console.log('[Notifications] mark all read error', e);
    }
  };

  // Per-row delete isn't supported in the schema; mark as read instead.
  const deleteNotification = (id) => {
    markAsRead(id);
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
          <TouchableOpacity onPress={() => goBack()}>
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
              const typeInfo = NOTIFICATION_TYPES[notif.type] || NOTIFICATION_TYPES.system;
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
    color: COLORS.gray700,
    flex: 1,
  },
  badge: {
    backgroundColor: COLORS.error,
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
