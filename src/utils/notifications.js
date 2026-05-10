import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DAILY_CHECKIN_KEY = 'notif_daily_checkin_id';
const SETTINGS_KEY = 'notif_settings';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function setupAndroidChannel() {
  if (Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Daily reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00A8CC',
    });
  } catch (e) {
    console.log('[notifications] channel error', e);
  }
}

export async function ensurePermission() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'granted') return true;
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    return newStatus === 'granted';
  } catch (e) {
    console.log('[notifications] permission error', e);
    return false;
  }
}

export async function scheduleDailyCheckIn({ hour = 19, minute = 0 } = {}) {
  try {
    const granted = await ensurePermission();
    if (!granted) return false;
    await cancelDailyCheckIn();
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time for your check-in 💖',
        body: 'How are you feeling today? Take a moment to log your mood.',
        data: { type: 'daily-checkin' },
      },
      trigger: {
        hour,
        minute,
        repeats: true,
        channelId: 'default',
      },
    });
    await AsyncStorage.setItem(DAILY_CHECKIN_KEY, id);
    return true;
  } catch (e) {
    console.log('[notifications] schedule error', e);
    return false;
  }
}

export async function cancelDailyCheckIn() {
  try {
    const id = await AsyncStorage.getItem(DAILY_CHECKIN_KEY);
    if (id) {
      await Notifications.cancelScheduledNotificationAsync(id);
      await AsyncStorage.removeItem(DAILY_CHECKIN_KEY);
    }
  } catch (e) {
    console.log('[notifications] cancel error', e);
  }
}

export async function isDailyCheckInScheduled() {
  const id = await AsyncStorage.getItem(DAILY_CHECKIN_KEY);
  return !!id;
}

export async function getNotifSettings() {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { dailyCheckIn: false, hour: 19, minute: 0 };
  } catch (e) {
    return { dailyCheckIn: false, hour: 19, minute: 0 };
  }
}

export async function saveNotifSettings(settings) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function applyNotifSettings(settings) {
  await saveNotifSettings(settings);
  if (settings.dailyCheckIn) {
    await scheduleDailyCheckIn({ hour: settings.hour, minute: settings.minute });
  } else {
    await cancelDailyCheckIn();
  }
}
