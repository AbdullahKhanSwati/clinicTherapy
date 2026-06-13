import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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
  getProfileById,
  getCurrentProfile,
  getCurrentUserId,
  listAssignmentsFor,
  listResponsesFor,
  listMoodEntries,
  listJournalEntries,
  listNotesForClient,
  listResources,
  listClientResources,
  listTherapistClients,
  assignClientToTherapist,
  removeClientResource,
  listWorksheets,
} from '../../services/api';
import Avatar from '../../components/Avatar';

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

const INK = '#1A2332';
const ACCENT = COLORS.primary;
const SUCCESS = '#15803D';
const WARNING = '#D97706';
const DANGER = '#DC2626';

const MOOD_EMOJIS = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  anxious: '😰',
  calm: '😌',
  excited: '🤩',
  confused: '😕',
  overwhelmed: '😩',
  okay: '🙂',
};

const ROLE_LABEL = {
  child: 'CHILD',
  teen: 'TEEN',
  couples: 'COUPLES',
  family: 'FAMILY',
};

const ROLE_COLOR = {
  child: '#9333EA',
  teen: '#0891B2',
  couples: '#D4536B',
  family: '#15803D',
};

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'worksheets', label: 'Worksheets' },
  { id: 'resources', label: 'Resources' },
  { id: 'mood', label: 'Mood' },
  { id: 'journal', label: 'Journal' },
  { id: 'notes', label: 'Notes' },
];

