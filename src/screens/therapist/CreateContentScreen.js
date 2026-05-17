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
const ACCENT = COLORS.primary;

const AUDIENCE_OPTIONS = [
  { id: 'all', label: 'Everyone' },
  { id: 'child', label: 'Children' },
  { id: 'teen', label: 'Teens' },
  { id: 'couples', label: 'Couples' },
  { id: 'family', label: 'Family' },
];

const COPING_TYPE_OPTIONS = [
  { id: 'breathing', label: 'Breathing' },
  { id: 'grounding', label: 'Grounding' },
  { id: 'visualization', label: 'Visualization' },
  { id: 'relaxation', label: 'Relaxation' },
  { id: 'mindfulness', label: 'Mindfulness' },
];

const RESOURCE_TYPE_OPTIONS = [
  { id: 'article', label: 'Article' },
  { id: 'video', label: 'Video' },
  { id: 'document', label: 'Document' },
  { id: 'note', label: 'Note' },
];

const DATE_TAG_OPTIONS = [
  { id: 'AT HOME', label: 'At Home' },
  { id: 'OUTDOOR', label: 'Outdoor' },
  { id: 'MEANINGFUL', label: 'Meaningful' },
  { id: 'NEW', label: 'New Experience' },
  { id: 'BUDGET', label: 'Budget-Friendly' },
];

const CONFIG = {
  affirmation: {
    title: 'New Affirmation',
    eyebrow: 'AFFIRMATION',
    accent: '#D4536B',
    saveFn: 'addAffirmation',
    fields: [
      {
        key: 'text',
        label: 'AFFIRMATION TEXT',
        placeholder: 'You are doing better than you think.',
        type: 'multiline',
        required: true,
        minHeight: 100,
      },
      {
        key: 'category',
        label: 'CATEGORY',
        placeholder: 'e.g. Self-compassion, Anxiety, Resilience',
        type: 'text',
        required: true,
      },
      {
        key: 'audience',
        label: 'AUDIENCE',
        type: 'chips',
        options: AUDIENCE_OPTIONS,
        defaultValue: 'all',
        required: true,
      },
    ],
  },
  copingTool: {
    title: 'New Coping Tool',
    eyebrow: 'COPING TOOLBOX',
    accent: '#15803D',
    saveFn: 'addCopingTool',
    fields: [
      {
        key: 'title',
        label: 'TITLE',
        placeholder: 'e.g. Box Breathing',
        type: 'text',
        required: true,
      },
      {
        key: 'description',
        label: 'SHORT DESCRIPTION',
        placeholder: 'One sentence explaining what it does.',
        type: 'multiline',
        required: true,
        minHeight: 80,
      },
      {
        key: 'type',
        label: 'TYPE',
        type: 'chips',
        options: COPING_TYPE_OPTIONS,
        defaultValue: 'breathing',
        required: true,
      },
      {
        key: 'instructions',
        label: 'INSTRUCTIONS',
        placeholder: 'Step-by-step guidance the client will follow.',
        type: 'multiline',
        required: true,
        minHeight: 140,
      },
      {
        key: 'duration',
        label: 'DURATION',
        placeholder: 'e.g. 5 min, 10 min',
        type: 'text',
        required: false,
      },
      {
        key: 'audience',
        label: 'AUDIENCE',
        type: 'chips',
        options: AUDIENCE_OPTIONS,
        defaultValue: 'all',
        required: true,
      },
    ],
  },
  resource: {
    title: 'New Resource',
    eyebrow: 'RESOURCE',
    accent: '#D97706',
    saveFn: 'addResource',
    fields: [
      {
        key: 'title',
        label: 'TITLE',
        placeholder: 'e.g. Understanding Anxiety: A Parent Guide',
        type: 'text',
        required: true,
      },
      {
        key: 'description',
        label: 'SHORT DESCRIPTION',
        placeholder: 'What this resource covers.',
        type: 'multiline',
        required: true,
        minHeight: 80,
      },
      {
        key: 'type',
        label: 'TYPE',
        type: 'chips',
        options: RESOURCE_TYPE_OPTIONS,
        defaultValue: 'article',
        required: true,
      },
      {
        key: 'url',
        label: 'LINK / URL',
        placeholder: 'https://...',
        type: 'text',
        required: false,
      },
      {
        key: 'content',
        label: 'NOTES (OPTIONAL)',
        placeholder: 'Internal content if not linkable (e.g. crisis numbers)',
        type: 'multiline',
        required: false,
        minHeight: 80,
      },
      {
        key: 'category',
        label: 'CATEGORY',
        placeholder: 'e.g. Anxiety, Sleep, Communication',
        type: 'text',
        required: true,
      },
      {
        key: 'audience',
        label: 'AUDIENCE',
        type: 'chips',
        options: AUDIENCE_OPTIONS,
        defaultValue: 'all',
        required: true,
      },
    ],
  },
  dateIdea: {
    title: 'New Date Idea',
    eyebrow: 'COUPLES CONTENT',
    accent: '#9333EA',
    saveFn: 'addDateIdea',
    fields: [
      {
        key: 'title',
        label: 'TITLE',
        placeholder: 'e.g. Sunset walk with five questions',
        type: 'text',
        required: true,
      },
      {
        key: 'description',
        label: 'DESCRIPTION',
        placeholder: 'One sentence describing the activity.',
        type: 'multiline',
        required: true,
        minHeight: 80,
      },
      {
        key: 'tag',
        label: 'TAG',
        type: 'chips',
        options: DATE_TAG_OPTIONS,
        defaultValue: 'AT HOME',
        required: true,
      },
    ],
  },
};

