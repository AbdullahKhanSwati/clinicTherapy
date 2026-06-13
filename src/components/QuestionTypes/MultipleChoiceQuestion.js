import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/colors';

export default function MultipleChoiceQuestion({ question, value, onChange, onNext }) {
  const [selected, setSelected] = useState(
    question.allowMultiple ? (value || []) : (value || null)
  );

  const handleSelect = (option) => {
    if (question.allowMultiple) {
      const isSelected = selected.includes(option.value);
      const newSelected = isSelected
        ? selected.filter(s => s !== option.value)
        : [...selected, option.value];
      setSelected(newSelected);
      onChange(newSelected);
    } else {
      setSelected(option.value);
      onChange(option.value);
    }
  };

  const isOptionSelected = (optionValue) => {
    if (question.allowMultiple) {
      return Array.isArray(selected) && selected.includes(optionValue);
    }
    return selected === optionValue;
  };

  const canProceed = !question.required || 
    (question.allowMultiple ? selected.length > 0 : selected !== null);

  return (
    <View style={styles.container}>
      <View style={styles.optionsContainer}>
        {(question.options || []).map((option, index) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              isOptionSelected(option.value) && styles.optionSelected,
            ]}
            onPress={() => handleSelect(option)}
          >
            <View style={[
              styles.checkbox,
              isOptionSelected(option.value) && styles.checkboxSelected,
            ]}>
              {isOptionSelected(option.value) && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[
              styles.optionLabel,
              isOptionSelected(option.value) && styles.optionLabelSelected,
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {onNext && (
        <TouchableOpacity
          style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}
          onPress={onNext}
          disabled={!canProceed}
        >
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
  },
  optionsContainer: {
    gap: SPACING.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
  },
  optionSelected: {
    backgroundColor: COLORS.primaryLighter,
    borderColor: COLORS.primary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: TYPOGRAPHY.sm,
  },
  optionLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.gray700,
    fontWeight: '500',
  },
  optionLabelSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  nextButtonDisabled: {
    backgroundColor: COLORS.gray300,
  },
  nextButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.base,
  },
});
