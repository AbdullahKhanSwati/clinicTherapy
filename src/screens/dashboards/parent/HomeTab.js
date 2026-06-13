import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, DrawerActions } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
} from '../../../constants/colors';
import { useAuth } from '../../../contexts/AuthContext';
import Avatar from '../../../components/Avatar';
import {
  getChildrenForParent,
  listMoodEntries,
  listNotesForParentChildren,
} from '../../../services/api';

const INK = '#1A2332';
const SAGE = '#15803D';
const CREAM = '#FAF7F2';

const MOOD_EMOJI = {
  happy: '😊', sad: '😢', angry: '😠', anxious: '😰',
  calm: '😌', excited: '🤩', confused: '😕', overwhelmed: '😩', okay: '🙂',
};

const PARENTING_TIPS = [
  'Listen first. Reply second.',
  'Name the feeling — it loses 30% of its power.',
  'Connection before correction.',
  'Calm parent, calm child.',
  'Praise the effort, not the outcome.',
];

export default function ParentHomeTab() {
  const navigation = useNavigation();
  const { profile: user } = useAuth();
  const [children, setChildren] = useState([]);
  const [therapistNotes, setTherapistNotes] = useState([]);
  const [recentMoods, setRecentMoods] = useState({});

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        if (!user?.id) return;
        try {
          const kids = await getChildrenForParent(user.id);
          if (cancelled) return;
          setChildren(kids || []);

          if ((kids || []).length === 0) {
            setRecentMoods({});
            setTherapistNotes([]);
            return;
          }

          // Latest mood per child + non-private therapist notes about kids
          const [perChildMoods, notes] = await Promise.all([
            Promise.all(
              kids.map(async (k) => {
                const list = await listMoodEntries(k.id);
                return [k.id, (list || [])[0] || null];
              })
            ),
            listNotesForParentChildren(user.id),
          ]);
          if (cancelled) return;

          const moodsMap = {};
          perChildMoods.forEach(([id, mood]) => { moodsMap[id] = mood; });
          setRecentMoods(moodsMap);

          // Parent should only see non-private notes
          const visible = (notes || []).filter((n) => !n.isPrivate);
          setTherapistNotes(visible.slice(0, 3));
        } catch (e) {
          console.log('[Parent HomeTab] load error', e);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [user?.id])
  );

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  const goToTab = (tabName) => {
    // Children/Insights/Profile are sibling tabs — bubble up to the tab nav.
    const parent = navigation.getParent?.() || navigation;
    parent.navigate(tabName);
  };

  const openChild = (childId) => {
    const parent = navigation.getParent?.() || navigation;
    parent.navigate('ChildDetail', { childId });
  };

  const userName = (user?.name || 'Parent').split(' ')[0];
  const hour = new Date().getHours();
  const greetingPrefix =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const dailyTip = PARENTING_TIPS[new Date().getDate() % PARENTING_TIPS.length];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={openDrawer}>
            <Feather name="menu" size={20} color={INK} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginHorizontal: SPACING.md }}>
            <Text style={styles.greetingSmall}>{greetingPrefix}</Text>
            <Text style={styles.greetingName}>{userName}</Text>
          </View>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Feather name="bell" size={20} color={INK} />
          </TouchableOpacity>
        </View>

        {/* Family overview hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroDecor} />
          <Text style={styles.heroLabel}>FAMILY OVERVIEW</Text>
          <Text style={styles.heroValue}>
            {children.length}
            <Text style={styles.heroSuffix}>
              {children.length === 1 ? ' child' : ' children'}
            </Text>
          </Text>
          <Text style={styles.heroSub}>
            {children.length === 0
              ? 'Your therapist will link your children soon.'
              : `Stay connected with ${
                  children.length === 1
                    ? (children[0]?.name?.split(' ')[0] || 'your child')
                    : 'your kids'
                } and their progress.`}
          </Text>
        </View>

        {/* Children mood row */}
        {children.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>TODAY'S PULSE</Text>
              <TouchableOpacity onPress={() => goToTab('Children')}>
                <Text style={styles.sectionAction}>See all</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.moodRow}>
              {children.map((c) => {
                const mood = recentMoods[c.id];
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.moodTile}
                    activeOpacity={0.85}
                    onPress={() => openChild(c.id)}
                  >
                    <Avatar
                      value={c.avatar}
                      name={c.name}
                      size={48}
                      backgroundColor={c.profileColor || SAGE}
                      emojiSize={24}
                      style={styles.moodAvatarStyle}
                    />
                    <Text style={styles.moodName} numberOfLines={1}>
                      {c.name?.split(' ')[0]}
                    </Text>
                    <Text style={styles.moodAge}>
                      {c.role === 'teen' ? 'Teen' : 'Child'}
                      {c.age ? ` · ${c.age}` : ''}
                    </Text>
                    {mood ? (
                      <Text style={styles.moodEmoji}>
                        {MOOD_EMOJI[mood.mood] || '🙂'}
                      </Text>
                    ) : (
                      <Text style={styles.moodEmojiPlaceholder}>—</Text>
                    )}
                    <Text style={styles.moodLabel}>
                      {mood ? mood.mood : 'No check-in yet'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* Quick actions */}
        <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
        <View style={styles.actionsRow}>
          <ActionCard
            icon="users"
            label="Children"
            sub="Their progress"
            onPress={() => goToTab('Children')}
          />
          <ActionCard
            icon="bar-chart-2"
            label="Insights"
            sub="Family trends"
            onPress={() => goToTab('Insights')}
          />
          <ActionCard
            icon="message-square"
            label="Notes"
            sub="From therapist"
            onPress={() => goToTab('Children')}
          />
        </View>

        {/* Therapist notes */}
        {therapistNotes.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>FROM YOUR THERAPIST</Text>
            {therapistNotes.map((note) => {
              const child = children.find((k) => k.id === note.clientId);
              return (
                <TouchableOpacity
                  key={note.id}
                  style={styles.noteCard}
                  onPress={() => child && openChild(child.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.noteHeader}>
                    <Text style={styles.noteAuthor}>
                      About {child?.name?.split(' ')[0] || 'your child'}
                    </Text>
                    <Text style={styles.noteCategory}>
                      {(note.category || 'note').toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.noteContent} numberOfLines={3}>
                    {note.body || note.content}
                  </Text>
                  <Text style={styles.noteDate}>
                    {new Date(note.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* Daily tip card */}
        <View style={styles.tipCard}>
          <Text style={styles.tipEyebrow}>PARENTING TIP OF THE DAY</Text>
          <Text style={styles.tipText}>"{dailyTip}"</Text>
        </View>

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const ActionCard = ({ icon, label, sub, onPress }) => (
  <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.85}>
    <View style={styles.actionIcon}>
      <Feather name={icon} size={18} color={INK} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
    <Text style={styles.actionSub}>{sub}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },

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

  /* Hero */
  heroCard: {
    backgroundColor: SAGE,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  heroDecor: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.sm,
  },
  heroValue: {
    fontSize: 44,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -1.5,
    marginBottom: 4,
  },
  heroSuffix: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  heroSub: {
    fontSize: 13,
    color: COLORS.white,
    opacity: 0.9,
    lineHeight: 19,
  },

  /* Sections */
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
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  sectionAction: {
    fontSize: 12,
    fontWeight: '700',
    color: SAGE,
  },

  /* Mood tiles */
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  moodTile: {
    width: '48.5%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  moodAvatarStyle: { marginBottom: SPACING.sm },
  moodName: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.2,
  },
  moodAge: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '600',
    marginTop: 2,
  },
  moodEmoji: { fontSize: 32, marginTop: SPACING.sm },
  moodEmojiPlaceholder: {
    fontSize: 32,
    color: COLORS.gray300,
    marginTop: SPACING.sm,
  },
  moodLabel: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
    marginTop: 4,
    textTransform: 'capitalize',
  },

  /* Actions */
  actionsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xl,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.1,
  },
  actionSub: {
    fontSize: 10,
    color: COLORS.gray500,
    fontWeight: '500',
    marginTop: 2,
  },

  /* Therapist notes */
  noteCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    borderLeftWidth: 3,
    borderLeftColor: SAGE,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  noteAuthor: {
    fontSize: 13,
    fontWeight: '800',
    color: INK,
  },
  noteCategory: {
    fontSize: 9,
    fontWeight: '800',
    color: SAGE,
    letterSpacing: 0.8,
    backgroundColor: SAGE + '15',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  noteContent: {
    fontSize: 13,
    color: INK,
    lineHeight: 19,
    marginBottom: 6,
  },
  noteDate: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
  },

  /* Daily tip */
  tipCard: {
    backgroundColor: CREAM,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: '#EFE6D8',
  },
  tipEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: SAGE,
    letterSpacing: 1.4,
    marginBottom: SPACING.sm,
  },
  tipText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: INK,
    lineHeight: 24,
    fontStyle: 'italic',
  },
});
