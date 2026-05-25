import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/colors';
import { ErrorBoundary } from '../../components/ErrorBoundary';

// Parent tab screens
import HomeTab from './parent/HomeTab';
import ChildrenTab from './parent/ChildrenTab';
import InsightsTab from './parent/InsightsTab';
import ProfileTab from './parent/ProfileTab';
import DrawerContent from './parent/DrawerContent';

// Reused detail screens
import WorksheetScreen from '../WorksheetScreen';
import MoodCheckInScreen from '../MoodCheckInScreen';
import ProgressScreen from '../ProgressScreen';
import JournalScreen from '../JournalScreen';
import SettingsScreen from '../SettingsScreen';
import ResourcesScreen from '../ResourcesScreen';
import NotificationCenterScreen from '../NotificationCenterScreen';
import CopingToolboxScreen from '../CopingToolboxScreen';
import BreathingExerciseScreen from '../coping/BreathingExerciseScreen';
import GroundingExerciseScreen from '../coping/GroundingExerciseScreen';
import VisualizationScreen from '../coping/VisualizationScreen';
import AffirmationsScreen from '../coping/AffirmationsScreen';
import AvatarCustomizerScreen from '../AvatarCustomizerScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const INK = '#1A2332';
const SAGE = '#15803D';

const TabBarItem = ({ focused, icon, label }) => (
  <View style={styles.tabItemContainer}>
    <View style={[styles.tabIndicator, focused && styles.tabIndicatorActive]} />
    <Feather
      name={icon}
      size={20}
      color={focused ? INK : COLORS.gray400}
      style={styles.tabIcon}
    />
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
      {label}
    </Text>
  </View>
);

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: COLORS.background },
};

const HomeStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="HomeTabScreen" component={HomeTab} />
    <Stack.Screen name="Notifications" component={NotificationCenterScreen} />
  </Stack.Navigator>
);

const ChildrenStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="ChildrenTabScreen" component={ChildrenTab} />
  </Stack.Navigator>
);

const InsightsStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="InsightsTabScreen" component={InsightsTab} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="ProfileTabScreen" component={ProfileTab} />
  </Stack.Navigator>
);

const ParentTabs = () => {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom || (Platform.OS === 'android' ? 8 : 0);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          { height: 72 + bottomInset, paddingBottom: bottomInset },
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
        name="Children"
        component={ChildrenStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarItem focused={focused} icon="users" label="Children" />
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

const ParentDrawer = () => (
  <Drawer.Navigator
    drawerContent={(props) => <DrawerContent {...props} />}
    screenOptions={{
      headerShown: false,
      drawerType: 'slide',
      drawerStyle: { width: '78%', backgroundColor: COLORS.background },
    }}
  >
    <Drawer.Screen name="DashboardTabs" component={ParentTabs} />
  </Drawer.Navigator>
);

const ParentRoot = createNativeStackNavigator();

export default function FamilyDashboard() {
  return (
    <ErrorBoundary>
      <ParentRoot.Navigator screenOptions={screenOptions}>
        <ParentRoot.Screen name="ParentDrawer" component={ParentDrawer} />
        <ParentRoot.Screen name="ChildDetail" component={ChildDetailPlaceholder} />
        <ParentRoot.Screen name="Worksheet" component={WorksheetScreen} />
        <ParentRoot.Screen name="MoodCheckIn" component={MoodCheckInScreen} />
        <ParentRoot.Screen name="Progress" component={ProgressScreen} />
        <ParentRoot.Screen name="Journal" component={JournalScreen} />
        <ParentRoot.Screen name="Settings" component={SettingsScreen} />
        <ParentRoot.Screen name="Resources" component={ResourcesScreen} />
        <ParentRoot.Screen name="Notifications" component={NotificationCenterScreen} />
        <ParentRoot.Screen name="CopingToolbox" component={CopingToolboxScreen} />
        <ParentRoot.Screen name="BreathingExercise" component={BreathingExerciseScreen} />
        <ParentRoot.Screen name="GroundingExercise" component={GroundingExerciseScreen} />
        <ParentRoot.Screen name="Visualization" component={VisualizationScreen} />
        <ParentRoot.Screen name="Affirmations" component={AffirmationsScreen} />
        <ParentRoot.Screen name="AvatarCustomizer" component={AvatarCustomizerScreen} />
      </ParentRoot.Navigator>
    </ErrorBoundary>
  );
}

// Lightweight read-only child detail for parents (full version can come later)
function ChildDetailPlaceholder({ route, navigation }) {
  const ChildDetailScreen = require('./parent/ChildDetailScreen').default;
  return <ChildDetailScreen route={route} navigation={navigation} />;
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    paddingTop: 0,
    paddingHorizontal: SPACING.sm,
  },
  tabItemContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: 64,
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
  tabIcon: { marginBottom: 3 },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.gray400,
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: INK,
    fontWeight: '700',
  },
});
