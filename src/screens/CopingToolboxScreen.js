import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/colors';

const TOOLS = [
  {
    id: 'breathing',
    title: 'Breathing Exercise',
    description: 'Follow the circle: breathe in, hold, breathe out',
    emoji: '🌬️',
    color: '#E0F4FF',
    duration: '2–5 min',
    screen: 'BreathingExercise',
  },
  {
    id: 'grounding',
    title: '5-4-3-2-1 Grounding',
    description: 'Use your senses to feel safe and present',
    emoji: '🌳',
    color: '#D1FAE5',
    duration: '3 min',
    screen: 'GroundingExercise',
  },
  {
    id: 'visualization',
    title: 'Safe Place Visualization',
    description: 'Imagine a calm and happy place in your mind',
    emoji: '🏖️',
    color: '#FEF3C7',
    duration: '5 min',
    screen: 'Visualization',
  },
  {
    id: 'affirmations',
    title: 'Positive Affirmations',
    description: 'Tell yourself something kind today',
    emoji: '💖',
    color: '#FFE4E6',
    duration: '2 min',
    screen: 'Affirmations',
  },
];

export default function CopingToolboxScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Coping Toolbox</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={styles.introEmoji}>🧰</Text>
          <Text style={styles.introTitle}>Feeling overwhelmed?</Text>
          <Text style={styles.introBody}>
            Pick a tool below. Each one takes just a few minutes and can help you
            feel calmer.
          </Text>
        </View>

        {TOOLS.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            activeOpacity={0.85}
            style={styles.toolCard}
            onPress={() => navigation.navigate(tool.screen)}
          >
            <View style={[styles.iconBox, { backgroundColor: tool.color }]}>
              <Text style={styles.iconEmoji}>{tool.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.toolTitle}>{tool.title}</Text>
              <Text style={styles.toolDesc} numberOfLines={2}>
                {tool.description}
              </Text>
              <Text style={styles.toolDuration}>⏱️ {tool.duration}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Remember</Text>
          <Text style={styles.tipBody}>
            Big feelings always pass. These tools are like a pause button —
            give yourself a moment to feel better.
          </Text>
        </View>
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
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  backButton: { color: COLORS.primary, fontWeight: '600' },
  title: { fontSize: TYPOGRAPHY.lg, fontWeight: '700', color: COLORS.primary },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['2xl'],
  },
  intro: { alignItems: 'center', marginBottom: SPACING.xl },
  introEmoji: { fontSize: 56, marginBottom: SPACING.sm },
  introTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '800',
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  introBody: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 20,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  iconEmoji: { fontSize: 28 },
  toolTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: 2,
  },
  toolDesc: { fontSize: TYPOGRAPHY.xs, color: COLORS.gray500, marginBottom: 4 },
  toolDuration: { fontSize: TYPOGRAPHY.xs, color: COLORS.primary, fontWeight: '600' },
  arrow: { fontSize: TYPOGRAPHY.xl, color: COLORS.gray400, marginLeft: SPACING.sm },
  tipCard: {
    backgroundColor: COLORS.primaryLighter,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
  },
  tipTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  tipBody: { fontSize: TYPOGRAPHY.sm, color: COLORS.white, lineHeight: 20 },
});
