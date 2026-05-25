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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
} from '../../constants/colors';
import dataStore from '../../utils/dataStore';
import { REPAIR_MESSAGE_TEMPLATES } from '../../data/mockData';

const INK = '#1A2332';
const BLUSH = '#D4536B';
const CREAM = '#FAF7F2';

export default function RepairRequestScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [partnerId, setPartnerId] = useState(null);
  const [partner, setPartner] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedId, setSelectedId] = useState(null);
  const [customMessage, setCustomMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
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
          const requests = await dataStore.getRepairRequestsForUser(u.id);
          setRecentRequests(requests.slice(0, 3));
        }
      } catch (e) {
        console.log('[RepairRequest] load', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const message = selectedId
    ? REPAIR_MESSAGE_TEMPLATES.find((t) => t.id === selectedId)?.label
    : customMessage.trim();

  const canSubmit = !!message && partnerId && !submitting;

  const handleSend = async () => {
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      await dataStore.sendRepairRequest(user.id, partnerId, message);
      Alert.alert(
        'Repair request sent',
        `${
          partner?.name?.split(' ')[0] || 'Your partner'
        } will see this on their home screen.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      console.log('[RepairRequest] send', e);
      Alert.alert('Error', 'Could not send. Please try again.');
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

  if (!partnerId) {
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
            <Text style={styles.eyebrow}>REPAIR REQUEST</Text>
            <Text style={styles.headerTitle}>Send Repair</Text>
          </View>
        </View>
        <View style={styles.center}>
          <Feather name="users" size={32} color={COLORS.gray300} />
          <Text style={styles.emptyTitle}>No partner linked yet</Text>
          <Text style={styles.emptyText}>
            Link your partner first to send a repair request.
          </Text>
          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => navigation.replace('CouplePairing')}
            activeOpacity={0.85}
          >
            <Text style={styles.linkBtnText}>Link your partner</Text>
          </TouchableOpacity>
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
          <Text style={styles.eyebrow}>REPAIR REQUEST</Text>
          <Text style={styles.headerTitle}>
            Send to {partner?.name?.split(' ')[0] || 'Partner'}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>
            A repair request is an invitation, not blame.
          </Text>
          <Text style={styles.introBody}>
            Choose a message below or write your own. Your partner will know you
            want to reconnect — not argue.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>QUICK MESSAGES</Text>
        {REPAIR_MESSAGE_TEMPLATES.map((t) => {
          const active = selectedId === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              style={[styles.option, active && styles.optionActive]}
              onPress={() => {
                setSelectedId(t.id);
                setCustomMessage('');
              }}
              activeOpacity={0.85}
            >
              <View
                style={[styles.optionBubble, active && styles.optionBubbleActive]}
              >
                {active && (
                  <Feather name="check" size={14} color={COLORS.white} />
                )}
              </View>
              <Text style={[styles.optionText, active && styles.optionTextActive]}>
                "{t.label}"
              </Text>
            </TouchableOpacity>
          );
        })}

        <Text style={styles.sectionLabel}>OR WRITE YOUR OWN</Text>
        <TextInput
          style={styles.input}
          placeholder="Write a short, gentle message..."
          placeholderTextColor={COLORS.gray400}
          value={customMessage}
          onChangeText={(v) => {
            setCustomMessage(v);
            if (v) setSelectedId(null);
          }}
          multiline
        />

        {recentRequests.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>RECENT</Text>
            {recentRequests.map((r) => (
              <View key={r.id} style={styles.recentItem}>
                <View style={styles.recentDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.recentMeta}>
                    {r.fromUserId === user.id ? 'YOU SENT' : 'PARTNER SENT'} ·{' '}
                    {formatTimeAgo(r.sentAt)}
                  </Text>
                  <Text style={styles.recentText} numberOfLines={2}>
                    "{r.message}"
                  </Text>
                  {r.response ? (
                    <Text style={styles.recentResponse} numberOfLines={1}>
                      Reply: "{r.response}"
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
          </>
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>

      <View style={styles.submitBar}>
        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={handleSend}
          disabled={!canSubmit}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Feather name="send" size={16} color={COLORS.white} />
              <Text style={styles.submitBtnText}>
                {canSubmit ? 'Send Repair Request' : 'Choose or write a message'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const formatTimeAgo = (iso) => {
  const ms = Date.now() - new Date(iso).getTime();
  const hours = Math.round(ms / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },

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

  introCard: {
    backgroundColor: CREAM,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#EFE6D8',
  },
  introTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  introBody: {
    fontSize: 13,
    color: COLORS.gray700,
    lineHeight: 19,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  optionActive: {
    borderColor: INK,
    borderWidth: 2,
  },
  optionBubble: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    marginRight: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionBubbleActive: {
    backgroundColor: INK,
    borderColor: INK,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray700,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  optionTextActive: { color: INK, fontWeight: '600' },

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
  },

  recentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  recentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BLUSH,
    marginTop: 8,
    marginRight: SPACING.sm,
  },
  recentMeta: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  recentText: {
    fontSize: 13,
    color: INK,
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 4,
  },
  recentResponse: {
    fontSize: 12,
    color: COLORS.gray500,
    fontWeight: '500',
  },

  emptyTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: INK,
    marginTop: SPACING.md,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.gray500,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  linkBtn: {
    backgroundColor: INK,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  linkBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.2,
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
