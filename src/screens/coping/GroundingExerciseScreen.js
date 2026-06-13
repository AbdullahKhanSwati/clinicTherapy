import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useSafeGoBack from '../../hooks/useSafeGoBack';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/colors';

const STEPS = [
  { count: 5, sense: 'see', emoji: '👀', color: '#E0F4FF' },
  { count: 4, sense: 'touch', emoji: '✋', color: '#D1FAE5' },
  { count: 3, sense: 'hear', emoji: '👂', color: '#FEF3C7' },
  { count: 2, sense: 'smell', emoji: '👃', color: '#FFE4E6' },
  { count: 1, sense: 'taste', emoji: '👅', color: '#F3E8FF' },
];

export default function GroundingExerciseScreen({ navigation }) {
  const goBack = useSafeGoBack();
  const [stepIndex, setStepIndex] = useState(0);
  const [inputs, setInputs] = useState(() => STEPS.map((s) => Array(s.count).fill('')));
  const [done, setDone] = useState(false);

  const step = STEPS[stepIndex];

  const updateInput = (i, value) => {
    setInputs((prev) => {
      const next = prev.map((row) => [...row]);
      next[stepIndex][i] = value;
      return next;
    });
  };

  const next = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      setDone(true);
    }
  };

  const back = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
    else goBack();
  };

  const restart = () => {
    setStepIndex(0);
    setInputs(STEPS.map((s) => Array(s.count).fill('')));
    setDone(false);
  };

  if (done) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => goBack()} hitSlop={8}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>5-4-3-2-1 Grounding</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView contentContainerStyle={styles.donePad}>
          <Text style={styles.celebrateEmoji}>🌟</Text>
          <Text style={styles.celebrateTitle}>You did it!</Text>
          <Text style={styles.celebrateBody}>
            You used your senses to feel safe and present. How do you feel now?
          </Text>

          <View style={styles.summaryCard}>
            {STEPS.map((s, i) => (
              <View key={s.sense} style={styles.summaryRow}>
                <Text style={styles.summaryEmoji}>{s.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.summaryLabel}>
                    {s.count} things I can {s.sense}
                  </Text>
                  <Text style={styles.summaryAnswers} numberOfLines={3}>
                    {inputs[i].filter(Boolean).join(', ') || '—'}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={restart}>
            <Text style={styles.primaryBtnText}>Do it again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => goBack()}
          >
            <Text style={styles.secondaryBtnText}>Back to Toolbox</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={back} hitSlop={8}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          Step {stepIndex + 1} / {STEPS.length}
        </Text>
        <View style={{ width: 50 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.stepHero, { backgroundColor: step.color }]}>
            <Text style={styles.stepEmoji}>{step.emoji}</Text>
            <Text style={styles.stepCount}>{step.count}</Text>
            <Text style={styles.stepLabel}>
              things I can <Text style={styles.stepLabelStrong}>{step.sense}</Text>
            </Text>
          </View>

          {Array.from({ length: step.count }).map((_, i) => (
            <TextInput
              key={i}
              style={styles.input}
              placeholder={`#${i + 1}`}
              placeholderTextColor={COLORS.gray400}
              value={inputs[stepIndex][i]}
              onChangeText={(v) => updateInput(i, v)}
            />
          ))}

          <TouchableOpacity style={styles.primaryBtn} onPress={next}>
            <Text style={styles.primaryBtnText}>
              {stepIndex < STEPS.length - 1 ? 'Next sense →' : 'Finish'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING['2xl'] },
  stepHero: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  stepEmoji: { fontSize: 56, marginBottom: SPACING.sm },
  stepCount: {
    fontSize: 56,
    fontWeight: '800',
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  stepLabel: { fontSize: TYPOGRAPHY.base, color: COLORS.gray600 },
  stepLabelStrong: { fontWeight: '700', color: COLORS.primary },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.md,
    ...SHADOWS.md,
  },
  primaryBtnText: { color: COLORS.white, fontWeight: '700', fontSize: TYPOGRAPHY.base },
  secondaryBtn: {
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  secondaryBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: TYPOGRAPHY.base },
  donePad: { padding: SPACING.lg, alignItems: 'center' },
  celebrateEmoji: { fontSize: 64, marginBottom: SPACING.md, marginTop: SPACING.lg },
  celebrateTitle: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  celebrateBody: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    width: '100%',
    marginBottom: SPACING.xl,
    ...SHADOWS.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  summaryEmoji: { fontSize: 24, marginRight: SPACING.md },
  summaryLabel: { fontSize: TYPOGRAPHY.sm, fontWeight: '700', color: COLORS.gray700 },
  summaryAnswers: { fontSize: TYPOGRAPHY.xs, color: COLORS.gray500, marginTop: 2 },
});
