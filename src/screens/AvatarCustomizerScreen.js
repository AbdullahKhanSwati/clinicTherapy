import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/colors';
import dataStore from '../utils/dataStore';

const CHARACTERS = ['👧', '👦', '🧒', '👩', '👨', '🧑', '🦊', '🐱', '🐶', '🐼', '🦁', '🐨', '🐸', '🐵', '🦄', '🐯'];

const BG_COLORS = [
  '#FF6B9D', // hot pink
  '#FFA500', // orange
  '#00D9A3', // mint
  '#FFD93D', // yellow
  '#6C5CE7', // purple
  '#00A8CC', // teal
  '#FF6B6B', // coral
  '#4ECDC4', // light teal
];

const ACCESSORIES = [
  { id: 'none', emoji: '', label: 'None' },
  { id: 'crown', emoji: '👑', label: 'Crown' },
  { id: 'star', emoji: '⭐', label: 'Star' },
  { id: 'sparkles', emoji: '✨', label: 'Sparkles' },
  { id: 'flower', emoji: '🌸', label: 'Flower' },
  { id: 'heart', emoji: '💖', label: 'Heart' },
  { id: 'hat', emoji: '🎩', label: 'Hat' },
  { id: 'rainbow', emoji: '🌈', label: 'Rainbow' },
];

export default function AvatarCustomizerScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [character, setCharacter] = useState('👧');
  const [bgColor, setBgColor] = useState(BG_COLORS[0]);
  const [accessory, setAccessory] = useState('none');

  useEffect(() => {
    (async () => {
      await dataStore.initialize();
      const u = await dataStore.getCurrentUser();
      setUser(u);
      if (u?.avatar) setCharacter(u.avatar);
      if (u?.profileColor) setBgColor(u.profileColor);
      if (u?.accessory) setAccessory(u.accessory);
    })();
  }, []);

  const accessoryEmoji =
    ACCESSORIES.find((a) => a.id === accessory)?.emoji || '';

  const save = async () => {
    if (!user) return;
    try {
      const updated = {
        ...user,
        avatar: character,
        profileColor: bgColor,
        accessory,
      };
      await dataStore.setCurrentUser(updated);
      Alert.alert('Saved!', 'Your avatar looks great 🎉', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      console.log('[AvatarCustomizer] save error', e);
      Alert.alert('Error', 'Could not save your avatar.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Avatar</Text>
        <TouchableOpacity onPress={save} hitSlop={8}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.preview}>
          <View style={[styles.avatarRing, { backgroundColor: bgColor }]}>
            <View style={styles.avatarInner}>
              <Text style={styles.avatarChar}>{character}</Text>
            </View>
            {accessoryEmoji ? (
              <Text style={styles.accessoryBadge}>{accessoryEmoji}</Text>
            ) : null}
          </View>
          <Text style={styles.previewName}>{user?.name || 'Friend'}</Text>
        </View>

        <Section title="Pick your character">
          <View style={styles.grid}>
            {CHARACTERS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.charCell, character === c && styles.charCellActive]}
                onPress={() => setCharacter(c)}
              >
                <Text style={styles.charEmoji}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        <Section title="Pick your color">
          <View style={styles.colorRow}>
            {BG_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: c },
                  bgColor === c && styles.colorSwatchActive,
                ]}
                onPress={() => setBgColor(c)}
              />
            ))}
          </View>
        </Section>

        <Section title="Add an accessory">
          <View style={styles.grid}>
            {ACCESSORIES.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={[
                  styles.accessoryCell,
                  accessory === a.id && styles.charCellActive,
                ]}
                onPress={() => setAccessory(a.id)}
              >
                <Text style={styles.charEmoji}>{a.emoji || '🚫'}</Text>
                <Text style={styles.accessoryLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        <TouchableOpacity style={styles.bigSave} onPress={save}>
          <Text style={styles.bigSaveText}>Save my avatar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
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
  saveButton: { color: COLORS.primary, fontWeight: '700' },
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING['2xl'] },

  preview: { alignItems: 'center', marginBottom: SPACING.xl },
  avatarRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.lg,
  },
  avatarInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarChar: { fontSize: 72 },
  accessoryBadge: {
    position: 'absolute',
    top: -8,
    right: -4,
    fontSize: 36,
  },
  previewName: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.gray700,
  },

  section: { marginBottom: SPACING.xl },
  sectionTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: SPACING.md,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  charCell: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  charCellActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLighter + '30',
  },
  charEmoji: { fontSize: 32 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: 'transparent',
    ...SHADOWS.sm,
  },
  colorSwatchActive: { borderColor: COLORS.gray700 },
  accessoryCell: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 4,
  },
  accessoryLabel: {
    fontSize: 10,
    color: COLORS.gray600,
    fontWeight: '600',
    marginTop: 2,
  },

  bigSave: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.md,
    ...SHADOWS.md,
  },
  bigSaveText: { color: COLORS.white, fontSize: TYPOGRAPHY.base, fontWeight: '700' },
});
