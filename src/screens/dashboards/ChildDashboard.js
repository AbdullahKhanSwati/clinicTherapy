import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/colors';
import { WORKSHEET_TEMPLATES } from '../../data/worksheetTemplates';
import dataStore from '../../utils/dataStore';

export default function ChildDashboard({ navigation }) {
  const [activeTab, setActiveTab] = useState('home');
  const [moodToday, setMoodToday] = useState('happy');
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        setLoadingAssignments(true);
        await dataStore.initialize();
        
        const user = await dataStore.getCurrentUser();
        setCurrentUser(user);

        if (user) {
          const userAssignments = await dataStore.getAssignmentsByClient(user.id);
          setAssignments(userAssignments);
        }
      } catch (error) {
        console.error('[v0] Error loading assignments:', error);
      } finally {
        setLoadingAssignments(false);
      }
    };

    loadAssignments();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userRole');
    await AsyncStorage.removeItem('userEmail');
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  const ACTIVITIES = [
    { id: 1, title: 'Feelings Explorer', emoji: '🎨', color: COLORS.accent1 },
    { id: 2, title: 'Breathing Game', emoji: '🌬️', color: COLORS.accent2 },
    { id: 3, title: 'Joy Journal', emoji: '📔', color: COLORS.accent3 },
    { id: 4, title: 'Monster Talk', emoji: '👹', color: COLORS.primaryLight },
  ];

  const BADGES = [
    { id: 1, title: 'Happy Start', emoji: '⭐', unlocked: true },
    { id: 2, title: 'Brave Heart', emoji: '💪', unlocked: true },
    { id: 3, title: 'Peace Master', emoji: '☮️', unlocked: false },
    { id: 4, title: 'Joy Seeker', emoji: '🎉', unlocked: false },
  ];

  const MOOD_OPTIONS = [
    { value: 'sad', emoji: '😢', label: 'Sad' },
    { value: 'okay', emoji: '😐', label: 'Okay' },
    { value: 'happy', emoji: '😊', label: 'Happy' },
    { value: 'excited', emoji: '🤩', label: 'Excited' },
  ];

  if (activeTab === 'worksheets') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>My Worksheets</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => setActiveTab('home')}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>

          {loadingAssignments ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : assignments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyText}>No worksheets assigned yet!</Text>
            </View>
          ) : (
            <View style={styles.worksheetsContainer}>
              {assignments.map((assignment) => {
                const worksheet = WORKSHEET_TEMPLATES[assignment.worksheetId];
                if (!worksheet) return null;

                const statusColor =
                  assignment.status === 'completed'
                    ? COLORS.success
                    : assignment.status === 'in-progress'
                    ? COLORS.warning
                    : COLORS.gray500;

                return (
                  <TouchableOpacity
                    key={assignment.id}
                    style={styles.worksheetCard}
                    onPress={() =>
                      navigation.navigate('Worksheet', {
                        worksheetId: assignment.worksheetId,
                        assignmentId: assignment.id,
                      })
                    }
                  >
                    <View style={styles.worksheetHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.worksheetTitle}>{worksheet.title}</Text>
                        <Text style={styles.worksheetCategory}>{worksheet.category}</Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: statusColor + '20', borderColor: statusColor },
                        ]}
                      >
                        <Text style={[styles.statusText, { color: statusColor }]}>
                          {assignment.status === 'pending'
                            ? '📝 New'
                            : assignment.status === 'in-progress'
                            ? '⏳ In Progress'
                            : '✓ Completed'}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.worksheetDescription}>{worksheet.description}</Text>

                    <View style={styles.worksheetFooter}>
                      <Text style={styles.worksheetTime}>{worksheet.estimatedTime}</Text>
                      <TouchableOpacity style={styles.startButton}>
                        <Text style={styles.startButtonText}>
                          {assignment.status === 'completed' ? 'Review' : 'Start'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
        <View style={styles.tabBar}>
          {['home', 'worksheets', 'journal', 'badges'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={styles.tabLabel}>
                {tab === 'home'
                  ? '🏠 Home'
                  : tab === 'worksheets'
                  ? '📋 Work'
                  : tab === 'journal'
                  ? '📔 Journal'
                  : '🏆 Badges'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (activeTab === 'journal') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>My Joy Journal</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => setActiveTab('home')}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.journalPrompt}>
            <Text style={styles.journalPromptEmoji}>📔</Text>
            <Text style={styles.journalPromptTitle}>Ready to write?</Text>
            <Text style={styles.journalPromptText}>Share your thoughts, feelings, and happy moments!</Text>
            <TouchableOpacity 
              style={styles.openJournalButton}
              onPress={() => navigation.navigate('Journal')}
            >
              <Text style={styles.openJournalButtonText}>Open Full Journal →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <View style={styles.tabBar}>
          {['home', 'worksheets', 'journal', 'badges'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={styles.tabLabel}>
                {tab === 'home' ? '🏠 Home' : tab === 'worksheets' ? '📋 Work' : tab === 'journal' ? '📔 Journal' : '🏆 Badges'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (activeTab === 'badges') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>My Achievements</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => setActiveTab('home')}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.badgesPrompt}>
            <Text style={styles.badgesEmoji}>🏆</Text>
            <Text style={styles.badgesTitle}>Earn Amazing Badges!</Text>
            <Text style={styles.badgesText}>Complete worksheets and activities to unlock achievements</Text>
            <TouchableOpacity 
              style={styles.viewBadgesButton}
              onPress={() => navigation.navigate('Badges')}
            >
              <Text style={styles.viewBadgesButtonText}>View All Achievements →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <View style={styles.tabBar}>
          {['home', 'worksheets', 'journal', 'badges'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={styles.tabLabel}>
                {tab === 'home' ? '🏠 Home' : tab === 'worksheets' ? '📋 Work' : tab === 'journal' ? '📔 Journal' : '🏆 Badges'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hey Friend! 👋</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>How are you feeling today?</Text>
          <View style={styles.moodGrid}>
            {MOOD_OPTIONS.map(mood => (
              <TouchableOpacity
                key={mood.value}
                style={[
                  styles.moodButton,
                  moodToday === mood.value && styles.moodButtonActive,
                ]}
                onPress={() => setMoodToday(mood.value)}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={styles.moodLabel}>{mood.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fun Activities</Text>
          <View style={styles.activitiesGrid}>
            {ACTIVITIES.map(activity => (
              <TouchableOpacity
                key={activity.id}
                style={[styles.activityCard, { borderLeftColor: activity.color, borderLeftWidth: 4 }]}
              >
                <Text style={styles.activityEmoji}>{activity.emoji}</Text>
                <Text style={styles.activityTitle}>{activity.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Streak</Text>
          <View style={styles.streakContainer}>
            <Text style={styles.streakNumber}>7</Text>
            <Text style={styles.streakLabel}>Days in a row!</Text>
            <Text style={styles.streakMessage}>Keep it up! 🌟</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.tabBar}>
        {['home', 'worksheets', 'journal', 'badges'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={styles.tabLabel}>
              {tab === 'home'
                ? '🏠 Home'
                : tab === 'worksheets'
                ? '📋 Work'
                : tab === 'journal'
                ? '📔 Journal'
                : '🏆 Badges'}
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
  cardTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.md,
  },
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: SPACING.md,
  },
  moodButton: {
    alignItems: 'center',
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray50,
    borderWidth: 2,
    borderColor: COLORS.gray200,
  },
  moodButtonActive: {
    backgroundColor: COLORS.primaryLighter,
    borderColor: COLORS.primary,
  },
  moodEmoji: {
    fontSize: TYPOGRAPHY['2xl'],
    marginBottom: SPACING.xs,
  },
  moodLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray700,
    fontWeight: '500',
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  activityCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  activityEmoji: {
    fontSize: TYPOGRAPHY['2xl'],
    marginBottom: SPACING.sm,
  },
  activityTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '500',
    color: COLORS.gray700,
    textAlign: 'center',
  },
  streakContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  streakNumber: {
    fontSize: TYPOGRAPHY['3xl'],
    fontWeight: '700',
    color: COLORS.primary,
  },
  streakLabel: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.gray600,
    marginTop: SPACING.sm,
  },
  streakMessage: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
    marginTop: SPACING.sm,
  },
  journalEntry: {
    gap: SPACING.md,
  },
  journalDate: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.md,
  },
  journalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  journalIcon: {
    fontSize: TYPOGRAPHY['2xl'],
  },
  journalText: {
    flex: 1,
    color: COLORS.gray700,
    fontSize: TYPOGRAPHY.sm,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  badgeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  badgeCardLocked: {
    backgroundColor: COLORS.gray50,
    borderColor: COLORS.gray300,
  },
  badgeEmoji: {
    fontSize: 40,
    marginBottom: SPACING.md,
  },
  badgeTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.gray700,
    textAlign: 'center',
  },
  badgeLock: {
    fontSize: TYPOGRAPHY.lg,
    marginTop: SPACING.sm,
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
  worksheetsContainer: {
    gap: SPACING.md,
  },
  worksheetCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    marginBottom: SPACING.md,
  },
  worksheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  worksheetTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  worksheetCategory: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  statusText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
  },
  worksheetDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray600,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  worksheetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  worksheetTime: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  startButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['2xl'],
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SPACING.lg,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.gray500,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  journalPrompt: {
    backgroundColor: COLORS.primaryLighter,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  journalPromptEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  journalPromptTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  journalPromptText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  openJournalButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  openJournalButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.sm,
  },
  badgesPrompt: {
    backgroundColor: COLORS.primaryLighter,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  badgesEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  badgesTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  badgesText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  viewBadgesButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  viewBadgesButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.sm,
  },
});
