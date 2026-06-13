import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/colors';

const EMOTION_EMOJIS = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  scared: '😨',
  calm: '😌',
  excited: '🤩',
  confused: '😕',
  anxious: '😰',
  proud: '😌',
  love: '😍',
};

const EMOTION_COLORS = {
  happy: '#FFD700',
  sad: '#4A90E2',
  angry: '#E74C3C',
  scared: '#8E44AD',
  calm: '#2ECC71',
  excited: '#E74C3C',
  confused: '#95A5A6',
  anxious: '#F39C12',
  proud: '#2ECC71',
  love: '#E91E63',
};

export default function EmotionSelector({ question, value, onChange, onNext }) {
  const [selected, setSelected] = useState(value);

  const handleSelect = (emotion) => {
    setSelected(emotion);
    onChange(emotion);
  };

  const handleNext = () => {
    if (selected && onNext) {
      onNext();
    }
  };

  const displayEmotions = question.emotions || Object.keys(EMOTION_EMOJIS);

  return (
    <View style={styles.container}>
      <View style={styles.emotionGrid}>
        {displayEmotions.map(emotion => (
          <TouchableOpacity
            key={emotion}
            style={[
              styles.emotionButton,
              selected === emotion && styles.emotionButtonSelected,
            ]}
            onPress={() => handleSelect(emotion)}
          >
            <Text style={styles.emotionEmoji}>{EMOTION_EMOJIS[emotion] || '😐'}</Text>
            <Text style={styles.emotionLabel}>{emotion.charAt(0).toUpperCase() + emotion.slice(1)}</Text>
            {selected === emotion && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {selected && onNext && (
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'center',
  },
  emotionButton: {
    width: '30%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.gray50,
    borderWidth: 2,
    borderColor: COLORS.gray200,
  },
  emotionButtonSelected: {
    backgroundColor: COLORS.primaryLighter,
    borderColor: COLORS.primary,
  },
  emotionEmoji: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  emotionLabel: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
    color: COLORS.gray700,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  checkmarkText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  nextButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.base,
  },
});
