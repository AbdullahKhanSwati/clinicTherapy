import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/colors';

export default function TextQuestion({ question, value, onChange, onNext }) {
  const [text, setText] = useState(value || '');

  const handleChange = (newText) => {
    setText(newText);
    onChange(newText);
  };

  const canProceed = !question.required || text.trim().length > 0;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={question.placeholder || 'Type your answer...'}
        placeholderTextColor={COLORS.gray400}
        value={text}
        onChangeText={handleChange}
        maxLength={question.maxLength || 200}
        editable={true}
      />
      <Text style={styles.charCount}>
        {text.length}/{question.maxLength || 200}
      </Text>

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
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.gray700,
    minHeight: 50,
    fontFamily: 'System',
  },
  charCount: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginTop: SPACING.sm,
    textAlign: 'right',
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
