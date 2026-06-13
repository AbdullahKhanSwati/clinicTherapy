import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useSafeGoBack from '../hooks/useSafeGoBack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/colors';
import { getCurrentProfile } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  applyNotifSettings,
  ensurePermission,
  getNotifSettings,
} from '../utils/notifications';

export default function SettingsScreen({ navigation }) {
  const goBack = useSafeGoBack();
  const { signOut } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    notifications: true,
    moodReminders: true,
    dataSharing: false,
    darkMode: false,
    soundEnabled: true,
  });
  const [dailyCheckIn, setDailyCheckIn] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const user = await getCurrentProfile();
        setCurrentUser(user);

        // Load saved settings
        const savedSettings = await AsyncStorage.getItem('appSettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
        const notifSettings = await getNotifSettings();
        setDailyCheckIn(!!notifSettings.dailyCheckIn);
      } catch (error) {
        console.error('[Settings] Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const updateSetting = async (key, value) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('[Settings] Error saving settings:', error);
    }
  };

  const toggleDailyCheckIn = async (value) => {
    if (value) {
      const granted = await ensurePermission();
      if (!granted) {
        Alert.alert(
          'Notifications disabled',
          'Please enable notifications for this app in your device settings to receive daily check-in reminders.'
        );
        return;
      }
    }
    setDailyCheckIn(value);
    await applyNotifSettings({ dailyCheckIn: value, hour: 19, minute: 0 });
    if (value) {
      Alert.alert('Reminder set ⏰', 'You will get a daily check-in at 7:00 PM.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            console.error('[Settings] Error logging out:', error);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleClearData = () => {
    Alert.alert(
      'Reset local preferences',
      'This clears the app preferences cached on this device. Your account and history in the cloud are not affected. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'appSettings',
                'notifSettings',
              ]);
              // Reset to the SAME shape used in useState above so the
              // toggles below render the correct on/off state.
              setSettings({
                notifications: true,
                moodReminders: true,
                dataSharing: false,
                darkMode: false,
                soundEnabled: true,
              });
              setDailyCheckIn(false);
              Alert.alert('Done', 'Local preferences reset.');
            } catch (error) {
              console.error('[Settings] reset error', error);
              Alert.alert('Error', error?.message || 'Could not reset preferences.');
            }
          },
          style: 'destructive',
        },
      ],
    );
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Name</Text>
                <Text style={styles.settingValue}>{currentUser?.name || 'Not set'}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Email</Text>
                <Text style={styles.settingValue}>{currentUser?.email || 'Not set'}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Role</Text>
                <Text style={styles.settingValue}>
                  {currentUser?.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : 'Not set'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Switch
                value={settings.notifications}
                onValueChange={(value) => updateSetting('notifications', value)}
                trackColor={{ false: COLORS.gray300, true: COLORS.primaryLight }}
                thumbColor={settings.notifications ? COLORS.primary : COLORS.gray400}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <View style={{ flex: 1, paddingRight: SPACING.md }}>
                <Text style={styles.settingLabel}>Daily Check-in (7 PM)</Text>
                <Text style={styles.settingHint}>
                  Get a reminder to log your mood every evening
                </Text>
              </View>
              <Switch
                value={dailyCheckIn}
                onValueChange={toggleDailyCheckIn}
                trackColor={{ false: COLORS.gray300, true: COLORS.primaryLight }}
                thumbColor={dailyCheckIn ? COLORS.primary : COLORS.gray400}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Mood Check-in Reminders</Text>
              <Switch
                value={settings.moodReminders}
                onValueChange={(value) => updateSetting('moodReminders', value)}
                trackColor={{ false: COLORS.gray300, true: COLORS.primaryLight }}
                thumbColor={settings.moodReminders ? COLORS.primary : COLORS.gray400}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Sound Effects</Text>
              <Switch
                value={settings.soundEnabled}
                onValueChange={(value) => updateSetting('soundEnabled', value)}
                trackColor={{ false: COLORS.gray300, true: COLORS.primaryLight }}
                thumbColor={settings.soundEnabled ? COLORS.primary : COLORS.gray400}
              />
            </View>
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Data</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>Share Data with Therapist</Text>
                <Text style={styles.settingDescription}>Allow your therapist to view your progress</Text>
              </View>
              <Switch
                value={settings.dataSharing}
                onValueChange={(value) => updateSetting('dataSharing', value)}
                trackColor={{ false: COLORS.gray300, true: COLORS.primaryLight }}
                thumbColor={settings.dataSharing ? COLORS.primary : COLORS.gray400}
              />
            </View>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() =>
                Alert.alert(
                  'Privacy Policy',
                  'A full privacy policy will be published before public launch. For now, your data is stored in Supabase and only visible to you, your assigned therapist, and the admin.'
                )
              }
            >
              <Text style={styles.settingLabel}>Privacy Policy</Text>
              <Text style={styles.chevron}>→</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() =>
                Alert.alert(
                  'Terms of Service',
                  'Terms of service will be published before public launch.'
                )
              }
            >
              <Text style={styles.settingLabel}>Terms of Service</Text>
              <Text style={styles.chevron}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Switch
                value={settings.darkMode}
                onValueChange={(value) => updateSetting('darkMode', value)}
                trackColor={{ false: COLORS.gray300, true: COLORS.primaryLight }}
                thumbColor={settings.darkMode ? COLORS.primary : COLORS.gray400}
              />
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleClearData}
            >
              <Text style={styles.dangerButtonText}>Clear All Local Data</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleLogout}
            >
              <Text style={styles.dangerButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Version */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>Therapy Companion v1.0.0</Text>
          <Text style={styles.copyrightText}>© 2024. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['2xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    marginBottom: SPACING.lg,
  },
  backButton: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.gray600,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
    marginLeft: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  settingLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  settingHint: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginTop: 2,
  },
  settingValue: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
  },
  chevron: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.gray400,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginHorizontal: SPACING.lg,
  },
  dangerButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  dangerButtonText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING['2xl'],
  },
  versionText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginBottom: SPACING.xs,
  },
  copyrightText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray400,
  },
});
