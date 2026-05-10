import React, { useState, useEffect } from 'react';
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
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/colors';
import { WORKSHEET_TEMPLATES } from '../../data/worksheetTemplates';
import dataStore from '../../utils/dataStore';

export default function ClientDetailsScreen({ route, navigation }) {
  const { clientId } = route.params || {};
  const [activeTab, setActiveTab] = useState('overview');
  const [client, setClient] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [completedWorksheets, setCompletedWorksheets] = useState([]);
  const [moodEntries, setMoodEntries] = useState([]);
  const [therapistNotes, setTherapistNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await dataStore.initialize();

        // Load client info
        const clientData = await dataStore.getUserById(clientId);
        setClient(clientData);

        // Load assignments
        const clientAssignments = await dataStore.getAssignmentsByClient(clientId);
        setAssignments(clientAssignments);

        // Load completed worksheets
        const completed = await dataStore.getCompletedWorksheetsByUser(clientId);
        setCompletedWorksheets(completed);

        // Load mood entries
        const moods = await dataStore.getMoodEntriesByUser(clientId);
        setMoodEntries(moods);

        // Load therapist notes
        const notes = await dataStore.getNotesByClient(clientId);
        setTherapistNotes(notes);
      } catch (error) {
        console.error('[v0] Error loading client data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [clientId]);

  const handleAddNote = () => {
    Alert.prompt(
      'Add Note',
      'Write your observation or progress note:',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Save',
          onPress: async (noteText) => {
            if (noteText.trim()) {
              try {
                const currentUser = await dataStore.getCurrentUser();
                await dataStore.addTherapistNote(
                  clientId,
                  currentUser?.id || 'therapist1',
                  noteText,
                  'observation',
                );
                // Reload notes
                const notes = await dataStore.getNotesByClient(clientId);
                setTherapistNotes(notes);
              } catch (error) {
                console.error('[v0] Error saving note:', error);
              }
            }
          },
        },
      ],
      'plain-text',
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!client) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Client not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const completionRate = assignments.length > 0 
    ? Math.round((completedWorksheets.length / assignments.length) * 100) 
    : 0;

  const avgMood = moodEntries.length > 0
    ? Math.round(
        moodEntries.reduce((sum, entry) => sum + entry.intensity, 0) / moodEntries.length
      )
    : 5;

  // Overview Tab
  if (activeTab === 'overview') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backButton}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{client.name}</Text>
            <View style={{ width: 50 }} />
          </View>

          {/* Client Profile */}
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <Text style={styles.profileAvatar}>{client.avatar || '👤'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.clientName}>{client.name}</Text>
                <Text style={styles.clientRole}>
                  {client.role.charAt(0).toUpperCase() + client.role.slice(1)}
                </Text>
              </View>
            </View>

            {client.age && (
              <Text style={styles.clientInfo}>Age: {client.age}</Text>
            )}
            {client.emotionalFocus && (
              <View style={styles.focusArea}>
                <Text style={styles.focusLabel}>Focus Areas:</Text>
                <View style={styles.focusTags}>
                  {client.emotionalFocus.map((focus, i) => (
                    <View key={i} style={styles.tag}>
                      <Text style={styles.tagText}>{focus}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Summary Cards */}
          <View style={styles.summaryCards}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{assignments.length}</Text>
              <Text style={styles.summaryLabel}>Assigned</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{completedWorksheets.length}</Text>
              <Text style={styles.summaryLabel}>Completed</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{completionRate}%</Text>
              <Text style={styles.summaryLabel}>Completion</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{avgMood}</Text>
              <Text style={styles.summaryLabel}>Avg Mood</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>📝 Assign Worksheet</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleAddNote}
            >
              <Text style={styles.actionButtonText}>📌 Add Note</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {completedWorksheets.length === 0 ? (
              <Text style={styles.emptyText}>No completed worksheets yet</Text>
            ) : (
              completedWorksheets.slice(0, 3).map(completed => {
                const worksheet = WORKSHEET_TEMPLATES[completed.worksheetId];
                return (
                  <View key={completed.id} style={styles.activityItem}>
                    <Text style={styles.activityIcon}>✓</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.activityTitle}>{worksheet?.title}</Text>
                      <Text style={styles.activityDate}>
                        {new Date(completed.completedDate).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <View style={styles.notesHeader}>
              <Text style={styles.sectionTitle}>Therapist Notes</Text>
              <TouchableOpacity onPress={handleAddNote}>
                <Text style={styles.addNoteLink}>+ Add</Text>
              </TouchableOpacity>
            </View>
            {therapistNotes.length === 0 ? (
              <Text style={styles.emptyText}>No notes yet</Text>
            ) : (
              therapistNotes.slice(0, 3).map(note => (
                <View key={note.id} style={styles.noteCard}>
                  <Text style={styles.noteDate}>
                    {new Date(note.date).toLocaleDateString()}
                  </Text>
                  <Text style={styles.noteContent} numberOfLines={3}>{note.content}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          {['overview', 'worksheets', 'mood'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={styles.tabLabel}>
                {tab === 'overview'
                  ? '📊 Overview'
                  : tab === 'worksheets'
                  ? '📋 Worksheets'
                  : '💭 Mood'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  // Worksheets Tab
  if (activeTab === 'worksheets') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backButton}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Assigned Worksheets</Text>
            <View style={{ width: 50 }} />
          </View>

          <View style={styles.section}>
            {assignments.length === 0 ? (
              <Text style={styles.emptyText}>No worksheets assigned</Text>
            ) : (
              assignments.map(assignment => {
                const worksheet = WORKSHEET_TEMPLATES[assignment.worksheetId];
                const isCompleted = completedWorksheets.some(
                  c => c.worksheetId === assignment.worksheetId,
                );

                return (
                  <View key={assignment.id} style={styles.worksheetListItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.worksheetName}>{worksheet?.title}</Text>
                      <Text style={styles.worksheetMeta}>
                        Assigned: {new Date(assignment.assignedDate).toLocaleDateString()}
                      </Text>
                      {assignment.dueDate && (
                        <Text style={styles.dueDateText}>
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                    <View style={styles.statusBadge}>
                      <Text
                        style={[
                          styles.statusBadgeText,
                          isCompleted && styles.statusCompleted,
                        ]}
                      >
                        {isCompleted ? '✓ Done' : '⏳ ' + assignment.status}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>

        <View style={styles.tabBar}>
          {['overview', 'worksheets', 'mood'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={styles.tabLabel}>
                {tab === 'overview'
                  ? '📊 Overview'
                  : tab === 'worksheets'
                  ? '📋 Worksheets'
                  : '💭 Mood'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  // Mood Tab
  if (activeTab === 'mood') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backButton}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Mood Tracking</Text>
            <View style={{ width: 50 }} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mood History</Text>
            {moodEntries.length === 0 ? (
              <Text style={styles.emptyText}>No mood entries yet</Text>
            ) : (
              <View style={styles.moodTimeline}>
                {moodEntries.slice(0, 10).map((entry, i) => {
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
                  return (
                    <View key={i} style={styles.moodEntry}>
                      <View style={styles.moodEntryDate}>
                        <Text style={styles.moodEntryDateText}>
                          {new Date(entry.date).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.moodEntryContent}>
                        <Text style={styles.moodEmoji}>
                          {moodEmojis[entry.mood] || '😐'}
                        </Text>
                        <Text style={styles.moodIntensity}>
                          Intensity: {entry.intensity}/10
                        </Text>
                        {entry.notes && (
                          <Text style={styles.moodNotes}>{entry.notes}</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.tabBar}>
          {['overview', 'worksheets', 'mood'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={styles.tabLabel}>
                {tab === 'overview'
                  ? '📊 Overview'
                  : tab === 'worksheets'
                  ? '📋 Worksheets'
                  : '💭 Mood'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    );
  }
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
  errorText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.base,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 80,
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
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  profileAvatar: {
    fontSize: 48,
    marginRight: SPACING.lg,
  },
  clientName: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.gray700,
  },
  clientRole: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
  },
  clientInfo: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray600,
    marginBottom: SPACING.md,
  },
  focusArea: {
    marginTop: SPACING.md,
  },
  focusLabel: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  focusTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tag: {
    backgroundColor: COLORS.primaryLighter,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  tagText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.primary,
    fontWeight: '500',
  },
  summaryCards: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.primaryLighter,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray600,
    marginTop: SPACING.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.sm,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.md,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  addNoteLink: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    gap: SPACING.md,
  },
  activityIcon: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.success,
  },
  activityTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  activityDate: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
  },
  noteCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  noteDate: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginBottom: SPACING.sm,
  },
  noteContent: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray700,
    lineHeight: 20,
  },
  worksheetListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    gap: SPACING.md,
  },
  worksheetName: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  worksheetMeta: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
  },
  dueDateText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.warning,
    marginTop: SPACING.xs,
    fontWeight: '500',
  },
  statusBadge: {
    backgroundColor: COLORS.primaryLighter,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  statusBadgeText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
    color: COLORS.warning,
  },
  statusCompleted: {
    color: COLORS.success,
  },
  moodTimeline: {
    gap: SPACING.md,
  },
  moodEntry: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  moodEntryDate: {
    minWidth: 80,
  },
  moodEntryDateText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  moodEntryContent: {
    flex: 1,
  },
  moodEmoji: {
    fontSize: TYPOGRAPHY.xl,
    marginBottom: SPACING.sm,
  },
  moodIntensity: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  moodNotes: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray600,
    marginTop: SPACING.sm,
    fontStyle: 'italic',
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
  },
  tabItemActive: {
    backgroundColor: COLORS.primaryLighter,
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
    color: COLORS.gray700,
  },
});
