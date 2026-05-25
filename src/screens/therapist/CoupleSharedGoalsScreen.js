import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
} from '../../constants/colors';
import dataStore from '../../utils/dataStore';

const INK = '#1A2332';
const BLUSH = '#D4536B';
const SUCCESS = '#15803D';

/**
 * CoupleSharedGoalsScreen — clinician manages shared goals for one couple.
 * Add new goal, edit progress, delete, mark as therapist-reviewed.
 */
const GOAL_TEMPLATES = [
  'Improve communication',
  'Reduce criticism',
  'Repair faster',
  'Increase affection',
  'Rebuild trust',
  'Schedule weekly connection time',
];

export default function CoupleSharedGoalsScreen({ route, navigation }) {
  const { pairingId } = route?.params || {};
  const [goals, setGoals] = useState([]);
  const [pairing, setPairing] = useState(null);
  const [partnerA, setPartnerA] = useState(null);
  const [partnerB, setPartnerB] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      await dataStore.initialize();
      const all = await dataStore.getCouplePairings();
      const p = all.find((x) => x.id === pairingId);
      setPairing(p || null);
      if (p) {
        const [a, b, list] = await Promise.all([
          dataStore.getUserById(p.partnerAId),
          p.partnerBId ? dataStore.getUserById(p.partnerBId) : null,
          dataStore.getSharedGoalsForPairing(p.id),
        ]);
        setPartnerA(a);
        setPartnerB(b);
        setGoals(list || []);
      }
    } catch (e) {
      console.log('[CoupleSharedGoals] load', e);
    } finally {
      setLoading(false);
    }
  }, [pairingId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleAdd = async () => {
    if (!newTitle.trim() || !pairing) return;
    try {
      setSubmitting(true);
      await dataStore.addSharedGoal(
        pairing.id,
        newTitle.trim(),
        newDescription.trim()
      );
      setNewTitle('');
      setNewDescription('');
      await load();
    } catch (e) {
      console.log('[CoupleSharedGoals] add', e);
      Alert.alert('Error', 'Could not add goal. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProgress = async (goalId, delta) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    const next = Math.max(0, Math.min(100, (goal.progress || 0) + delta));
    try {
      await dataStore.updateSharedGoalProgress(goalId, next);
      await load();
    } catch (e) {
      console.log('[CoupleSharedGoals] progress', e);
    }
  };

  const handleDelete = (goal) => {
    Alert.alert(
      'Delete goal?',
      `"${goal.title}" will be removed for this couple.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const all = await dataStore.getSharedGoals();
              await dataStore.setSharedGoals(
                all.filter((g) => g.id !== goal.id)
              );
              await load();
            } catch (e) {
              console.log('[CoupleSharedGoals] delete', e);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color={INK} />
        </View>
      </SafeAreaView>
    );
  }

  if (!pairing) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={20} color={INK} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>Couple not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={20} color={INK} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: SPACING.md }}>
          <Text style={styles.eyebrow}>SHARED GOALS</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {partnerA?.name?.split(' ')[0] || 'Partner'} &{' '}
            {partnerB?.name?.split(' ')[0] || 'Partner'}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Add new goal */}
        <View style={styles.addCard}>
          <Text style={styles.sectionLabel}>NEW GOAL</Text>
          <TextInput
            style={styles.input}
            placeholder="Goal title (e.g. Improve communication)"
            placeholderTextColor={COLORS.gray400}
            value={newTitle}
            onChangeText={setNewTitle}
          />
          <TextInput
            style={[styles.input, { minHeight: 60, marginTop: SPACING.sm }]}
            placeholder="Optional description for the couple"
            placeholderTextColor={COLORS.gray400}
            value={newDescription}
            onChangeText={setNewDescription}
            multiline
            textAlignVertical="top"
          />

          {/* Quick templates */}
          <Text style={styles.helperLabel}>QUICK PICKS</Text>
          <View style={styles.templateRow}>
            {GOAL_TEMPLATES.map((t) => (
              <TouchableOpacity
                key={t}
                style={styles.templateChip}
                onPress={() => setNewTitle(t)}
                activeOpacity={0.85}
              >
                <Text style={styles.templateText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.addBtn,
              !newTitle.trim() && styles.addBtnDisabled,
            ]}
            onPress={handleAdd}
            disabled={!newTitle.trim() || submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Feather name="plus" size={14} color={COLORS.white} />
                <Text style={styles.addBtnText}>Add Goal</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Existing goals */}
        <Text style={styles.sectionLabel}>
          ACTIVE GOALS · {goals.length}
        </Text>
        {goals.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="target" size={28} color={COLORS.gray300} />
            <Text style={styles.emptyTitle}>No goals yet</Text>
            <Text style={styles.emptyText}>
              Add a shared commitment for this couple above.
            </Text>
          </View>
        ) : (
          goals.map((g) => (
            <View key={g.id} style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.goalTitle}>{g.title}</Text>
                  {g.description ? (
                    <Text style={styles.goalDesc}>{g.description}</Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  onPress={() => handleDelete(g)}
                  style={styles.deleteBtn}
                  activeOpacity={0.7}
                >
                  <Feather name="trash-2" size={14} color={COLORS.error} />
                </TouchableOpacity>
              </View>

              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>PROGRESS</Text>
                <Text style={styles.progressValue}>{g.progress || 0}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${g.progress || 0}%` },
                  ]}
                />
              </View>

              <View style={styles.progressActions}>
                <TouchableOpacity
                  style={styles.progressBtn}
                  onPress={() => handleProgress(g.id, -10)}
                  activeOpacity={0.7}
                >
                  <Feather name="minus" size={14} color={INK} />
                  <Text style={styles.progressBtnText}>10%</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.progressBtn, styles.progressBtnPrimary]}
                  onPress={() => handleProgress(g.id, 10)}
                  activeOpacity={0.7}
                >
                  <Feather name="plus" size={14} color={COLORS.white} />
                  <Text style={[styles.progressBtnText, { color: COLORS.white }]}>
                    10%
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.progressBtn, styles.progressBtnComplete]}
                  onPress={() =>
                    dataStore
                      .updateSharedGoalProgress(g.id, 100)
                      .then(() => load())
                  }
                  activeOpacity={0.7}
                >
                  <Feather name="check" size={14} color={SUCCESS} />
                  <Text style={[styles.progressBtnText, { color: SUCCESS }]}>
                    Complete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 14, color: COLORS.error, fontWeight: '600' },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: BLUSH,
    letterSpacing: 1.4,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.5,
  },

  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
    marginBottom: SPACING.sm,
  },
  helperLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.2,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },

  /* Add card */
  addCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  input: {
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: 14,
    color: INK,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  templateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  templateChip: {
    backgroundColor: COLORS.gray50,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    marginRight: 6,
    marginBottom: 6,
  },
  templateText: {
    fontSize: 11,
    color: INK,
    fontWeight: '600',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: INK,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  addBtnDisabled: { backgroundColor: COLORS.gray300 },
  addBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 13,
    marginLeft: 6,
    letterSpacing: 0.3,
  },

  /* Empty */
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: INK,
    marginTop: SPACING.sm,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.gray500,
    textAlign: 'center',
  },

  /* Goal card */
  goalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  goalDesc: {
    fontSize: 12,
    color: COLORS.gray500,
    lineHeight: 17,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },

  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.2,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '800',
    color: SUCCESS,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.gray100,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: SUCCESS,
  },
  progressActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    marginHorizontal: 3,
  },
  progressBtnPrimary: {
    backgroundColor: INK,
    borderColor: INK,
  },
  progressBtnComplete: {
    backgroundColor: SUCCESS + '15',
    borderColor: SUCCESS + '30',
  },
  progressBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: INK,
    marginLeft: 4,
    letterSpacing: 0.2,
  },
});
