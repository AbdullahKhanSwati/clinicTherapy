import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useSafeGoBack from '../hooks/useSafeGoBack';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/colors';
import {
  listMyMoodEntries,
  listMyJournalEntries,
  listMyAssignments,
  listMyBadges,
} from '../services/api';

// Catalog of award-able badges. Each badge has a `compute(stats)` that returns
// the user's current progress (a number). When that meets/exceeds `requirement`
// the badge is considered earned. Stats come from the live DB.
const BADGE_CATALOG = [
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Complete your first worksheet',
    icon: '👣',
    requirement: 1,
    compute: (s) => s.completedCount,
  },
  {
    id: 'consistent',
    name: 'Consistent',
    description: 'Complete 7 worksheets',
    icon: '🔥',
    requirement: 7,
    compute: (s) => s.completedCount,
  },
  {
    id: 'mood_master',
    name: 'Mood Master',
    description: 'Record 14 mood check-ins',
    icon: '📊',
    requirement: 14,
    compute: (s) => s.moodCount,
  },
  {
    id: 'journal_hero',
    name: 'Journal Hero',
    description: 'Write 10 journal entries',
    icon: '📔',
    requirement: 10,
    compute: (s) => s.journalCount,
  },
  {
    id: 'insight_seeker',
    name: 'Insight Seeker',
    description: 'Complete 5 different worksheets',
    icon: '💡',
    requirement: 5,
    compute: (s) => s.completedDistinct,
  },
  {
    id: 'mood_streak_3',
    name: 'On a Roll',
    description: '3 mood check-ins in a row',
    icon: '⚡',
    requirement: 3,
    compute: (s) => s.moodStreak,
  },
  {
    id: 'month_active',
    name: 'Month Active',
    description: 'Any activity on 30 distinct days',
    icon: '⭐',
    requirement: 30,
    compute: (s) => s.activeDays,
  },
];

const distinctDays = (rows) => {
  const days = new Set();
  rows.forEach((r) => {
    const d = r.date || r.createdAt;
    if (!d) return;
    days.add(new Date(d).toDateString());
  });
  return days.size;
};

