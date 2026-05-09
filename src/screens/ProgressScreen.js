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
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/colors';
import dataStore from '../utils/dataStore';

export default function ProgressScreen({ navigation }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [moodEntries, setMoodEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await dataStore.initialize();

        const user = await dataStore.getCurrentUser();
        setCurrentUser(user);

        if (user) {
          const assigns = await dataStore.getAssignmentsByClient(user.id);
          setAssignments(assigns);

          const completed_ws = await dataStore.getCompletedWorksheetsByUser(user.id);
          setCompleted(completed_ws);

          const moods = await dataStore.getMoodEntriesByUser(user.id);
          setMoodEntries(moods);
        }
      } catch (error) {
        console.error('[v0] Error loading progress:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const completionRate = assignments.length > 0 
    ? Math.round((completed.length / assignments.length) * 100)
    : 0;

  const avgMood = moodEntries.length > 0
    ? Math.round(
        moodEntries.reduce((sum, entry) => sum + entry.intensity, 0) / moodEntries.length
      )
    : 5;

  const moodTrend = moodEntries.slice(0, 7).reverse();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Your Progress</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* Completion Stats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Worksheet Completion</Text>
          <View style={styles.progressRingContainer}>
            <View style={styles.progressRing}>
              <Text style={styles.progressValue}>{completionRate}%</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Completed</Text>
              <Text style={styles.statValue}>{completed.length}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Assigned</Text>
              <Text style={styles.statValue}>{assignments.length}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Remaining</Text>
              <Text style={styles.statValue}>{Math.max(0, assignments.length - completed.length)}</Text>
            </View>
          </View>
        </View>

        {/* Mood Trends */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mood Trends (Last 7 Days)</Text>
          {moodEntries.length === 0 ? (
            <Text style={styles.emptyText}>No mood entries yet</Text>
          ) : (
            <>
              <View style={styles.moodChart}>
                <View style={styles.chartBars}>
                  {moodTrend.map((entry, i) => (
                    <View key={i} style={styles.barContainer}>
                      <View
                        style={[
                          styles.bar,
                          { height: `${(entry.intensity / 10) * 100}%` },
                        ]}
                      />
                      <Text style={styles.barLabel}>
                        {new Date(entry.date).getDate()}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.trendStats}>
                <View style={styles.trendStat}>
                  <Text style={styles.trendLabel}>Average</Text>
                  <Text style={styles.trendValue}>{avgMood}/10</Text>
                </View>
                <View style={styles.trendStat}>
                  <Text style={styles.trendLabel}>Highest</Text>
                  <Text style={styles.trendValue}>
                    {Math.max(...moodEntries.map(e => e.intensity))}/10
                  </Text>
                </View>
                <View style={styles.trendStat}>
                  <Text style={styles.trendLabel}>Lowest</Text>
                  <Text style={styles.trendValue}>
                    {Math.min(...moodEntries.map(e => e.intensity))}/10
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Mood Distribution */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mood Distribution</Text>
          {moodEntries.length === 0 ? (
            <Text style={styles.emptyText}>No data yet</Text>
          ) : (
            <View style={styles.moodDistribution}>
              {Object.entries(
                moodEntries.reduce((acc, entry) => {
                  acc[entry.mood] = (acc[entry.mood] || 0) + 1;
                  return acc;
                }, {})
              )
                .sort((a, b) => b[1] - a[1])
                .map(([mood, count]) => {
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
                  const percentage = Math.round((count / moodEntries.length) * 100);
                  return (
                    <View key={mood} style={styles.distributionItem}>
                      <View style={styles.distributionLeft}>
                        <Text style={styles.moodEmoji}>{moodEmojis[mood] || '😐'}</Text>
                        <Text style={styles.moodName}>{mood}</Text>
                      </View>
                      <View style={styles.barWrapper}>
                        <View
                          style={[
                            styles.distributionBar,
                            { width: `${percentage}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.percentage}>{percentage}%</Text>
                    </View>
                  );
                })}
            </View>
          )}
        </View>

        {/* Weekly Activity */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Activity Summary</Text>
          <View style={styles.activityList}>
            <View style={styles.activityRow}>
              <Text style={styles.activityLabel}>Worksheets Completed</Text>
              <Text style={styles.activityValue}>{completed.length}</Text>
            </View>
            <View style={styles.activityRow}>
              <Text style={styles.activityLabel}>Mood Check-ins</Text>
              <Text style={styles.activityValue}>{moodEntries.length}</Text>
            </View>
            <View style={styles.activityRow}>
              <Text style={styles.activityLabel}>This Week</Text>
              <Text style={styles.activityValue}>
                {moodEntries.filter(
                  e => new Date(e.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length}
                {' check-ins'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['2xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  backButton: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.lg,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  progressRingContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  progressRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primaryLighter,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: COLORS.primary,
  },
  progressValue: {
    fontSize: TYPOGRAPHY['3xl'],
    fontWeight: '700',
    color: COLORS.primary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray600,
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  moodChart: {
    height: 150,
    marginBottom: SPACING.lg,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '100%',
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '70%',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xs,
    minHeight: 10,
  },
  barLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray600,
    marginTop: SPACING.sm,
  },
  trendStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  trendStat: {
    alignItems: 'center',
  },
  trendLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray600,
    marginBottom: SPACING.sm,
  },
  trendValue: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: COLORS.primary,
  },
  moodDistribution: {
    gap: SPACING.md,
  },
  distributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  distributionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    minWidth: 70,
  },
  moodEmoji: {
    fontSize: TYPOGRAPHY.lg,
  },
  moodName: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray700,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  barWrapper: {
    flex: 1,
    height: 20,
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
  },
  distributionBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  percentage: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
    color: COLORS.gray700,
    minWidth: 35,
    textAlign: 'right',
  },
  activityList: {
    gap: SPACING.md,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  activityLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray700,
  },
  activityValue: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
