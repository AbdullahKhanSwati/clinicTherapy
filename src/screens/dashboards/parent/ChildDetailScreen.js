import React, { useState, useCallback } from 'react';
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
} from '../../../constants/colors';
import Avatar from '../../../components/Avatar';
import {
  getProfileById,
  listMoodEntries,
  listAssignmentsFor,
  listNotesForClient,
  listWorksheets,
} from '../../../services/api';

const INK = '#1A2332';
const SAGE = '#15803D';
const WARNING = '#D97706';
const DANGER = '#DC2626';
const SUCCESS = '#15803D';

const ACCESSORY_EMOJI = {
  none: '',
  crown: '👑',
  star: '⭐',
  sparkles: '✨',
  flower: '🌸',
  heart: '💖',
  hat: '🎩',
  rainbow: '🌈',
};

const MOOD_EMOJI = {
  happy: '😊', sad: '😢', angry: '😠', anxious: '😰',
  calm: '😌', excited: '🤩', confused: '😕', overwhelmed: '😩', okay: '🙂',
};

/**
 * ChildDetailScreen (parent view) — read-only summary of one of the parent's
 * children. Shows mood timeline, worksheet progress, and therapist notes.
 *
 * All data is fetched live from Supabase; RLS enforces that the signed-in
 * parent can only see rows belonging to a child they are linked to.
 */
