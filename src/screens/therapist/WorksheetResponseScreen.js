import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
} from '../../constants/colors';
import {
  getAssignmentById,
  getWorksheetById,
  getResponseForAssignment,
  getProfileById,
} from '../../services/api';

const INK = '#1A2332';
const SUCCESS = '#15803D';
const WARNING = '#D97706';
const DANGER = '#DC2626';
const ACCENT = COLORS.primary;

const STATUS_META = {
  completed:   { label: 'COMPLETED',   color: SUCCESS },
  in_progress: { label: 'IN PROGRESS', color: WARNING },
  not_started: { label: 'NOT STARTED', color: ACCENT },
  overdue:     { label: 'OVERDUE',     color: DANGER },
};

/**
 * WorksheetResponseScreen — therapist's read-only view of a single worksheet
 * assignment + whatever the client has submitted so far. Shows partial
 * (in-progress) drafts as well as completed submissions.
 *
 * route.params:
 *   - assignmentId  (required)
 */
export default function WorksheetResponseScreen({ route, navigation }) {
  const { assignmentId } = route?.params || {};
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState(null);
  const [worksheet, setWorksheet] = useState(null);
  const [response, setResponse] = useState(null);
  const [client, setClient] = useState(null);

  const load = useCallback(async () => {
    if (!assignmentId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const a = await getAssignmentById(assignmentId);
      setAssignment(a);
      if (!a) return;

      const [w, r, c] = await Promise.all([
        getWorksheetById(a.worksheetId),
        getResponseForAssignment(assignmentId),
        getProfileById(a.assigneeId),
      ]);
      setWorksheet(w);
      setResponse(r);
      setClient(c);
    } catch (e) {
      console.log('[WorksheetResponse] load', e);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Adapt the DB worksheet content to a flat step list (same logic as the
  // teen-side WorksheetScreen so the review mirrors what the teen saw).
  const steps = useMemo(() => {
    if (!worksheet) return [];
    const c = worksheet.content || {};
    if (Array.isArray(c.steps) && c.steps.length > 0) return c.steps;
    if (Array.isArray(c.questions)) {
      return c.questions.map((q, i) => ({
        id: `step${i + 1}`,
        type: 'text-area',
        title: typeof q === 'string' ? q : q.title || `Question ${i + 1}`,
        prompt: typeof q === 'object' ? q.prompt || '' : '',
        saveKey: `q${i + 1}`,
      }));
    }
    return [];
  }, [worksheet]);

  const answers = response?.answers || {};
  const answerableSteps = steps.filter((s) => s.saveKey);
  const answeredCount = answerableSteps.filter(
    (s) => answers[s.saveKey] != null && answers[s.saveKey] !== ''
  ).length;
  const progress = assignment?.progress ?? (
    answerableSteps.length
      ? Math.round((answeredCount / answerableSteps.length) * 100)
      : 0
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={20} color={INK} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <ActivityIndicator color={INK} />
        </View>
      </SafeAreaView>
    );
  }

  if (!assignment || !worksheet) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={20} color={INK} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>This worksheet could not be loaded.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const status = assignment.status || 'not_started';
  const statusMeta = STATUS_META[status] || STATUS_META.not_started;
  const completedAt = response?.completedAt;
  const lastUpdated = response?.updatedAt || response?.createdAt;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={20} color={INK} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: SPACING.md }}>
          <Text style={styles.eyebrow}>RESPONSE REVIEW</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {worksheet.title}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status / client hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View
              style={[
                styles.statusPill,
                { backgroundColor: statusMeta.color + '15' },
              ]}
            >
              <View
                style={[styles.statusDot, { backgroundColor: statusMeta.color }]}
              />
              <Text style={[styles.statusText, { color: statusMeta.color }]}>
                {statusMeta.label}
              </Text>
            </View>
            <Text style={styles.heroPct}>{progress}%</Text>
          </View>

          <Text style={styles.heroTitle}>{worksheet.title}</Text>
          {worksheet.description ? (
            <Text style={styles.heroDesc}>{worksheet.description}</Text>
          ) : null}

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%`, backgroundColor: statusMeta.color },
              ]}
            />
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Feather name="user" size={12} color={COLORS.gray500} />
              <Text style={styles.metaText}>
                {client?.name || 'Client'}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="calendar" size={12} color={COLORS.gray500} />
              <Text style={styles.metaText}>
                Assigned{' '}
                {new Date(assignment.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
            {assignment.dueDate ? (
              <View style={styles.metaItem}>
                <Feather name="clock" size={12} color={COLORS.gray500} />
                <Text style={styles.metaText}>
                  Due{' '}
                  {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            ) : null}
          </View>

          {completedAt ? (
            <Text style={styles.completedAt}>
              ✓ Completed{' '}
              {new Date(completedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          ) : lastUpdated ? (
            <Text style={styles.completedAt}>
              Last updated{' '}
              {new Date(lastUpdated).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          ) : null}
        </View>

        {/* Step-by-step answers */}
        <Text style={styles.sectionLabel}>
          {answeredCount} of {answerableSteps.length} answered
        </Text>

        {steps.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="file-text" size={28} color={COLORS.gray300} />
            <Text style={styles.emptyText}>
              This worksheet has no questions yet.
            </Text>
          </View>
        ) : !response || Object.keys(answers).length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="inbox" size={28} color={COLORS.gray300} />
            <Text style={styles.emptyTitle}>No responses yet</Text>
            <Text style={styles.emptyText}>
              {client?.name?.split(' ')[0] || 'The client'} hasn't started
              this worksheet.
            </Text>
          </View>
        ) : (
          steps.map((s, i) => {
            const value = s.saveKey ? answers[s.saveKey] : undefined;
            const isAnswered = value != null && value !== '';
            const isInfoBlock =
              s.type === 'information-block' || s.type === 'reflection-note';
            return (
              <View key={s.id || i} style={styles.stepCard}>
                <View style={styles.stepHeader}>
                  <View
                    style={[
                      styles.stepNumber,
                      isAnswered && styles.stepNumberDone,
                      isInfoBlock && styles.stepNumberInfo,
                    ]}
                  >
                    {isAnswered ? (
                      <Feather name="check" size={12} color={COLORS.white} />
                    ) : (
                      <Text style={styles.stepNumberText}>{i + 1}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stepTitle}>{s.title}</Text>
                    {s.prompt && s.prompt !== s.title ? (
                      <Text style={styles.stepPrompt}>{s.prompt}</Text>
                    ) : null}
                  </View>
                </View>

                {isInfoBlock ? (
                  <View style={styles.infoBlock}>
                    <Text style={styles.infoBlockLabel}>
                      {s.type === 'reflection-note'
                        ? 'REFLECTION'
                        : 'INFORMATION'}
                    </Text>
                    <Text style={styles.infoBlockText}>
                      {s.content || s.prompt || s.title}
                    </Text>
                  </View>
                ) : isAnswered ? (
                  <View style={styles.answerBox}>
                    <Text style={styles.answerLabel}>ANSWER</Text>
                    <Text style={styles.answerText}>{formatValue(value)}</Text>
                  </View>
                ) : (
                  <View style={styles.unansweredBox}>
                    <Feather name="circle" size={12} color={COLORS.gray400} />
                    <Text style={styles.unansweredText}>Not answered yet</Text>
                  </View>
                )}
              </View>
            );
          })
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const formatValue = (v) => {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return v.join(', ');
  if (typeof v === 'object') return JSON.stringify(v, null, 2);
  return String(v);
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: COLORS.error, fontWeight: '600' },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: ACCENT,
    letterSpacing: 1.4,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.5,
  },

  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },

  /* Hero card */
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroPct: {
    fontSize: 22,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.5,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  heroDesc: {
    fontSize: 12,
    color: COLORS.gray600,
    lineHeight: 17,
    marginBottom: SPACING.md,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  progressFill: { height: '100%' },

  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
    marginTop: 4,
  },
  metaText: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
    marginLeft: 4,
  },
  completedAt: {
    fontSize: 11,
    color: SUCCESS,
    fontWeight: '700',
    marginTop: SPACING.sm,
    letterSpacing: 0.2,
  },

  /* Section */
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
    marginBottom: SPACING.md,
  },

  /* Empty */
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: INK,
    marginTop: SPACING.sm,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: SPACING.sm,
  },

  /* Step card */
  stepCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    marginTop: 1,
  },
  stepNumberDone: { backgroundColor: SUCCESS },
  stepNumberInfo: { backgroundColor: ACCENT + '40' },
  stepNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.gray600,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: INK,
    letterSpacing: -0.2,
    lineHeight: 19,
  },
  stepPrompt: {
    fontSize: 12,
    color: COLORS.gray500,
    marginTop: 4,
    lineHeight: 17,
  },

  answerBox: {
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: SUCCESS,
  },
  answerLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.gray500,
    letterSpacing: 1,
    marginBottom: 6,
  },
  answerText: {
    fontSize: 13,
    color: INK,
    lineHeight: 19,
  },

  infoBlock: {
    backgroundColor: ACCENT + '08',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: ACCENT,
  },
  infoBlockLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: ACCENT,
    letterSpacing: 1,
    marginBottom: 6,
  },
  infoBlockText: {
    fontSize: 12,
    color: COLORS.gray700,
    lineHeight: 17,
    fontStyle: 'italic',
  },

  unansweredBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  unansweredText: {
    fontSize: 12,
    color: COLORS.gray500,
    marginLeft: 6,
    fontStyle: 'italic',
  },
});
