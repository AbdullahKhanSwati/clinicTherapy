import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/colors';
import { WORKSHEET_TEMPLATES } from '../../data/worksheetTemplates';
import dataStore from '../../utils/dataStore';

export default function TeenDashboard({ navigation }) {
  const [activeTab, setActiveTab] = useState('home');
  const [assignments, setAssignments] = useState([]);
  const [moodEntries, setMoodEntries] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await dataStore.initialize();
        
        const user = await dataStore.getCurrentUser();
        setCurrentUser(user);

        if (user) {
          const userAssignments = await dataStore.getAssignmentsByClient(user.id);
          setAssignments(userAssignments);

          const moods = await dataStore.getMoodEntriesByUser(user.id);
          setMoodEntries(moods.slice(0, 5)); // Last 5 moods

          const journals = await dataStore.getJournalEntriesByUser(user.id);
          setJournalEntries(journals.slice(0, 5)); // Last 5 entries
        }
      } catch (error) {
        console.error('[v0] Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userRole');
    await AsyncStorage.removeItem('userEmail');
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  const WORKSHEETS = [
    { id: 1, title: 'Anxiety Management', category: 'CBT', progress: 60 },
    { id: 2, title: 'Social Skills', category: 'Social', progress: 40 },
    { id: 3, title: 'Sleep Hygiene', category: 'Wellness', progress: 80 },
    { id: 4, title: 'Stress Relief', category: 'DBT', progress: 30 },
  ];

  const RECENT_REFLECTIONS = [
    { date: 'Today', emotion: '😌', text: 'Feeling calmer after breathing exercise' },
    { date: 'Yesterday', emotion: '😰', text: 'Had anxiety about presentation' },
    { date: '2 days ago', emotion: '😊', text: 'Great day with friends' },
  ];

  if (activeTab === 'insights') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Your Insights</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => setActiveTab('home')}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Mood Trends</Text>
            <View style={styles.trendChart}>
              <View style={[styles.trendBar, { height: '30%' }]} />
              <View style={[styles.trendBar, { height: '50%' }]} />
              <View style={[styles.trendBar, { height: '70%' }]} />
              <View style={[styles.trendBar, { height: '60%' }]} />
              <View style={[styles.trendBar, { height: '80%' }]} />
              <View style={[styles.trendBar, { height: '75%' }]} />
              <View style={[styles.trendBar, { height: '85%' }]} />
            </View>
            <Text style={styles.insightText}>Your mood has improved by 25% this week!</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Top Triggers</Text>
            <View style={styles.triggerList}>
              <View style={styles.triggerItem}>
                <Text style={styles.triggerLabel}>School Pressure</Text>
                <Text style={styles.triggerCount}>45%</Text>
              </View>
              <View style={styles.triggerItem}>
                <Text style={styles.triggerLabel}>Sleep Deprivation</Text>
                <Text style={styles.triggerCount}>30%</Text>
              </View>
              <View style={styles.triggerItem}>
                <Text style={styles.triggerLabel}>Social Anxiety</Text>
                <Text style={styles.triggerCount}>25%</Text>
              </View>
            </View>
          </View>
        </ScrollView>
        <View style={styles.tabBar}>
          {['home', 'insights'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={styles.tabLabel}>
                {tab === 'home' ? '🏠 Home' : '📊 Insights'}
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
          <Text style={styles.greeting}>Welcome back! 👋</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('Progress')}
            >
              <Text style={styles.headerIcon}>📊</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('Journal')}
            >
              <Text style={styles.headerIcon}>📔</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={styles.headerIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mood Check-in</Text>
          <Text style={styles.checkInQuestion}>How are you feeling right now?</Text>
          <TouchableOpacity 
            style={styles.moodCheckButton}
            onPress={() => navigation.navigate('MoodCheckIn')}
          >
            <Text style={styles.moodCheckEmoji}>💭</Text>
            <Text style={styles.moodCheckText}>Quick Check-In</Text>
          </TouchableOpacity>
          
          {moodEntries.length > 0 && (
            <View style={styles.recentMoods}>
              <Text style={styles.recentMoodsLabel}>Recent moods:</Text>
              <View style={styles.moodHistory}>
                {moodEntries.slice(0, 5).map((entry, i) => {
                  const moodEmojis = {
                    happy: '😊',
                    sad: '😢',
                    angry: '😠',
                    anxious: '😰',
                    calm: '😌',
                    excited: '🤩',
                    confused: '😕',
                    overwhelmed: '😩',
                  };
                  return (
                    <Text key={i} style={styles.moodBubble}>
                      {moodEmojis[entry.mood] || '😐'}
                    </Text>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.sectionTitle}>Therapy & Learning</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TherapyPrograms')}>
              <Text style={styles.viewAllLink}>Programs →</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : assignments.length === 0 ? (
            <Text style={styles.emptyText}>No worksheets assigned yet</Text>
          ) : (
            assignments.slice(0, 3).map(assignment => {
              const worksheet = WORKSHEET_TEMPLATES[assignment.worksheetId];
              if (!worksheet) return null;

              const statusEmoji =
                assignment.status === 'completed'
                  ? '✓'
                  : assignment.status === 'in-progress'
                  ? '⏳'
                  : '📝';

              return (
                <TouchableOpacity
                  key={assignment.id}
                  style={styles.worksheetItem}
                  onPress={() =>
                    navigation.navigate('Worksheet', {
                      worksheetId: assignment.worksheetId,
                      assignmentId: assignment.id,
                    })
                  }
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.worksheetTitle}>{worksheet.title}</Text>
                    <Text style={styles.worksheetCategory}>{worksheet.category}</Text>
                  </View>
                  <Text style={styles.statusEmoji}>{statusEmoji} {assignment.status}</Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.sectionTitle}>Journal</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Journal')}>
              <Text style={styles.viewAllLink}>New entry →</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : journalEntries.length === 0 ? (
            <Text style={styles.emptyText}>No journal entries yet. Start reflecting!</Text>
          ) : (
            journalEntries.slice(0, 3).map((entry, i) => (
              <View key={i} style={styles.reflectionItem}>
                <Text style={styles.reflectionEmoji}>{entry.mood === 'happy' ? '😊' : entry.mood === 'sad' ? '😢' : '😌'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reflectionDate}>{new Date(entry.date).toLocaleDateString()}</Text>
                  <Text style={styles.reflectionText} numberOfLines={2}>{entry.title}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.tabBar}>
        {['home', 'insights'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={styles.tabLabel}>
              {tab === 'home' ? '🏠 Home' : '📊 Insights'}
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
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '700',
    color: COLORS.primary,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.md,
  },
  checkInQuestion: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray600,
    marginBottom: SPACING.md,
  },
  moodCheckButton: {
    backgroundColor: COLORS.primaryLighter,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  moodCheckEmoji: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  moodCheckText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.sm,
  },
  recentMoods: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  recentMoodsLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray600,
    marginBottom: SPACING.md,
    fontWeight: '500',
  },
  moodHistory: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  moodBubble: {
    fontSize: TYPOGRAPHY.xl,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  viewAllLink: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.xs,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
    textAlign: 'center',
    paddingVertical: SPACING.md,
  },
  statusEmoji: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLighter,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: TYPOGRAPHY.lg,
  },
  worksheetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  worksheetTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  worksheetCategory: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginTop: 2,
  },
  progressContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  progressText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  reflectionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    gap: SPACING.md,
  },
  reflectionEmoji: {
    fontSize: TYPOGRAPHY.lg,
  },
  reflectionDate: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginBottom: 2,
  },
  reflectionText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray700,
  },
  trendChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 120,
    marginBottom: SPACING.md,
  },
  trendBar: {
    width: 30,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xs,
  },
  insightText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.success,
    textAlign: 'center',
    fontWeight: '500',
  },
  triggerList: {
    gap: SPACING.md,
  },
  triggerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  triggerLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray700,
  },
  triggerCount: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.primary,
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
