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

export default function App() {
  const [authState, setAuthState] = useState({
    isLoading: true,
    userToken: null,
    userRole: null,
  });

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const role = await AsyncStorage.getItem('userRole');
        setAuthState({ isLoading: false, userToken: token, userRole: role });
      } catch (e) {
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
          <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFFFFF' } }}>
            {authState.userToken == null ? (
              <>
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
              </>
            ) : !authState.userRole ? (
              <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
            ) : (
              <Stack.Screen
                name={ROLE_TO_SCREEN[authState.userRole] || 'ChildDashboard'}
                component={
                  {
                    child: ChildDashboard,
                    teen: TeenDashboard,
                    couples: CouplesDashboard,
                    family: FamilyDashboard,
                    therapist: TherapistDashboard,
                  }[authState.userRole] || ChildDashboard
                }
              />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}
