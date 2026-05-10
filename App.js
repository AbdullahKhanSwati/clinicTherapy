import React, { useState, useEffect, useMemo, createContext, useContext, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import RoleSelectionScreen from './src/screens/RoleSelectionScreen';
import ChildDashboard from './src/screens/dashboards/ChildDashboard';
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
import dataStore from './src/utils/dataStore';

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
        console.error('[v0] Bootstrap error:', e);
        setAuthState({ isLoading: false, userToken: null, userRole: null });
      }
    };
    bootstrapAsync();
  }, []);

  const signIn = useCallback(async ({ token, role, email }) => {
    await AsyncStorage.setItem('userToken', token);
    if (role) await AsyncStorage.setItem('userRole', role);
    if (email) await AsyncStorage.setItem('userEmail', email);
    setAuthState({ isLoading: false, userToken: token, userRole: role || null });
  }, []);

  const setRole = useCallback(async (role) => {
    await AsyncStorage.setItem('userRole', role);
    setAuthState((prev) => ({ ...prev, userRole: role }));
  }, []);

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
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}
