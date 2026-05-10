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
import { useFocusEffect } from '@react-navigation/native';
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from '../../constants/colors';
import dataStore from '../../utils/dataStore';
import { WORKSHEET_TEMPLATES } from '../../data/worksheetTemplates';
import TabScreenHeader from '../../components/TabScreenHeader';

const STATUS_PROGRESS = { pending: 0, 'in-progress': 50, completed: 100 };
const STATUS_LABEL = {
  pending: 'Not started',
  'in-progress': 'In progress',
  completed: 'Completed',
};

export default function HomeTab({ navigation }) {
  const [user, setUser] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          setLoading(true);
          await dataStore.initialize();
          const u = await dataStore.getCurrentUser();
          if (cancelled) return;
          setUser(u);
          if (u) {
            const all = await dataStore.getAssignmentsByClient(u.id);
            if (cancelled) return;
            setPending(all.filter((a) => a.status !== 'completed'));
          }
        } catch (e) {
          console.log('[HomeTab] load error', e);
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const QUICK_ACTIONS = [
    { id: 'mood', emoji: '😊', label: 'Check Mood', screen: 'MoodCheckIn' },
    { id: 'toolbox', emoji: '🧰', label: 'Coping Toolbox', screen: 'CopingToolbox' },
    { id: 'journal', emoji: '📔', label: 'Journal', screen: 'Journal' },
    { id: 'badges', emoji: '🏆', label: 'My Badges', screen: 'Badges' },
  ];

  const openWorksheet = (assignment) => {
    const parent = navigation.getParent?.() || navigation;
    parent.navigate('Worksheet', {
      worksheetId: assignment.worksheetId,
      assignmentId: assignment.id,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TabScreenHeader
          title={`Hi ${user?.name || 'Friend'}! 👋`}
          subtitle="What would you like to do today?"
        />

        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((a) => (
            <TouchableOpacity
              key={a.id}
              style={styles.actionCard}
              onPress={() => navigation.navigate(a.screen)}
            >
              <Text style={styles.actionEmoji}>{a.emoji}</Text>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📋 Pending Worksheets</Text>
          {pending.length > 0 && (
            <TouchableOpacity
              onPress={() => navigation.navigate('Worksheets')}
            >
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : pending.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={styles.emptyText}>No pending worksheets — great job!</Text>
          </View>
        ) : (
          pending.map((a) => {
            const w = WORKSHEET_TEMPLATES[a.worksheetId];
            if (!w) return null;
            const progress = STATUS_PROGRESS[a.status] ?? 0;
            const ctaLabel = a.status === 'in-progress' ? 'Continue' : 'Start';
            return (
              <TouchableOpacity
                key={a.id}
                activeOpacity={0.85}
                style={styles.worksheetCard}
                onPress={() => openWorksheet(a)}
              >
                <View style={styles.cardTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.worksheetTitle} numberOfLines={1}>
                      {w.title}
                    </Text>
                    <Text style={styles.worksheetMeta} numberOfLines={1}>
                      {w.category} · {w.estimatedTime}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      a.status === 'in-progress' && styles.statusBadgeInProgress,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        a.status === 'in-progress' && styles.statusTextInProgress,
                      ]}
                    >
                      {STATUS_LABEL[a.status]}
                    </Text>
                  </View>
                </View>

                <View style={styles.progressRow}>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${progress}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressLabel}>{progress}%</Text>
                </View>

                <View style={styles.ctaRow}>
                  <Text style={styles.ctaText}>{ctaLabel}</Text>
                  <Text style={styles.ctaArrow}>→</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>Today's Tip</Text>
          <Text style={styles.tipBody}>
            Take 3 deep breaths whenever you feel overwhelmed. In through your nose, out through your mouth.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  actionCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  actionEmoji: { fontSize: 36, marginBottom: SPACING.sm },
  actionLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.gray700,
    textAlign: 'center',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.gray700,
  },
  seeAll: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },

  loadingBlock: { padding: SPACING.lg, alignItems: 'center' },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  emptyEmoji: { fontSize: 36, marginBottom: SPACING.sm },
  emptyText: { fontSize: TYPOGRAPHY.sm, color: COLORS.gray500 },

  worksheetCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  worksheetTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: 2,
  },
  worksheetMeta: { fontSize: TYPOGRAPHY.xs, color: COLORS.gray500 },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    marginLeft: SPACING.sm,
  },
  statusBadgeInProgress: {
    backgroundColor: '#FFF4E0',
    borderColor: COLORS.warning,
  },
  statusText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  statusTextInProgress: { color: COLORS.warning },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginRight: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
  },
  progressLabel: {
    minWidth: 36,
    textAlign: 'right',
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    fontWeight: '600',
  },

  ctaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  ctaText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 4,
  },
  ctaArrow: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.primary,
  },

  tipCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    ...SHADOWS.sm,
  },
  tipTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  tipBody: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray600,
    lineHeight: 22,
  },
});
