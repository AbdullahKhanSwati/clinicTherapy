import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, DrawerActions } from '@react-navigation/native';
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from '../../../constants/colors';
import { useAuth } from '../../../contexts/AuthContext';
import Avatar from '../../../components/Avatar';
import {
  listMyAssignments,
  listMyMoodEntries,
  listMoodEntries,
  listWorksheets,
  listMyNotifications,
  getActivePairingForUser,
  getPartnerProfileForUser,
  listPartnerCheckinsForUser,
  getLatestPartnerCheckinForUser,
  listRepairRequestsForUser,
  listAppreciationsForUser,
} from '../../../services/api';

// Refined warm palette layered on top of brand tokens
const BLUSH = '#D4536B';        // refined, muted rose accent
const BLUSH_SOFT = '#F7E8EC';   // subtle background tint
const CREAM = '#FAF7F2';        // editorial cream
const INK = '#1A2332';          // deep navy ink

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

const MOOD_EMOJIS = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  anxious: '😰',
  calm: '😌',
  excited: '🤩',
  confused: '😕',
  overwhelmed: '😩',
  okay: '🙂',
};

const MOOD_LABEL = {
  happy: 'Happy',
  sad: 'Reflective',
  angry: 'Frustrated',
  anxious: 'Anxious',
  calm: 'Calm',
  excited: 'Excited',
  confused: 'Uncertain',
  overwhelmed: 'Overwhelmed',
  okay: 'Steady',
};

const QUESTIONS = [
  'What is one thing your partner did this week that made you feel loved?',
  'What is a small habit you appreciate about each other?',
  'When did you last feel most connected? What were you doing?',
  'What is one dream you would love to chase together this year?',
  'What does "feeling safe" mean to you in this relationship?',
  'What is a way your partner makes ordinary moments better?',
  'What is one thing you are grateful for about your partner today?',
];

const isToday = (iso) => {
  if (!iso) return false;
  const d = new Date(iso);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
};

const toDayKey = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};
const dayKeyOf = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

