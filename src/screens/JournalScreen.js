import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/colors';
import dataStore from '../utils/dataStore';

export default function JournalScreen({ navigation, route }) {
  const { entryId } = route.params || {};
  const [isEditingEntry, setIsEditingEntry] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('calm');
  const [entries, setEntries] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(!entryId);

  const MOOD_OPTIONS = ['happy', 'sad', 'angry', 'anxious', 'calm', 'excited', 'confused', 'overwhelmed'];
  const MOOD_EMOJIS = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    anxious: '😰',
    calm: '😌',
    excited: '🤩',
    confused: '😕',
    overwhelmed: '😩',
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await dataStore.initialize();

        const user = await dataStore.getCurrentUser();
        setCurrentUser(user);

        if (entryId) {
          // Load specific entry for editing
          const entry = await dataStore.getJournalEntry(entryId);
          if (entry) {
            setTitle(entry.title);
            setContent(entry.content);
            setMood(entry.mood || 'calm');
            setIsEditingEntry(true);
          }
        } else {
          // Load all entries
          const allEntries = await dataStore.getJournalEntriesByUser(user?.id);
          setEntries(allEntries);
        }
      } catch (error) {
        console.error('[v0] Error loading journal:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [entryId]);

  const handleSaveEntry = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing Information', 'Please enter both a title and content.');
      return;
    }

    try {
      if (entryId) {
        // Update existing entry
        await dataStore.updateJournalEntry(entryId, {
          title,
          content,
          mood,
          updatedDate: new Date().toISOString(),
        });
        Alert.alert('Success', 'Entry updated!');
      } else {
        // Create new entry
        await dataStore.createJournalEntry({
          userId: currentUser?.id,
          title,
          content,
          mood,
          date: new Date().toISOString(),
        });
        Alert.alert('Success', 'Entry saved!');
      }

      // Reset form
      setTitle('');
      setContent('');
      setMood('calm');
      setIsEditingEntry(false);

      // Reload entries
      const allEntries = await dataStore.getJournalEntriesByUser(currentUser?.id);
      setEntries(allEntries);
    } catch (error) {
      console.error('[v0] Error saving entry:', error);
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    }
  };

  const handleDeleteEntry = (id) => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this entry?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await dataStore.deleteJournalEntry(id);
            const allEntries = await dataStore.getJournalEntriesByUser(currentUser?.id);
            setEntries(allEntries);
            Alert.alert('Success', 'Entry deleted!');
          } catch (error) {
            console.error('[v0] Error deleting entry:', error);
          }
        },
        style: 'destructive',
      },
    ]);
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

  // New/Edit Entry View
  if (isEditingEntry || !entryId) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => {
                if (isEditingEntry) setIsEditingEntry(false);
                else navigation.goBack();
              }}>
                <Text style={styles.backButton}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.title}>
                {entryId ? 'Edit Entry' : 'New Journal Entry'}
              </Text>
              <View style={{ width: 50 }} />
            </View>

            {/* Mood Selector */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>How are you feeling?</Text>
              <View style={styles.moodGrid}>
                {MOOD_OPTIONS.map(moodOption => (
                  <TouchableOpacity
                    key={moodOption}
                    style={[
                      styles.moodOption,
                      mood === moodOption && styles.moodOptionActive,
                    ]}
                    onPress={() => setMood(moodOption)}
                  >
                    <Text style={styles.moodEmoji}>{MOOD_EMOJIS[moodOption]}</Text>
                    <Text style={styles.moodLabel}>{moodOption}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Title Input */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Title</Text>
              <TextInput
                style={styles.titleInput}
                placeholder="Give your entry a title..."
                placeholderTextColor={COLORS.gray400}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
              <Text style={styles.charCount}>{title.length}/100</Text>
            </View>

            {/* Content Input */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>What's on your mind?</Text>
              <TextInput
                style={styles.contentInput}
                placeholder="Write your thoughts and feelings here..."
                placeholderTextColor={COLORS.gray400}
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{content.length} characters</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setTitle('');
                  setContent('');
                  setMood('calm');
                  setIsEditingEntry(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveEntry}
              >
                <Text style={styles.saveButtonText}>Save Entry</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Entries List View
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>My Journal</Text>
          <TouchableOpacity onPress={() => setIsEditingEntry(true)}>
            <Text style={styles.newButton}>+ New</Text>
          </TouchableOpacity>
        </View>

        {entries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📔</Text>
            <Text style={styles.emptyTitle}>No entries yet</Text>
            <Text style={styles.emptyText}>Start journaling to reflect on your feelings and progress</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setIsEditingEntry(true)}
            >
              <Text style={styles.emptyButtonText}>Create First Entry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          entries.map(entry => (
            <TouchableOpacity
              key={entry.id}
              style={styles.entryCard}
              onPress={() => {
                setTitle(entry.title);
                setContent(entry.content);
                setMood(entry.mood || 'calm');
                setIsEditingEntry(true);
              }}
            >
              <View style={styles.entryHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.entryTitleRow}>
                    <Text style={styles.moodEmoji}>{MOOD_EMOJIS[entry.mood] || '😐'}</Text>
                    <Text style={styles.entryTitle}>{entry.title}</Text>
                  </View>
                  <Text style={styles.entryDate}>
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteEntry(entry.id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.entryPreview} numberOfLines={2}>
                {entry.content}
              </Text>
            </TouchableOpacity>
          ))
        )}
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
  newButton: {
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
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.md,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'center',
  },
  moodOption: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.gray100,
    width: '23%',
  },
  moodOptionActive: {
    backgroundColor: COLORS.primaryLighter,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  moodEmoji: {
    fontSize: TYPOGRAPHY.xl,
    marginBottom: SPACING.xs,
  },
  moodLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray700,
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  titleInput: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray700,
    minHeight: 150,
    textAlignVertical: 'top',
    marginBottom: SPACING.sm,
  },
  charCount: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.gray200,
  },
  cancelButtonText: {
    color: COLORS.gray700,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.sm,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.sm,
  },
  entryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  entryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  moodEmoji: {
    fontSize: TYPOGRAPHY.xl,
  },
  entryTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  entryDate: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
  },
  entryPreview: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray600,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  deleteButton: {
    padding: SPACING.sm,
  },
  deleteIcon: {
    fontSize: TYPOGRAPHY.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['3xl'],
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    maxWidth: '80%',
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.sm,
  },
});