export default function ChildDetailScreen({ route, navigation }) {
  const { childId } = route?.params || {};
  const [child, setChild] = useState(null);
  const [moods, setMoods] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [worksheetsById, setWorksheetsById] = useState({});
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        if (!childId) {
          setLoading(false);
          setError('No child specified.');
          return;
        }
        try {
          setLoading(true);
          setError(null);
          const [c, m, a, ws, n] = await Promise.all([
            getProfileById(childId),
            listMoodEntries(childId),
            listAssignmentsFor(childId),
            listWorksheets(),
            listNotesForClient(childId),
          ]);
          if (cancelled) return;
          setChild(c);
          setMoods(m || []);
          setAssignments(a || []);
          const map = {};
          (ws || []).forEach((w) => {
            map[w.id] = w;
          });
          setWorksheetsById(map);
          // Hide notes flagged private by the therapist. RLS lets the
          // parent see them, but they're meant for the therapist's
          // record only.
          setNotes((n || []).filter((note) => !note.isPrivate));
        } catch (e) {
          console.log('[Parent ChildDetail] load error', e);
          if (!cancelled) setError("Couldn't load this child's details.");
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [childId])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color={INK} />
        </View>
      </SafeAreaView>
    );
  }

  if (!child) {
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
          <Feather name="user-x" size={32} color={COLORS.gray300} />
          <Text style={styles.errorText}>{error || 'Child not found.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const completedCount = assignments.filter((a) => a.status === 'completed').length;
  const totalAssignments = assignments.length;
  const completionPct =
    totalAssignments > 0
      ? Math.round((completedCount / totalAssignments) * 100)
      : 0;
  const latestMood = moods[0];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={20} color={INK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {child.name}
        </Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile hero */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Avatar
              value={child.avatar}
              name={child.name}
              size={80}
              backgroundColor={child.profileColor || SAGE}
              emojiSize={38}
            />
            {child.accessory && ACCESSORY_EMOJI[child.accessory] ? (
              <Text style={styles.accessoryBadge}>
                {ACCESSORY_EMOJI[child.accessory]}
              </Text>
            ) : null}
          </View>
          <Text style={styles.childName}>{child.name}</Text>
          <View style={styles.tagRow}>
            <View style={[styles.tag, { backgroundColor: SAGE + '15' }]}>
              <Text style={[styles.tagText, { color: SAGE }]}>
                {(child.role || '').toUpperCase()}
              </Text>
            </View>
            {child.age ? (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{child.age} YEARS</Text>
              </View>
            ) : null}
          </View>
          {child.emotionalFocus && child.emotionalFocus.length > 0 && (
            <View style={styles.focusRow}>
              {child.emotionalFocus.map((focus, i) => (
                <View key={i} style={styles.focusTag}>
                  <Text style={styles.focusTagText}>{focus}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Stats strip */}
          <View style={styles.statsStrip}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{moods.length}</Text>
              <Text style={styles.statLabel}>CHECK-INS</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completedCount}</Text>
              <Text style={styles.statLabel}>COMPLETED</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completionPct}%</Text>
              <Text style={styles.statLabel}>RATE</Text>
            </View>
          </View>
        </View>

        {/* Latest mood */}
        {latestMood && (
          <>
            <Text style={styles.sectionLabel}>LATEST MOOD CHECK-IN</Text>
            <View style={styles.moodCard}>
              <Text style={styles.moodEmojiLarge}>
                {MOOD_EMOJI[latestMood.mood] || '🙂'}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.moodMood}>
                  {(latestMood.mood || '').replace(/^./, (c) => c.toUpperCase())}
                  {typeof latestMood.score === 'number'
                    ? ` · intensity ${latestMood.score}/10`
                    : ''}
                </Text>
                {latestMood.note ? (
                  <Text style={styles.moodNote} numberOfLines={2}>
                    "{latestMood.note}"
                  </Text>
                ) : null}
                <Text style={styles.moodDate}>
                  {new Date(latestMood.date || latestMood.createdAt).toLocaleDateString(
                    'en-US',
                    {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }
                  )}
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Active worksheets */}
        <Text style={styles.sectionLabel}>WORKSHEETS</Text>
        {assignments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No worksheets assigned yet.
            </Text>
          </View>
        ) : (
          assignments.slice(0, 5).map((a) => {
            const w = worksheetsById[a.worksheetId];
            if (!w) return null;
            const isDone = a.status === 'completed';
            const isOverdue =
              !isDone && a.dueDate && new Date(a.dueDate) < new Date();
            const isInProgress = a.status === 'in_progress';
            const statusColor = isDone
              ? SUCCESS
              : isOverdue
              ? DANGER
              : isInProgress
              ? WARNING
              : INK;
            const statusLabel = isDone
              ? 'COMPLETED'
              : isOverdue
              ? 'OVERDUE'
              : isInProgress
              ? 'IN PROGRESS'
              : 'NOT STARTED';
            return (
              <View key={a.id} style={styles.wsCard}>
                <View style={styles.wsTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.wsCategory}>
                      {(w.category || '').toUpperCase()}
                    </Text>
                    <Text style={styles.wsTitle} numberOfLines={2}>
                      {w.title}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: statusColor + '15' },
                    ]}
                  >
                    <View
                      style={[styles.statusDot, { backgroundColor: statusColor }]}
                    />
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {statusLabel}
                    </Text>
                  </View>
                </View>
                {a.dueDate && !isDone ? (
                  <Text
                    style={[
                      styles.wsDue,
                      isOverdue && { color: DANGER, fontWeight: '700' },
                    ]}
                  >
                    Due{' '}
                    {new Date(a.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                ) : null}
              </View>
            );
          })
        )}

        {/* Therapist notes */}
        <Text style={styles.sectionLabel}>THERAPIST NOTES</Text>
        {notes.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No notes shared with you yet. Your therapist may share
              observations here.
            </Text>
          </View>
        ) : (
          notes.slice(0, 5).map((n) => (
            <View key={n.id} style={styles.noteCard}>
              <View style={styles.noteHeader}>
                <Text style={styles.noteCategory}>
                  {(n.category || 'NOTE').toUpperCase()}
                </Text>
                <Text style={styles.noteDate}>
                  {new Date(n.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              <Text style={styles.noteContent}>{n.body || n.content}</Text>
            </View>
          ))
        )}

        {/* Recent mood timeline */}
        {moods.length > 1 && (
          <>
            <Text style={styles.sectionLabel}>RECENT MOOD HISTORY</Text>
            <View style={styles.moodHistoryCard}>
              {moods.slice(0, 7).map((m, i) => (
                <View
                  key={m.id}
                  style={[
                    styles.moodHistoryRow,
                    i < Math.min(moods.length, 7) - 1 && styles.borderBottom,
                  ]}
                >
                  <Text style={styles.moodHistoryEmoji}>
                    {MOOD_EMOJI[m.mood] || '🙂'}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.moodHistoryLabel}>
                      {(m.mood || '').replace(/^./, (c) => c.toUpperCase())}
                    </Text>
                    {m.note ? (
                      <Text style={styles.moodHistoryNote} numberOfLines={1}>
                        "{m.note}"
                      </Text>
                    ) : null}
                  </View>
                  <Text style={styles.moodHistoryDate}>
                    {new Date(m.date || m.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  errorText: {
    fontSize: 14,
    color: COLORS.gray500,
    fontWeight: '600',
    marginTop: SPACING.md,
    textAlign: 'center',
  },

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
  headerTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: INK,
    textAlign: 'center',
    letterSpacing: -0.2,
  },

  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },

  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  accessoryBadge: {
    position: 'absolute',
    top: -8,
    right: -4,
    fontSize: 28,
  },
  childName: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.5,
    marginBottom: SPACING.sm,
  },
  tagRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.gray100,
    marginHorizontal: 3,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.gray600,
    letterSpacing: 0.6,
  },
  focusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  focusTag: {
    backgroundColor: SAGE + '12',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    marginHorizontal: 3,
    marginTop: 4,
  },
  focusTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: SAGE,
    letterSpacing: 0.3,
  },

  statsStrip: {
    flexDirection: 'row',
    width: '100%',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.4,
  },
  statLabel: {
    fontSize: 9,
    color: COLORS.gray500,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  statDivider: { width: 1, backgroundColor: COLORS.gray100, marginVertical: 4 },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },

  moodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  moodEmojiLarge: { fontSize: 40, marginRight: SPACING.md },
  moodMood: {
    fontSize: 13,
    fontWeight: '700',
    color: INK,
    marginBottom: 4,
  },
  moodNote: {
    fontSize: 12,
    color: COLORS.gray600,
    fontStyle: 'italic',
    lineHeight: 17,
    marginBottom: 4,
  },
  moodDate: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
  },

  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.gray500,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 17,
  },

  wsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  wsTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  wsCategory: {
    fontSize: 9,
    fontWeight: '700',
    color: SAGE,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  wsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
    marginLeft: SPACING.sm,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  wsDue: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
  },

  noteCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    borderLeftWidth: 3,
    borderLeftColor: SAGE,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  noteCategory: {
    fontSize: 9,
    fontWeight: '800',
    color: SAGE,
    letterSpacing: 0.8,
    backgroundColor: SAGE + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  noteDate: { fontSize: 11, color: COLORS.gray500, fontWeight: '500' },
  noteContent: { fontSize: 13, color: INK, lineHeight: 19 },

  moodHistoryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  moodHistoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  moodHistoryEmoji: { fontSize: 24, marginRight: SPACING.md },
  moodHistoryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: INK,
  },
  moodHistoryNote: {
    fontSize: 11,
    color: COLORS.gray500,
    fontStyle: 'italic',
    marginTop: 2,
  },
  moodHistoryDate: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
  },
});