const computeStreak = (checkins) => {
  const days = new Set(
    (checkins || []).map((c) => toDayKey(c.date || c.createdAt)).filter(Boolean)
  );
  let streak = 0;
  const cursor = new Date();
  while (days.has(dayKeyOf(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

const computeBondScore = ({
  myCheckin,
  partnerCheckin,
  appreciations,
  repairs,
}) => {
  // Lightweight wellness index from real data.
  // - Average of latest mood, connection, inverted-stress across both
  //   partners' newest check-ins (0–10 → 0–100 each).
  // - Boost for appreciations exchanged in the last 14 days.
  // - Small penalty for unresolved repair requests.
  let parts = [];
  const fold = (c) => {
    if (!c) return;
    if (typeof c.mood === 'number') parts.push((c.mood / 10) * 100);
    if (typeof c.connection === 'number') parts.push((c.connection / 10) * 100);
    if (typeof c.stress === 'number') parts.push(((10 - c.stress) / 10) * 100);
  };
  fold(myCheckin);
  fold(partnerCheckin);
  if (parts.length === 0) return null;
  let score = parts.reduce((s, n) => s + n, 0) / parts.length;
  const recentApps = (appreciations || []).filter(
    (a) => Date.now() - new Date(a.createdAt).getTime() < 14 * 86400000
  );
  score += Math.min(10, recentApps.length * 1.5);
  const openRepairs = (repairs || []).filter((r) => r.status === 'sent').length;
  score -= openRepairs * 4;
  return Math.max(0, Math.min(100, Math.round(score)));
};

export default function CouplesHomeTab() {
  const navigation = useNavigation();
  const { profile: user } = useAuth();
  const [partner, setPartner] = useState(null);
  const [pairing, setPairing] = useState(null);
  const [userMood, setUserMood] = useState(null);
  const [partnerMood, setPartnerMood] = useState(null);
  const [pending, setPending] = useState([]);
  const [worksheetsById, setWorksheetsById] = useState({});
  const [userCheckin, setUserCheckin] = useState(null);
  const [partnerCheckin, setPartnerCheckin] = useState(null);
  const [pendingRepair, setPendingRepair] = useState(null);
  const [latestAppreciation, setLatestAppreciation] = useState(null);
  const [appreciations, setAppreciations] = useState([]);
  const [myCheckins, setMyCheckins] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        if (!user?.id) return;
        try {
          setLoading(true);

          // Pairing + partner profile
          const p = await getActivePairingForUser(user.id);
          if (cancelled) return;
          setPairing(p);

          let partnerProfile = null;
          if (p) {
            const partnerId =
              p.partnerAId === user.id ? p.partnerBId : p.partnerAId;
            if (partnerId) {
              partnerProfile = await getPartnerProfileForUser(user.id);
            }
          }
          if (cancelled) return;
          setPartner(partnerProfile);

          // My data
          const [myMoods, all, worksheets, myCheckinsList, repairs, apprs, notifs] =
            await Promise.all([
              listMyMoodEntries(),
              listMyAssignments(),
              listWorksheets(),
              listPartnerCheckinsForUser(user.id),
              listRepairRequestsForUser(user.id),
              listAppreciationsForUser(user.id),
              listMyNotifications(),
            ]);
          if (cancelled) return;

          setUserMood((myMoods || [])[0] || null);
          setPending((all || []).filter((a) => a.status !== 'completed'));
          const map = {};
          (worksheets || []).forEach((w) => { map[w.id] = w; });
          setWorksheetsById(map);
          setMyCheckins(myCheckinsList || []);
          setUserCheckin((myCheckinsList || [])[0] || null);
          setAppreciations(apprs || []);
          setUnreadCount((notifs || []).filter((n) => !n.readAt).length);

          // Incoming, still-unacknowledged repair
          setPendingRepair(
            (repairs || []).find(
              (r) => r.toUserId === user.id && r.status === 'sent'
            ) || null
          );

          // Latest appreciation received
          setLatestAppreciation(
            (apprs || []).find((a) => a.toUserId === user.id) || null
          );

          // Partner-specific data (only when paired)
          if (partnerProfile) {
            const [pMoods, pLatestCheckin] = await Promise.all([
              listMoodEntries(partnerProfile.id),
              getLatestPartnerCheckinForUser(partnerProfile.id),
            ]);
            if (cancelled) return;
            setPartnerMood((pMoods || [])[0] || null);
            setPartnerCheckin(pLatestCheckin || null);
          } else {
            setPartnerMood(null);
            setPartnerCheckin(null);
          }
        } catch (e) {
          console.log('[Couples HomeTab] load error', e);
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [user?.id])
  );

  const isPaired = !!partner;

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  const openWorksheet = (a) => {
    const parent = navigation.getParent?.() || navigation;
    parent.navigate('Worksheet', {
      worksheetId: a.worksheetId,
      assignmentId: a.id,
    });
  };

  const openParent = (screen, params) => {
    const parent = navigation.getParent?.() || navigation;
    parent.navigate(screen, params);
  };

  const userName = (user?.name || 'Friend').split(' ')[0];
  const partnerName = (partner?.name || 'Partner').split(' ')[0];

  const hour = new Date().getHours();
  const greetingPrefix =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const dailyQuestion = QUESTIONS[new Date().getDate() % QUESTIONS.length];

  const daysTogether = pairing?.pairedAt
    ? Math.max(
        1,
        Math.floor((Date.now() - new Date(pairing.pairedAt).getTime()) / 86400000)
      )
    : 0;
  const streak = computeStreak(myCheckins);
  const bondScore = computeBondScore({
    myCheckin: userCheckin,
    partnerCheckin,
    appreciations,
    repairs: [], // already accounted for in pendingRepair
  });

  const QUICK_ACTIONS = [
    {
      id: 'checkin',
      label: 'Daily Check-In',
      sub: 'Mood · Connection · Stress',
      mark: '01',
      onPress: () => openParent('DailyCheckIn'),
      variant: 'dark',
    },
    {
      id: 'appreciation',
      label: 'Appreciation',
      sub: 'Send a daily note',
      mark: '02',
      onPress: () => openParent('AppreciationExchange'),
      variant: 'cream',
    },
    {
      id: 'pause',
      label: 'We Need a Pause',
      sub: 'Reset during conflict',
      mark: '03',
      onPress: () => openParent('ConflictPause'),
      variant: 'accent',
    },
    {
      id: 'repair',
      label: 'Repair Request',
      sub: 'Reach for reconnection',
      mark: '04',
      onPress: () => openParent('RepairRequest'),
      variant: 'light',
    },
  ];

  const getTileStyle = (variant) => {
    switch (variant) {
      case 'dark':
        return { bg: INK, fg: COLORS.white, mark: 'rgba(255,255,255,0.4)' };
      case 'cream':
        return { bg: CREAM, fg: INK, mark: COLORS.gray400 };
      case 'accent':
        return { bg: BLUSH, fg: COLORS.white, mark: 'rgba(255,255,255,0.5)' };
      case 'light':
      default:
        return { bg: COLORS.surface, fg: INK, mark: COLORS.gray400 };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={openDrawer}>
            <Text style={styles.iconBtnText}>☰</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, marginHorizontal: SPACING.md }}>
            <Text style={styles.greetingSmall}>{greetingPrefix}</Text>
            <Text style={styles.greetingName}>{userName}</Text>
          </View>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.iconBtnText}>◔</Text>
            {unreadCount > 0 && <View style={styles.notifDot} />}
          </TouchableOpacity>
        </View>

        {/* Connection card — refined editorial style */}
        <View style={styles.connectionCard}>
          <View style={styles.connectionAvatars}>
            <View style={styles.avatarBubbleWrap}>
              <Avatar
                value={user?.avatar}
                name={user?.name}
                size={56}
                backgroundColor={user?.profileColor || COLORS.primary}
                emojiSize={26}
              />
              {user?.accessory && ACCESSORY_EMOJI[user.accessory] ? (
                <Text style={styles.accessoryBadge}>
                  {ACCESSORY_EMOJI[user.accessory]}
                </Text>
              ) : null}
            </View>
            <Text style={styles.ampersand}>&</Text>
            <View style={styles.avatarBubbleWrap}>
              <Avatar
                value={partner?.avatar}
                name={partner?.name}
                size={56}
                backgroundColor={partner?.profileColor || BLUSH}
                emojiSize={26}
              />
              {partner?.accessory && ACCESSORY_EMOJI[partner.accessory] ? (
                <Text style={styles.accessoryBadge}>
                  {ACCESSORY_EMOJI[partner.accessory]}
                </Text>
              ) : null}
            </View>
          </View>

          <Text style={styles.connectionPair}>
            {userName} <Text style={styles.connectionAmpInline}>&</Text> {partnerName}
          </Text>
          <Text style={styles.connectionMeta}>
            {isPaired
              ? `${daysTogether.toLocaleString()} day${daysTogether === 1 ? '' : 's'} paired`
              : 'Not yet paired'}
          </Text>

          <View style={styles.connectionStatRow}>
            <View style={styles.connectionStatItem}>
              <Text style={styles.connectionStatValue}>
                {bondScore == null ? '—' : bondScore}
              </Text>
              <Text style={styles.connectionStatLabel}>Bond</Text>
            </View>
            <View style={styles.connectionStatDivider} />
            <View style={styles.connectionStatItem}>
              <Text style={styles.connectionStatValue}>{pending.length}</Text>
              <Text style={styles.connectionStatLabel}>Active</Text>
            </View>
            <View style={styles.connectionStatDivider} />
            <View style={styles.connectionStatItem}>
              <Text style={styles.connectionStatValue}>{streak}</Text>
              <Text style={styles.connectionStatLabel}>Streak</Text>
            </View>
          </View>
        </View>

        {/* Pairing banner — only when not paired */}
        {!isPaired && !loading && (
          <TouchableOpacity
            style={styles.alertBanner}
            onPress={() => openParent('CouplePairing')}
            activeOpacity={0.85}
          >
            <View style={styles.alertIcon}>
              <Text style={styles.alertIconText}>⚭</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Link your partner</Text>
              <Text style={styles.alertSub}>
                Share check-ins, appreciations, and repair requests.
              </Text>
            </View>
            <Text style={styles.alertChev}>→</Text>
          </TouchableOpacity>
        )}

        {/* Pending repair banner */}
        {pendingRepair && (
          <TouchableOpacity
            style={[styles.alertBanner, styles.alertBannerRepair]}
            onPress={() => openParent('RepairRequest')}
            activeOpacity={0.85}
          >
            <View style={[styles.alertIcon, styles.alertIconRepair]}>
              <Text style={styles.alertIconText}>♥</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitleRepair}>Repair request waiting</Text>
              <Text style={styles.alertSub} numberOfLines={1}>
                "{pendingRepair.message}"
              </Text>
            </View>
            <Text style={[styles.alertChev, { color: '#D4536B' }]}>→</Text>
          </TouchableOpacity>
        )}

        {/* Today's check-in status — only if not completed today and paired */}
        {isPaired && !isToday(userCheckin?.date || userCheckin?.createdAt) && (
          <TouchableOpacity
            style={[styles.alertBanner, styles.alertBannerCheckin]}
            onPress={() => openParent('DailyCheckIn')}
            activeOpacity={0.85}
          >
            <View style={[styles.alertIcon, styles.alertIconCheckin]}>
              <Text style={styles.alertIconText}>◷</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Today's check-in is open</Text>
              <Text style={styles.alertSub}>
                {partnerCheckin && isToday(partnerCheckin.date || partnerCheckin.createdAt)
                  ? `${partnerName} already checked in. Your turn.`
                  : '2 minutes — mood, connection, stress.'}
              </Text>
            </View>
            <Text style={styles.alertChev}>→</Text>
          </TouchableOpacity>
        )}

        {/* Mood comparison */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>TODAY'S PULSE</Text>
          <TouchableOpacity onPress={() => openParent('DailyCheckIn')}>
            <Text style={styles.sectionAction}>Update</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.moodComparisonRow}>
          <TouchableOpacity
            style={styles.moodTile}
            onPress={() => navigation.navigate('MoodCheckIn')}
            activeOpacity={0.85}
          >
            <View style={styles.moodHeaderRow}>
              <Text style={styles.moodNameLabel}>YOU</Text>
              <View
                style={[
                  styles.moodAvatarDot,
                  { backgroundColor: user?.profileColor || COLORS.primary },
                ]}
              />
            </View>
            {userMood ? (
              <>
                <Text style={styles.moodEmojiLarge}>{MOOD_EMOJIS[userMood.mood] || '🙂'}</Text>
                <Text style={styles.moodStateLabel}>
                  {MOOD_LABEL[userMood.mood] || 'Steady'}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.moodEmojiPlaceholder}>+</Text>
                <Text style={styles.moodPlaceholderLabel}>Tap to log</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.moodTile}>
            <View style={styles.moodHeaderRow}>
              <Text style={styles.moodNameLabel} numberOfLines={1}>
                {partnerName.toUpperCase()}
              </Text>
              <View
                style={[
                  styles.moodAvatarDot,
                  { backgroundColor: partner?.profileColor || BLUSH },
                ]}
              />
            </View>
            {partnerMood ? (
              <>
                <Text style={styles.moodEmojiLarge}>{MOOD_EMOJIS[partnerMood.mood] || '🙂'}</Text>
                <Text style={styles.moodStateLabel}>
                  {MOOD_LABEL[partnerMood.mood] || 'Steady'}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.moodEmojiPlaceholder}>—</Text>
                <Text style={styles.moodPlaceholderLabel}>
                  {isPaired ? 'Not logged' : 'Not paired'}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Question of the Day — editorial cream */}
        <View style={styles.qotdCard}>
          <View style={styles.qotdHeader}>
            <Text style={styles.qotdEyebrow}>QUESTION OF THE DAY</Text>
            <Text style={styles.qotdDate}>
              {new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.qotdQuoteMark}>
            <Text style={styles.qotdQuoteMarkText}>"</Text>
          </View>
          <Text style={styles.qotdText}>{dailyQuestion}</Text>
          <View style={styles.qotdActions}>
            <TouchableOpacity
              style={styles.qotdBtnPrimary}
              onPress={() => navigation.navigate('Journal')}
              activeOpacity={0.85}
            >
              <Text style={styles.qotdBtnPrimaryText}>Answer Together</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.qotdBtnGhost} activeOpacity={0.7}>
              <Text style={styles.qotdBtnGhostText}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
        <View style={styles.bentoGrid}>
          {QUICK_ACTIONS.map((a) => {
            const s = getTileStyle(a.variant);
            return (
              <TouchableOpacity
                key={a.id}
                style={[styles.bentoTile, { backgroundColor: s.bg }]}
                onPress={a.onPress}
                activeOpacity={0.85}
              >
                <Text style={[styles.bentoMark, { color: s.mark }]}>{a.mark}</Text>
                <Text style={[styles.bentoLabel, { color: s.fg }]}>{a.label}</Text>
                <Text
                  style={[
                    styles.bentoSub,
                    { color: s.fg, opacity: s.fg === COLORS.white ? 0.7 : 0.55 },
                  ]}
                >
                  {a.sub}
                </Text>
                <View style={styles.bentoArrow}>
                  <Text
                    style={[
                      styles.bentoArrowText,
                      { color: s.fg, opacity: s.fg === COLORS.white ? 0.65 : 0.4 },
                    ]}
                  >
                    →
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Continue Together */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>CONTINUE TOGETHER</Text>
          {pending.length > 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('Together')}>
              <Text style={styles.sectionAction}>See all</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator size="small" color={BLUSH} />
          </View>
        ) : pending.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>All caught up</Text>
            <Text style={styles.emptyText}>
              No shared work right now. Use this moment to journal or plan your next session.
            </Text>
          </View>
        ) : (
          pending.slice(0, 2).map((a) => {
            const w = worksheetsById[a.worksheetId];
            if (!w) return null;
            const progress = a.progress ?? 0;
            const cta = a.status === 'in_progress' ? 'Continue' : 'Begin';
            return (
              <TouchableOpacity
                key={a.id}
                activeOpacity={0.9}
                style={styles.continueCard}
                onPress={() => openWorksheet(a)}
              >
                <View style={styles.continueTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.continueCategory}>
                      {(w.category || 'WORKSHEET').toUpperCase()}
                    </Text>
                    <Text style={styles.continueTitle} numberOfLines={1}>
                      {w.title}
                    </Text>
                    <Text style={styles.continueMeta}>{w.estimatedTime}</Text>
                  </View>
                  <View style={styles.continueProgressCircle}>
                    <Text style={styles.continueProgressCircleText}>{progress}%</Text>
                  </View>
                </View>
                <View style={styles.continueProgressTrack}>
                  <View
                    style={[styles.continueProgressFill, { width: `${progress}%` }]}
                  />
                </View>
                <View style={styles.continueFooter}>
                  <Text style={styles.continueCtaText}>{cta}</Text>
                  <Text style={styles.continueCtaArrow}>→</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* Latest received appreciation */}
        {latestAppreciation && (
          <View style={styles.reflectionCard}>
            <Text style={styles.reflectionEyebrow}>
              FROM {partnerName.toUpperCase()} · APPRECIATION
            </Text>
            <Text style={styles.reflectionText}>
              "{latestAppreciation.message || latestAppreciation.text}"
            </Text>
            <View style={styles.reflectionDivider} />
            <TouchableOpacity onPress={() => openParent('AppreciationExchange')}>
              <Text style={styles.reflectionAttribution}>
                Send one back →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
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
  iconBtnText: { fontSize: 18, color: INK, fontWeight: '600' },
  greetingSmall: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  greetingName: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.6,
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BLUSH,
  },

  /* Connection card */
  connectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  connectionAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarBubbleWrap: { position: 'relative' },
  accessoryBadge: {
    position: 'absolute',
    top: -6,
    right: -2,
    fontSize: 18,
  },
  ampersand: {
    fontSize: 24,
    fontWeight: '300',
    color: COLORS.gray400,
    fontStyle: 'italic',
    marginHorizontal: SPACING.lg,
  },
  connectionPair: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: INK,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  connectionAmpInline: {
    fontWeight: '300',
    fontStyle: 'italic',
    color: COLORS.gray500,
  },
  connectionMeta: {
    fontSize: 12,
    color: COLORS.gray500,
    marginBottom: SPACING.lg,
    fontWeight: '500',
  },
  connectionStatRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  connectionStatItem: { flex: 1, alignItems: 'center' },
  connectionStatValue: {
    fontSize: 24,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.5,
  },
  connectionStatLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.gray500,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  connectionStatDivider: {
    width: 1,
    backgroundColor: COLORS.gray100,
    marginVertical: 4,
  },

  /* Section labels */
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionAction: {
    fontSize: 12,
    fontWeight: '700',
    color: BLUSH,
    letterSpacing: 0.3,
  },

  /* Alert banners (pairing, repair, check-in) */
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    borderLeftWidth: 3,
    borderLeftColor: INK,
  },
  alertBannerRepair: {
    borderLeftColor: BLUSH,
    backgroundColor: '#FFF7F8',
  },
  alertBannerCheckin: {
    borderLeftColor: INK,
  },
  alertIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: INK + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  alertIconRepair: { backgroundColor: BLUSH + '15' },
  alertIconCheckin: { backgroundColor: COLORS.gray100 },
  alertIconText: {
    fontSize: 18,
    color: INK,
    fontWeight: '700',
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  alertTitleRepair: {
    fontSize: 13,
    fontWeight: '800',
    color: BLUSH,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  alertSub: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
    lineHeight: 15,
  },
  alertChev: {
    fontSize: 20,
    color: COLORS.gray400,
    fontWeight: '700',
    marginLeft: SPACING.sm,
  },

  /* Mood tiles */
  moodComparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  moodTile: {
    width: '48.5%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    minHeight: 140,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  moodHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  moodNameLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.2,
    flex: 1,
  },
  moodAvatarDot: { width: 8, height: 8, borderRadius: 4 },
  moodEmojiLarge: {
    fontSize: 38,
    marginBottom: SPACING.sm,
  },
  moodStateLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: INK,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  moodEmojiPlaceholder: {
    fontSize: 38,
    color: COLORS.gray300,
    marginBottom: SPACING.sm,
    fontWeight: '300',
  },
  moodPlaceholderLabel: {
    fontSize: 12,
    color: COLORS.gray400,
    fontWeight: '500',
  },

  /* Question of the day */
  qotdCard: {
    backgroundColor: CREAM,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: '#EFE6D8',
  },
  qotdHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  qotdEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: BLUSH,
  },
  qotdDate: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  qotdQuoteMark: {
    marginTop: SPACING.xs,
    marginBottom: -SPACING.md,
  },
  qotdQuoteMarkText: {
    fontSize: 48,
    color: BLUSH,
    fontWeight: '300',
    fontStyle: 'italic',
    opacity: 0.4,
    lineHeight: 40,
  },
  qotdText: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '500',
    color: INK,
    lineHeight: 28,
    marginBottom: SPACING.lg,
    letterSpacing: -0.3,
  },
  qotdActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qotdBtnPrimary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: INK,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.sm,
  },
  qotdBtnPrimaryText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  qotdBtnGhost: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  qotdBtnGhostText: {
    color: COLORS.gray500,
    fontWeight: '600',
    fontSize: 13,
  },

  /* Bento */
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  bentoTile: {
    width: '48.5%',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    minHeight: 130,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    position: 'relative',
  },
  bentoMark: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: SPACING.md,
  },
  bentoLabel: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  bentoSub: {
    fontSize: 12,
    fontWeight: '500',
  },
  bentoArrow: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
  },
  bentoArrowText: {
    fontSize: 18,
    fontWeight: '500',
  },

  /* Continue cards */
  loadingBlock: { padding: SPACING.lg, alignItems: 'center' },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: INK,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 20,
  },
  continueCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  continueTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  continueCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: BLUSH,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  continueTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: INK,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  continueMeta: { fontSize: 11, color: COLORS.gray500, fontWeight: '500' },
  continueProgressCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: BLUSH,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  continueProgressCircleText: {
    fontSize: 11,
    fontWeight: '800',
    color: BLUSH,
    letterSpacing: -0.2,
  },
  continueProgressTrack: {
    height: 3,
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  continueProgressFill: {
    height: '100%',
    backgroundColor: BLUSH,
    borderRadius: BORDER_RADIUS.full,
  },
  continueFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  continueCtaText: {
    fontSize: 13,
    fontWeight: '700',
    color: INK,
    marginRight: 6,
    letterSpacing: 0.2,
  },
  continueCtaArrow: { fontSize: 16, color: INK, fontWeight: '700' },

  /* Reflection / latest appreciation */
  reflectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  reflectionEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: BLUSH,
    marginBottom: SPACING.md,
  },
  reflectionText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '500',
    color: INK,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  reflectionDivider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginVertical: SPACING.md,
  },
  reflectionAttribution: {
    fontSize: 12,
    color: BLUSH,
    fontStyle: 'italic',
    fontWeight: '600',
  },
});
