import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/colors';
import dataStore from '../utils/dataStore';

const ALL_BADGES = [
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Complete your first worksheet',
    icon: '👣',
    requirement: 1,
    progress: 1,
  },
  {
    id: 'consistent',
    name: 'Consistent',
    description: 'Complete worksheets for 7 days in a row',
    icon: '🔥',
    requirement: 7,
    progress: 5,
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Try 5 different types of worksheets',
    icon: '🗺️',
    requirement: 5,
    progress: 3,
  },
  {
    id: 'mood_master',
    name: 'Mood Master',
    description: 'Record mood check-ins for 14 days',
    icon: '📊',
    requirement: 14,
    progress: 8,
  },
  {
    id: 'journal_hero',
    name: 'Journal Hero',
    description: 'Write 10 journal entries',
    icon: '📔',
    requirement: 10,
    progress: 4,
  },
  {
    id: 'insight_seeker',
    name: 'Insight Seeker',
    description: 'Complete all reflection questions in 5 worksheets',
    icon: '💡',
    requirement: 5,
    progress: 2,
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Share your progress 3 times',
    icon: '🦋',
    requirement: 3,
    progress: 1,
  },
  {
    id: 'mindfulness_guru',
    name: 'Mindfulness Guru',
    description: 'Complete all mindfulness worksheets',
    icon: '🧘',
    requirement: 5,
    progress: 2,
  },
  {
    id: 'resilience',
    name: 'Resilience',
    description: 'Continue after 3 missed days',
    icon: '💪',
    requirement: 1,
    progress: 0,
  },
  {
    id: 'month_streak',
    name: 'Month Streak',
    description: '30 consecutive days of activity',
    icon: '⭐',
    requirement: 30,
    progress: 12,
  },
];

export default function BadgesScreen({ navigation }) {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      setLoading(true);
      await dataStore.initialize();
      setBadges(ALL_BADGES);
    } catch (error) {
      console.error('[v0] Error loading badges:', error);
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
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
