import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/colors';
import WorksheetRenderer from '../components/WorksheetRenderer';
import {
  getCurrentUserId,
  getCurrentProfile,
  getWorksheetById,
  listAssignmentsFor,
  saveWorksheetResponse,
  getResponseForAssignment,
} from '../services/api';

export default function WorksheetScreen({ route, navigation }) {
  const { worksheetId, assignmentId } = route.params || {};
  const [worksheet, setWorksheet] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  // Existing draft loaded from DB. {} if none.
  const [initialResponses, setInitialResponses] = useState({});
  // We track the latest draft + step locally so that on unmount/blur we can
  // flush a final save without waiting for the debounced auto-save.
  const draftRef = useRef({ answers: {}, stepIndex: 0 });

  useEffect(() => {
    const loadData = async () => {
      try {
        const ws = await getWorksheetById(worksheetId);
        setWorksheet(ws);

        const user = await getCurrentProfile();
        setCurrentUser(user);

        if (assignmentId && user) {
          const mine = await listAssignmentsFor(user.id);
          setAssignment((mine || []).find((a) => a.id === assignmentId) || null);

          // Pull any saved draft so the teen resumes from where they left off.
          const existing = await getResponseForAssignment(assignmentId);
          if (existing?.answers && Object.keys(existing.answers).length > 0) {
            setInitialResponses(existing.answers);
            draftRef.current.answers = existing.answers;
            // If there's saved progress, skip the intro — drop the teen back
            // into the worksheet at the next unanswered step.
            if (!existing.completedAt) setShowIntro(false);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('[Worksheet] load error', error);
        setLoading(false);
      }
    };

    loadData();
  }, [worksheetId, assignmentId]);

  const handleStartWorksheet = () => {
    setShowIntro(false);
  };

  // Adapt the DB worksheet to the shape WorksheetRenderer expects.
  // DB worksheets store everything in a JSONB `content` column with one of
  // two legacy shapes:
  //   { type: 'questionnaire', questions: ['Q1', 'Q2', ...] }
  //   { type: 'builder', steps: [{ id, type, title, prompt, saveKey, ... }, ...] }
  // The renderer wants a flat `steps` array on the worksheet object plus
  // `completionMessage` / `therapistInsight` / `introduction`.
  const renderableWorksheet = useMemo(() => {
    if (!worksheet) return null;
    const c = worksheet.content || {};
    let steps = Array.isArray(c.steps) ? c.steps : [];
    if (steps.length === 0 && Array.isArray(c.questions)) {
      steps = c.questions.map((q, i) => ({
        id: `step${i + 1}`,
        type: 'text-area',
        title: typeof q === 'string' ? q : q.title || `Question ${i + 1}`,
        prompt: typeof q === 'object' ? q.prompt || '' : '',
        required: false,
        saveKey: `q${i + 1}`,
      }));
    }
    return {
      ...worksheet,
      steps,
      introduction: c.introduction || worksheet.description || '',
      completionMessage:
        c.completionMessage || 'Great work — your responses are saved.',
      therapistInsight: c.therapistInsight,
    };
  }, [worksheet]);

  // Resume index: first step whose saveKey isn't in the existing answers.
  const initialStepIndex = useMemo(() => {
    const steps = renderableWorksheet?.steps || [];
    if (!steps.length) return 0;
    const answered = new Set(Object.keys(initialResponses || {}));
    const idx = steps.findIndex(
      (s) => s.saveKey && !answered.has(s.saveKey)
    );
    return idx === -1 ? steps.length - 1 : idx;
  }, [renderableWorksheet, initialResponses]);

  // Percentage answered = answeredCount / answerableStepsCount
  const computeProgress = useCallback(
    (answers) => {
      const steps = renderableWorksheet?.steps || [];
      const answerable = steps.filter((s) => s.saveKey).length;
      if (!answerable) return 0;
      const filled = steps.filter(
        (s) => s.saveKey && answers && answers[s.saveKey] != null && answers[s.saveKey] !== ''
      ).length;
      return Math.round((filled / answerable) * 100);
    },
    [renderableWorksheet]
  );

  // Persist a draft (NOT marked completed). Called from the renderer's
  // debounced auto-save and from the back/exit handler below.
  const handleAutoSave = useCallback(
    async (responses, stepIndex) => {
      if (!assignmentId || !currentUser?.id) return;
      draftRef.current = { answers: responses || {}, stepIndex: stepIndex ?? 0 };
      try {
        await saveWorksheetResponse({
          assignmentId,
          userId: currentUser.id,
          answers: responses || {},
          completed: false,
          progress: computeProgress(responses),
        });
      } catch (e) {
        console.log('[Worksheet] auto-save error', e?.message);
      }
    },
    [assignmentId, currentUser, computeProgress]
  );

  // On unmount (back gesture / nav) flush any unsaved draft. Skips if the
  // worksheet was completed (the answers are already persisted as completed).
  useEffect(() => {
    return () => {
      const { answers, stepIndex } = draftRef.current;
      if (
        assignmentId &&
        currentUser?.id &&
        answers &&
        Object.keys(answers).length > 0
      ) {
        // Fire-and-forget — RN unmount can't await.
        saveWorksheetResponse({
          assignmentId,
          userId: currentUser.id,
          answers,
          completed: false,
          progress: computeProgress(answers),
        }).catch(() => {});
        void stepIndex;
      }
    };
    // We deliberately depend only on the ids so this runs at true unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId, currentUser?.id]);

  // Safely return — if there's no stack to pop (e.g. worksheet opened as
  // initial route), fall back to navigating to the Home tab.
  const safeGoBack = useCallback(() => {
    if (navigation.canGoBack?.()) {
      navigation.goBack();
    } else {
      // Best-effort fallback: jump to the user's role's home tab if it exists.
      try {
        navigation.navigate('Home');
      } catch (_) {
        /* nothing else we can do */
      }
    }
  }, [navigation]);

  const handleComplete = async (responses, skipped = false, stepIndex) => {
    try {
      if (assignmentId) {
        const userId = currentUser?.id || (await getCurrentUserId());
        if (userId) {
          await saveWorksheetResponse({
            assignmentId,
            userId,
            answers: responses || {},
            // skipped = user tapped Exit without finishing → keep as draft so
            // they can resume. Not skipped = user reached the end + tapped
            // Finish → mark completed.
            completed: !skipped,
            progress: computeProgress(responses),
          });
          // Clear the unmount-flush draft so we don't double-write.
          draftRef.current = { answers: {}, stepIndex: 0 };
          void stepIndex;
        }
      }
      safeGoBack();
    } catch (error) {
      console.error('[Worksheet] save error', error);
      safeGoBack();
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
            onPress={() => safeGoBack()}
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
              onPress={() => safeGoBack()}
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
                  {(worksheet.difficulty || 'beginner').charAt(0).toUpperCase() +
                    (worksheet.difficulty || 'beginner').slice(1)}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Category</Text>
                <Text style={styles.statValue}>{worksheet.category}</Text>
              </View>
            </View>

            <View style={styles.introText}>
              <Text style={styles.introTextTitle}>Why This Matters</Text>
              <Text style={styles.introTextContent}>
                {renderableWorksheet?.introduction || worksheet.description || ''}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartWorksheet}
            >
              <Text style={styles.startButtonText}>Start Worksheet</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => safeGoBack()}
            >
              <Text style={styles.cancelButtonText}>Not Now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Render the worksheet using WorksheetRenderer (with content shape adapted).
  if (!renderableWorksheet || renderableWorksheet.steps.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>
            This worksheet has no questions yet.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => safeGoBack()}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <WorksheetRenderer
      worksheet={renderableWorksheet}
      onComplete={handleComplete}
      initialResponses={initialResponses}
      initialStepIndex={initialStepIndex}
      onAutoSave={handleAutoSave}
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
