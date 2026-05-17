import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { COLORS, SPACING } from '../../constants/colors';
import { ErrorBoundary } from '../../components/ErrorBoundary';

// Couples tab screens
import HomeTab from './couples/HomeTab';
import TogetherTab from './couples/TogetherTab';
import InsightsTab from './couples/InsightsTab';
import ProfileTab from './couples/ProfileTab';
import DrawerContent from './couples/DrawerContent';

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

const BLUSH = '#D4536B';
const INK = '#1A2332';

const TabBarItem = ({ focused, icon, label }) => (
  <View style={styles.tabItemContainer}>
    <View style={[styles.tabIndicator, focused && styles.tabIndicatorActive]} />
    <Feather
      name={icon}
      size={20}
      color={focused ? INK : COLORS.gray400}
      style={styles.tabIcon}
    />
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
    <Stack.Screen name="CopingToolbox" component={CopingToolboxScreen} />
    <Stack.Screen name="TherapyPrograms" component={TherapyProgramsScreen} />
    <Stack.Screen name="ProgramDetails" component={ProgramDetailsScreen} />
  </Stack.Navigator>
);

const TogetherStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="TogetherTabScreen" component={TogetherTab} />
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

const CouplesTabs = () => {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom || (Platform.OS === 'android' ? 8 : 0);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            height: 72 + bottomInset,
            paddingBottom: bottomInset,
          },
        ],
        tabBarShowLabel: false,
        tabBarActiveTintColor: INK,
        tabBarInactiveTintColor: COLORS.gray400,
        lazy: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarItem focused={focused} icon="home" label="Home" />
          ),
        }}
      />
      <Tab.Screen
        name="Together"
        component={TogetherStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarItem focused={focused} icon="heart" label="Together" />
          ),
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarItem focused={focused} icon="bar-chart-2" label="Insights" />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarItem focused={focused} icon="user" label="Profile" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default function CouplesDashboard() {
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
        <Drawer.Screen name="DashboardTabs" component={CouplesTabs} />
      </Drawer.Navigator>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    paddingTop: 0,
    paddingHorizontal: SPACING.md,
  },
  tabItemContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: 70,
    paddingTop: 8,
  },
  tabIndicator: {
    width: 24,
    height: 2,
    backgroundColor: 'transparent',
    borderRadius: 1,
    marginBottom: 6,
  },
  tabIndicatorActive: {
    backgroundColor: INK,
  },
  tabIcon: {
    marginBottom: 3,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gray400,
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: INK,
    fontWeight: '700',
  },
});
