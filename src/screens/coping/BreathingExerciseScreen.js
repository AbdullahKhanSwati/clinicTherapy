import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/colors';

const PHASES = [
  { name: 'Breathe in', duration: 4000, scaleTo: 1.6 },
  { name: 'Hold', duration: 2000, scaleTo: 1.6 },
  { name: 'Breathe out', duration: 6000, scaleTo: 0.8 },
];

export default function BreathingExerciseScreen({ navigation }) {
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const scale = useRef(new Animated.Value(1)).current;
  const animationRef = useRef(null);

  useEffect(() => {
    if (!running) {
      animationRef.current?.stop();
      scale.stopAnimation();
      Animated.timing(scale, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
      return;
    }

    const phase = PHASES[phaseIndex];
    animationRef.current = Animated.timing(scale, {
      toValue: phase.scaleTo,
      duration: phase.duration,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    });
    animationRef.current.start(({ finished }) => {
      if (!finished) return;
      const next = (phaseIndex + 1) % PHASES.length;
      if (next === 0) setCycleCount((c) => c + 1);
      setPhaseIndex(next);
    });

    return () => animationRef.current?.stop();
  }, [running, phaseIndex, scale]);

  const start = () => {
    setCycleCount(0);
    setPhaseIndex(0);
    setRunning(true);
  };
  const stop = () => setRunning(false);

  const phase = PHASES[phaseIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Breathing</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.body}>
        <View style={styles.circleWrap}>
          <Animated.View
            style={[styles.outerCircle, { transform: [{ scale }] }]}
          />
          <Animated.View
            style={[styles.innerCircle, { transform: [{ scale }] }]}
          >
            <Text style={styles.instruction}>
              {running ? phase.name : 'Ready when you are'}
            </Text>
          </Animated.View>
        </View>

        <Text style={styles.helper}>
          {running
            ? `Cycle ${cycleCount + 1} · ${PHASES.length - phaseIndex} step(s) left`
            : 'Sit comfortably. Press start when you’re ready.'}
        </Text>

        {!running ? (
          <TouchableOpacity style={styles.startBtn} onPress={start}>
            <Text style={styles.startBtnText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopBtn} onPress={stop}>
            <Text style={styles.stopBtnText}>Stop</Text>
          </TouchableOpacity>
        )}

        {cycleCount > 0 && !running && (
          <Text style={styles.celebrate}>
            🎉 You completed {cycleCount} breathing cycle{cycleCount === 1 ? '' : 's'}!
          </Text>
        )}
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  circleWrap: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  outerCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.primaryLighter,
    opacity: 0.35,
  },
  innerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  instruction: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: TYPOGRAPHY.lg,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },
  helper: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  startBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING['3xl'],
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.md,
  },
  startBtnText: { color: COLORS.white, fontWeight: '700', fontSize: TYPOGRAPHY.base },
  stopBtn: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING['3xl'],
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.md,
  },
  stopBtnText: { color: COLORS.white, fontWeight: '700', fontSize: TYPOGRAPHY.base },
  celebrate: {
    marginTop: SPACING.lg,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.success,
    fontWeight: '600',
  },
});
