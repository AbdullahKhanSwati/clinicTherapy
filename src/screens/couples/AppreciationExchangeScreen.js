import React, { useState, useEffect, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
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

const TYPES = [
  {
    id: 'appreciation',
    label: 'Appreciation',
    icon: 'star',
    hint: 'Something specific they did or said',
  },
  {
    id: 'memory',
    label: 'Memory',
    icon: 'clock',
    hint: 'A moment from your shared history',
  },
  {
    id: 'quality',
    label: 'Quality',
    icon: 'heart',
    hint: 'Something you admire about who they are',
  },
  {
    id: 'thank_you',
    label: 'Thank You',
    icon: 'gift',
    hint: 'A small act of kindness',
  },
];

export default function AppreciationExchangeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [partnerId, setPartnerId] = useState(null);
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedType, setSelectedType] = useState('appreciation');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      await dataStore.initialize();
      const u = await dataStore.getCurrentUser();
      setUser(u);
      if (u) {
        const pid = await dataStore.getPartnerIdForUser(u.id);
        setPartnerId(pid);
        if (pid) {
          const p = await dataStore.getUserById(pid);
          setPartner(p);
        }
        const all = await dataStore.getAppreciationsForUser(u.id);
        setReceived(all.filter((a) => a.toUserId === u.id));
        setSent(all.filter((a) => a.fromUserId === u.id));
      }
    } catch (e) {
      console.log('[Appreciation] load', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const canSubmit = text.trim().length > 0 && partnerId && !submitting;

  const handleSend = async () => {
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      await dataStore.sendAppreciation(
        user.id,
        partnerId,
        selectedType,
        text.trim()
      );
      setText('');
      Alert.alert(
        'Sent ✓',
        `${
          partner?.name?.split(' ')[0] || 'Your partner'
        } will see this on their home screen.`,
        [{ text: 'OK' }]
      );
      load();
    } catch (e) {
      console.log('[Appreciation] send', e);
      Alert.alert('Error', 'Could not send. Try again.');
    } finally {
      setSubmitting(false);
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
          <Text style={styles.eyebrow}>FONDNESS RITUAL</Text>
          <Text style={styles.headerTitle}>Appreciation</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!partnerId ? (
          <View style={styles.warningCard}>
            <Feather name="alert-circle" size={20} color={BLUSH} />
            <Text style={styles.warningText}>
              Link your partner to start exchanging appreciations.
            </Text>
            <TouchableOpacity
              style={styles.warningCta}
              onPress={() => navigation.navigate('CouplePairing')}
            >
              <Text style={styles.warningCtaText}>Link now →</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <Text style={styles.sectionLabel}>TYPE</Text>
        <View style={styles.typeGrid}>
          {TYPES.map((t) => {
            const active = selectedType === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.typeTile, active && styles.typeTileActive]}
                onPress={() => setSelectedType(t.id)}
                activeOpacity={0.85}
              >
                <Feather
                  name={t.icon}
                  size={18}
                  color={active ? COLORS.white : INK}
                />
                <Text
                  style={[
                    styles.typeLabel,
                    active && styles.typeLabelActive,
                  ]}
                >
                  {t.label}
                </Text>
                <Text
                  style={[
                    styles.typeHint,
                    active && { color: 'rgba(255,255,255,0.7)' },
                  ]}
                  numberOfLines={2}
                >
                  {t.hint}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>YOUR MESSAGE</Text>
        <TextInput
          style={styles.input}
          placeholder={
            TYPES.find((t) => t.id === selectedType)?.hint ||
            'Something genuine and specific...'
          }
          placeholderTextColor={COLORS.gray400}
          value={text}
          onChangeText={setText}
          multiline
        />

        <TouchableOpacity
          style={[styles.sendBtn, !canSubmit && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!canSubmit}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Feather name="send" size={14} color={COLORS.white} />
              <Text style={styles.sendBtnText}>
                Send to {partner?.name?.split(' ')[0] || 'Partner'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {received.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: SPACING.xl }]}>
              FROM {partner?.name?.split(' ')[0]?.toUpperCase() || 'PARTNER'}
            </Text>
            {received.slice(0, 5).map((a) => (
              <AppreciationCard key={a.id} item={a} direction="in" />
            ))}
          </>
        )}

        {sent.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: SPACING.xl }]}>
              YOU SENT
            </Text>
            {sent.slice(0, 5).map((a) => (
              <AppreciationCard key={a.id} item={a} direction="out" />
            ))}
          </>
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const AppreciationCard = ({ item, direction }) => {
  const type = TYPES.find((t) => t.id === item.type) || TYPES[0];
  return (
    <View
      style={[
        styles.cardItem,
        direction === 'out' && { opacity: 0.7 },
      ]}
    >
      <View style={styles.cardIcon}>
        <Feather name={type.icon} size={14} color={BLUSH} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardEyebrow}>
          {type.label.toUpperCase()} · {formatTimeAgo(item.createdAt)}
        </Text>
        <Text style={styles.cardText}>"{item.text}"</Text>
      </View>
    </View>
  );
};

const formatTimeAgo = (iso) => {
  const ms = Date.now() - new Date(iso).getTime();
  const hours = Math.round(ms / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

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

  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F3',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#FCD9DF',
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: INK,
    marginLeft: SPACING.sm,
    fontWeight: '500',
  },
  warningCta: { paddingHorizontal: SPACING.sm },
  warningCtaText: {
    fontSize: 12,
    color: BLUSH,
    fontWeight: '700',
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },

  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  typeTile: {
    width: '48.5%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    minHeight: 100,
  },
  typeTileActive: {
    backgroundColor: INK,
    borderColor: INK,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.2,
    marginTop: SPACING.sm,
    marginBottom: 2,
  },
  typeLabelActive: { color: COLORS.white },
  typeHint: {
    fontSize: 11,
    color: COLORS.gray500,
    lineHeight: 15,
    fontWeight: '500',
  },

  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: 14,
    color: INK,
    fontWeight: '500',
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: COLORS.gray100,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },

  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: INK,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  sendBtnDisabled: { backgroundColor: COLORS.gray300 },
  sendBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 13,
    marginLeft: 6,
    letterSpacing: 0.2,
  },

  cardItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  cardIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: BLUSH + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  cardEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  cardText: {
    fontSize: 13,
    color: INK,
    fontStyle: 'italic',
    lineHeight: 19,
  },
});
