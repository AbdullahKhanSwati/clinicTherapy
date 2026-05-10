import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/colors';

const AFFIRMATIONS = [
  'I am brave, even when I feel scared.',
  'My feelings are okay. All of them.',
  'I am loved.',
  'I can do hard things, one small step at a time.',
  'I am learning every day.',
  'I am kind to others, and I am kind to myself.',
  'It is okay to ask for help.',
  'I am proud of who I am.',
  'I am safe right now.',
  'Tomorrow is a new day.',
  'I have people who care about me.',
  'I am stronger than I think.',
  'I deserve good things.',
  'I am enough, just as I am.',
];

export default function AffirmationsScreen({ navigation }) {
  const [index, setIndex] = useState(() =>
    Math.floor(Math.random() * AFFIRMATIONS.length)
  );

  const next = () => {
    let n;
    do {
      n = Math.floor(Math.random() * AFFIRMATIONS.length);
    } while (n === index && AFFIRMATIONS.length > 1);
    setIndex(n);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Today's Affirmation</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.body}>
        <Text style={styles.heart}>💖</Text>
        <View style={styles.card}>
          <Text style={styles.quote}>“{AFFIRMATIONS[index]}”</Text>
        </View>
        <TouchableOpacity style={styles.primaryBtn} onPress={next}>
          <Text style={styles.primaryBtnText}>Show me another</Text>
        </TouchableOpacity>
        <Text style={styles.helper}>
          Read it out loud. Read it again. Believe it.
        </Text>
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
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  heart: { fontSize: 64, marginBottom: SPACING.lg },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    width: '100%',
    ...SHADOWS.lg,
  },
  quote: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    lineHeight: 32,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING['2xl'],
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.md,
  },
  primaryBtnText: { color: COLORS.white, fontWeight: '700', fontSize: TYPOGRAPHY.base },
  helper: {
    marginTop: SPACING.lg,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
    textAlign: 'center',
  },
});
