import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
const CREAM = '#FAF7F2';

/**
 * Daily/Weekly Partner Check-In screen.
 * Captures mood (1-10), connection (1-10), stress (1-10) + need + appreciation.
 * After both partners submit, the home screen surfaces a shared summary.
 */
export default function DailyCheckInScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [partnerLastCheckin, setPartnerLastCheckin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [mood, setMood] = useState(7);
  const [connection, setConnection] = useState(7);
  const [stress, setStress] = useState(5);
  const [need, setNeed] = useState('');
  const [appreciation, setAppreciation] = useState('');

  useEffect(() => {
    (async () => {
      try {
        await dataStore.initialize();
        const u = await dataStore.getCurrentUser();
        setUser(u);
        if (u) {
          const partnerId = await dataStore.getPartnerIdForUser(u.id);
          if (partnerId) {
            const latest = await dataStore.getLatestCheckinForUser(partnerId);
            setPartnerLastCheckin(latest);
          }
        }
      } catch (e) {
        console.log('[DailyCheckIn] load', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const canSubmit = !submitting && need.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      await dataStore.addPartnerCheckin({
        userId: user?.id,
        mood,
        connection,
        stress,
        need: need.trim(),
        appreciation: appreciation.trim(),
      });
      Alert.alert(
        'Check-in saved',
        partnerLastCheckin
          ? 'Your partner has also checked in today. Open the home screen to see your shared summary.'
          : 'Saved. When your partner also checks in, you\'ll see a shared summary.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      console.log('[DailyCheckIn] save', e);
      Alert.alert('Error', 'Could not save your check-in. Please try again.');
      setSubmitting(false);
    }
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.goBack()}
          >
            <Feather name="x" size={20} color={INK} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Text style={styles.eyebrow}>RELATIONSHIP PULSE</Text>
            <Text style={styles.headerTitle}>Daily Check-In</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Slider
            label="MOOD TODAY"
            value={mood}
            onChange={setMood}
            leftLabel="Low"
            rightLabel="Great"
          />

          <Slider
            label="CONNECTION TO PARTNER"
            value={connection}
            onChange={setConnection}
            leftLabel="Distant"
            rightLabel="Close"
          />

          <Slider
            label="STRESS LEVEL"
            value={stress}
            onChange={setStress}
            leftLabel="Calm"
            rightLabel="Overwhelmed"
          />

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>ONE THING I NEED TODAY</Text>
            <TextInput
              style={styles.input}
              placeholder="A quiet 10 minutes, a hug, a check-in call..."
              placeholderTextColor={COLORS.gray400}
              value={need}
              onChangeText={setNeed}
              multiline
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>ONE APPRECIATION FOR MY PARTNER</Text>
            <TextInput
              style={styles.input}
              placeholder="Something they did, said, or are..."
              placeholderTextColor={COLORS.gray400}
              value={appreciation}
              onChangeText={setAppreciation}
              multiline
            />
          </View>

          {partnerLastCheckin && (
            <View style={styles.partnerCard}>
              <Text style={styles.partnerCardEyebrow}>
                YOUR PARTNER · {formatTimeAgo(partnerLastCheckin.date)}
              </Text>
              <View style={styles.partnerStatRow}>
                <Stat label="MOOD" value={partnerLastCheckin.mood} />
                <Stat label="CONNECTION" value={partnerLastCheckin.connection} />
                <Stat label="STRESS" value={partnerLastCheckin.stress} />
              </View>
              {partnerLastCheckin.need ? (
                <View style={styles.partnerNote}>
                  <Text style={styles.partnerNoteLabel}>THEY NEED</Text>
                  <Text style={styles.partnerNoteText}>
                    "{partnerLastCheckin.need}"
                  </Text>
                </View>
              ) : null}
            </View>
          )}

          <View style={{ height: SPACING.xl }} />
        </ScrollView>

        <View style={styles.submitBar}>
          <TouchableOpacity
            style={[
              styles.submitBtn,
              !canSubmit && styles.submitBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Feather name="check" size={16} color={COLORS.white} />
                <Text style={styles.submitBtnText}>
                  {canSubmit ? 'Save Check-In' : 'Add what you need today'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Custom slider component — pan-driven 1-10 scale
const Slider = ({ label, value, onChange, leftLabel, rightLabel }) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const valueToX = (v) => ((v - 1) / 9) * trackWidth;

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, g) => {
          if (trackWidth <= 0) return;
          const clamped = Math.max(0, Math.min(trackWidth, g.moveX - 40));
          const next = Math.round((clamped / trackWidth) * 9) + 1;
          if (next !== value) onChange(next);
        },
      }),
    [trackWidth, value, onChange]
  );

  return (
    <View style={styles.fieldBlock}>
      <View style={styles.sliderHeader}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.sliderValue}>{value}/10</Text>
      </View>
      <View
        style={styles.sliderTrack}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
        {...panResponder.panHandlers}
      >
        <View
          style={[styles.sliderFill, { width: `${((value - 1) / 9) * 100}%` }]}
        />
        <View style={[styles.sliderThumb, { left: valueToX(value) - 12 }]} />
      </View>
      <View style={styles.sliderEnds}>
        <Text style={styles.sliderEndLabel}>{leftLabel}</Text>
        <Text style={styles.sliderEndLabel}>{rightLabel}</Text>
      </View>
      <View style={styles.tickRow}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <TouchableOpacity
            key={n}
            onPress={() => onChange(n)}
            style={styles.tickHit}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.tickLabel, value === n && styles.tickLabelActive]}
            >
              {n}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const Stat = ({ label, value }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const formatTimeAgo = (iso) => {
  const ms = Date.now() - new Date(iso).getTime();
  const hours = Math.round(ms / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

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

  fieldBlock: { marginBottom: SPACING.xl },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
    marginBottom: SPACING.sm,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sliderValue: {
    fontSize: 18,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.4,
  },
  sliderTrack: {
    height: 8,
    backgroundColor: COLORS.gray100,
    borderRadius: 4,
    marginVertical: SPACING.sm,
    position: 'relative',
    overflow: 'visible',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: BLUSH,
    borderRadius: 4,
  },
  sliderThumb: {
    position: 'absolute',
    top: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: INK,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  sliderEnds: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  sliderEndLabel: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '600',
  },
  tickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  tickHit: { paddingVertical: 4, paddingHorizontal: 2 },
  tickLabel: { fontSize: 11, color: COLORS.gray400, fontWeight: '600' },
  tickLabelActive: { color: INK, fontWeight: '800' },

  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: 14,
    color: INK,
    fontWeight: '500',
    minHeight: 70,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: COLORS.gray100,
    lineHeight: 20,
  },

  partnerCard: {
    backgroundColor: CREAM,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: '#EFE6D8',
  },
  partnerCardEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: BLUSH,
    letterSpacing: 1.4,
    marginBottom: SPACING.md,
  },
  partnerStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.2,
    marginTop: 2,
  },
  partnerNote: {
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#E5DCD0',
  },
  partnerNoteLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: BLUSH,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  partnerNoteText: {
    fontSize: 13,
    color: INK,
    fontStyle: 'italic',
    lineHeight: 19,
  },

  submitBar: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: INK,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  submitBtnDisabled: { backgroundColor: COLORS.gray300 },
  submitBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14,
    marginLeft: 8,
    letterSpacing: 0.2,
  },
});