export default function ClientDetailsScreen({ route, navigation }) {
  const { clientId } = route.params || {};
  const [activeTab, setActiveTab] = useState('overview');
  const [client, setClient] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [moods, setMoods] = useState([]);
  const [journals, setJournals] = useState([]);
  const [notes, setNotes] = useState([]);
  const [clientResources, setClientResources] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [customWorksheets, setCustomWorksheets] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);

      // Auto-link: if the signed-in therapist isn't yet listed as this
      // client's therapist, add the link before we fetch their data — RLS
      // for journal_entries / notes / etc. requires the link to exist.
      try {
        const me = await getCurrentProfile();
        if (
          me &&
          clientId &&
          (me.role === 'therapist' || me.role === 'admin')
        ) {
          const existing = await listTherapistClients(me.id);
          if (!existing.includes(clientId)) {
            await assignClientToTherapist(me.id, clientId);
          }
        }
      } catch (linkErr) {
        // Non-fatal — even without the link, RLS still lets admins through.
        console.log('[ClientDetails] auto-link skipped', linkErr?.message);
      }

      const [c, a, responses, m, j, n, allRes, cr, custom] = await Promise.all([
        getProfileById(clientId),
        listAssignmentsFor(clientId),
        listResponsesFor(clientId),
        listMoodEntries(clientId),
        listJournalEntries(clientId),
        listNotesForClient(clientId),
        listResources(),
        listClientResources(clientId),
        listWorksheets(),
      ]);
      setClient(c);
      setAssignments(a || []);
      const completedFromResponses = (responses || [])
        .filter((r) => r.completedAt)
        .map((r) => {
          const ass = (a || []).find((aa) => aa.id === r.assignmentId);
          return {
            id: r.id,
            assignmentId: r.assignmentId,
            worksheetId: ass?.worksheetId,
            completedDate: r.completedAt,
          };
        })
        .filter((x) => x.worksheetId);
      setCompleted(completedFromResponses);
      setMoods(m || []);
      setJournals(j || []);
      setNotes(n || []);
      setClientResources(cr || []);
      setAllResources(allRes || []);
      setCustomWorksheets(custom || []);
    } catch (e) {
      console.log('[ClientDetails] load error', e);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  // Helper to look up worksheet by id from the DB-loaded list
  const findWorksheet = useCallback(
    (id) => (customWorksheets || []).find((w) => w.id === id),
    [customWorksheets]
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const stats = useMemo(() => {
    const completedAssignments = assignments.filter(
      (a) => a.status === 'completed'
    ).length;
    const completionRate =
      assignments.length > 0
        ? Math.round((completedAssignments / assignments.length) * 100)
        : 0;
    const moodScores = {
      happy: 8, calm: 7, excited: 9, okay: 5,
      confused: 4, sad: 3, anxious: 3, angry: 2, overwhelmed: 1,
    };
    const avgMood =
      moods.length > 0
        ? Math.round(
            (moods.reduce((s, m) => s + (moodScores[m.mood] || 5), 0) /
              moods.length) *
              10
          ) / 10
        : 0;
    return {
      assignments: assignments.length,
      completed: completedAssignments,
      completionRate,
      avgMood,
    };
  }, [assignments, moods]);

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

  if (!client) {
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
          <Text style={styles.errorText}>Client not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const roleLabel = ROLE_LABEL[client.role] || (client.role || 'USER').toUpperCase();
  const roleColor = ROLE_COLOR[client.role] || COLORS.gray500;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={20} color={INK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Client
        </Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
      >
        {/* Profile hero */}
        <View>
          <View style={styles.profileCard}>
            <View style={styles.avatarWrap}>
              <Avatar
                value={client.avatar}
                name={client.name}
                size={80}
                backgroundColor={client.profileColor || ACCENT}
                emojiSize={42}
              />
              {client.accessory && ACCESSORY_EMOJI[client.accessory] ? (
                <Text style={styles.accessoryBadge}>
                  {ACCESSORY_EMOJI[client.accessory]}
                </Text>
              ) : null}
            </View>

            <Text style={styles.clientName}>{client.name}</Text>
            <Text style={styles.clientEmail}>{client.email}</Text>

            <View style={styles.tagsRow}>
              <View
                style={[styles.roleTag, { backgroundColor: roleColor + '15' }]}
              >
                <Text style={[styles.roleTagText, { color: roleColor }]}>
                  {roleLabel}
                </Text>
              </View>
              {client.age && (
                <View style={styles.ageTag}>
                  <Text style={styles.ageTagText}>{client.age} years</Text>
                </View>
              )}
            </View>

            {client.emotionalFocus && client.emotionalFocus.length > 0 && (
              <View style={styles.focusRow}>
                {client.emotionalFocus.map((focus, i) => (
                  <View key={i} style={styles.focusTag}>
                    <Text style={styles.focusTagText}>{focus}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Stats */}
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.assignments}</Text>
                <Text style={styles.statLabel}>ASSIGNED</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.completed}</Text>
                <Text style={styles.statLabel}>COMPLETED</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.completionRate}%</Text>
                <Text style={styles.statLabel}>RATE</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.avgMood || '—'}</Text>
                <Text style={styles.statLabel}>AVG MOOD</Text>
              </View>
            </View>
          </View>

          {/* Primary actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnPrimary]}
              onPress={() =>
                navigation.navigate('AssignWorksheet', { clientId: client.id })
              }
              activeOpacity={0.85}
            >
              <Feather name="send" size={14} color={COLORS.white} />
              <Text style={styles.actionBtnPrimaryText}>Assign Worksheet</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnSecondary]}
              onPress={() =>
                navigation.navigate('AddNote', { clientId: client.id })
              }
              activeOpacity={0.85}
            >
              <Feather name="edit-3" size={14} color={INK} />
              <Text style={styles.actionBtnSecondaryText}>Add Note</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sticky tab bar */}
        <View style={styles.stickyTabBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabBarRow}
          >
            {TABS.map((t) => {
              const active = activeTab === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.tabBtn, active && styles.tabBtnActive]}
                  onPress={() => setActiveTab(t.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.tabLabel, active && styles.tabLabelActive]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Tab content */}
        {activeTab === 'overview' && (
          <OverviewSection
            client={client}
            completed={completed}
            notes={notes}
            moods={moods}
            navigation={navigation}
            findWorksheet={findWorksheet}
          />
        )}

        {activeTab === 'worksheets' && (
          <WorksheetsSection
            assignments={assignments}
            completed={completed}
            client={client}
            navigation={navigation}
            findWorksheet={findWorksheet}
          />
        )}

        {activeTab === 'resources' && (
          <ResourcesSection
            clientResources={clientResources}
            allResources={allResources}
            client={client}
            navigation={navigation}
            onReload={load}
          />
        )}

        {activeTab === 'mood' && <MoodSection moods={moods} />}
        {activeTab === 'journal' && <JournalSection journals={journals} />}
        {activeTab === 'notes' && (
          <NotesSection
            notes={notes}
            client={client}
            navigation={navigation}
          />
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ===== Overview Section =====
const OverviewSection = ({ client, completed, notes, moods, navigation, findWorksheet }) => {
  const lastMood = moods[0];
  const recentCompleted = completed.slice(0, 3);
  const recentNotes = notes.slice(0, 2);

  return (
    <View>
      {/* Last mood snapshot */}
      {lastMood && (
        <>
          <Text style={styles.sectionLabel}>LATEST MOOD CHECK-IN</Text>
          <View style={styles.lastMoodCard}>
            <Text style={styles.lastMoodEmoji}>
              {MOOD_EMOJIS[lastMood.mood] || '🙂'}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.lastMoodText}>
                {((lastMood.mood || '').charAt(0).toUpperCase() + (lastMood.mood || '').slice(1)) || '—'}{' '}
                · intensity {lastMood.intensity}/10
              </Text>
              {lastMood.notes ? (
                <Text style={styles.lastMoodNotes} numberOfLines={2}>
                  "{lastMood.notes}"
                </Text>
              ) : null}
              <Text style={styles.lastMoodDate}>
                {new Date(lastMood.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </>
      )}

      <Text style={styles.sectionLabel}>RECENTLY COMPLETED</Text>
      {recentCompleted.length === 0 ? (
        <View style={styles.emptyInline}>
          <Text style={styles.emptyText}>No completed worksheets yet</Text>
        </View>
      ) : (
        <View style={styles.card}>
          {recentCompleted.map((c, i) => {
            const w = findWorksheet(c.worksheetId);
            return (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.completedRow,
                  i < recentCompleted.length - 1 && styles.borderBottom,
                ]}
                onPress={() =>
                  c.assignmentId &&
                  navigation.navigate('WorksheetResponse', {
                    assignmentId: c.assignmentId,
                  })
                }
                activeOpacity={0.7}
              >
                <View style={styles.completedDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.completedTitle}>{w?.title}</Text>
                  <Text style={styles.completedDate}>
                    {new Date(c.completedDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
                <Feather name="chevron-right" size={16} color={COLORS.gray400} />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>RECENT NOTES</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('AddNote', { clientId: client.id })
          }
        >
          <Text style={styles.sectionAction}>+ Add</Text>
        </TouchableOpacity>
      </View>
      {recentNotes.length === 0 ? (
        <View style={styles.emptyInline}>
          <Text style={styles.emptyText}>No clinical notes yet</Text>
        </View>
      ) : (
        recentNotes.map((n) => (
          <View key={n.id} style={styles.noteCard}>
            <View style={styles.noteHeader}>
              <Text style={styles.noteCategoryBadge}>
                {(n.category || 'NOTE').toUpperCase()}
              </Text>
              <Text style={styles.noteDate}>
                {new Date(n.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <Text style={styles.noteContent}>{n.content}</Text>
          </View>
        ))
      )}
    </View>
  );
};

// ===== Worksheets Section =====
const WorksheetsSection = ({ assignments, completed, client, navigation, findWorksheet }) => {
  if (assignments.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Feather name="file-text" size={28} color={COLORS.gray300} />
        <Text style={styles.emptyTitle}>No worksheets assigned</Text>
        <TouchableOpacity
          style={styles.emptyActionBtn}
          onPress={() =>
            navigation.navigate('AssignWorksheet', { clientId: client.id })
          }
        >
          <Text style={styles.emptyActionText}>Assign your first</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      {assignments.map((a) => {
        const w = findWorksheet(a.worksheetId);
        if (!w) return null;
        const isDone = a.status === 'completed';
        const isOverdue = !isDone && a.dueDate && new Date(a.dueDate) < new Date();
        const isInProgress = a.status === 'in_progress' || a.status === 'in-progress';
        const statusColor = isDone
          ? SUCCESS
          : isOverdue
          ? DANGER
          : isInProgress
          ? WARNING
          : ACCENT;
        const statusLabel = isDone
          ? 'COMPLETED'
          : isOverdue
          ? 'OVERDUE'
          : isInProgress
          ? 'IN PROGRESS'
          : 'PENDING';

        return (
          <TouchableOpacity
            key={a.id}
            style={styles.assignmentCard}
            onPress={() =>
              navigation.navigate('WorksheetResponse', { assignmentId: a.id })
            }
            activeOpacity={0.9}
          >
            <View style={styles.assignmentTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.assignmentCategory}>
                  {(w.category || '').toUpperCase()}
                </Text>
                <Text style={styles.assignmentTitle}>{w.title}</Text>
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

            <View style={styles.assignmentMeta}>
              <View style={styles.metaItem}>
                <Feather name="calendar" size={11} color={COLORS.gray500} />
                <Text style={styles.metaText}>
                  Assigned{' '}
                  {new Date(a.assignedDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              {a.dueDate && (
                <View style={styles.metaItem}>
                  <Feather
                    name="clock"
                    size={11}
                    color={isOverdue ? DANGER : COLORS.gray500}
                  />
                  <Text
                    style={[
                      styles.metaText,
                      isOverdue && { color: DANGER, fontWeight: '700' },
                    ]}
                  >
                    Due{' '}
                    {new Date(a.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              )}
              {(a.progress > 0 || isDone) && (
                <View style={styles.metaItem}>
                  <Feather
                    name="bar-chart-2"
                    size={11}
                    color={COLORS.gray500}
                  />
                  <Text style={styles.metaText}>
                    {isDone ? '100%' : `${a.progress}%`} done
                  </Text>
                </View>
              )}
            </View>

            {a.notes && (
              <Text style={styles.assignmentNotes} numberOfLines={2}>
                "{a.notes}"
              </Text>
            )}

            <View style={styles.reviewCta}>
              <Text style={styles.reviewCtaText}>
                {isDone
                  ? 'Review answers'
                  : isInProgress
                  ? 'View progress'
                  : 'Open worksheet'}
              </Text>
              <Feather name="chevron-right" size={16} color={ACCENT} />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ===== Mood Section =====
const MoodSection = ({ moods }) => {
  if (moods.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Feather name="smile" size={28} color={COLORS.gray300} />
        <Text style={styles.emptyTitle}>No mood entries yet</Text>
        <Text style={styles.emptyText}>
          The client hasn't logged any mood check-ins
        </Text>
      </View>
    );
  }

  return (
    <View>
      {moods.map((m, i) => (
        <View key={i} style={styles.moodCard}>
          <Text style={styles.moodEmoji}>{MOOD_EMOJIS[m.mood] || '🙂'}</Text>
          <View style={{ flex: 1 }}>
            <View style={styles.moodTitleRow}>
              <Text style={styles.moodMood}>
                {((m.mood || '').charAt(0).toUpperCase() + (m.mood || '').slice(1)) || '—'}
              </Text>
              <Text style={styles.moodIntensity}>{m.intensity}/10</Text>
            </View>
            <Text style={styles.moodDate}>
              {new Date(m.date).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
            {m.notes ? (
              <Text style={styles.moodNotes}>"{m.notes}"</Text>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
};

// ===== Journal Section =====
const JournalSection = ({ journals }) => {
  if (journals.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Feather name="book" size={28} color={COLORS.gray300} />
        <Text style={styles.emptyTitle}>No journal entries</Text>
        <Text style={styles.emptyText}>
          The client hasn't shared any journal entries
        </Text>
      </View>
    );
  }

  return (
    <View>
      {journals.map((j) => (
        <View key={j.id} style={styles.journalCard}>
          <View style={styles.journalHeader}>
            <Text style={styles.journalDate}>
              {new Date(j.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
            <Text style={styles.journalMood}>
              {MOOD_EMOJIS[j.mood] || j.emoji || '📓'}
            </Text>
          </View>
          <Text style={styles.journalTitle}>{j.title}</Text>
          <Text style={styles.journalContent} numberOfLines={4}>
            {j.content}
          </Text>
        </View>
      ))}
    </View>
  );
};

// ===== Resources Section =====
const ResourcesSection = ({
  clientResources,
  allResources,
  client,
  navigation,
  onReload,
}) => {
  const TYPE_ICON = {
    article: 'file-text',
    video: 'video',
    document: 'paperclip',
    note: 'edit-3',
  };

  const handleRemove = (assignment) => {
    const resource = allResources.find((r) => r.id === assignment.resourceId);
    const title = resource?.title || 'this resource';
    Alert.alert(
      'Remove resource?',
      `"${title}" will be removed from ${client?.name}'s profile.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeClientResource(assignment.id);
              onReload?.();
            } catch (e) {
              console.log('[ClientDetails] remove resource error', e);
            }
          },
        },
      ]
    );
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.addNoteBtn}
        onPress={() =>
          navigation.navigate('AddClientResource', { clientId: client.id })
        }
        activeOpacity={0.85}
      >
        <Feather name="plus" size={16} color={COLORS.white} />
        <Text style={styles.addNoteBtnText}>Add Resource</Text>
      </TouchableOpacity>

      {clientResources.length === 0 ? (
        <View style={styles.emptyCard}>
          <Feather name="book-open" size={28} color={COLORS.gray300} />
          <Text style={styles.emptyTitle}>No resources assigned</Text>
          <Text style={styles.emptyText}>
            Tap above to share articles, videos, or notes with this client.
          </Text>
        </View>
      ) : (
        clientResources.map((cr) => {
          const resource = allResources.find((r) => r.id === cr.resourceId);
          if (!resource) return null;
          const icon = TYPE_ICON[resource.type] || 'link';
          return (
            <View key={cr.id} style={styles.resourceCard}>
              <View style={styles.resourceCardTop}>
                <View style={styles.resourceCardIcon}>
                  <Feather name={icon} size={16} color="#D97706" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resourceCardCategory}>
                    {(resource.category || '').toUpperCase()}
                  </Text>
                  <Text style={styles.resourceCardTitle} numberOfLines={2}>
                    {resource.title}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemove(cr)}
                  activeOpacity={0.7}
                  style={styles.resourceRemoveBtn}
                >
                  <Feather name="x" size={16} color={COLORS.gray400} />
                </TouchableOpacity>
              </View>
              {resource.description ? (
                <Text style={styles.resourceCardDesc} numberOfLines={2}>
                  {resource.description}
                </Text>
              ) : null}
              {cr.note ? (
                <View style={styles.resourceNoteBox}>
                  <Text style={styles.resourceNoteLabel}>YOUR NOTE</Text>
                  <Text style={styles.resourceNoteText}>{cr.note}</Text>
                </View>
              ) : null}
              <Text style={styles.resourceCardDate}>
                Assigned{' '}
                {new Date(cr.assignedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
          );
        })
      )}
    </View>
  );
};

// ===== Notes Section =====
const NotesSection = ({ notes, client, navigation }) => {
  return (
    <View>
      <TouchableOpacity
        style={styles.addNoteBtn}
        onPress={() => navigation.navigate('AddNote', { clientId: client.id })}
        activeOpacity={0.85}
      >
        <Feather name="plus" size={16} color={COLORS.white} />
        <Text style={styles.addNoteBtnText}>Add Clinical Note</Text>
      </TouchableOpacity>

      {notes.length === 0 ? (
        <View style={styles.emptyCard}>
          <Feather name="edit-3" size={28} color={COLORS.gray300} />
          <Text style={styles.emptyTitle}>No notes yet</Text>
          <Text style={styles.emptyText}>
            Tap above to record your first clinical observation
          </Text>
        </View>
      ) : (
        notes.map((n) => (
          <View key={n.id} style={styles.noteCard}>
            <View style={styles.noteHeader}>
              <Text style={styles.noteCategoryBadge}>
                {(n.category || 'NOTE').toUpperCase()}
              </Text>
              <Text style={styles.noteDate}>
                {new Date(n.date).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            <Text style={styles.noteContent}>{n.content}</Text>
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '600',
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

  /* Profile hero */
  avatarWrap: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  accessoryBadge: {
    position: 'absolute',
    top: -8,
    right: -6,
    fontSize: 26,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: { fontSize: 38 },
  clientName: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.5,
  },
  clientEmail: {
    fontSize: 12,
    color: COLORS.gray500,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  tagsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  roleTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: 6,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  ageTag: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  ageTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray600,
    letterSpacing: 0.4,
  },
  focusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  focusTag: {
    backgroundColor: ACCENT + '12',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    marginHorizontal: 3,
    marginTop: 4,
  },
  focusTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: ACCENT,
    letterSpacing: 0.3,
  },

  statsGrid: {
    flexDirection: 'row',
    width: '100%',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.4,
  },
  statLabel: {
    fontSize: 9,
    color: COLORS.gray500,
    marginTop: 3,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.gray100,
    marginVertical: 4,
  },

  /* Actions */
  actionRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: 4,
  },
  actionBtnPrimary: { backgroundColor: INK },
  actionBtnPrimaryText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 6,
    letterSpacing: 0.2,
  },
  actionBtnSecondary: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  actionBtnSecondaryText: {
    color: INK,
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 6,
    letterSpacing: 0.2,
  },

  /* Sticky tab bar */
  stickyTabBar: {
    backgroundColor: COLORS.background,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    marginHorizontal: -SPACING.lg,
  },
  tabBarRow: {
    paddingHorizontal: SPACING.lg,
  },
  tabBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: { borderBottomColor: INK },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray500,
  },
  tabLabelActive: {
    color: INK,
    fontWeight: '800',
  },

  /* Sections */
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  sectionAction: {
    fontSize: 12,
    fontWeight: '700',
    color: ACCENT,
  },

  /* Cards */
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },

  /* Last mood */
  lastMoodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  lastMoodEmoji: {
    fontSize: 40,
    marginRight: SPACING.md,
  },
  lastMoodText: {
    fontSize: 13,
    fontWeight: '700',
    color: INK,
    marginBottom: 4,
  },
  lastMoodNotes: {
    fontSize: 12,
    color: COLORS.gray600,
    fontStyle: 'italic',
    marginBottom: 4,
    lineHeight: 18,
  },
  lastMoodDate: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
  },

  /* Completed rows */
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  completedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SUCCESS,
    marginRight: SPACING.md,
  },
  completedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: INK,
    marginBottom: 2,
  },
  completedDate: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
  },

  /* Assignment card */
  assignmentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  assignmentTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  assignmentCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: ACCENT,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  assignmentTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.3,
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
  assignmentMeta: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  metaText: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
    marginLeft: 4,
  },
  assignmentNotes: {
    fontSize: 12,
    color: COLORS.gray600,
    fontStyle: 'italic',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    lineHeight: 18,
  },
  reviewCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  reviewCtaText: {
    fontSize: 12,
    fontWeight: '800',
    color: ACCENT,
    letterSpacing: 0.3,
    marginRight: 2,
  },

  /* Mood card */
  moodCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  moodEmoji: { fontSize: 32, marginRight: SPACING.md, marginTop: 2 },
  moodTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  moodMood: {
    fontSize: 13,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.2,
  },
  moodIntensity: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray500,
  },
  moodDate: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
    marginBottom: 4,
  },
  moodNotes: {
    fontSize: 12,
    color: COLORS.gray600,
    fontStyle: 'italic',
    lineHeight: 18,
  },

  /* Journal card */
  journalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  journalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  journalDate: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  journalMood: { fontSize: 20 },
  journalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  journalContent: {
    fontSize: 13,
    color: COLORS.gray600,
    lineHeight: 20,
  },

  /* Notes */
  addNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: INK,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  addNoteBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 6,
    letterSpacing: 0.2,
  },
  noteCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    borderLeftWidth: 3,
    borderLeftColor: ACCENT,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  noteCategoryBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: ACCENT,
    letterSpacing: 0.8,
    backgroundColor: ACCENT + '12',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  noteDate: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  noteContent: {
    fontSize: 13,
    color: INK,
    lineHeight: 20,
  },

  /* Resource card */
  resourceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    borderLeftWidth: 3,
    borderLeftColor: '#D97706',
  },
  resourceCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  resourceCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D9770615',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  resourceCardCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  resourceCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: INK,
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  resourceRemoveBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resourceCardDesc: {
    fontSize: 12,
    color: COLORS.gray500,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  resourceNoteBox: {
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  resourceNoteLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.gray500,
    letterSpacing: 1,
    marginBottom: 4,
  },
  resourceNoteText: {
    fontSize: 12,
    color: INK,
    fontStyle: 'italic',
    lineHeight: 17,
  },
  resourceCardDate: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
  },

  /* Empty */
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  emptyInline: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: INK,
    marginTop: SPACING.md,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.gray500,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyActionBtn: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: INK,
    borderRadius: BORDER_RADIUS.full,
  },
  emptyActionText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
