import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
} from '../../constants/colors';
import {
  getCurrentUserId,
  createWorksheet,
} from '../../services/api';

const INK = '#1A2332';
const ACCENT = '#0891B2';

const AUDIENCE_OPTIONS = [
  { id: 'child', label: 'Children' },
  { id: 'teen', label: 'Teens' },
  { id: 'couples', label: 'Couples' },
  { id: 'family', label: 'Family' },
];

const DIFFICULTY_OPTIONS = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

const STEP_TYPES = [
  { id: 'text-area', label: 'Long text', icon: 'align-left' },
  { id: 'text', label: 'Short text', icon: 'minus' },
  { id: 'slider', label: 'Scale 1-10', icon: 'sliders' },
  { id: 'information-block', label: 'Info block', icon: 'info' },
  { id: 'reflection-note', label: 'Reflection', icon: 'message-square' },
];

const newStep = () => ({
  localId: `step_${Date.now()}_${Math.random()}`,
  type: 'text-area',
  title: '',
  prompt: '',
  required: true,
});

export default function CreateWorksheetScreen({ route, navigation }) {
  const initialAudience = route?.params?.defaultAudience || 'teen';
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState(
    initialAudience === 'all' ? 'teen' : initialAudience
  );
  const [difficulty, setDifficulty] = useState('beginner');
  const [estimatedTime, setEstimatedTime] = useState('10 mins');
  const [introduction, setIntroduction] = useState('');
  const [steps, setSteps] = useState([newStep()]);
  const [submitting, setSubmitting] = useState(false);
  const insets = useSafeAreaInsets();

  const updateStep = (localId, patch) => {
    setSteps((prev) =>
      prev.map((s) => (s.localId === localId ? { ...s, ...patch } : s))
    );
  };

  const removeStep = (localId) => {
    setSteps((prev) => prev.filter((s) => s.localId !== localId));
  };

  const addStep = () => {
    setSteps((prev) => [...prev, newStep()]);
  };

  const isValid =
    title.trim().length > 0 &&
    category.trim().length > 0 &&
    description.trim().length > 0 &&
    steps.length > 0 &&
    steps.every(
      (s) =>
        (s.type === 'information-block' || s.type === 'reflection-note'
          ? s.title.trim().length > 0
          : s.title.trim().length > 0 && s.prompt.trim().length > 0)
    );

  const handleSave = async () => {
    if (!isValid || submitting) return;
    try {
      setSubmitting(true);
      const createdBy = await getCurrentUserId();

      const finalSteps = steps.map((s, i) => {
        const stepId = `step${i + 1}`;
        return {
          id: stepId,
          type: s.type,
          title: s.title.trim(),
          prompt: s.prompt.trim() || s.title.trim(),
          required: s.type === 'reflection-note' || s.type === 'information-block' ? false : s.required,
          saveKey:
            s.type === 'information-block' || s.type === 'reflection-note'
              ? null
              : `step${i + 1}_response`,
          ...(s.type === 'slider' && { min: 1, max: 10, labels: ['Low', 'High'] }),
          ...(s.type === 'information-block' && { content: s.prompt.trim() }),
          ...(s.type === 'reflection-note' && { content: s.prompt.trim() }),
        };
      });

      // Everything beyond title/description/audience is stored inside the JSONB content column.
      const content = {
        type: 'builder',
        category: category.trim(),
        difficulty,
        estimatedTime: estimatedTime.trim() || '10 mins',
        introduction: introduction.trim() || description.trim(),
        steps: finalSteps,
        completionMessage: 'Great work — your responses are saved.',
      };

      await createWorksheet({
        title: title.trim(),
        description: description.trim(),
        audience: targetAudience,
        programId: null,
        content,
        createdBy,
      });

      Alert.alert('Worksheet Created', `"${title.trim()}" is now available.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      console.log('[CreateWorksheet] save error', e);
      Alert.alert('Error', e?.message || 'Failed to save. Please try again.');
      setSubmitting(false);
    }
  };

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
            <Text style={styles.eyebrow}>WORKSHEET BUILDER</Text>
            <Text style={styles.headerTitle}>New Worksheet</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Basics */}
          <Text style={styles.sectionLabel}>BASICS</Text>
          <View style={styles.card}>
            <Field
              label="TITLE"
              value={title}
              onChange={setTitle}
              placeholder="e.g. Cognitive Reframing Practice"
            />
            <Field
              label="CATEGORY"
              value={category}
              onChange={setCategory}
              placeholder="e.g. Anxiety Management, Communication"
            />
            <Field
              label="SHORT DESCRIPTION"
              value={description}
              onChange={setDescription}
              placeholder="One sentence summary."
              multiline
            />
          </View>

          {/* Settings */}
          <Text style={styles.sectionLabel}>SETTINGS</Text>
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>TARGET AUDIENCE</Text>
            <ChipsRow
              options={AUDIENCE_OPTIONS}
              value={targetAudience}
              onSelect={setTargetAudience}
            />
            <Text style={[styles.fieldLabel, { marginTop: SPACING.md }]}>
              DIFFICULTY
            </Text>
            <ChipsRow
              options={DIFFICULTY_OPTIONS}
              value={difficulty}
              onSelect={setDifficulty}
            />
            <View style={{ marginTop: SPACING.md }}>
              <Field
                label="ESTIMATED TIME"
                value={estimatedTime}
                onChange={setEstimatedTime}
                placeholder="e.g. 10 mins"
              />
              <Field
                label="INTRODUCTION (OPTIONAL)"
                value={introduction}
                onChange={setIntroduction}
                placeholder="Shown before the first step."
                multiline
              />
            </View>
          </View>

          {/* Steps */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>STEPS · {steps.length}</Text>
            <TouchableOpacity onPress={addStep} activeOpacity={0.7}>
              <Text style={styles.sectionAction}>+ Add step</Text>
            </TouchableOpacity>
          </View>

          {steps.map((step, idx) => (
            <View key={step.localId} style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{idx + 1}</Text>
                </View>
                <Text style={styles.stepHeaderText}>Step {idx + 1}</Text>
                {steps.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeStep(step.localId)}
                    activeOpacity={0.7}
                  >
                    <Feather name="trash-2" size={16} color={COLORS.error} />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.fieldLabel}>TYPE</Text>
              <View style={styles.typeRow}>
                {STEP_TYPES.map((t) => {
                  const active = step.type === t.id;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      style={[
                        styles.typeChip,
                        active && {
                          backgroundColor: INK,
                          borderColor: INK,
                        },
                      ]}
                      onPress={() =>
                        updateStep(step.localId, { type: t.id })
                      }
                      activeOpacity={0.85}
                    >
                      <Feather
                        name={t.icon}
                        size={11}
                        color={active ? COLORS.white : COLORS.gray600}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={[
                          styles.typeChipText,
                          active && { color: COLORS.white },
                        ]}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Field
                label="STEP TITLE"
                value={step.title}
                onChange={(v) => updateStep(step.localId, { title: v })}
                placeholder="Short title for this step"
              />
              <Field
                label={
                  step.type === 'information-block' || step.type === 'reflection-note'
                    ? 'CONTENT'
                    : 'PROMPT TO CLIENT'
                }
                value={step.prompt}
                onChange={(v) => updateStep(step.localId, { prompt: v })}
                placeholder={
                  step.type === 'information-block'
                    ? 'Text the client will read'
                    : step.type === 'reflection-note'
                    ? 'Closing reflection note'
                    : 'What should the client write or rate?'
                }
                multiline
              />
            </View>
          ))}

          <TouchableOpacity
            style={styles.addStepBtn}
            onPress={addStep}
            activeOpacity={0.85}
          >
            <Feather name="plus" size={16} color={INK} />
            <Text style={styles.addStepBtnText}>Add another step</Text>
          </TouchableOpacity>

          <View style={{ height: SPACING.xl }} />
        </ScrollView>

        <View style={[styles.submitBar, { paddingBottom: insets.bottom + SPACING.md }]}>
          <TouchableOpacity
            style={[
              styles.submitBtn,
              !isValid && styles.submitBtnDisabled,
            ]}
            onPress={handleSave}
            disabled={!isValid || submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Feather name="check" size={16} color={COLORS.white} />
                <Text style={styles.submitBtnText}>
                  {isValid ? 'Save Worksheet' : 'Complete required fields'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const Field = ({ label, value, onChange, placeholder, multiline }) => (
  <View style={styles.fieldBlock}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={[
        styles.input,
        multiline && { minHeight: 70, textAlignVertical: 'top' },
      ]}
      placeholder={placeholder}
      placeholderTextColor={COLORS.gray400}
      value={value}
      onChangeText={onChange}
      multiline={multiline}
    />
  </View>
);

const ChipsRow = ({ options, value, onSelect }) => (
  <View style={styles.chipsRow}>
    {options.map((opt) => {
      const active = value === opt.id;
      return (
        <TouchableOpacity
          key={opt.id}
          style={[
            styles.chip,
            active && {
              backgroundColor: INK,
              borderColor: INK,
            },
          ]}
          onPress={() => onSelect(opt.id)}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.chipText,
              active && { color: COLORS.white },
            ]}
          >
            {opt.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

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
    color: ACCENT,
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
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  sectionAction: {
    fontSize: 12,
    fontWeight: '700',
    color: ACCENT,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },

  fieldBlock: { marginBottom: SPACING.md },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: 13,
    color: INK,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: COLORS.gray100,
    lineHeight: 19,
  },

  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray600,
  },

  /* Step card */
  stepCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.white,
  },
  stepHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.2,
  },

  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    marginRight: 4,
    marginBottom: 4,
  },
  typeChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray600,
  },

  addStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    borderStyle: 'dashed',
    marginTop: SPACING.sm,
  },
  addStepBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: INK,
    marginLeft: 6,
    letterSpacing: 0.1,
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
