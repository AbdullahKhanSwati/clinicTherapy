import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/colors';
import WorksheetRenderer from '../components/WorksheetRenderer';
import { WORKSHEET_TEMPLATES } from '../data/worksheetTemplates';
import dataStore from '../utils/dataStore';

export default function WorksheetScreen({ route, navigation }) {
  const { worksheetId, assignmentId } = route.params || {};
  const [worksheet, setWorksheet] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await dataStore.initialize();

        // Load worksheet template
        const ws = WORKSHEET_TEMPLATES[worksheetId];
        setWorksheet(ws);

        // Load assignment if provided
        if (assignmentId) {
          const assignments = await dataStore.getWorksheetAssignments();
          const assign = assignments.find(a => a.id === assignmentId);
          setAssignment(assign);
        }

        // Load current user
        const user = await dataStore.getCurrentUser();
        setCurrentUser(user);

        setLoading(false);
      } catch (error) {
        console.error('[v0] Error loading worksheet:', error);
        setLoading(false);
      }
    };

    loadData();
  }, [worksheetId, assignmentId]);

  const handleStartWorksheet = () => {
    setShowIntro(false);
  };

  const handleComplete = async (responses, skipped = false) => {
    try {
      if (!skipped && currentUser) {
        // Save completed worksheet
        const completion = await dataStore.saveCompletedWorksheet(
          currentUser.id,
          worksheetId,
          assignmentId,
          responses,
        );

        if (completion) {
          console.log('[v0] Worksheet saved successfully');
        }
      }

      // Show completion screen or navigate back
      navigation.goBack();
    } catch (error) {
      console.error('[v0] Error saving worksheet:', error);
      navigation.goBack();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading worksheet...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!worksheet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Worksheet not found</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (showIntro) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.introHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.introContent}>
            <Text style={styles.introEmoji}>📝</Text>

            <Text style={styles.introTitle}>{worksheet.title}</Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>About This Worksheet</Text>
              <Text style={styles.infoText}>{worksheet.description}</Text>
            </View>

            {assignment && (
              <View style={styles.assignmentBox}>
                <Text style={styles.assignmentLabel}>Assigned to you by your therapist</Text>
                {assignment.notes && (
                  <Text style={styles.assignmentNotes}>{assignment.notes}</Text>
                )}
              </View>
            )}

            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Time</Text>
                <Text style={styles.statValue}>{worksheet.estimatedTime}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Difficulty</Text>
                <Text style={styles.statValue}>
                  {worksheet.difficulty.charAt(0).toUpperCase() + worksheet.difficulty.slice(1)}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Category</Text>
                <Text style={styles.statValue}>{worksheet.category}</Text>
              </View>
            </View>

            <View style={styles.introText}>
              <Text style={styles.introTextTitle}>Why This Matters</Text>
              <Text style={styles.introTextContent}>{worksheet.introduction}</Text>
            </View>

            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartWorksheet}
            >
              <Text style={styles.startButtonText}>Start Worksheet</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Not Now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Render the worksheet using WorksheetRenderer
  return (
    <WorksheetRenderer
      worksheet={worksheet}
      onComplete={handleComplete}
    />
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
  loadingText: {
    marginTop: SPACING.lg,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.gray600,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['2xl'],
  },
  introHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: SPACING.lg,
    marginTop: SPACING.lg,
  },
  closeButton: {
    fontSize: TYPOGRAPHY.lg,
    padding: SPACING.md,
  },
  closeButtonText: {
    fontSize: TYPOGRAPHY.xl,
    color: COLORS.gray500,
  },
  introContent: {
    alignItems: 'center',
  },
  introEmoji: {
    fontSize: 60,
    marginBottom: SPACING.lg,
  },
  introTitle: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  infoBox: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.gray600,
    lineHeight: 22,
  },
  assignmentBox: {
    width: '100%',
    backgroundColor: COLORS.primaryLighter,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  assignmentLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  assignmentNotes: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.gray700,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray600,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  introText: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  introTextTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.md,
  },
  introTextContent: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.gray600,
    lineHeight: 22,
  },
  startButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  startButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.base,
  },
  cancelButton: {
    width: '100%',
    backgroundColor: COLORS.gray100,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  cancelButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.base,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.lg,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.base,
  },
  errorText: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.error,
    marginBottom: SPACING.lg,
  },
});
