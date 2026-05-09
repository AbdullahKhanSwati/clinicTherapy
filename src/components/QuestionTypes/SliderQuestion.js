import React, { useState } from 'react';
import { View, Slider, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/colors';

export default function SliderQuestion({ question, value, onChange, onNext }) {
  const [sliderValue, setSliderValue] = useState(value || question.min || 0);

  const handleSliderChange = (newValue) => {
    setSliderValue(newValue);
    onChange(newValue);
  };

  const min = question.min || 0;
  const max = question.max || 10;
  const leftLabel = question.labels?.[0] || 'Low';
  const rightLabel = question.labels?.[1] || 'High';

  return (
    <View style={styles.container}>
      <View style={styles.valueDisplay}>
        <Text style={styles.valueText}>{Math.round(sliderValue)}</Text>
        <Text style={styles.valueLabel}>out of {max}</Text>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        value={sliderValue}
        onValueChange={handleSliderChange}
        step={1}
        minimumTrackTintColor={COLORS.primary}
        maximumTrackTintColor={COLORS.gray300}
        thumbTintColor={COLORS.primary}
      />

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
  slider: {
    width: '100%',
    height: 50,
    marginVertical: SPACING.lg,
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
