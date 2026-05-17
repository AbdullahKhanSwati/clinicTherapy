import React, { useState, useCallback, useMemo } from 'react';
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
import dataStore from '../../../utils/dataStore';
import { WORKSHEET_TEMPLATES } from '../../../data/worksheetTemplates';

const INK = '#1A2332';
const ACCENT = COLORS.primary;

// Content categories the admin manages
const CONTENT_CATEGORIES = [
  {
    id: 'worksheets',
    label: 'Worksheets',
    description: 'Therapeutic exercises and prompts',
    icon: 'file-text',
    accent: '#0891B2',
    contentType: 'worksheet',
  },
  {
    id: 'affirmations',
    label: 'Affirmations',
    description: 'Daily statements for clients',
    icon: 'message-circle',
    accent: '#D4536B',
    contentType: 'affirmation',
  },
  {
    id: 'coping',
    label: 'Coping Tools',
    description: 'Toolbox exercises and techniques',
    icon: 'shield',
    accent: '#15803D',
    contentType: 'copingTool',
  },
  {
    id: 'resources',
    label: 'Resources',
    description: 'Articles, videos, and references',
    icon: 'book-open',
    accent: '#D97706',
    contentType: 'resource',
  },
  {
    id: 'couples',
    label: 'Couples Content',
    description: 'Date ideas and partner exercises',
    icon: 'heart',
    accent: '#9333EA',
    contentType: 'dateIdea',
  },
];

