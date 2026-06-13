import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
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
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../../components/Avatar';
import {
  getActivePairingForUser,
  getPartnerProfileForUser,
  disconnectPairing,
} from '../../services/api';

const INK = '#1A2332';
const BLUSH = '#D4536B';
const CREAM = '#FAF7F2';
const SUCCESS = '#15803D';

const ACCESSORY_EMOJI = {
  none: '',
  crown: '👑',
  star: '⭐',
  sparkles: '✨',
  flower: '🌸',
  heart: '💖',
  hat: '🎩',
  rainbow: '🌈',
};

/**
 * Couple Pairing screen.
 *
 * Pairing is managed by the therapist on the admin side
 * (AdminPairCoupleScreen). On the client side this screen shows the user
 * their current pairing status, lets them see partner info, and lets them
 * disconnect if they choose to (RLS permits a partner to update their own
 * pairing row).
 */
export default function CouplePairingScreen({ navigation }) {
  const { profile: user } = useAuth();
  const [pairing, setPairing] = useState(null);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const p = await getActivePairingForUser(user.id);
      setPairing(p);
      if (p) {
        const partnerProfile = await getPartnerProfileForUser(user.id);
        setPartner(partnerProfile);
      } else {
        setPartner(null);
      }
    } catch (e) {
      console.log('[CouplePairing] load', e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleDisconnect = () => {
    if (!pairing?.id) return;
    Alert.alert(
      'Disconnect partner?',
      'Shared check-ins, repair requests, and appreciations will no longer sync. Your therapist can re-pair you later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await disconnectPairing(pairing.id);
              await load();
            } catch (e) {
              console.log('[CouplePairing] disconnect', e);
              Alert.alert('Error', e.message || 'Could not disconnect.');
            }
          },
        },
      ]
    );
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
              <View style={styles.avatarWrap}>
                <Avatar
                  value={user?.avatar}
                  name={user?.name}
                  size={64}
                  backgroundColor={user?.profileColor || COLORS.primary}
                  emojiSize={30}
                />
                {user?.accessory && ACCESSORY_EMOJI[user.accessory] ? (
                  <Text style={styles.accessoryBadge}>
                    {ACCESSORY_EMOJI[user.accessory]}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.amp}>&</Text>
              <View style={styles.avatarWrap}>
                <Avatar
                  value={partner?.avatar}
                  name={partner?.name}
                  size={64}
                  backgroundColor={partner?.profileColor || BLUSH}
                  emojiSize={30}
                />
                {partner?.accessory && ACCESSORY_EMOJI[partner.accessory] ? (
                  <Text style={styles.accessoryBadge}>
                    {ACCESSORY_EMOJI[partner.accessory]}
                  </Text>
                ) : null}
              </View>
            </View>
            <Text style={styles.activeStatusEyebrow}>PAIRING ACTIVE</Text>
            <Text style={styles.activeNames}>
              {user?.name?.split(' ')[0] || 'You'}{' '}
              <Text style={styles.activeAmpInline}>&</Text>{' '}
              {partner?.name?.split(' ')[0] || 'Partner'}
            </Text>
            <Text style={styles.activeMeta}>
              Paired{' '}
              {new Date(
                pairing.pairedAt || pairing.createdAt
              ).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>

          <Text style={styles.sectionLabel}>WHAT'S SHARED</Text>
          <View style={styles.featureList}>
            <FeatureRow
              icon="message-circle"
              label="Daily check-ins (mood, connection, stress)"
            />
            <FeatureRow icon="send" label="Repair requests" />
            <FeatureRow icon="heart" label="Appreciations" />
            <FeatureRow icon="pause-circle" label="Conflict pauses" />
            <FeatureRow icon="target" label="Shared goals" />
            <FeatureRow icon="file-text" label="Worksheets your therapist assigns" />
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

  // NO PAIRING — clinician-managed. Direct the user to ask their therapist.
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
          <Text style={styles.headerTitle}>Not Paired Yet</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>
            Pairing is set up by your therapist.
          </Text>
          <Text style={styles.introBody}>
            Each partner has their own login. To unlock shared check-ins, repair
            requests, appreciations and worksheets, ask your therapist to pair
            your accounts in the admin panel.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>HOW IT WORKS</Text>
        <View style={styles.howCard}>
          <Step number="1" text="Both partners create their own account in the app." />
          <Step number="2" text="Tell your therapist you'd like to be paired." />
          <Step number="3" text="They link your accounts from the Couple Management screen." />
          <Step number="4" text="Once linked, all couples tools unlock instantly." />
        </View>

        <Text style={styles.sectionLabel}>WHAT YOU UNLOCK</Text>
        <View style={styles.featureList}>
          <FeatureRow icon="message-circle" label="Daily check-ins" />
          <FeatureRow icon="send" label="Repair requests" />
          <FeatureRow icon="heart" label="Appreciation exchange" />
          <FeatureRow icon="pause-circle" label="Conflict pause timer" />
          <FeatureRow icon="target" label="Shared goals" />
        </View>

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

  /* How it works */
  howCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray100,
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
  avatarWrap: { position: 'relative' },
  accessoryBadge: {
    position: 'absolute',
    top: -6,
    right: -2,
    fontSize: 22,
  },
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
