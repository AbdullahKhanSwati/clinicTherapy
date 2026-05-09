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
import WorksheetScreen from './src/screens/WorksheetScreen';
import MoodCheckInScreen from './src/screens/MoodCheckInScreen';
import WorksheetLibraryScreen from './src/screens/therapist/WorksheetLibraryScreen';
import ClientDetailsScreen from './src/screens/therapist/ClientDetailsScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import JournalScreen from './src/screens/JournalScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import TherapyProgramsScreen from './src/screens/TherapyProgramsScreen';
import dataStore from './src/utils/dataStore';

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
        // Initialize data store
        await dataStore.initialize();

        const token = await AsyncStorage.getItem('userToken');
        const role = await AsyncStorage.getItem('userRole');
        
        // Set mock user if no token exists (for demo purposes)
        if (!token) {
          await AsyncStorage.setItem('userToken', 'demo-token');
          await AsyncStorage.setItem('userRole', 'child');
          
          // Set current user to child1 for demo
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
          isSignout: false,
          userToken: token || 'demo-token',
          userRole: role || 'child',
        });
      } catch (e) {
        console.error('[v0] Bootstrap error:', e);
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
            {/* Shared screens accessible from any role */}
            <Stack.Screen name="Worksheet" component={WorksheetScreen} />
            <Stack.Screen name="MoodCheckIn" component={MoodCheckInScreen} />
            <Stack.Screen name="WorksheetLibrary" component={WorksheetLibraryScreen} />
            <Stack.Screen name="ClientDetails" component={ClientDetailsScreen} />
            <Stack.Screen name="Progress" component={ProgressScreen} />
            <Stack.Screen name="Journal" component={JournalScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="TherapyPrograms" component={TherapyProgramsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
