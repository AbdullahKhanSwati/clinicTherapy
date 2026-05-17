import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/colors';
import dataStore from '../../utils/dataStore';
import TabScreenHeader from '../../components/TabScreenHeader';

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

export default function MoodRewardsTab({ navigation }) {
  const [moods, setMoods] = useState([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        await dataStore.initialize();
        const user = await dataStore.getCurrentUser();
        if (user && dataStore.getMoodEntriesByUser) {
          const list = await dataStore.getMoodEntriesByUser(user.id);
          setMoods((list || []).slice(0, 7));
          setStreak(list?.length || 0);
        }
      } catch (e) {
        console.log('[MoodRewardsTab] load error', e);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TabScreenHeader title="Mood" subtitle="Track how you're feeling" />

        <TouchableOpacity
          style={styles.checkInCard}
          onPress={() => navigation.navigate('MoodCheckIn')}
        >
          <Text style={styles.checkInEmoji}>💭</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.checkInTitle}>Quick Mood Check-In</Text>
            <Text style={styles.checkInSubtitle}>How are you feeling right now?</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Moods</Text>
          {moods.length === 0 ? (
            <Text style={styles.emptyText}>No mood check-ins yet. Tap above to start!</Text>
          ) : (
            <View style={styles.moodRow}>
              {moods.map((m, i) => (
                <Text key={i} style={styles.moodBubble}>
                  {MOOD_EMOJIS[m.mood] || '😐'}
                </Text>
              ))}
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Streak</Text>
          <Text style={styles.streakValue}>{streak}</Text>
          <Text style={styles.streakLabel}>
            {streak === 1 ? 'check-in logged' : 'check-ins logged'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  checkInCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  checkInEmoji: { fontSize: 40, marginRight: SPACING.md },
  checkInTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: COLORS.white,
  },
  checkInSubtitle: { fontSize: TYPOGRAPHY.sm, color: COLORS.white, opacity: 0.9 },
  arrow: { fontSize: TYPOGRAPHY.xl, color: COLORS.white },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: SPACING.md,
  },
  emptyText: { fontSize: TYPOGRAPHY.sm, color: COLORS.gray500 },
  moodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  moodBubble: { fontSize: 32 },
  streakValue: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -1,
  },
  streakLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
    fontWeight: '500',
    marginTop: 2,
  },
});
