import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/colors';

export default function TherapistDashboard({ navigation }) {
  const [activeTab, setActiveTab] = useState('home');

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userRole');
    await AsyncStorage.removeItem('userEmail');
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  const CLIENTS = [
    { id: 1, name: 'Alex (Teen)', diagnosis: 'Anxiety Disorder', progress: 65, nextSession: 'Today 3:00 PM' },
    { id: 2, name: 'Emma (Child)', diagnosis: 'ADHD', progress: 50, nextSession: 'Tomorrow 2:00 PM' },
    { id: 3, name: 'John & Sarah', diagnosis: 'Relationship Issues', progress: 70, nextSession: 'Thursday 6:00 PM' },
  ];

  const SESSION_NOTES = [
    { clientName: 'Alex', date: 'Today', mood: '😊', progress: 'Good engagement, practiced breathing techniques' },
    { clientName: 'Emma', date: 'Yesterday', mood: '😐', progress: 'Focused on concentration exercises' },
  ];

  if (activeTab === 'clients') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>My Clients</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => setActiveTab('home')}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>

          {CLIENTS.map(client => (
            <TouchableOpacity key={client.id} style={styles.clientCard}>
              <View style={styles.clientHeader}>
                <Text style={styles.clientName}>{client.name}</Text>
                <Text style={styles.clientDiagnosis}>{client.diagnosis}</Text>
              </View>
              <View style={styles.progressSection}>
                <Text style={styles.progressLabel}>Progress: {client.progress}%</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressBarFill, { width: client.progress + '%' }]} />
                </View>
              </View>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionLabel}>📅 {client.nextSession}</Text>
                <TouchableOpacity style={styles.viewButton}>
                  <Text style={styles.viewButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.tabBar}>
          {['home', 'clients', 'notes'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={styles.tabLabel}>
                {tab === 'home' ? '🏠 Home' : tab === 'clients' ? '👥 Clients' : '📝 Notes'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (activeTab === 'notes') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Session Notes</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => setActiveTab('home')}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>

          {SESSION_NOTES.map((note, i) => (
            <View key={i} style={styles.noteCard}>
              <View style={styles.noteHeader}>
                <Text style={styles.noteClient}>{note.clientName}</Text>
                <Text style={styles.noteMood}>{note.mood}</Text>
              </View>
              <Text style={styles.noteDate}>{note.date}</Text>
              <Text style={styles.noteContent}>{note.progress}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.tabBar}>
          {['home', 'clients', 'notes'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={styles.tabLabel}>
                {tab === 'home' ? '🏠 Home' : tab === 'clients' ? '👥 Clients' : '📝 Notes'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome, Dr. Smith 👋</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Schedule</Text>
          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleTime}>2:00 PM</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.scheduleClient}>Alex (Teen)</Text>
              <Text style={styles.scheduleType}>Individual Session</Text>
            </View>
            <TouchableOpacity style={styles.joinButton}>
              <Text style={styles.joinButtonText}>Join</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleTime}>4:00 PM</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.scheduleClient}>Emma (Child)</Text>
              <Text style={styles.scheduleType}>Game-based Therapy</Text>
            </View>
            <TouchableOpacity style={styles.joinButton}>
              <Text style={styles.joinButtonText}>Join</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Client Overview</Text>
          <View style={styles.overviewRow}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewNumber}>12</Text>
              <Text style={styles.overviewLabel}>Active Clients</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewNumber}>8</Text>
              <Text style={styles.overviewLabel}>Completing Worksheets</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewNumber}>85%</Text>
              <Text style={styles.overviewLabel}>Avg Progress</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>✓</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.activityText}>Alex completed Anxiety Worksheet</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>⭐</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.activityText}>John & Sarah unlocked new module</Text>
              <Text style={styles.activityTime}>1 day ago</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.tabBar}>
        {['home', 'clients', 'notes'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={styles.tabLabel}>
              {tab === 'home' ? '🏠 Home' : tab === 'clients' ? '👥 Clients' : '📝 Notes'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  greeting: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '700',
    color: COLORS.primary,
  },
  title: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '700',
    color: COLORS.primary,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  logoutText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.md,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    gap: SPACING.md,
  },
  scheduleTime: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.primary,
    minWidth: 50,
  },
  scheduleClient: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  scheduleType: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginTop: 2,
  },
  joinButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  joinButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  overviewItem: {
    alignItems: 'center',
    flex: 1,
  },
  overviewNumber: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '700',
    color: COLORS.primary,
  },
  overviewLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    gap: SPACING.md,
  },
  activityIcon: {
    fontSize: TYPOGRAPHY.lg,
  },
  activityText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '500',
    color: COLORS.gray700,
  },
  activityTime: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginTop: 2,
  },
  clientCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  clientHeader: {
    marginBottom: SPACING.md,
  },
  clientName: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  clientDiagnosis: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
    marginTop: 2,
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '500',
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  sessionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  sessionLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray700,
  },
  viewButton: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  viewButtonText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
  },
  noteCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  noteClient: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  noteMood: {
    fontSize: TYPOGRAPHY.lg,
  },
  noteDate: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginBottom: SPACING.sm,
  },
  noteContent: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray700,
    lineHeight: 20,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  tabItem: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemActive: {
    backgroundColor: COLORS.primaryLighter,
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
    color: COLORS.gray700,
  },
});
