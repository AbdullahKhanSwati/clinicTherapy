import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export default function App() {
  const [authState, setAuthState] = useState({
    isLoading: true,
    isSignout: false,
    userToken: null,
    userRole: null,
  });

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const role = await AsyncStorage.getItem('userRole');
        setAuthState({
          isLoading: false,
          isSignout: false,
          userToken: token,
          userRole: role,
        });
      } catch (e) {
        setAuthState({
          isLoading: false,
          isSignout: false,
          userToken: null,
          userRole: null,
        });
      }
    };

    bootstrapAsync();
  }, []);

  if (authState.isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FFFFFF' },
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
            {authState.userRole === 'child' && (
              <Stack.Screen name="ChildDashboard" component={ChildDashboard} />
            )}
            {authState.userRole === 'teen' && (
              <Stack.Screen name="TeenDashboard" component={TeenDashboard} />
            )}
            {authState.userRole === 'couples' && (
              <Stack.Screen name="CouplesDashboard" component={CouplesDashboard} />
            )}
            {authState.userRole === 'family' && (
              <Stack.Screen name="FamilyDashboard" component={FamilyDashboard} />
            )}
            {authState.userRole === 'therapist' && (
              <Stack.Screen name="TherapistDashboard" component={TherapistDashboard} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
