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
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../constants/colors';
import dataStore from '../../utils/dataStore';
import { WORKSHEET_TEMPLATES } from '../../data/worksheetTemplates';
import { tryCatch } from '../../utils/safeOperations';

export default function WorksheetsTab({ navigation }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, completed

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    await tryCatch(async () => {
      setLoading(true);
      await dataStore.initialize();
      const user = await dataStore.getCurrentUser();

      if (user) {
        const userAssignments = await dataStore.getAssignmentsByClient(user.id);
        setAssignments(userAssignments || []);
      }
      setLoading(false);
    }, null);
  };

  const getFilteredAssignments = () => {
    if (filter === 'pending') return assignments.filter((a) => a.status !== 'completed');
    if (filter === 'completed') return assignments.filter((a) => a.status === 'completed');
    return assignments;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return COLORS.success;
      case 'in-progress':
        return COLORS.warning;
      default:
        return COLORS.accent5;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'in-progress':
        return '⏳';
      default:
        return '📋';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const filteredAssignments = getFilteredAssignments();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Worksheets</Text>
          <Text style={styles.subtitle}>
            {filteredAssignments.length} {filteredAssignments.length === 1 ? 'worksheet' : 'worksheets'}
          </Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {['all', 'pending', 'completed'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.filterTab,
                filter === tab && styles.filterTabActive,
              ]}
              onPress={() => setFilter(tab)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filter === tab && styles.filterTabTextActive,
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Worksheets List */}
        {filteredAssignments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyText}>No worksheets here yet!</Text>
            <Text style={styles.emptySubtext}>
              Check back soon for new assignments from your therapist
            </Text>
          </View>
        ) : (
          <View style={styles.worksheetsList}>
            {filteredAssignments.map((assignment, index) => {
              const worksheet = WORKSHEET_TEMPLATES[assignment.worksheetId];
              const statusColor = getStatusColor(assignment.status);
              const statusIcon = getStatusIcon(assignment.status);

              return (
                <TouchableOpacity
                  key={assignment.id}
                  style={[
                    styles.worksheetCard,
                    index === filteredAssignments.length - 1 && styles.worksheetCardLast,
                  ]}
                  onPress={() => navigation.navigate('Worksheet', { assignmentId: assignment.id })}
                  activeOpacity={0.7}
                >
                  <View style={styles.worksheetHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                      <Text style={[styles.statusIcon, { color: statusColor }]}>
                        {statusIcon}
                      </Text>
                    </View>
                    <View style={styles.worksheetInfo}>
                      <Text style={styles.worksheetTitle}>{worksheet?.title || 'Worksheet'}</Text>
                      <Text style={styles.worksheetDescription}>
                        {worksheet?.description || 'Complete this worksheet'}
                      </Text>
                    </View>
                    <Text style={styles.worksheetArrow}>→</Text>
                  </View>

                  <View style={styles.worksheetFooter}>
                    <View style={styles.progressContainer}>
                      <Text style={styles.progressLabel}>Progress</Text>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width:
                                assignment.status === 'completed'
                                  ? '100%'
                                  : assignment.status === 'in-progress'
                                    ? '60%'
                                    : '0%',
                              backgroundColor: statusColor,
                            },
                          ]}
                        />
                      </View>
                    </View>
                    <Text style={styles.dueDate}>
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  filterTab: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceAlt,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  filterTabTextActive: {
    color: COLORS.white,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING['3xl'],
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: SPACING.lg,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
    textAlign: 'center',
    maxWidth: 240,
  },
  worksheetsList: {
    gap: SPACING.md,
  },
  worksheetCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  worksheetCardLast: {
    marginBottom: 0,
  },
  worksheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statusBadge: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  statusIcon: {
    fontSize: 24,
    fontWeight: '600',
  },
  worksheetInfo: {
    flex: 1,
  },
  worksheetTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  worksheetDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
  },
  worksheetArrow: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.primary,
    marginLeft: SPACING.md,
  },
  worksheetFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    paddingTop: SPACING.lg,
    gap: SPACING.md,
  },
  progressContainer: {
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.gray200,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  dueDate: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    fontWeight: '500',
  },
});
