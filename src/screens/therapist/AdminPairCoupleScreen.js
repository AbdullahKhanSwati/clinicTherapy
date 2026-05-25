import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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
const SUCCESS = '#15803D';

/**
 * AdminPairCoupleScreen — admin-controlled couple pairing.
 *
 * Replaces the invite-code flow: the admin picks Partner A and Partner B
 * from the list of users with role='couples' who are not already paired.
 */
export default function AdminPairCoupleScreen({ navigation }) {
  const [users, setUsers] = useState({});
  const [pairings, setPairings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedA, setSelectedA] = useState(null);
  const [selectedB, setSelectedB] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      await dataStore.initialize();
      const [allUsers, allPairings] = await Promise.all([
        dataStore.getUsers(),
        dataStore.getCouplePairings(),
      ]);
      setUsers(allUsers || {});
      setPairings(allPairings || []);
    } catch (e) {
      console.log('[AdminPairCouple] load', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const { unpaired, pairedIds } = useMemo(() => {
    const activeIds = new Set();
    (pairings || [])
      .filter((p) => p.status === 'active')
      .forEach((p) => {
        if (p.partnerAId) activeIds.add(p.partnerAId);
        if (p.partnerBId) activeIds.add(p.partnerBId);
      });
    const candidates = Object.values(users || {}).filter(
      (u) => u && u.role === 'couples'
    );
    return {
      unpaired: candidates.filter((u) => !activeIds.has(u.id)),
      pairedIds: activeIds,
    };
  }, [users, pairings]);

  const pickPartner = (user) => {
    if (selectedA?.id === user.id) {
      setSelectedA(null);
      return;
    }
    if (selectedB?.id === user.id) {
      setSelectedB(null);
      return;
    }
    if (!selectedA) {
      setSelectedA(user);
    } else if (!selectedB) {
      setSelectedB(user);
    } else {
      setSelectedB(user);
    }
  };

  const reset = () => {
    setSelectedA(null);
    setSelectedB(null);
  };

  const confirmPair = () => {
    if (!selectedA || !selectedB) return;
    Alert.alert(
      'Confirm pairing',
      `Link ${selectedA.name} & ${selectedB.name} as a couple?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pair them',
          onPress: createPairing,
        },
      ]
    );
  };

  const createPairing = async () => {
    try {
      const list = await dataStore.getCouplePairings();
      const now = new Date().toISOString();
      const newPairing = {
        id: `cp_${Date.now().toString(36)}`,
        partnerAId: selectedA.id,
        partnerBId: selectedB.id,
        inviteCode: null,
        status: 'active',
        createdAt: now,
        pairedAt: now,
        createdBy: 'admin',
      };
      await dataStore.setCouplePairings([...(list || []), newPairing]);
      reset();
      await load();
      Alert.alert('Pairing created', 'The couple has been linked.');
    } catch (e) {
      console.log('[AdminPairCouple] create', e);
      Alert.alert('Error', 'Could not create the pairing.');
    }
  };

  const activePairings = useMemo(
    () =>
      (pairings || [])
        .filter((p) => p.status === 'active')
        .map((p) => ({
          ...p,
          a: users[p.partnerAId],
          b: users[p.partnerBId],
        })),
    [pairings, users]
  );

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
          <Text style={styles.eyebrow}>COUPLES MODULE</Text>
          <Text style={styles.headerTitle}>Pair a Couple</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Selection preview */}
        <View style={styles.previewCard}>
          <View style={styles.previewRow}>
            <SlotPreview slot="A" user={selectedA} />
            <View style={styles.previewDivider}>
              <Text style={styles.previewAmp}>&</Text>
            </View>
            <SlotPreview slot="B" user={selectedB} />
          </View>
          <View style={styles.previewActions}>
            <TouchableOpacity
              style={[styles.previewBtn, styles.previewBtnSecondary]}
              onPress={reset}
              disabled={!selectedA && !selectedB}
              activeOpacity={0.85}
            >
              <Text style={styles.previewBtnSecondaryText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.previewBtn,
                styles.previewBtnPrimary,
                (!selectedA || !selectedB) && styles.previewBtnDisabled,
              ]}
              onPress={confirmPair}
              disabled={!selectedA || !selectedB}
              activeOpacity={0.85}
            >
              <Feather name="link" size={14} color={COLORS.white} />
              <Text style={styles.previewBtnPrimaryText}>Create Pairing</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator color={INK} />
          </View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>AVAILABLE PARTNERS</Text>
            <Text style={styles.sectionHint}>
              {unpaired.length === 0
                ? 'Every couples-role user is already paired.'
                : `${unpaired.length} couples-role user${
                    unpaired.length === 1 ? '' : 's'
                  } available to pair.`}
            </Text>

            {unpaired.length === 0 ? (
              <View style={styles.emptyCard}>
                <Feather name="users" size={28} color={COLORS.gray300} />
                <Text style={styles.emptyTitle}>All paired up</Text>
                <Text style={styles.emptyText}>
                  Create more users with role "couples" to add new pairings.
                </Text>
              </View>
            ) : (
              unpaired.map((u) => {
                const isA = selectedA?.id === u.id;
                const isB = selectedB?.id === u.id;
                const isSelected = isA || isB;
                return (
                  <TouchableOpacity
                    key={u.id}
                    style={[styles.userRow, isSelected && styles.userRowActive]}
                    onPress={() => pickPartner(u)}
                    activeOpacity={0.85}
                  >
                    <View
                      style={[
                        styles.userAvatar,
                        { backgroundColor: u.profileColor || BLUSH },
                      ]}
                    >
                      <Text style={styles.userAvatarEmoji}>
                        {u.avatar || '👤'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.userName}>{u.name}</Text>
                      <Text style={styles.userMeta}>
                        {u.email || 'No email'} · age {u.age || '—'}
                      </Text>
                    </View>
                    {isSelected ? (
                      <View style={styles.slotBadge}>
                        <Text style={styles.slotBadgeText}>{isA ? 'A' : 'B'}</Text>
                      </View>
                    ) : (
                      <Feather
                        name="circle"
                        size={20}
                        color={COLORS.gray300}
                      />
                    )}
                  </TouchableOpacity>
                );
              })
            )}

            {activePairings.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { marginTop: SPACING.xl }]}>
                  CURRENT PAIRINGS
                </Text>
                <Text style={styles.sectionHint}>
                  {activePairings.length} active couple
                  {activePairings.length === 1 ? '' : 's'}.
                </Text>
                {activePairings.map((p) => (
                  <View key={p.id} style={styles.pairingCard}>
                    <View style={styles.dualAvatars}>
                      <View
                        style={[
                          styles.userAvatar,
                          {
                            backgroundColor: p.a?.profileColor || BLUSH,
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                          },
                        ]}
                      >
                        <Text style={[styles.userAvatarEmoji, { fontSize: 18 }]}>
                          {p.a?.avatar || '👤'}
                        </Text>
                      </View>
                      <Text style={styles.pairingAmp}>&</Text>
                      <View
                        style={[
                          styles.userAvatar,
                          {
                            backgroundColor: p.b?.profileColor || BLUSH,
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                          },
                        ]}
                      >
                        <Text style={[styles.userAvatarEmoji, { fontSize: 18 }]}>
                          {p.b?.avatar || '👤'}
                        </Text>
                      </View>
                    </View>
                    <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                      <Text style={styles.pairingNames}>
                        {p.a?.name?.split(' ')[0] || 'Partner A'} &{' '}
                        {p.b?.name?.split(' ')[0] || 'Partner B'}
                      </Text>
                      <Text style={styles.pairingMeta}>
                        Linked{' '}
                        {p.pairedAt
                          ? new Date(p.pairedAt).toLocaleDateString()
                          : '—'}
                      </Text>
                    </View>
                    <View style={styles.activePill}>
                      <View style={styles.activeDot} />
                      <Text style={styles.activePillText}>ACTIVE</Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const SlotPreview = ({ slot, user }) => (
  <View style={styles.slotPreview}>
    <View
      style={[
        styles.slotAvatar,
        user
          ? { backgroundColor: user.profileColor || BLUSH }
          : { backgroundColor: COLORS.gray100 },
      ]}
    >
      {user ? (
        <Text style={styles.slotAvatarEmoji}>{user.avatar || '👤'}</Text>
      ) : (
        <Text style={styles.slotPlaceholder}>{slot}</Text>
      )}
    </View>
    <Text style={styles.slotLabel}>{user ? user.name?.split(' ')[0] : `Partner ${slot}`}</Text>
    {user ? (
      <Text style={styles.slotSub} numberOfLines={1}>
        {user.email || '—'}
      </Text>
    ) : (
      <Text style={styles.slotSub}>Tap a user below</Text>
    )}
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
    paddingBottom: SPACING.xl,
  },

  /* Preview */
  previewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    marginBottom: SPACING.lg,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  previewDivider: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
  },
  previewAmp: {
    fontSize: 28,
    color: COLORS.gray400,
    fontWeight: '300',
    fontStyle: 'italic',
  },
  slotPreview: { flex: 1, alignItems: 'center' },
  slotAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  slotAvatarEmoji: { fontSize: 30 },
  slotPlaceholder: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.gray400,
  },
  slotLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  slotSub: {
    fontSize: 10,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  previewActions: { flexDirection: 'row' },
  previewBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  previewBtnSecondary: {
    backgroundColor: COLORS.gray100,
    marginRight: SPACING.sm,
  },
  previewBtnSecondaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray600,
    letterSpacing: 0.2,
  },
  previewBtnPrimary: {
    backgroundColor: INK,
  },
  previewBtnDisabled: { opacity: 0.4 },
  previewBtnPrimaryText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.3,
    marginLeft: 6,
  },

  /* Section labels */
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
    marginBottom: 4,
    marginTop: SPACING.sm,
  },
  sectionHint: {
    fontSize: 12,
    color: COLORS.gray500,
    marginBottom: SPACING.md,
    fontWeight: '500',
  },

  loadingBlock: { padding: SPACING.xl, alignItems: 'center' },

  /* User row */
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  userRowActive: {
    borderColor: INK,
    backgroundColor: INK + '08',
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  userAvatarEmoji: { fontSize: 22 },
  userName: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.2,
  },
  userMeta: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
    marginTop: 1,
  },
  slotBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },

  /* Empty */
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: INK,
    marginTop: SPACING.md,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 17,
  },

  /* Pairings */
  pairingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  dualAvatars: { flexDirection: 'row', alignItems: 'center' },
  pairingAmp: {
    fontSize: 18,
    fontWeight: '300',
    color: COLORS.gray400,
    fontStyle: 'italic',
    marginHorizontal: 6,
  },
  pairingNames: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.2,
  },
  pairingMeta: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
    marginTop: 1,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: SUCCESS + '15',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SUCCESS,
    marginRight: 4,
  },
  activePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: SUCCESS,
    letterSpacing: 0.8,
  },
});