const computeMoodStreak = (moods) => {
  const days = new Set(moods.map((m) => new Date(m.date).toDateString()));
  let streak = 0;
  const cursor = new Date();
  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

export default function BadgesScreen({ navigation }) {
  const goBack = useSafeGoBack();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      setLoading(true);
      const [moods, journals, assigns, awarded] = await Promise.all([
        listMyMoodEntries(),
        listMyJournalEntries(),
        listMyAssignments(),
        listMyBadges(),
      ]);
      const completed = (assigns || []).filter((a) => a.status === 'completed');
      const stats = {
        moodCount: (moods || []).length,
        moodStreak: computeMoodStreak(moods || []),
        journalCount: (journals || []).length,
        completedCount: completed.length,
        completedDistinct: new Set(completed.map((a) => a.worksheetId)).size,
        activeDays: distinctDays([
          ...(moods || []),
          ...(journals || []),
          ...completed,
        ]),
      };
      const awardedIds = new Set((awarded || []).map((b) => b.badgeId));
      setBadges(
        BADGE_CATALOG.map((b) => {
          const progress = Math.min(b.compute(stats), b.requirement);
          return {
            ...b,
            progress: awardedIds.has(b.id) ? b.requirement : progress,
          };
        })
      );
    } catch (error) {
      console.error('[Badges] load error', error);
    } finally {
      setLoading(false);
    }
  };

  const earnedBadges = badges.filter(b => b.progress >= b.requirement);
  const inProgressBadges = badges.filter(
    b => b.progress < b.requirement && b.progress > 0
  );
  const lockedBadges = badges.filter(b => b.progress === 0);

  const BadgeItem = ({ badge, style }) => {
    const isEarned = badge.progress >= badge.requirement;
    const progressPercent = (badge.progress / badge.requirement) * 100;

    return (
      <TouchableOpacity
        style={[styles.badgeContainer, style]}
        onPress={() => setSelectedBadge(badge)}
      >
        <View style={[styles.badgeIcon, !isEarned && styles.badgeIconLocked]}>
          <Text style={styles.badgeEmoji}>{badge.icon}</Text>
        </View>
        <Text style={styles.badgeName}>{badge.name}</Text>
        {!isEarned && (
          <>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              {badge.progress}/{badge.requirement}
            </Text>
          </>
        )}
        {isEarned && <Text style={styles.earnedBadge}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Achievements</Text>
        </View>

        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <>
            {/* Stats Section */}
            <View style={styles.statsSection}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{earnedBadges.length}</Text>
                <Text style={styles.statLabel}>Earned</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{inProgressBadges.length}</Text>
                <Text style={styles.statLabel}>In Progress</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{lockedBadges.length}</Text>
                <Text style={styles.statLabel}>Locked</Text>
              </View>
            </View>

            {/* Earned Badges */}
            {earnedBadges.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Earned Badges</Text>
                <View style={styles.badgeGrid}>
                  {earnedBadges.map((badge, idx) => (
                    <BadgeItem key={badge.id} badge={badge} />
                  ))}
                </View>
              </View>
            )}

            {/* In Progress Badges */}
            {inProgressBadges.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>In Progress</Text>
                <View style={styles.badgeGrid}>
                  {inProgressBadges.map((badge, idx) => (
                    <BadgeItem key={badge.id} badge={badge} />
                  ))}
                </View>
              </View>
            )}

            {/* Locked Badges */}
            {lockedBadges.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Locked Badges</Text>
                <View style={styles.badgeGrid}>
                  {lockedBadges.map((badge, idx) => (
                    <BadgeItem key={badge.id} badge={badge} />
                  ))}
                </View>
              </View>
            )}

            {/* Selected Badge Details */}
            {selectedBadge && (
              <View style={styles.detailsOverlay}>
                <TouchableOpacity
                  style={styles.overlayBackground}
                  onPress={() => setSelectedBadge(null)}
                />
                <View style={styles.detailsCard}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setSelectedBadge(null)}
                  >
                    <Text style={styles.closeText}>✕</Text>
                  </TouchableOpacity>
                  <Text style={styles.detailsEmoji}>{selectedBadge.icon}</Text>
                  <Text style={styles.detailsName}>{selectedBadge.name}</Text>
                  <Text style={styles.detailsDescription}>
                    {selectedBadge.description}
                  </Text>
                  {selectedBadge.progress < selectedBadge.requirement && (
                    <>
                      <View style={styles.detailsProgressBar}>
                        <View
                          style={[
                            styles.detailsProgressFill,
                            {
                              width: `${(selectedBadge.progress / selectedBadge.requirement) * 100}%`,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.detailsProgress}>
                        {selectedBadge.progress} of {selectedBadge.requirement} completed
                      </Text>
                    </>
                  )}
                  {selectedBadge.progress >= selectedBadge.requirement && (
                    <View style={styles.earnedBanner}>
                      <Text style={styles.earnedBannerText}>Badge Earned!</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  backButton: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    marginRight: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '700',
    color: COLORS.gray900,
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  statsSection: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  statNumber: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray600,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.md,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  badgeContainer: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  badgeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primaryLighter,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  badgeIconLocked: {
    backgroundColor: COLORS.gray100,
    opacity: 0.6,
  },
  badgeEmoji: {
    fontSize: 24,
  },
  badgeName: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
    color: COLORS.gray700,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.gray200,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
  },
  earnedBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: COLORS.success,
    color: COLORS.white,
    borderRadius: 10,
    width: 20,
    height: 20,
    textAlign: 'center',
    lineHeight: 20,
    fontSize: TYPOGRAPHY.xs,
    fontWeight: 'bold',
  },
  detailsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    width: '85%',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.gray400,
  },
  detailsEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  detailsName: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  detailsDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  detailsProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.gray200,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  detailsProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  detailsProgress: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray600,
    marginBottom: SPACING.md,
  },
  earnedBanner: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    width: '100%',
  },
  earnedBannerText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.base,
    textAlign: 'center',
  },
});
