import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/colors';

/**
 * A discrete-step "slider" implemented as a row of tappable cells.
 * Replaces the deprecated `Slider` import from `react-native` core.
 */
export default function SliderQuestion({ question, value, onChange, onNext }) {
  const min = question.min ?? 1;
  const max = question.max ?? 10;
  const [sliderValue, setSliderValue] = useState(
    typeof value === 'number' ? value : min
  );

  const leftLabel = question.labels?.[0] || 'Low';
  const rightLabel = question.labels?.[1] || 'High';

  const handleSelect = (n) => {
    setSliderValue(n);
    onChange(n);
  };

  const steps = [];
  for (let i = min; i <= max; i++) steps.push(i);

  return (
    <View style={styles.container}>
      <View style={styles.valueDisplay}>
        <Text style={styles.valueText}>{sliderValue}</Text>
        <Text style={styles.valueLabel}>out of {max}</Text>
      </View>

      <View style={styles.scaleRow}>
        {steps.map((n) => {
          const active = n <= sliderValue;
          const isCurrent = n === sliderValue;
          return (
            <TouchableOpacity
              key={n}
              style={styles.cellWrap}
              onPress={() => handleSelect(n)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.cell,
                  active && styles.cellActive,
                  isCurrent && styles.cellCurrent,
                ]}
              />
              <Text
                style={[
                  styles.cellNumber,
                  isCurrent && styles.cellNumberCurrent,
                ]}
              >
                {n}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.labels}>
        <Text style={styles.label}>{leftLabel}</Text>
        <Text style={styles.label}>{rightLabel}</Text>
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
    justifyContent: 'center',
  },
  valueDisplay: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.primaryLighter,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
  },
  valueText: {
    fontSize: TYPOGRAPHY['3xl'],
    fontWeight: '700',
    color: COLORS.primary,
  },
  valueLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray600,
    marginTop: SPACING.xs,
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SPACING.lg,
  },
  cellWrap: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  cell: {
    width: '100%',
    height: 28,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.gray200,
  },
  cellActive: {
    backgroundColor: COLORS.primaryLighter,
  },
  cellCurrent: {
    backgroundColor: COLORS.primary,
  },
  cellNumber: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    fontWeight: '600',
    marginTop: 6,
  },
  cellNumberCurrent: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray600,
    fontWeight: '500',
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
