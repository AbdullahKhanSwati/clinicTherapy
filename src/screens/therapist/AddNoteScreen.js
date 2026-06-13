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
  getProfileById,
  getCurrentUserId,
  createNote,
} from '../../services/api';

const INK = '#1A2332';
const ACCENT = COLORS.primary;

const CATEGORIES = [
  { id: 'observation', label: 'Observation', icon: 'eye' },
  { id: 'progress', label: 'Progress', icon: 'trending-up' },
  { id: 'concern', label: 'Concern', icon: 'alert-circle' },
  { id: 'plan', label: 'Plan', icon: 'target' },
];

export default function AddNoteScreen({ route, navigation }) {
  const { clientId } = route?.params || {};
  const [client, setClient] = useState(null);
  const [category, setCategory] = useState('observation');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    (async () => {
      try {
        if (clientId) {
          const c = await getProfileById(clientId);
          setClient(c);
        }
      } catch (e) {
        console.log('[AddNote] load error', e);
      }
    })();
  }, [clientId]);

  const canSubmit = content.trim().length > 0 && !submitting;

  const handleSave = async () => {
    if (!canSubmit) return;
    if (!clientId) {
      Alert.alert('Missing client', 'No client was selected for this note.');
      return;
    }
    try {
      setSubmitting(true);
      const therapistId = await getCurrentUserId();
      if (!therapistId) throw new Error('Not signed in.');
      await createNote({
        therapistId,
        clientId,
        body: content.trim(),
        category,
        isPrivate: true,    // matches the on-screen disclaimer
      });
      Alert.alert('Note Saved', 'Your clinical note has been recorded.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      console.log('[AddNote] save error', e);
      Alert.alert('Error', e?.message || 'Failed to save note. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
        >
          <Feather name="x" size={20} color={INK} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: SPACING.md }}>
          <Text style={styles.eyebrow}>CLINICAL NOTE</Text>
          <Text style={styles.headerTitle}>
            {client ? `Note for ${client.name}` : 'Add Note'}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.fieldLabel}>CATEGORY</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((c) => {
            const active = category === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.categoryTile,
                  active && styles.categoryTileActive,
                ]}
                onPress={() => setCategory(c.id)}
                activeOpacity={0.85}
              >
                <Feather
                  name={c.icon}
                  size={18}
                  color={active ? COLORS.white : INK}
                />
                <Text
                  style={[
                    styles.categoryLabel,
                    active && styles.categoryLabelActive,
                  ]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.fieldLabel}>NOTE</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Write your clinical observation, progress update, or follow-up plan..."
          placeholderTextColor={COLORS.gray400}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          autoFocus
        />

        <View style={styles.helperRow}>
          <Feather name="info" size={12} color={COLORS.gray500} />
          <Text style={styles.helperText}>
            Notes are private to your practice and not visible to the client.
          </Text>
        </View>

        <View style={{ height: SPACING.xl }} />
      </ScrollView>

      <View style={[styles.submitBar, { paddingBottom: insets.bottom + SPACING.md }]}>
        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={handleSave}
          disabled={!canSubmit}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Feather name="check" size={16} color={COLORS.white} />
              <Text style={styles.submitBtnText}>Save Note</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
    color: ACCENT,
    letterSpacing: 1.4,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.4,
  },

  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },

  /* Category grid */
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryTile: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  categoryTileActive: {
    backgroundColor: INK,
    borderColor: INK,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: INK,
    marginLeft: SPACING.sm,
    letterSpacing: -0.1,
  },
  categoryLabelActive: { color: COLORS.white },

  /* Notes input */
  notesInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    fontSize: 14,
    color: INK,
    minHeight: 200,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: COLORS.gray100,
    lineHeight: 22,
  },

  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  helperText: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
    marginLeft: 6,
    flex: 1,
  },

  /* Submit bar */
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
