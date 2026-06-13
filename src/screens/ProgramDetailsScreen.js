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
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from '../constants/colors';
import {
  listWorksheets,
  listMyAssignments,
} from '../services/api';
import useSafeGoBack from '../hooks/useSafeGoBack';

// Display chrome for known program ids. Anything else falls back to defaults
// derived from the id itself.
const PROGRAM_DISPLAY = {
  gottman_12week: {
    title: 'Gottman 12-Week',
    emoji: '💞',
    tagline: 'Build the seven principles of a healthy relationship',
    accent: '#D4536B',
  },
  psychodynamic_suite: {
    title: 'Psychodynamic Suite',
    emoji: '🧠',
    tagline: 'Explore triggers, defenses, and repair',
    accent: COLORS.primary,
  },
};

const formatProgramTitle = (id) =>
  (id || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Program';

export default function ProgramDetailsScreen({ route, navigation }) {
  const { programId } = route.params || {};
  const goBack = useSafeGoBack();
  const [loading, setLoading] = useState(true);
  const [worksheets, setWorksheets] = useState([]);
  const [myAssignments, setMyAssignments] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          setLoading(true);
          const [all, mine] = await Promise.all([
            listWorksheets({ programId }),
            listMyAssignments(),
          ]);
          if (cancelled) return;
          setWorksheets((all || []).sort(
            (a, b) =>
              (a.content?.week || 0) - (b.content?.week || 0)
          ));
          setMyAssignments(mine || []);
        } catch (e) {
          console.log('[ProgramDetails] load error', e);
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => { cancelled = true; };
    }, [programId])
  );

  const display = PROGRAM_DISPLAY[programId] || {
    title: formatProgramTitle(programId),
    emoji: '📚',
    tagline: 'A structured program by your therapist',
    accent: COLORS.primary,
  };

  // For each worksheet in the program, check if the current user has an
  // assignment for it — and if so, what its status is.
  const modules = useMemo(() => {
    const assignByWorksheet = new Map();
    myAssignments.forEach((a) => assignByWorksheet.set(a.worksheetId, a));
    return worksheets.map((w, i) => {
      const a = assignByWorksheet.get(w.id);
      return {
        id: w.id,
        weekLabel: w.content?.week
          ? `Week ${w.content.week}`
          : `Step ${i + 1}`,
        title: w.title,
        sub: w.description || w.content?.phase || '',
        status: a?.status || null,
        assignmentId: a?.id || null,
      };
    });
  }, [worksheets, myAssignments]);

  const completedCount = modules.filter((m) => m.status === 'completed').length;
  const total = modules.length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const enrolled = modules.some((m) => m.status);

  const openModule = (m) => {
    if (m.assignmentId) {
      navigation.navigate('Worksheet', {
        worksheetId: m.id,
        assignmentId: m.assignmentId,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { backgroundColor: display.accent }]}>
        <TouchableOpacity onPress={goBack} hitSlop={8}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{display.title}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.heroCard, { borderColor: display.accent }]}>
          <Text style={styles.heroEmoji}>{display.emoji}</Text>
          <Text style={styles.heroTagline}>{display.tagline}</Text>
          {enrolled && (
            <View style={[styles.enrollPill, { backgroundColor: display.accent + '15' }]}>
              <Text style={[styles.enrollPillText, { color: display.accent }]}>
                ENROLLED · {pct}%
              </Text>
            </View>
          )}
        </View>

        {/* Progress */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{total}</Text>
            <Text style={styles.statLabel}>MODULES</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>DONE</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{pct}%</Text>
            <Text style={styles.statLabel}>PROGRESS</Text>
          </View>
        </View>

        {/* Modules */}
        <Text style={styles.sectionLabel}>MODULES</Text>

        {loading ? (
          <View style={{ paddingVertical: SPACING.xl, alignItems: 'center' }}>
            <ActivityIndicator color={display.accent} />
          </View>
        ) : modules.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>
              No worksheets in this program yet
            </Text>
            <Text style={styles.emptyText}>
              Your therapist will publish modules here as the program rolls out.
            </Text>
          </View>
        ) : (
          modules.map((m, i) => {
            const done = m.status === 'completed';
            const inProg = m.status === 'in_progress';
            const tappable = !!m.assignmentId;
            return (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.moduleCard,
                  done && styles.moduleCardDone,
                ]}
                onPress={() => openModule(m)}
                disabled={!tappable}
                activeOpacity={tappable ? 0.85 : 1}
              >
                <View style={styles.moduleNumberBox}>
                  <Text
                    style={[
                      styles.moduleNumber,
                      done && { color: display.accent },
                    ]}
                  >
                    {done ? '✓' : i + 1}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.moduleWeek}>{m.weekLabel}</Text>
                  <Text style={styles.moduleTitle}>{m.title}</Text>
                  {m.sub ? (
                    <Text style={styles.moduleSub} numberOfLines={2}>
                      {m.sub}
                    </Text>
                  ) : null}
                  {m.status && (
                    <Text
                      style={[
                        styles.moduleStatus,
                        done && { color: COLORS.success },
                        inProg && { color: COLORS.warning },
                      ]}
                    >
                      {done
                        ? 'Completed'
                        : inProg
                        ? 'In progress'
                        : 'Assigned'}
                    </Text>
                  )}
                </View>
                {tappable && (
                  <Text style={styles.moduleChev}>›</Text>
                )}
              </TouchableOpacity>
            );
          })
        )}

        <View style={styles.helperBlock}>
          <Text style={styles.helperText}>
            Modules unlock as your therapist assigns them to you. Tap an
            assigned module to open the worksheet.
          </Text>
        </View>

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: { color: COLORS.white, fontWeight: '700', fontSize: TYPOGRAPHY.sm },
  headerTitle: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.base,
    fontWeight: '800',
    letterSpacing: -0.2,
    flex: 1,
    textAlign: 'center',
  },

  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },

  /* Hero */
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    ...SHADOWS.sm,
  },
  heroEmoji: { fontSize: 56, marginBottom: SPACING.sm },
  heroTagline: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.gray700,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.sm,
    letterSpacing: -0.2,
  },
  enrollPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    marginTop: 4,
  },
  enrollPillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  statValue: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '800',
    color: COLORS.gray700,
    letterSpacing: -0.4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 0.8,
    marginTop: 2,
  },

  /* Section label */
  sectionLabel: {
    fontSize: 11,
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
    ...SHADOWS.sm,
  },
  emptyEmoji: { fontSize: 36, marginBottom: SPACING.sm },
  emptyTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 18,
  },

  /* Module card */
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  moduleCardDone: { opacity: 0.85 },
  moduleNumberBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  moduleNumber: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '800',
    color: COLORS.gray600,
  },
  moduleWeek: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.gray500,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  moduleTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: COLORS.gray700,
    letterSpacing: -0.2,
  },
  moduleSub: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginTop: 2,
    lineHeight: 16,
  },
  moduleStatus: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    color: COLORS.primary,
  },
  moduleChev: {
    fontSize: 22,
    color: COLORS.gray400,
    marginLeft: SPACING.sm,
  },

  /* Helper */
  helperBlock: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
  },
  helperText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
