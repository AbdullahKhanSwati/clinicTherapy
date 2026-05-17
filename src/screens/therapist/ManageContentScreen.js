import React, { useState, useCallback, useMemo } from 'react';
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
import dataStore from '../../utils/dataStore';
import { WORKSHEET_TEMPLATES } from '../../data/worksheetTemplates';

const INK = '#1A2332';
const ACCENT = COLORS.primary;

const CONFIG = {
  worksheet: {
    title: 'Worksheets',
    eyebrow: 'WORKSHEET LIBRARY',
    createScreen: 'CreateWorksheet',
    accent: '#0891B2',
    primaryField: 'title',
    secondaryField: 'category',
    descriptionField: 'description',
    audienceField: 'targetAudience',
    showAssign: true,
  },
  affirmation: {
    title: 'Affirmations',
    eyebrow: 'AFFIRMATION LIBRARY',
    createScreen: 'CreateAffirmation',
    accent: '#D4536B',
    primaryField: 'text',
    secondaryField: 'category',
    audienceField: 'audience',
  },
  copingTool: {
    title: 'Coping Tools',
    eyebrow: 'COPING TOOLBOX',
    createScreen: 'CreateCopingTool',
    accent: '#15803D',
    primaryField: 'title',
    secondaryField: 'type',
    descriptionField: 'description',
    audienceField: 'audience',
  },
  resource: {
    title: 'Resources',
    eyebrow: 'RESOURCE LIBRARY',
    createScreen: 'CreateResource',
    accent: '#D97706',
    primaryField: 'title',
    secondaryField: 'type',
    descriptionField: 'description',
    audienceField: 'audience',
  },
  dateIdea: {
    title: 'Date Ideas',
    eyebrow: 'COUPLES CONTENT',
    createScreen: 'CreateDateIdea',
    accent: '#9333EA',
    primaryField: 'title',
    secondaryField: 'tag',
    descriptionField: 'description',
  },
};

const AUDIENCE_COLORS = {
  all: COLORS.gray500,
  child: '#9333EA',
  teen: '#0891B2',
  couples: '#D4536B',
  family: '#15803D',
};

