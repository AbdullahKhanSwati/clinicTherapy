import React, { useState, useEffect, useRef } from 'react';
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
 * Conflict Pause Screen — "We Need a Pause"
 *
 * Flow:
 *   1. Idle: explain the tool, tap "Start a Pause" to begin.
 *   2. Active: large countdown timer (20 or 30 min) + self-soothing prompts.
 *   3. Return: a fillable script for what to say when re-engaging.
 */
export default function ConflictPauseScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [partnerId, setPartnerId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [pauseId, setPauseId] = useState(null);
  const [stage, setStage] = useState('idle'); // 'idle' | 'active' | 'return'
  const [remainingSec, setRemainingSec] = useState(0);
  const [duration, setDuration] = useState(20);
  const timerRef = useRef(null);

  const [feelingUnderneath, setFeelingUnderneath] = useState('');
  const [needNow, setNeedNow] = useState('');

  useEffect(() => {
    (async () => {
      try {
        await dataStore.initialize();
        const u = await dataStore.getCurrentUser();
        setUser(u);
        if (u) {
          const pid = await dataStore.getPartnerIdForUser(u.id);
          setPartnerId(pid);
        }
      } catch (e) {
        console.log('[ConflictPause] load', e);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startPause = async (mins) => {
    try {
      const pause = await dataStore.startConflictPause(
        user?.id,
        partnerId,
        mins
      );
      setPauseId(pause.id);
      setDuration(mins);
      setRemainingSec(mins * 60);
      setStage('active');
      timerRef.current = setInterval(() => {
        setRemainingSec((s) => {
          if (s <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            setStage('return');
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } catch (e) {
      console.log('[ConflictPause] start', e);
      Alert.alert('Error', 'Could not start the pause. Try again.');
    }
  };

  const endEarly = () => {
    Alert.alert(
      'End the pause early?',
      'Move to the return script now. The pause will still be logged.',
      [
        { text: 'Keep waiting', style: 'cancel' },
        {
          text: 'End pause',
          onPress: () => {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            setStage('return');
          },
        },
      ]
    );
  };

  const handleFinish = async () => {
    try {
      if (pauseId) {
        const returnNote = `Felt: ${feelingUnderneath.trim()} | Need: ${needNow.trim()}`;
        await dataStore.completeConflictPause(pauseId, returnNote);
      }
      Alert.alert(
        'Pause complete',
        'You are ready to return to the conversation. Lead with the script you wrote.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      console.log('[ConflictPause] finish', e);
      navigation.goBack();
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

  const mins = Math.floor(remainingSec / 60);
  const secs = remainingSec % 60;
  const progress =
    duration > 0 ? 1 - remainingSec / (duration * 60) : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => {
            if (stage === 'active') {
              Alert.alert(
                'Cancel the pause?',
                'Closing now will end the pause early.',
                [
                  { text: 'Keep going', style: 'cancel' },
                  {
                    text: 'Cancel pause',
                    style: 'destructive',
                    onPress: () => {
                      if (timerRef.current) clearInterval(timerRef.current);
                      navigation.goBack();
                    },
                  },
                ]
              );
            } else {
              navigation.goBack();
            }
          }}
        >
          <Feather name="x" size={20} color={INK} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: SPACING.md }}>
          <Text style={styles.eyebrow}>WE NEED A PAUSE</Text>
          <Text style={styles.headerTitle}>
            {stage === 'idle'
              ? 'Take a Pause'
              : stage === 'active'
              ? 'Pausing…'
              : 'Ready to Return'}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {stage === 'idle' && (
          <>
            <View style={styles.introCard}>
              <Text style={styles.introTitle}>
                A pause is a return ticket — not avoidance.
              </Text>
              <Text style={styles.introBody}>
                When conflict escalates, both nervous systems are flooded. A short
                pause lets you self-soothe and come back able to actually talk.
              </Text>
            </View>

            <Text style={styles.sectionLabel}>HOW LONG?</Text>
            <View style={styles.optionRow}>
              <TouchableOpacity
                style={styles.durationBtn}
                onPress={() => startPause(20)}
                activeOpacity={0.85}
              >
                <Text style={styles.durationValue}>20</Text>
                <Text style={styles.durationLabel}>minutes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.durationBtn, styles.durationBtnDark]}
                onPress={() => startPause(30)}
                activeOpacity={0.85}
              >
                <Text style={[styles.durationValue, { color: COLORS.white }]}>
                  30
                </Text>
                <Text style={[styles.durationLabel, { color: 'rgba(255,255,255,0.7)' }]}>
                  minutes
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionLabel}>WHILE YOU PAUSE</Text>
            <View style={styles.tipsCard}>
              <Tip text="Walk, breathe, drink water, listen to music." />
              <Tip text="Do not rehearse arguments mentally." />
              <Tip text="Notice what you're feeling underneath." />
              <Tip text="Trust the timer — both of you need this." />
            </View>
          </>
        )}

        {stage === 'active' && (
          <>
            <View style={styles.timerCard}>
              <Text style={styles.timerLabel}>TIME REMAINING</Text>
              <Text style={styles.timerValue}>
                {String(mins).padStart(2, '0')}:
                {String(secs).padStart(2, '0')}
              </Text>
              <View style={styles.timerTrack}>
                <View
                  style={[
                    styles.timerFill,
                    { width: `${Math.round(progress * 100)}%` },
                  ]}
                />
              </View>
            </View>

            <Text style={styles.sectionLabel}>SELF-SOOTHING PROMPT</Text>
            <View style={styles.promptCard}>
              <Text style={styles.promptQuote}>
                "What am I feeling underneath the anger or hurt?"
              </Text>
              <Text style={styles.promptBody}>
                You don't need to share this with your partner. Just notice it.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.endEarlyBtn}
              onPress={endEarly}
              activeOpacity={0.7}
            >
              <Text style={styles.endEarlyText}>End pause early</Text>
            </TouchableOpacity>
          </>
        )}

        {stage === 'return' && (
          <>
            <View style={styles.introCard}>
              <Text style={styles.introTitle}>The Return Script</Text>
              <Text style={styles.introBody}>
                Use this script to re-enter the conversation. It signals safety,
                not blame.
              </Text>
            </View>

            <Text style={styles.fieldLabel}>WHAT I WAS FEELING UNDERNEATH</Text>
            <TextInput
              style={styles.input}
              placeholder="Hurt, scared, dismissed, overwhelmed..."
              placeholderTextColor={COLORS.gray400}
              value={feelingUnderneath}
              onChangeText={setFeelingUnderneath}
              multiline
            />

            <Text style={styles.fieldLabel}>WHAT I NEED NOW</Text>
            <TextInput
              style={styles.input}
              placeholder="To be heard, to slow down, a hug..."
              placeholderTextColor={COLORS.gray400}
              value={needNow}
              onChangeText={setNeedNow}
              multiline
            />

            {feelingUnderneath.trim() || needNow.trim() ? (
              <View style={styles.scriptPreview}>
                <Text style={styles.scriptLabel}>YOUR OPENING LINE</Text>
                <Text style={styles.scriptText}>
                  "I'm ready to return. What I was feeling underneath was{' '}
                  <Text style={styles.scriptHi}>
                    {feelingUnderneath.trim() || '___'}
                  </Text>
                  . What I need now is{' '}
                  <Text style={styles.scriptHi}>{needNow.trim() || '___'}</Text>."
                </Text>
              </View>
            ) : null}

            <View style={{ height: SPACING.xl }} />
          </>
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>

      {stage === 'return' && (
        <View style={styles.submitBar}>
          <TouchableOpacity
            style={[
              styles.submitBtn,
              !(feelingUnderneath.trim() && needNow.trim()) &&
                styles.submitBtnDisabled,
            ]}
            onPress={handleFinish}
            disabled={!(feelingUnderneath.trim() && needNow.trim())}
            activeOpacity={0.85}
          >
            <Feather name="check" size={16} color={COLORS.white} />
            <Text style={styles.submitBtnText}>I'm Ready to Return</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const Tip = ({ text }) => (
  <View style={styles.tipRow}>
    <View style={styles.tipDot} />
    <Text style={styles.tipText}>{text}</Text>
  </View>
);

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

  introCard: {
    backgroundColor: CREAM,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#EFE6D8',
  },
  introTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.4,
    marginBottom: SPACING.sm,
  },
  introBody: {
    fontSize: 13,
    color: COLORS.gray700,
    lineHeight: 20,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },

  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  durationBtn: {
    width: '48.5%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  durationBtnDark: {
    backgroundColor: INK,
    borderColor: INK,
  },
  durationValue: {
    fontSize: 48,
    fontWeight: '800',
    color: INK,
    letterSpacing: -1.5,
  },
  durationLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.2,
    marginTop: 4,
  },

  tipsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
  },
  tipDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: BLUSH,
    marginTop: 8,
    marginRight: SPACING.sm,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.gray700,
    lineHeight: 19,
  },

  /* Active timer */
  timerCard: {
    backgroundColor: INK,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  timerLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: SPACING.md,
  },
  timerValue: {
    fontSize: 72,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -3,
    marginBottom: SPACING.lg,
  },
  timerTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
    backgroundColor: BLUSH,
    borderRadius: 3,
  },

  promptCard: {
    backgroundColor: CREAM,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#EFE6D8',
  },
  promptQuote: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '600',
    color: INK,
    fontStyle: 'italic',
    lineHeight: 26,
    marginBottom: SPACING.md,
  },
  promptBody: {
    fontSize: 12,
    color: COLORS.gray600,
    lineHeight: 17,
  },

  endEarlyBtn: {
    alignSelf: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  endEarlyText: {
    fontSize: 13,
    color: COLORS.gray500,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  /* Return script */
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: 14,
    color: INK,
    fontWeight: '500',
    minHeight: 60,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: COLORS.gray100,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  scriptPreview: {
    backgroundColor: INK,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.md,
  },
  scriptLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: SPACING.sm,
  },
  scriptText: {
    fontSize: 14,
    color: COLORS.white,
    lineHeight: 22,
  },
  scriptHi: {
    fontWeight: '800',
    color: BLUSH,
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
