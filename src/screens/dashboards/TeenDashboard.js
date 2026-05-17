import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/colors';
import { ErrorBoundary } from '../../components/ErrorBoundary';

// Teen tab screens
import HomeTab from './teen/HomeTab';
import ToolsTab from './teen/ToolsTab';
import InsightsTab from './teen/InsightsTab';
import ProfileTab from './teen/ProfileTab';
import DrawerContent from './teen/DrawerContent';

// Detail screens reused from app stack
import WorksheetScreen from '../WorksheetScreen';
import MoodCheckInScreen from '../MoodCheckInScreen';
import ProgressScreen from '../ProgressScreen';
import JournalScreen from '../JournalScreen';
import SettingsScreen from '../SettingsScreen';
import ResourcesScreen from '../ResourcesScreen';
import NotificationCenterScreen from '../NotificationCenterScreen';
import TherapyProgramsScreen from '../TherapyProgramsScreen';
import ProgramDetailsScreen from '../ProgramDetailsScreen';
import CopingToolboxScreen from '../CopingToolboxScreen';
import BreathingExerciseScreen from '../coping/BreathingExerciseScreen';
import GroundingExerciseScreen from '../coping/GroundingExerciseScreen';
import VisualizationScreen from '../coping/VisualizationScreen';
import AffirmationsScreen from '../coping/AffirmationsScreen';
import AvatarCustomizerScreen from '../AvatarCustomizerScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const TabBarIcon = ({ focused, icon, label }) => (
  <View style={styles.tabIconContainer}>
    <View style={[styles.iconPill, focused && styles.iconPillActive]}>
      <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{icon}</Text>
    </View>
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
  </View>
);

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: COLORS.background },
};

const HomeStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="HomeTabScreen" component={HomeTab} />
    <Stack.Screen name="MoodCheckIn" component={MoodCheckInScreen} />
    <Stack.Screen name="Journal" component={JournalScreen} />
    <Stack.Screen name="Notifications" component={NotificationCenterScreen} />
    <Stack.Screen name="Affirmations" component={AffirmationsScreen} />
  </Stack.Navigator>
);

const ToolsStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="ToolsTabScreen" component={ToolsTab} />
    <Stack.Screen name="Worksheet" component={WorksheetScreen} />
    <Stack.Screen name="CopingToolbox" component={CopingToolboxScreen} />
    <Stack.Screen name="BreathingExercise" component={BreathingExerciseScreen} />
    <Stack.Screen name="GroundingExercise" component={GroundingExerciseScreen} />
    <Stack.Screen name="Visualization" component={VisualizationScreen} />
    <Stack.Screen name="Affirmations" component={AffirmationsScreen} />
    <Stack.Screen name="TherapyPrograms" component={TherapyProgramsScreen} />
    <Stack.Screen name="ProgramDetails" component={ProgramDetailsScreen} />
  </Stack.Navigator>
);

const InsightsStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="InsightsTabScreen" component={InsightsTab} />
    <Stack.Screen name="Progress" component={ProgressScreen} />
    <Stack.Screen name="Journal" component={JournalScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="ProfileTabScreen" component={ProfileTab} />
    <Stack.Screen name="AvatarCustomizer" component={AvatarCustomizerScreen} />
    <Stack.Screen name="Progress" component={ProgressScreen} />
    <Stack.Screen name="Journal" component={JournalScreen} />
    <Stack.Screen name="Resources" component={ResourcesScreen} />
    <Stack.Screen name="CopingToolbox" component={CopingToolboxScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="Notifications" component={NotificationCenterScreen} />
  </Stack.Navigator>
);

const TeenTabs = () => {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom || (Platform.OS === 'android' ? 8 : 0);
  return (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: [
        styles.tabBar,
        {
          height: 64 + bottomInset,
          paddingBottom: bottomInset,
        },
      ],
      tabBarShowLabel: false,
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.gray400,
      lazy: true,
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeStack}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabBarIcon focused={focused} icon="🏠" label="Home" />
        ),
      }}
    />
    <Tab.Screen
      name="Tools"
      component={ToolsStack}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabBarIcon focused={focused} icon="🧰" label="Tools" />
        ),
      }}
    />
    <Tab.Screen
      name="Insights"
      component={InsightsStack}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabBarIcon focused={focused} icon="📊" label="Insights" />
        ),
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileStack}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabBarIcon focused={focused} icon="👤" label="Profile" />
        ),
      }}
    />
  </Tab.Navigator>
  );
};

export default function TeenDashboard() {
  return (
    <ErrorBoundary>
      <Drawer.Navigator
        drawerContent={(props) => <DrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerType: 'slide',
          drawerStyle: {
            width: '78%',
            backgroundColor: COLORS.background,
          },
        }}
      >
        <Drawer.Screen name="DashboardTabs" component={TeenTabs} />
      </Drawer.Navigator>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 0,
    paddingTop: 8,
    paddingHorizontal: SPACING.sm,
    ...SHADOWS.md,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    paddingTop: 4,
  },
  iconPill: {
    width: 40,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  iconPillActive: {
    backgroundColor: COLORS.primaryLighter + '25',
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.gray400,
    marginTop: 2,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