export default function ManageContentScreen({ route, navigation }) {
  const contentType = route?.params?.contentType || 'affirmation';
  const config = CONFIG[contentType] || CONFIG.affirmation;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      await dataStore.initialize();
      let data = [];
      if (contentType === 'worksheet') {
        const customWs = await dataStore.getCustomWorksheets();
        data = [...Object.values(WORKSHEET_TEMPLATES), ...(customWs || [])];
      } else if (contentType === 'affirmation') {
        data = await dataStore.getAffirmations();
      } else if (contentType === 'copingTool') {
        data = await dataStore.getCopingTools();
      } else if (contentType === 'resource') {
        data = await dataStore.getResources();
      } else if (contentType === 'dateIdea') {
        data = await dataStore.getDateIdeas();
      }
      setItems(data || []);
    } catch (e) {
      console.log('[ManageContent] load error', e);
    } finally {
      setLoading(false);
    }
  }, [contentType]);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  const handleDelete = (item) => {
    // Built-in templates (non-custom) can't be deleted
    if (contentType === 'worksheet' && !item.id.startsWith('ws_custom')) {
      Alert.alert(
        'Cannot delete',
        'Built-in worksheets are protected. Only custom worksheets you created can be deleted.'
      );
      return;
    }
    const labelValue = item[config.primaryField] || 'this item';
    Alert.alert(
      'Delete item?',
      `"${
        labelValue.length > 60 ? labelValue.slice(0, 60) + '...' : labelValue
      }" will be removed permanently.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (contentType === 'worksheet') {
                await dataStore.deleteCustomWorksheet(item.id);
              } else if (contentType === 'affirmation') {
                await dataStore.deleteAffirmation(item.id);
              } else if (contentType === 'copingTool') {
                await dataStore.deleteCopingTool(item.id);
              } else if (contentType === 'resource') {
                await dataStore.deleteResource(item.id);
              } else if (contentType === 'dateIdea') {
                await dataStore.deleteDateIdea(item.id);
              }
              loadItems();
            } catch (e) {
              console.log('[ManageContent] delete error', e);
              Alert.alert('Error', 'Failed to delete. Please try again.');
            }
          },
        },
      ]
    );
  };

  const openCreate = () => {
    navigation.navigate(config.createScreen);
  };

  const isBuiltInWorksheet = (item) =>
    contentType === 'worksheet' && !item.id.startsWith('ws_custom');

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
          <Text style={[styles.eyebrow, { color: config.accent }]}>
            {config.eyebrow}
          </Text>
          <Text style={styles.headerTitle}>{config.title}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: INK }]}
          onPress={openCreate}
          activeOpacity={0.85}
        >
          <Feather name="plus" size={14} color={COLORS.white} />
          <Text style={styles.addBtnText}>Create</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.totalBar}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalValue}>{items.length}</Text>
        </View>

        {loading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator color={INK} />
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="inbox" size={32} color={COLORS.gray300} />
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptyText}>
              Tap "Create" above to add your first {config.title.toLowerCase()}.
            </Text>
            <TouchableOpacity
              style={[styles.emptyCta, { backgroundColor: config.accent }]}
              onPress={openCreate}
              activeOpacity={0.85}
            >
              <Feather name="plus" size={14} color={COLORS.white} />
              <Text style={styles.emptyCtaText}>Create new</Text>
            </TouchableOpacity>
          </View>
        ) : (
          items.map((item) => {
            const primary = item[config.primaryField] || 'Untitled';
            const secondary = config.secondaryField
              ? item[config.secondaryField]
              : null;
            const description = config.descriptionField
              ? item[config.descriptionField]
              : null;
            const audience = config.audienceField
              ? item[config.audienceField]
              : null;
            const builtIn = isBuiltInWorksheet(item);
            return (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemTopRow}>
                  {secondary ? (
                    <Text
                      style={[styles.itemCategory, { color: config.accent }]}
                    >
                      {String(secondary).toUpperCase()}
                    </Text>
                  ) : (
                    <View />
                  )}
                  {builtIn && (
                    <View style={styles.builtInBadge}>
                      <Text style={styles.builtInText}>BUILT-IN</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.itemTitle} numberOfLines={3}>
                  {primary}
                </Text>
                {description ? (
                  <Text style={styles.itemDescription} numberOfLines={2}>
                    {description}
                  </Text>
                ) : null}

                <View style={styles.itemMeta}>
                  {audience ? (
                    <View
                      style={[
                        styles.audienceTag,
                        {
                          backgroundColor:
                            (AUDIENCE_COLORS[audience] || COLORS.gray500) +
                            '15',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.audienceTagText,
                          {
                            color: AUDIENCE_COLORS[audience] || COLORS.gray500,
                          },
                        ]}
                      >
                        {String(audience).toUpperCase()}
                      </Text>
                    </View>
                  ) : null}
                  {item.estimatedTime ? (
                    <Text style={styles.metaText}>{item.estimatedTime}</Text>
                  ) : null}
                  {item.duration ? (
                    <Text style={styles.metaText}>{item.duration}</Text>
                  ) : null}
                </View>

                <View style={styles.itemActions}>
                  {config.showAssign && (
                    <TouchableOpacity
                      style={styles.itemActionBtn}
                      onPress={() =>
                        navigation.navigate('AssignWorksheet', {
                          worksheetId: item.id,
                        })
                      }
                      activeOpacity={0.7}
                    >
                      <Feather name="send" size={13} color={INK} />
                      <Text style={styles.itemActionText}>Assign</Text>
                    </TouchableOpacity>
                  )}
                  <View style={{ flex: 1 }} />
                  {!builtIn && (
                    <TouchableOpacity
                      style={styles.itemActionBtn}
                      onPress={() => handleDelete(item)}
                      activeOpacity={0.7}
                    >
                      <Feather name="trash-2" size={13} color={COLORS.error} />
                      <Text
                        style={[styles.itemActionText, { color: COLORS.error }]}
                      >
                        Delete
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}

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
    letterSpacing: 1.4,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.5,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  addBtnText: {
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

  totalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
  },
  totalValue: {
    fontSize: 13,
    fontWeight: '800',
    color: INK,
  },

  loadingBlock: { padding: SPACING.xl, alignItems: 'center' },

  /* Empty */
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.md,
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
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  emptyCtaText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
    letterSpacing: 0.2,
  },

  /* Item card */
  itemCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  itemCategory: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  builtInBadge: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  builtInText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.gray500,
    letterSpacing: 0.6,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: INK,
    marginBottom: 4,
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  itemDescription: {
    fontSize: 12,
    color: COLORS.gray500,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
  },
  audienceTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: 6,
  },
  audienceTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  metaText: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
    marginRight: 8,
  },

  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  itemActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  itemActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: INK,
    marginLeft: 4,
    letterSpacing: 0.1,
  },
});
