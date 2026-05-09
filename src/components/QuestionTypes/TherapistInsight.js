import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/colors';

export default function TherapistInsight({ question, onNext }) {
  return (
    <View style={styles.container}>
      <View style={styles.insightBox}>
        <Text style={styles.icon}>👨‍⚕️</Text>
        <Text style={styles.title}>Therapist Insight</Text>
        <Text style={styles.content}>{question.content}</Text>
      </View>

      {onNext && (
        <TouchableOpacity style={styles.nextButton} onPress={onNext}>
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
    justifyContent: 'space-between',
  },
  insightBox: {
    backgroundColor: COLORS.primaryLighter,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  icon: {
    fontSize: TYPOGRAPHY['2xl'],
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  content: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.gray700,
    lineHeight: 24,
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
