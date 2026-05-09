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

const THERAPY_PROGRAMS = [
  {
    id: 'cbt',
    title: 'Cognitive Behavioral Therapy',
    emoji: '🧠',
    description: 'Learn to identify and change negative thought patterns',
    duration: '8 weeks',
    sessions: 8,
    color: COLORS.primary,
  },
  {
    id: 'dbt',
    title: 'Dialectical Behavior Therapy',
    emoji: '🎯',
    description: 'Develop emotional regulation and distress tolerance skills',
    duration: '12 weeks',
    sessions: 12,
    color: '#FF6B6B',
  },
  {
    id: 'mindfulness',
    title: 'Mindfulness & Meditation',
    emoji: '🧘',
    description: 'Build awareness and reduce anxiety through mindfulness',
    duration: '6 weeks',
    sessions: 6,
    color: '#4ECDC4',
  },
  {
    id: 'ace',
    title: 'Acceptance & Commitment Therapy',
    emoji: '🌱',
    description: 'Accept what you cannot control and commit to valued living',
    duration: '10 weeks',
    sessions: 10,
    color: '#95E1D3',
  },
  {
    id: 'social',
    title: 'Social Skills Training',
    emoji: '👥',
    description: 'Improve communication and interpersonal relationships',
    duration: '8 weeks',
    sessions: 8,
    color: '#F38181',
  },
  {
    id: 'sleep',
    title: 'Sleep & Wellness',
    emoji: '😴',
    description: 'Improve sleep quality and develop healthy habits',
    duration: '4 weeks',
    sessions: 4,
    color: '#AA96DA',
  },
];

export default function TherapyProgramsScreen({ navigation }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolledPrograms, setEnrolledPrograms] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await dataStore.initialize();
        const user = await dataStore.getCurrentUser();
        setCurrentUser(user);

        // Simulate enrolled programs
        setEnrolledPrograms(['cbt', 'mindfulness']);
      } catch (error) {
        console.error('[v0] Error loading programs:', error);
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Therapy Programs</Text>
          <View style={{ width: 50 }} />
        </View>

        <View style={styles.introCard}>
          <Text style={styles.introTitle}>Choose Your Path to Wellness</Text>
          <Text style={styles.introText}>
            Explore evidence-based therapy programs designed to help you achieve your mental health goals.
          </Text>
        </View>

        <View style={styles.programsContainer}>
          {THERAPY_PROGRAMS.map(program => {
            const isEnrolled = enrolledPrograms.includes(program.id);
            return (
              <TouchableOpacity
                key={program.id}
                style={[styles.programCard, { borderLeftColor: program.color }]}
                onPress={() => navigation.navigate('ProgramDetails', { programId: program.id })}
              >
                <View style={styles.programHeader}>
                  <Text style={styles.programEmoji}>{program.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.programTitle}>{program.title}</Text>
                    {isEnrolled && (
                      <View style={styles.enrolledBadge}>
                        <Text style={styles.enrolledText}>✓ Enrolled</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={styles.programDescription}>{program.description}</Text>
                <View style={styles.programMeta}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Duration</Text>
                    <Text style={styles.metaValue}>{program.duration}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Sessions</Text>
                    <Text style={styles.metaValue}>{program.sessions}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Difficulty</Text>
                    <Text style={styles.metaValue}>Moderate</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
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
    marginBottom: SPACING.lg,
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
  introCard: {
    backgroundColor: COLORS.primaryLighter,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  introTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  introText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray700,
    lineHeight: 20,
  },
  programsContainer: {
    gap: SPACING.md,
  },
  programCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderLeftWidth: 4,
  },
  programHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  programEmoji: {
    fontSize: 32,
  },
  programTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  enrolledBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
  },
  enrolledText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.success,
    fontWeight: '600',
  },
  programDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray600,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  programMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginBottom: SPACING.xs,
  },
  metaValue: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.gray700,
  },
});