export default function TherapistContentTab() {
  const navigation = useNavigation();
  const [counts, setCounts] = useState({
    worksheet: 0,
    affirmation: 0,
    copingTool: 0,
    resource: 0,
    dateIdea: 0,
  });
  const [recent, setRecent] = useState({
    worksheet: null,
    affirmation: null,
    copingTool: null,
    resource: null,
    dateIdea: null,
  });

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          await dataStore.initialize();
          const [
            affirmations,
            copingTools,
            resources,
            dateIdeas,
            customWorksheets,
          ] = await Promise.all([
            dataStore.getAffirmations(),
            dataStore.getCopingTools(),
            dataStore.getResources(),
            dataStore.getDateIdeas(),
            dataStore.getCustomWorksheets(),
          ]);
          if (cancelled) return;

          const allWorksheets = [
            ...Object.values(WORKSHEET_TEMPLATES),
            ...(customWorksheets || []),
          ];
          setCounts({
            worksheet: allWorksheets.length,
            affirmation: (affirmations || []).length,
            copingTool: (copingTools || []).length,
            resource: (resources || []).length,
            dateIdea: (dateIdeas || []).length,
          });

          const newest = (list, key = 'createdAt') =>
            list && list.length > 0
              ? [...list].sort(
                  (a, b) => new Date(b[key] || 0) - new Date(a[key] || 0)
                )[0]
              : null;

          setRecent({
            worksheet: newest(customWorksheets) || null,
            affirmation: newest(affirmations),
            copingTool: newest(copingTools),
            resource: newest(resources),
            dateIdea: newest(dateIdeas),
          });
        } catch (e) {
          console.log('[Therapist ContentTab] load error', e);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  const openManage = (cat) => {
    const parent = navigation.getParent?.() || navigation;
    parent.navigate('ManageContent', { contentType: cat.contentType });
  };

  const openCreate = (cat) => {
    const parent = navigation.getParent?.() || navigation;
    if (cat.contentType === 'worksheet') {
      parent.navigate('CreateWorksheet');
    } else if (cat.contentType === 'affirmation') {
      parent.navigate('CreateAffirmation');
    } else if (cat.contentType === 'copingTool') {
      parent.navigate('CreateCopingTool');
    } else if (cat.contentType === 'resource') {
      parent.navigate('CreateResource');
    } else if (cat.contentType === 'dateIdea') {
      parent.navigate('CreateDateIdea');
    }
  };

  const openAssign = () => {
    const parent = navigation.getParent?.() || navigation;
    parent.navigate('AssignWorksheet', { worksheetId: null });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.iconBtn} onPress={openDrawer}>
          <Feather name="menu" size={20} color={INK} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: SPACING.md }}>
          <Text style={styles.eyebrow}>CONTENT LIBRARY</Text>
          <Text style={styles.headerTitle}>Content</Text>
        </View>
        <TouchableOpacity
          style={styles.assignBtn}
          onPress={openAssign}
          activeOpacity={0.85}
        >
          <Feather name="send" size={14} color={COLORS.white} />
          <Text style={styles.assignBtnText}>Assign</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Snapshot */}
        <View style={styles.snapshotCard}>
          <Text style={styles.snapshotLabel}>CONTENT SNAPSHOT</Text>
          <View style={styles.snapshotRow}>
            <View style={styles.snapshotItem}>
              <Text style={styles.snapshotValue}>
                {counts.worksheet +
                  counts.affirmation +
                  counts.copingTool +
                  counts.resource +
                  counts.dateIdea}
              </Text>
              <Text style={styles.snapshotItemLabel}>TOTAL ITEMS</Text>
            </View>
            <View style={styles.snapshotDivider} />
            <View style={styles.snapshotItem}>
              <Text style={styles.snapshotValue}>{counts.worksheet}</Text>
              <Text style={styles.snapshotItemLabel}>WORKSHEETS</Text>
            </View>
            <View style={styles.snapshotDivider} />
            <View style={styles.snapshotItem}>
              <Text style={styles.snapshotValue}>{counts.resource}</Text>
              <Text style={styles.snapshotItemLabel}>RESOURCES</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>MANAGE CONTENT</Text>

        {CONTENT_CATEGORIES.map((cat) => {
          const count = counts[cat.contentType] || 0;
          const recentItem = recent[cat.contentType];
          return (
            <View key={cat.id} style={styles.categoryCard}>
              <TouchableOpacity
                style={styles.categoryRow}
                onPress={() => openManage(cat)}
                activeOpacity={0.85}
              >
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: cat.accent + '15' },
                  ]}
                >
                  <Feather name={cat.icon} size={20} color={cat.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.categoryTopRow}>
                    <Text style={styles.categoryLabel}>{cat.label}</Text>
                    <View style={styles.categoryCountBadge}>
                      <Text style={styles.categoryCountText}>{count}</Text>
                    </View>
                  </View>
                  <Text style={styles.categoryDescription}>
                    {cat.description}
                  </Text>
                  {recentItem ? (
                    <Text style={styles.categoryRecent} numberOfLines={1}>
                      Latest:{' '}
                      {recentItem.title || recentItem.text || 'untitled'}
                    </Text>
                  ) : null}
                </View>
                <Feather name="chevron-right" size={20} color={COLORS.gray400} />
              </TouchableOpacity>

              <View style={styles.categoryActions}>
                <TouchableOpacity
                  style={styles.categoryActionBtn}
                  onPress={() => openCreate(cat)}
                  activeOpacity={0.7}
                >
                  <Feather name="plus" size={14} color={INK} />
                  <Text style={styles.categoryActionText}>Create new</Text>
                </TouchableOpacity>
                <View style={styles.categoryActionDivider} />
                <TouchableOpacity
                  style={styles.categoryActionBtn}
                  onPress={() => openManage(cat)}
                  activeOpacity={0.7}
                >
                  <Feather name="list" size={14} color={INK} />
                  <Text style={styles.categoryActionText}>View all</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
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
    color: ACCENT,
    letterSpacing: 1.4,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.6,
  },
  assignBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INK,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  assignBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
    letterSpacing: 0.2,
  },

  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },

  /* Snapshot */
  snapshotCard: {
    backgroundColor: INK,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  snapshotLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: SPACING.md,
  },
  snapshotRow: { flexDirection: 'row' },
  snapshotItem: { flex: 1 },
  snapshotValue: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -1,
  },
  snapshotItemLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
    marginTop: 4,
  },
  snapshotDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 4,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
    marginBottom: SPACING.md,
  },

  /* Category card */
  categoryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    overflow: 'hidden',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  categoryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.3,
    flex: 1,
  },
  categoryCountBadge: {
    minWidth: 28,
    paddingHorizontal: 6,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.gray600,
    letterSpacing: -0.2,
  },
  categoryDescription: {
    fontSize: 12,
    color: COLORS.gray500,
    fontWeight: '500',
    marginBottom: 2,
  },
  categoryRecent: {
    fontSize: 11,
    color: COLORS.gray500,
    fontStyle: 'italic',
    marginTop: 2,
  },

  categoryActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  categoryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm + 2,
  },
  categoryActionDivider: {
    width: 1,
    backgroundColor: COLORS.gray100,
  },
  categoryActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: INK,
    marginLeft: 6,
    letterSpacing: 0.1,
  },
});
