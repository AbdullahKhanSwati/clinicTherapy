import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useSafeGoBack from '../hooks/useSafeGoBack';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/colors';
import {
  getCurrentProfile,
  listWorksheets,
  listMyAssignments,
} from '../services/api';

// Display chrome (icon + colour) for known program ids. Anything else falls
// back to a neutral default.
const PROGRAM_DISPLAY = {
  gottman_12week: { emoji: '💞', color: '#D4536B', title: 'Gottman 12-Week' },
  psychodynamic_suite: { emoji: '🧠', color: COLORS.primary, title: 'Psychodynamic Suite' },
};

const programDisplay = (id) =>
  PROGRAM_DISPLAY[id] || {
    emoji: '📚',
    color: COLORS.primary,
    title: id,
  };

export default function TherapyProgramsScreen({ navigation }) {
  const goBack = useSafeGoBack();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);
  const [enrolledPrograms, setEnrolledPrograms] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [user, allWS, myAssigns] = await Promise.all([
          getCurrentProfile(),
          listWorksheets(),
          listMyAssignments(),
        ]);
        setCurrentUser(user);

        // Build the program list from DB worksheets grouped by program_id,
        // only including programs relevant to this user's role.
        const role = user?.role;
        const eligible = (allWS || []).filter(
          (w) =>
            w.programId &&
            (!role || w.audience === role || w.audience === 'all')
        );
        const byProgram = new Map();
        eligible.forEach((w) => {
          const cur = byProgram.get(w.programId);
          if (cur) {
            cur.sessions += 1;
          } else {
            const d = programDisplay(w.programId);
            byProgram.set(w.programId, {
              id: w.programId,
              title: d.title,
              emoji: d.emoji,
              color: d.color,
              description: w.description || 'Multi-session program',
              duration: '',
              sessions: 1,
            });
          }
        });
        const list = Array.from(byProgram.values()).map((p) => ({
          ...p,
          duration: `${p.sessions} ${p.sessions === 1 ? 'session' : 'sessions'}`,
        }));
        setPrograms(list);

        // Enrollment derived from my assignments: any program whose worksheet
        // I've been assigned counts as "enrolled".
        const myProgramIds = new Set(
          (myAssigns || [])
            .map((a) => (allWS || []).find((w) => w.id === a.worksheetId)?.programId)
            .filter(Boolean)
        );
        setEnrolledPrograms(Array.from(myProgramIds));
      } catch (error) {
        console.error('[TherapyPrograms] load error', error);
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
          <TouchableOpacity onPress={() => goBack()}>
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
          {programs.length === 0 && (
            <View style={[styles.programCard, { alignItems: 'center' }]}>
              <Text style={{ color: COLORS.gray500, textAlign: 'center' }}>
                No programs available yet.
              </Text>
            </View>
          )}
          {programs.map(program => {
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
