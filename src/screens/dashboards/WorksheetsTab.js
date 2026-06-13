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
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/colors';
import { listMyAssignments, listWorksheets } from '../../services/api';
import TabScreenHeader from '../../components/TabScreenHeader';

const STATUS_LABEL = {
  not_started: 'New',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export default function WorksheetsTab({ navigation }) {
  const [assignments, setAssignments] = useState([]);
  const [worksheetsById, setWorksheetsById] = useState({});
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          setLoading(true);
          const [list, ws] = await Promise.all([
            listMyAssignments(),
            listWorksheets(),
          ]);
          if (cancelled) return;
          setAssignments(list || []);
          const map = {};
          (ws || []).forEach((w) => {
            map[w.id] = w;
          });
          setWorksheetsById(map);
        } catch (e) {
          console.log('[WorksheetsTab] load error', e);
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const openWorksheet = (a) => {
    const parent = navigation.getParent?.() || navigation;
    parent.navigate('Worksheet', {
      worksheetId: a.worksheetId,
      assignmentId: a.id,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TabScreenHeader title="My Worksheets" subtitle="Your therapeutic activities" />

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : assignments.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyText}>No worksheets assigned yet</Text>
          </View>
        ) : (
          assignments.map((a) => {
            const w = worksheetsById[a.worksheetId];
            if (!w) return null;
            const statusColor =
              a.status === 'completed'
                ? COLORS.success
                : a.status === 'in_progress'
                ? COLORS.warning
                : COLORS.gray500;
            return (
              <TouchableOpacity
                key={a.id}
                style={styles.card}
                onPress={() => openWorksheet(a)}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{w.title}</Text>
                    <Text style={styles.cardCategory}>{w.category}</Text>
                  </View>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: statusColor + '20', borderColor: statusColor },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: statusColor }]}>
                      {STATUS_LABEL[a.status] || 'New'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.desc}>{w.description}</Text>
                <Text style={styles.time}>{w.estimatedTime}</Text>
              </TouchableOpacity>
            );
          })
        )}
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
  center: { padding: SPACING['2xl'], alignItems: 'center' },
  empty: { padding: SPACING['2xl'], alignItems: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.md },
  emptyText: { fontSize: TYPOGRAPHY.base, color: COLORS.gray500 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  cardTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: 2,
  },
  cardCategory: { fontSize: TYPOGRAPHY.xs, color: COLORS.gray500 },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
  },
  badgeText: { fontSize: TYPOGRAPHY.xs, fontWeight: '600' },
  desc: { fontSize: TYPOGRAPHY.sm, color: COLORS.gray600, marginBottom: SPACING.sm },
  time: { fontSize: TYPOGRAPHY.xs, color: COLORS.gray500 },
});
