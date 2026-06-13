import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useSafeGoBack from '../hooks/useSafeGoBack';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/colors';
import { getCurrentUserId, createMoodEntry } from '../services/api';

const MOODS = [
  { id: 'happy', emoji: '😊', label: 'Happy', color: '#FFD700' },
  { id: 'sad', emoji: '😢', label: 'Sad', color: '#4A90E2' },
  { id: 'angry', emoji: '😠', label: 'Angry', color: '#E74C3C' },
  { id: 'anxious', emoji: '😰', label: 'Anxious', color: '#F39C12' },
  { id: 'calm', emoji: '😌', label: 'Calm', color: '#2ECC71' },
  { id: 'excited', emoji: '🤩', label: 'Excited', color: '#E91E63' },
  { id: 'confused', emoji: '😕', label: 'Confused', color: '#95A5A6' },
  { id: 'overwhelmed', emoji: '😩', label: 'Overwhelmed', color: '#E74C3C' },
];

export default function MoodCheckInScreen({ navigation }) {
  const goBack = useSafeGoBack();
  const [selectedMood, setSelectedMood] = useState(null);
  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionVisible, setCompletionVisible] = useState(false);

  const handleSubmit = async () => {
    if (!selectedMood) {
      Alert.alert('Required', 'Please select a mood to check in');
      return;
    }

    try {
      setIsSubmitting(true);
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('You are not signed in.');

      await createMoodEntry({
        userId,
        mood: selectedMood,
        score: intensity,
        note: notes,
      });

      setCompletionVisible(true);
      setTimeout(() => {
        setCompletionVisible(false);
        goBack();
      }, 2000);
    } catch (error) {
      console.error('[MoodCheckIn] save error', error);
      Alert.alert('Error', error?.message || 'Failed to save mood check-in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Mood Check-In</Text>
          <View style={{ width: 50 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.promptBox}>
            <Text style={styles.promptEmoji}>💭</Text>
            <Text style={styles.promptText}>How are you feeling right now?</Text>
          </View>

          {/* Mood Selection */}
          <View style={styles.moodGrid}>
            {MOODS.map(mood => (
              <TouchableOpacity
                key={mood.id}
                style={[
                  styles.moodButton,
                  selectedMood === mood.id && styles.moodButtonSelected,
                ]}
                onPress={() => setSelectedMood(mood.id)}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={styles.moodLabel}>{mood.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Intensity Slider */}
          {selectedMood && (
            <View style={styles.intensitySection}>
              <Text style={styles.sectionTitle}>How intense is this feeling?</Text>
              <View style={styles.sliderContainer}>
                <Text style={styles.intensityValue}>{intensity}</Text>
                <View style={styles.sliderTrack}>
                  <View
                    style={[
                      styles.sliderThumb,
                      { left: `${(intensity / 10) * 100}%` },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.intensityLabels}>
                <Text style={styles.label}>Mild</Text>
                <Text style={styles.label}>Overwhelming</Text>
              </View>

              {/* Manual input for intensity */}
              <View style={styles.intensityInputs}>
                {[...Array(11)].map((_, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.intensityButton,
                      intensity === i && styles.intensityButtonActive,
                    ]}
                    onPress={() => setIntensity(i)}
                  >
                    <Text
                      style={[
                        styles.intensityButtonText,
                        intensity === i && styles.intensityButtonTextActive,
                      ]}
                    >
                      {i}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Notes Section */}
          {selectedMood && (
            <View style={styles.notesSection}>
              <Text style={styles.sectionTitle}>Any notes? (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="What triggered this feeling? What helps?"
                placeholderTextColor={COLORS.gray400}
                value={notes}
                onChangeText={setNotes}
                multiline
                maxLength={500}
                editable={!isSubmitting}
              />
              <Text style={styles.charCount}>{notes.length}/500</Text>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, !selectedMood && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!selectedMood || isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Saving...' : 'Save Check-In'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Completion Modal */}
      <Modal visible={completionVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.completionBox}>
            <Text style={styles.completionEmoji}>✓</Text>
            <Text style={styles.completionText}>Check-in saved!</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING['2xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  backButton: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  promptBox: {
    backgroundColor: COLORS.primaryLighter,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  promptEmoji: {
    fontSize: 40,
    marginBottom: SPACING.md,
  },
  promptText: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
    justifyContent: 'center',
  },
  moodButton: {
    width: '23%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.gray200,
  },
  moodButtonSelected: {
    backgroundColor: COLORS.primaryLighter,
    borderColor: COLORS.primary,
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  moodLabel: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
    color: COLORS.gray700,
    textAlign: 'center',
  },
  intensitySection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.md,
  },
  sliderContainer: {
    position: 'relative',
    height: 50,
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  intensityValue: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  sliderTrack: {
    height: 8,
    backgroundColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  sliderThumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    top: -8,
  },
  intensityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
  },
  intensityInputs: {
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  intensityButton: {
    width: '9%',
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  intensityButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  intensityButtonText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  intensityButtonTextActive: {
    color: COLORS.white,
  },
  notesSection: {
    marginBottom: SPACING.xl,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.gray700,
    minHeight: 100,
    maxHeight: 200,
    fontFamily: 'System',
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginTop: SPACING.sm,
    textAlign: 'right',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.gray300,
  },
  submitButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.base,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionBox: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING['2xl'],
    paddingHorizontal: SPACING['3xl'],
    alignItems: 'center',
  },
  completionEmoji: {
    fontSize: 48,
    marginBottom: SPACING.lg,
  },
  completionText: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
