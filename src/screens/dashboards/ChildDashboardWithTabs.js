import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../constants/colors';
import { ErrorBoundary } from '../../components/ErrorBoundary';

// Tab screens
import HomeTab from './HomeTab';
import WorksheetsTab from './WorksheetsTab';
import MoodRewardsTab from './MoodRewardsTab';
import ProfileTab from './ProfileTab';

// Detail screens
import WorksheetScreen from '../WorksheetScreen';
import MoodCheckInScreen from '../MoodCheckInScreen';
import ProgressScreen from '../ProgressScreen';
import JournalScreen from '../JournalScreen';
import SettingsScreen from '../SettingsScreen';
import ResourcesScreen from '../ResourcesScreen';
import NotificationCenterScreen from '../NotificationCenterScreen';

// Drawer navigation
import DrawerContent from './DrawerContent';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Tab bar icons component
const TabBarIcon = ({ focused, icon, label }) => (
  <View style={styles.tabIconContainer}>
    <Text style={[
      styles.tabIcon,
      { color: focused ? COLORS.primary : COLORS.gray400 },
    ]}>
      {icon}
    </Text>
    <Text style={[
      styles.tabLabel,
      { color: focused ? COLORS.primary : COLORS.gray400 },
    ]}>
      {label}
    </Text>
  </View>
);

// Stack navigators for each tab
const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: COLORS.background },
    }}
  >
    <Stack.Screen name="HomeTabScreen" component={HomeTab} />
    <Stack.Screen name="MoodCheckIn" component={MoodCheckInScreen} />
    <Stack.Screen name="Progress" component={ProgressScreen} />
    <Stack.Screen name="Journal" component={JournalScreen} />
  </Stack.Navigator>
);

const WorksheetsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: COLORS.background },
    }}
  >
    <Stack.Screen name="WorksheetsTabScreen" component={WorksheetsTab} />
    <Stack.Screen name="Worksheet" component={WorksheetScreen} />
  </Stack.Navigator>
);

const MoodStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: COLORS.background },
    }}
  >
    <Stack.Screen name="MoodRewardsTabScreen" component={MoodRewardsTab} />
    <Stack.Screen name="MoodCheckIn" component={MoodCheckInScreen} />
    <Stack.Screen name="Progress" component={ProgressScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: COLORS.background },
    }}
  >
    <Stack.Screen name="ProfileTabScreen" component={ProfileTab} />
    <Stack.Screen name="Progress" component={ProgressScreen} />
    <Stack.Screen name="Journal" component={JournalScreen} />
    <Stack.Screen name="Resources" component={ResourcesScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="Notifications" component={NotificationCenterScreen} />
  </Stack.Navigator>
);

// Bottom tabs navigator
const ChildDashboardTabs = () => {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom || (Platform.OS === 'android' ? 8 : 0);
  return (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: [
        styles.tabBar,
        {
          height: 60 + bottomInset,
          paddingBottom: bottomInset,
        },
      ],
      tabBarShowLabel: false,
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.gray400,
      lazy: true,
      lazyPlaceholder: () => <View style={{ flex: 1, backgroundColor: COLORS.background }} />,
      unmountOnBlur: false,
    })}
  >
    <Tab.Screen
      name="Home"
      component={HomeStack}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabBarIcon focused={focused} icon="🏠" label="Home" />
        ),
        tabBarLabel: 'Home',
      }}
    />
    <Tab.Screen
      name="Worksheets"
      component={WorksheetsStack}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabBarIcon focused={focused} icon="📋" label="Worksheets" />
        ),
        tabBarLabel: 'Worksheets',
      }}
    />
    <Tab.Screen
      name="Mood"
      component={MoodStack}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabBarIcon focused={focused} icon="😊" label="Mood" />
        ),
        tabBarLabel: 'Mood',
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileStack}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabBarIcon focused={focused} icon="👤" label="Profile" />
        ),
        tabBarLabel: 'Profile',
      }}
    />
  </Tab.Navigator>
  );
};

// Drawer navigator wrapper
const ChildDashboardWithDrawer = () => {
  return (
    <ErrorBoundary>
      <Drawer.Navigator
        drawerContent={(props) => <DrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerType: 'slide',
          drawerStyle: {
            width: '75%',
            backgroundColor: COLORS.surface,
          },
        }}
      >
        <Drawer.Screen
          name="DashboardTabs"
          component={ChildDashboardTabs}
          options={{
            headerShown: false,
          }}
        />
      </Drawer.Navigator>
    </ErrorBoundary>
  );
};

export default ChildDashboardWithDrawer;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    paddingTop: 6,
    ...SHADOWS.md,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
    marginBottom: Platform.OS === 'ios' ? 4 : 0,
  },
});
