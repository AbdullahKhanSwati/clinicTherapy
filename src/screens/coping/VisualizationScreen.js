import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useSafeGoBack from '../../hooks/useSafeGoBack';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/colors';

const STEPS = [
  {
    title: 'Find a comfy spot',
    body: 'Sit or lie down somewhere comfortable. Close your eyes if it feels safe.',
    emoji: '🛋️',
  },
  {
    title: 'Take a deep breath',
    body: 'Breathe in slowly through your nose. Hold for a moment. Let it out through your mouth.',
    emoji: '🌬️',
  },
  {
    title: 'Picture your safe place',
    body: 'Imagine a place where you feel calm and happy. It can be real or made-up — a beach, a treehouse, your bedroom, a forest.',
    emoji: '🏖️',
  },
  {
    title: 'What do you see?',
    body: 'Look around your safe place. Notice the colors, the light, the shapes. Take your time.',
    emoji: '🌈',
  },
  {
    title: 'What do you hear?',
    body: 'Are there waves? Birds? Music? Quiet? Listen for sounds that make you feel peaceful.',
    emoji: '🎵',
  },
  {
    title: 'How does it feel?',
    body: 'Is it warm? Cool? Are you sitting on soft sand or fluffy grass? Notice every little feeling.',
    emoji: '☁️',
  },
  {
    title: 'You can come back anytime',
    body: 'This safe place is always inside you. When you’re ready, slowly open your eyes and come back to right now.',
    emoji: '💖',
  },
];

export default function VisualizationScreen({ navigation }) {
  const goBack = useSafeGoBack();
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => goBack()} hitSlop={8}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          Step {stepIndex + 1} / {STEPS.length}
        </Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.emoji}>{step.emoji}</Text>
        <Text style={styles.stepTitle}>{step.title}</Text>
        <Text style={styles.stepBody}>{step.body}</Text>

        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === stepIndex && styles.dotActive]}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {stepIndex > 0 && (
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => setStepIndex(stepIndex - 1)}
          >
            <Text style={styles.secondaryBtnText}>← Previous</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => {
            if (isLast) goBack();
            else setStepIndex(stepIndex + 1);
          }}
        >
          <Text style={styles.primaryBtnText}>{isLast ? 'Done' : 'Next →'}</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  backButton: { color: COLORS.primary, fontWeight: '600' },
  title: { fontSize: TYPOGRAPHY.lg, fontWeight: '700', color: COLORS.primary },
  body: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emoji: { fontSize: 80, marginBottom: SPACING.lg },
  stepTitle: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  stepBody: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.gray600,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING['2xl'],
  },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.gray300 },
  dotActive: { backgroundColor: COLORS.primary, width: 24 },
  footer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    backgroundColor: COLORS.white,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  primaryBtnText: { color: COLORS.white, fontWeight: '700', fontSize: TYPOGRAPHY.base },
  secondaryBtn: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
  },
  secondaryBtnText: { color: COLORS.gray700, fontWeight: '700', fontSize: TYPOGRAPHY.base },
});
