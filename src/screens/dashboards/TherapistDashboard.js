import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { COLORS, SPACING } from '../../constants/colors';
import { ErrorBoundary } from '../../components/ErrorBoundary';

// Therapist tab screens
import OverviewTab from './therapist/OverviewTab';
import ClientsTab from './therapist/ClientsTab';
import WorksheetsTab from './therapist/WorksheetsTab';
import InsightsTab from './therapist/InsightsTab';
import ProfileTab from './therapist/ProfileTab';
import DrawerContent from './therapist/DrawerContent';

// Detail screens reused from app stack
import ClientDetailsScreen from '../therapist/ClientDetailsScreen';
import AssignWorksheetScreen from '../therapist/AssignWorksheetScreen';
import AddNoteScreen from '../therapist/AddNoteScreen';
import WorksheetLibraryScreen from '../therapist/WorksheetLibraryScreen';
import ManageContentScreen from '../therapist/ManageContentScreen';
import CreateContentScreen from '../therapist/CreateContentScreen';
import CreateWorksheetScreen from '../therapist/CreateWorksheetScreen';
import AddClientResourceScreen from '../therapist/AddClientResourceScreen';
import SettingsScreen from '../SettingsScreen';
import NotificationCenterScreen from '../NotificationCenterScreen';

const INK = '#1A2332';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

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

const OverviewStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="OverviewTabScreen" component={OverviewTab} />
    <Stack.Screen name="Notifications" component={NotificationCenterScreen} />
  </Stack.Navigator>
);

const ClientsStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="ClientsTabScreen" component={ClientsTab} />
  </Stack.Navigator>
);

const WorksheetsStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="WorksheetsTabScreen" component={WorksheetsTab} />
    <Stack.Screen name="WorksheetLibrary" component={WorksheetLibraryScreen} />
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
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="Notifications" component={NotificationCenterScreen} />
  </Stack.Navigator>
);

const TherapistTabs = () => {
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
        name="Overview"
        component={OverviewStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarItem focused={focused} icon="grid" label="Overview" />
          ),
        }}
      />
      <Tab.Screen
        name="Clients"
        component={ClientsStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarItem focused={focused} icon="users" label="Clients" />
          ),
        }}
      />
      <Tab.Screen
        name="Worksheets"
        component={WorksheetsStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarItem focused={focused} icon="file-text" label="Worksheets" />
          ),
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarItem focused={focused} icon="bar-chart-2" label="Analytics" />
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

const TherapistDrawer = () => (
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
    <Drawer.Screen name="DashboardTabs" component={TherapistTabs} />
  </Drawer.Navigator>
);

// Wraps the drawer with modal-style detail screens so navigation up from a tab
// (e.g. open a ClientDetails) opens above the tab bar.
const TherapistRoot = createNativeStackNavigator();

export default function TherapistDashboard() {
  return (
    <ErrorBoundary>
      <TherapistRoot.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <TherapistRoot.Screen name="TherapistDrawer" component={TherapistDrawer} />
        <TherapistRoot.Screen
          name="ClientDetails"
          component={ClientDetailsScreen}
        />
        <TherapistRoot.Screen
          name="AssignWorksheet"
          component={AssignWorksheetScreen}
          options={{ presentation: 'modal' }}
        />
        <TherapistRoot.Screen
          name="AddNote"
          component={AddNoteScreen}
          options={{ presentation: 'modal' }}
        />
        <TherapistRoot.Screen
          name="ManageContent"
          component={ManageContentScreen}
        />
        <TherapistRoot.Screen
          name="CreateWorksheet"
          component={CreateWorksheetScreen}
          options={{ presentation: 'modal' }}
        />
        <TherapistRoot.Screen
          name="CreateAffirmation"
          component={CreateContentScreen}
          initialParams={{ contentType: 'affirmation' }}
          options={{ presentation: 'modal' }}
        />
        <TherapistRoot.Screen
          name="CreateCopingTool"
          component={CreateContentScreen}
          initialParams={{ contentType: 'copingTool' }}
          options={{ presentation: 'modal' }}
        />
        <TherapistRoot.Screen
          name="CreateResource"
          component={CreateContentScreen}
          initialParams={{ contentType: 'resource' }}
          options={{ presentation: 'modal' }}
        />
        <TherapistRoot.Screen
          name="CreateDateIdea"
          component={CreateContentScreen}
          initialParams={{ contentType: 'dateIdea' }}
          options={{ presentation: 'modal' }}
        />
        <TherapistRoot.Screen
          name="AddClientResource"
          component={AddClientResourceScreen}
          options={{ presentation: 'modal' }}
        />
      </TherapistRoot.Navigator>
    </ErrorBoundary>
  );
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
    width: 58,
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
