import React, { useState, useEffect, useMemo, createContext, useContext, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ErrorBoundary } from './src/components/ErrorBoundary';
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import RoleSelectionScreen from './src/screens/RoleSelectionScreen';
import ChildDashboard from './src/screens/dashboards/ChildDashboardWithTabs';
import TeenDashboard from './src/screens/dashboards/TeenDashboard';
import CouplesDashboard from './src/screens/dashboards/CouplesDashboard';
import FamilyDashboard from './src/screens/dashboards/FamilyDashboard';
import TherapistDashboard from './src/screens/dashboards/TherapistDashboard';
import WorksheetScreen from './src/screens/WorksheetScreen';
import MoodCheckInScreen from './src/screens/MoodCheckInScreen';
import WorksheetLibraryScreen from './src/screens/therapist/WorksheetLibraryScreen';
import ClientDetailsScreen from './src/screens/therapist/ClientDetailsScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import JournalScreen from './src/screens/JournalScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import TherapyProgramsScreen from './src/screens/TherapyProgramsScreen';
import ResourcesScreen from './src/screens/ResourcesScreen';
import NotificationCenterScreen from './src/screens/NotificationCenterScreen';
import BadgesScreen from './src/screens/BadgesScreen';
import CopingToolboxScreen from './src/screens/CopingToolboxScreen';
import BreathingExerciseScreen from './src/screens/coping/BreathingExerciseScreen';
import GroundingExerciseScreen from './src/screens/coping/GroundingExerciseScreen';
import VisualizationScreen from './src/screens/coping/VisualizationScreen';
import AffirmationsScreen from './src/screens/coping/AffirmationsScreen';
import AvatarCustomizerScreen from './src/screens/AvatarCustomizerScreen';
import dataStore from './src/utils/dataStore';
import { tryCatch } from './src/utils/safeOperations';
import { setupAndroidChannel } from './src/utils/notifications';

const Stack = createNativeStackNavigator();

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const ROLE_TO_SCREEN = {
  child: 'ChildDashboard',
  teen: 'TeenDashboard',
  couples: 'CouplesDashboard',
  family: 'FamilyDashboard',
  therapist: 'TherapistDashboard',
};

const ROLE_TO_COMPONENT = {
  child: ChildDashboard,
  teen: TeenDashboard,
  couples: CouplesDashboard,
  family: FamilyDashboard,
  therapist: TherapistDashboard,
};

export default function App() {
  const [authState, setAuthState] = useState({
    isLoading: true,
    userToken: null,
    userRole: null,
  });

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        await setupAndroidChannel();
        await dataStore.initialize();

        const token = await AsyncStorage.getItem('userToken');
        const role = await AsyncStorage.getItem('userRole');

        if (!token) {
          await AsyncStorage.setItem('userToken', 'demo-token');
          await AsyncStorage.setItem('userRole', 'child');

          const child1 = {
            id: 'child1',
            name: 'Sophie',
            email: 'sophie@example.com',
            role: 'child',
            age: 8,
          };
          await dataStore.setCurrentUser(child1);
        }

        setAuthState({
          isLoading: false,
          userToken: token || 'demo-token',
          userRole: role || 'child',
        });
      } catch (e) {
        console.log('[v0] Bootstrap error:', e);
        setAuthState({ isLoading: false, userToken: null, userRole: null });
      }
    };
    bootstrapAsync();
  }, []);

  const linkRoleToMockUser = useCallback(async (role) => {
    const ROLE_TO_MOCK_ID = {
      child: 'child1',
      teen: 'teen1',
      couples: 'partner1',
      family: 'parent1',
      therapist: 'therapist1',
    };
    const mockId = ROLE_TO_MOCK_ID[role];
    if (!mockId) return;
    try {
      const mockUser = await dataStore.getUserById(mockId);
      if (mockUser) await dataStore.setCurrentUser(mockUser);
    } catch (e) {
      console.log('[App] linkRoleToMockUser error', e);
    }
  }, []);

  const signIn = useCallback(async ({ token, role, email }) => {
    await AsyncStorage.setItem('userToken', token);
    if (role) await AsyncStorage.setItem('userRole', role);
    if (email) await AsyncStorage.setItem('userEmail', email);
    if (role) await linkRoleToMockUser(role);
    setAuthState({ isLoading: false, userToken: token, userRole: role || null });
  }, [linkRoleToMockUser]);

  const setRole = useCallback(async (role) => {
    await AsyncStorage.setItem('userRole', role);
    await linkRoleToMockUser(role);
    setAuthState((prev) => ({ ...prev, userRole: role }));
  }, [linkRoleToMockUser]);

  const signOut = useCallback(async () => {
    await AsyncStorage.multiRemove(['userToken', 'userRole', 'userEmail']);
    try {
      await dataStore.setCurrentUser(null);
    } catch (e) {
      // ignore
    }
    setAuthState({ isLoading: false, userToken: null, userRole: null });
  }, []);

  const authContext = useMemo(
    () => ({ signIn, signOut, setRole, userRole: authState.userRole }),
    [signIn, signOut, setRole, authState.userRole]
  );

  if (authState.isLoading) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <StatusBar style="dark" backgroundColor="#FFFFFF" translucent={false} />
        <AuthContext.Provider value={authContext}>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#FFFFFF' },
              }}
            >
              {authState.userToken == null ? (
                <>
                  <Stack.Screen name="Welcome" component={WelcomeScreen} />
                  <Stack.Screen name="Login" component={LoginScreen} />
                  <Stack.Screen name="Register" component={RegisterScreen} />
                </>
              ) : !authState.userRole ? (
                <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
              ) : (
                <>
                  <Stack.Screen
                    name={ROLE_TO_SCREEN[authState.userRole] || 'ChildDashboard'}
                    component={ROLE_TO_COMPONENT[authState.userRole] || ChildDashboard}
                  />
                  <Stack.Screen name="Worksheet" component={WorksheetScreen} />
                  <Stack.Screen name="MoodCheckIn" component={MoodCheckInScreen} />
                  <Stack.Screen name="WorksheetLibrary" component={WorksheetLibraryScreen} />
                  <Stack.Screen name="ClientDetails" component={ClientDetailsScreen} />
                  <Stack.Screen name="Progress" component={ProgressScreen} />
                  <Stack.Screen name="Journal" component={JournalScreen} />
                  <Stack.Screen name="Settings" component={SettingsScreen} />
                  <Stack.Screen name="TherapyPrograms" component={TherapyProgramsScreen} />
                  <Stack.Screen name="Resources" component={ResourcesScreen} />
                  <Stack.Screen name="Notifications" component={NotificationCenterScreen} />
                  <Stack.Screen name="Badges" component={BadgesScreen} />
                  <Stack.Screen name="CopingToolbox" component={CopingToolboxScreen} />
                  <Stack.Screen name="BreathingExercise" component={BreathingExerciseScreen} />
                  <Stack.Screen name="GroundingExercise" component={GroundingExerciseScreen} />
                  <Stack.Screen name="Visualization" component={VisualizationScreen} />
                  <Stack.Screen name="Affirmations" component={AffirmationsScreen} />
                  <Stack.Screen name="AvatarCustomizer" component={AvatarCustomizerScreen} />
                </>
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </AuthContext.Provider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
