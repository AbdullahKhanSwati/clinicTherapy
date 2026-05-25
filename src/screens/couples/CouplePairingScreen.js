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
  Share,
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
const CREAM = '#FAF7F2';
const SUCCESS = '#15803D';

/**
 * Couple Pairing screen.
 *
 * Three states:
 *   1. ACTIVE PAIRING: shows partner info + disconnect option
 *   2. PENDING (you created an invite): shows the invite code
 *   3. NO PAIRING: choice between "Generate Invite" and "Join with Code"
 */
export default function CouplePairingScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [pairing, setPairing] = useState(null);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState(null); // null | 'invite' | 'join'
  const [joinCode, setJoinCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      await dataStore.initialize();
      const u = await dataStore.getCurrentUser();
      setUser(u);
      if (u) {
        const all = await dataStore.getCouplePairings();
        // Find any pairing (active or pending) involving this user
        const mine = all.find(
          (p) =>
            (p.partnerAId === u.id || p.partnerBId === u.id) &&
            p.status !== 'disconnected'
        );
        setPairing(mine || null);
        if (mine && mine.status === 'active') {
          const partnerId =
            mine.partnerAId === u.id ? mine.partnerBId : mine.partnerAId;
          if (partnerId) {
            const p = await dataStore.getUserById(partnerId);
            setPartner(p);
          }
        } else {
          setPartner(null);
        }
      }
    } catch (e) {
      console.log('[CouplePairing] load', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleGenerateInvite = async () => {
    try {
      setSubmitting(true);
      await dataStore.createPairingInvite(user.id);
      await load();
    } catch (e) {
      console.log('[CouplePairing] invite', e);
      Alert.alert('Error', 'Could not create invite code.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    try {
      setSubmitting(true);
      await dataStore.acceptPairingInvite(joinCode.trim().toUpperCase(), user.id);
      Alert.alert('Linked', 'You are now paired with your partner.', [
        {
          text: 'OK',
          onPress: () => {
            setMode(null);
            setJoinCode('');
            load();
          },
        },
      ]);
    } catch (e) {
      Alert.alert(
        'Invalid code',
        e.message || 'That code was not found or has already been used.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect partner?',
      'You can re-pair later, but shared check-ins, repair requests, and appreciations will no longer sync.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await dataStore.disconnectPairing(pairing.id);
              await load();
            } catch (e) {
              console.log('[CouplePairing] disconnect', e);
            }
          },
        },
      ]
    );
  };

  const handleShareInvite = async () => {
    try {
      await Share.share({
        message: `Join me on Therapy Companion. Use my invite code: ${pairing.inviteCode}`,
      });
    } catch (e) {
      console.log('[CouplePairing] share', e);
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

  // ACTIVE state — partners are linked
  if (pairing && pairing.status === 'active') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={20} color={INK} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Text style={styles.eyebrow}>PAIRING</Text>
            <Text style={styles.headerTitle}>You're Linked</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.activeCard}>
            <View style={styles.dualAvatars}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: user?.profileColor || COLORS.primary },
                ]}
              >
                <Text style={styles.avatarEmoji}>{user?.avatar || '👤'}</Text>
              </View>
              <Text style={styles.amp}>&</Text>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: partner?.profileColor || BLUSH },
                ]}
              >
                <Text style={styles.avatarEmoji}>{partner?.avatar || '👤'}</Text>
              </View>
            </View>
            <Text style={styles.activeStatusEyebrow}>PAIRING ACTIVE</Text>
            <Text style={styles.activeNames}>
              {user?.name?.split(' ')[0]}{' '}
              <Text style={styles.activeAmpInline}>&</Text>{' '}
              {partner?.name?.split(' ')[0]}
            </Text>
            <Text style={styles.activeMeta}>
              Paired{' '}
              {new Date(pairing.pairedAt || pairing.createdAt).toLocaleDateString(
                'en-US',
                { month: 'long', day: 'numeric', year: 'numeric' }
              )}
            </Text>
          </View>

          <Text style={styles.sectionLabel}>WHAT'S SHARED</Text>
          <View style={styles.featureList}>
            <FeatureRow icon="message-circle" label="Daily check-ins (mood, connection, stress)" />
            <FeatureRow icon="send" label="Repair requests" />
            <FeatureRow icon="heart" label="Appreciations" />
            <FeatureRow icon="pause-circle" label="Conflict pauses" />
            <FeatureRow icon="target" label="Shared goals" />
            <FeatureRow icon="file-text" label="Worksheets you choose to share" />
          </View>

          <TouchableOpacity
            style={styles.disconnectBtn}
            onPress={handleDisconnect}
            activeOpacity={0.85}
          >
            <Feather name="user-x" size={16} color={COLORS.error} />
            <Text style={styles.disconnectText}>Disconnect Partner</Text>
          </TouchableOpacity>

          <View style={{ height: SPACING.xl }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // PENDING state — invite created but partner hasn't joined yet
  if (pairing && pairing.status === 'pending') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={20} color={INK} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Text style={styles.eyebrow}>WAITING FOR PARTNER</Text>
            <Text style={styles.headerTitle}>Your Invite Code</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>SHARE THIS CODE</Text>
            <Text style={styles.codeValue} selectable>
              {pairing.inviteCode}
            </Text>
            <Text style={styles.codeHelper}>
              Your partner enters this code in their app to link your accounts.
            </Text>
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={handleShareInvite}
              activeOpacity={0.85}
            >
              <Feather name="share-2" size={14} color={COLORS.white} />
              <Text style={styles.shareBtnText}>Share Code</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.howCard}>
            <Text style={styles.howTitle}>How your partner joins</Text>
            <Step number="1" text="They open the Therapy Companion app and sign in." />
            <Step number="2" text="They tap 'Pair with your partner' on their profile." />
            <Step number="3" text="They enter this code and tap 'Join.'" />
            <Step number="4" text="You'll both be linked instantly." />
          </View>

          <TouchableOpacity
            style={styles.disconnectBtn}
            onPress={handleDisconnect}
            activeOpacity={0.85}
          >
            <Feather name="x-circle" size={16} color={COLORS.error} />
            <Text style={styles.disconnectText}>Cancel Invite</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // NO PAIRING — choose to invite or join
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={20} color={INK} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: SPACING.md }}>
          <Text style={styles.eyebrow}>PARTNER PAIRING</Text>
          <Text style={styles.headerTitle}>Link Your Partner</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>
            Each partner has their own login.
          </Text>
          <Text style={styles.introBody}>
            Pairing keeps your data private while letting you share check-ins,
            repair requests, appreciations, and selected worksheet responses.
          </Text>
        </View>

        {mode === null && (
          <>
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => setMode('invite')}
              activeOpacity={0.85}
            >
              <View style={[styles.optionIcon, { backgroundColor: BLUSH + '15' }]}>
                <Feather name="user-plus" size={22} color={BLUSH} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>Invite your partner</Text>
                <Text style={styles.optionDesc}>
                  Generate a code your partner can use to join you.
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={COLORS.gray400} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => setMode('join')}
              activeOpacity={0.85}
            >
              <View style={[styles.optionIcon, { backgroundColor: INK + '10' }]}>
                <Feather name="key" size={22} color={INK} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>Join with a code</Text>
                <Text style={styles.optionDesc}>
                  Enter the invite code your partner shared with you.
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={COLORS.gray400} />
            </TouchableOpacity>
          </>
        )}

        {mode === 'invite' && (
          <View style={styles.modeCard}>
            <Feather name="user-plus" size={28} color={BLUSH} />
            <Text style={styles.modeTitle}>Create an invite code</Text>
            <Text style={styles.modeBody}>
              We'll generate a unique code. Share it with your partner — when
              they enter it, you'll be linked.
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleGenerateInvite}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.primaryBtnText}>Generate Code</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMode(null)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {mode === 'join' && (
          <View style={styles.modeCard}>
            <Feather name="key" size={28} color={INK} />
            <Text style={styles.modeTitle}>Enter the code</Text>
            <Text style={styles.modeBody}>
              Paste the invite code your partner shared with you.
            </Text>
            <TextInput
              style={styles.codeInput}
              placeholder="COUP-XXXXX-XXXXX"
              placeholderTextColor={COLORS.gray400}
              value={joinCode}
              onChangeText={(v) => setJoinCode(v.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                !joinCode.trim() && styles.primaryBtnDisabled,
              ]}
              onPress={handleJoin}
              disabled={!joinCode.trim() || submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.primaryBtnText}>Join Partner</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMode(null)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const FeatureRow = ({ icon, label }) => (
  <View style={styles.featureRow}>
    <Feather name={icon} size={14} color={SUCCESS} style={{ marginRight: 10 }} />
    <Text style={styles.featureLabel}>{label}</Text>
  </View>
);

const Step = ({ number, text }) => (
  <View style={styles.stepRow}>
    <View style={styles.stepNum}>
      <Text style={styles.stepNumText}>{number}</Text>
    </View>
    <Text style={styles.stepText}>{text}</Text>
  </View>
);

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

  /* Intro */
  introCard: {
    backgroundColor: CREAM,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#EFE6D8',
  },
  introTitle: {
    fontSize: TYPOGRAPHY.base,
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

  /* Option cards */
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 12,
    color: COLORS.gray500,
    fontWeight: '500',
    lineHeight: 17,
  },

  /* Mode card (invite or join) */
  modeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  modeTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.4,
    marginTop: SPACING.md,
    marginBottom: 6,
  },
  modeBody: {
    fontSize: 13,
    color: COLORS.gray600,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: SPACING.lg,
  },
  codeInput: {
    width: '100%',
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: 16,
    color: INK,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1.5,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    marginBottom: SPACING.md,
  },
  primaryBtn: {
    backgroundColor: INK,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  primaryBtnDisabled: { backgroundColor: COLORS.gray300 },
  primaryBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  cancelText: {
    fontSize: 13,
    color: COLORS.gray500,
    fontWeight: '600',
  },

  /* Code (pending) */
  codeCard: {
    backgroundColor: CREAM,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#EFE6D8',
  },
  codeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: BLUSH,
    letterSpacing: 1.4,
    marginBottom: SPACING.md,
  },
  codeValue: {
    fontSize: 28,
    fontWeight: '800',
    color: INK,
    letterSpacing: 2,
    marginBottom: SPACING.md,
  },
  codeHelper: {
    fontSize: 12,
    color: COLORS.gray600,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: SPACING.lg,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INK,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  shareBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 6,
    letterSpacing: 0.2,
  },

  howCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  howTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.2,
    marginBottom: SPACING.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  stepNumText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.gray700,
    lineHeight: 19,
    marginTop: 4,
  },

  /* Active pairing */
  activeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  dualAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: { fontSize: 30 },
  amp: {
    fontSize: 28,
    fontWeight: '300',
    color: COLORS.gray400,
    fontStyle: 'italic',
    marginHorizontal: SPACING.lg,
  },
  activeStatusEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: SUCCESS,
    marginBottom: 4,
  },
  activeNames: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  activeAmpInline: {
    fontWeight: '300',
    fontStyle: 'italic',
    color: COLORS.gray500,
  },
  activeMeta: {
    fontSize: 12,
    color: COLORS.gray500,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
    marginBottom: SPACING.sm,
  },
  featureList: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  featureLabel: {
    fontSize: 13,
    color: INK,
    fontWeight: '500',
    flex: 1,
  },

  disconnectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  disconnectText: {
    color: COLORS.error,
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 6,
    letterSpacing: 0.2,
  },
});
