import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
import ProgramDetailsScreen from './src/screens/ProgramDetailsScreen';
import ResourcesScreen from './src/screens/ResourcesScreen';
import NotificationCenterScreen from './src/screens/NotificationCenterScreen';
import CopingToolboxScreen from './src/screens/CopingToolboxScreen';
import BreathingExerciseScreen from './src/screens/coping/BreathingExerciseScreen';
import GroundingExerciseScreen from './src/screens/coping/GroundingExerciseScreen';
import VisualizationScreen from './src/screens/coping/VisualizationScreen';
import AffirmationsScreen from './src/screens/coping/AffirmationsScreen';
import AvatarCustomizerScreen from './src/screens/AvatarCustomizerScreen';

import { supabase, getCurrentProfile } from './src/lib/supabase';
import dataStore from './src/utils/dataStore';
import { setupAndroidChannel } from './src/utils/notifications';
import { AuthContext, useAuth } from './src/contexts/AuthContext';

// Re-export so old imports (`from '../../App'`) keep working during migration.
// New code should import from './src/contexts/AuthContext' directly.
export { useAuth };

const Stack = createNativeStackNavigator();

const ROLE_TO_SCREEN = {
  child: 'ChildDashboard',
  teen: 'TeenDashboard',
  couples: 'CouplesDashboard',
  family: 'FamilyDashboard',
  therapist: 'TherapistDashboard',
  admin: 'TherapistDashboard',
};

const ROLE_TO_COMPONENT = {
  child: ChildDashboard,
  teen: TeenDashboard,
  couples: CouplesDashboard,
  family: FamilyDashboard,
  therapist: TherapistDashboard,
  admin: TherapistDashboard,
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  const loadProfile = useCallback(async () => {
    try {
      const p = await getCurrentProfile();
      setProfile(p);
      if (p) {
        try { await dataStore.setCurrentUser(p); } catch (_) {}
      }
    } catch (e) {
      console.log('[App] loadProfile error', e);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        await setupAndroidChannel();
        await dataStore.initialize();
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(data?.session ?? null);
        if (data?.session) await loadProfile();
      } catch (e) {
        console.log('[App] bootstrap error', e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    bootstrap();

    const { data: subscription } = supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess);
      if (sess) {
        loadProfile();
      } else {
        setProfile(null);
        try { dataStore.setCurrentUser(null); } catch (_) {}
      }
    });

    return () => {
      mounted = false;
      subscription?.subscription?.unsubscribe?.();
    };
  }, [loadProfile]);

  const signIn = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }, []);

  const signUp = useCallback(async ({ email, password, metadata }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata || {} },
    });
    if (error) throw error;
    return data;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  const setRole = useCallback(async (role) => {
    if (!session?.user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', session.user.id);
    if (error) {
      console.log('[App] setRole error', error);
      return;
    }
    await loadProfile();
  }, [session, loadProfile]);

  const authContext = useMemo(
    () => ({
      session,
      profile,
      userRole: profile?.role || null,
      signIn,
      signUp,
      signOut,
      setRole,
      refreshProfile,
    }),
    [session, profile, signIn, signUp, signOut, setRole, refreshProfile]
  );

  if (isLoading) {
    return <SplashScreen />;
  }

  const role = profile?.role;

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
              {!session ? (
                <>
                  <Stack.Screen name="Welcome" component={WelcomeScreen} />
                  <Stack.Screen name="Login" component={LoginScreen} />
                  <Stack.Screen name="Register" component={RegisterScreen} />
                </>
              ) : !role ? (
                <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
              ) : (
                <>
                  <Stack.Screen
                    name={ROLE_TO_SCREEN[role] || 'ChildDashboard'}
                    component={ROLE_TO_COMPONENT[role] || ChildDashboard}
                  />
                  <Stack.Screen name="Worksheet" component={WorksheetScreen} />
                  <Stack.Screen name="MoodCheckIn" component={MoodCheckInScreen} />
                  <Stack.Screen name="WorksheetLibrary" component={WorksheetLibraryScreen} />
                  <Stack.Screen name="ClientDetails" component={ClientDetailsScreen} />
                  <Stack.Screen name="Progress" component={ProgressScreen} />
                  <Stack.Screen name="Journal" component={JournalScreen} />
                  <Stack.Screen name="Settings" component={SettingsScreen} />
                  <Stack.Screen name="TherapyPrograms" component={TherapyProgramsScreen} />
                  <Stack.Screen name="ProgramDetails" component={ProgramDetailsScreen} />
                  <Stack.Screen name="Resources" component={ResourcesScreen} />
                  <Stack.Screen name="Notifications" component={NotificationCenterScreen} />
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