export default function CreateContentScreen({ route, navigation }) {
  const contentType = route?.params?.contentType || 'affirmation';
  const config = CONFIG[contentType] || CONFIG.affirmation;
  const [values, setValues] = useState(() => {
    const initial = {};
    config.fields.forEach((f) => {
      initial[f.key] = f.defaultValue || '';
    });
    return initial;
  });
  const [submitting, setSubmitting] = useState(false);

  const setField = (key, val) =>
    setValues((prev) => ({ ...prev, [key]: val }));

  const isValid = config.fields.every(
    (f) => !f.required || String(values[f.key] || '').trim().length > 0
  );

  const handleSave = async () => {
    if (!isValid || submitting) return;
    try {
      setSubmitting(true);
      const therapist = await dataStore.getCurrentUser();

      // Build the payload from form values + therapist
      const payload = {
        ...values,
        createdBy: therapist?.id || 'therapist1',
      };

      const fn = dataStore[config.saveFn];
      if (typeof fn !== 'function') throw new Error('Save function missing');
      await fn.call(dataStore, payload);

      Alert.alert('Saved', `Your ${config.title.toLowerCase()} has been added.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      console.log('[CreateContent] save error', e);
      Alert.alert('Error', 'Failed to save. Please try again.');
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
            <Text style={[styles.eyebrow, { color: config.accent }]}>
              {config.eyebrow}
            </Text>
            <Text style={styles.headerTitle}>{config.title}</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {config.fields.map((field) => {
            if (field.type === 'chips') {
              return (
                <View key={field.key} style={styles.fieldBlock}>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  <View style={styles.chipsRow}>
                    {field.options.map((opt) => {
                      const active = values[field.key] === opt.id;
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
                          onPress={() => setField(field.key, opt.id)}
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
                </View>
              );
            }

            return (
              <View key={field.key} style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <TextInput
                  style={[
                    styles.input,
                    field.type === 'multiline' && {
                      minHeight: field.minHeight || 80,
                      textAlignVertical: 'top',
                    },
                  ]}
                  placeholder={field.placeholder}
                  placeholderTextColor={COLORS.gray400}
                  value={values[field.key]}
                  onChangeText={(v) => setField(field.key, v)}
                  multiline={field.type === 'multiline'}
                />
              </View>
            );
          })}

          <View style={{ height: SPACING.xl }} />
        </ScrollView>

        <View style={styles.submitBar}>
          <TouchableOpacity
            style={[
              styles.submitBtn,
              !isValid && styles.submitBtnDisabled,
              isValid && { backgroundColor: INK },
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
                  {isValid ? 'Save' : 'Fill required fields'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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

  fieldBlock: { marginBottom: SPACING.lg },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: 14,
    color: INK,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: COLORS.gray100,
    lineHeight: 20,
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
