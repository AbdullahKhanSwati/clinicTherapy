import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/colors';

const RESOURCES = [
  { id: 1, category: 'Anxiety', title: 'Understanding Anxiety Disorders', type: 'Article', duration: '8 min read', emoji: '😰' },
  { id: 2, category: 'Anxiety', title: 'Breathing Techniques for Panic', type: 'Video', duration: '5 min', emoji: '🌬️' },
  { id: 3, category: 'Depression', title: 'Cognitive Distortions Explained', type: 'Article', duration: '10 min read', emoji: '💭' },
  { id: 4, category: 'Depression', title: 'Building a Routine', type: 'Guide', duration: '15 min', emoji: '📋' },
  { id: 5, category: 'Sleep', title: 'Sleep Hygiene Tips', type: 'Article', duration: '6 min read', emoji: '😴' },
  { id: 6, category: 'Relationships', title: 'Healthy Communication Skills', type: 'Video', duration: '12 min', emoji: '💬' },
  { id: 7, category: 'Stress', title: 'Stress Management Techniques', type: 'Interactive', duration: '20 min', emoji: '🧘' },
  { id: 8, category: 'Self-Care', title: 'Daily Self-Care Checklist', type: 'Tool', duration: '5 min', emoji: '💪' },
];

const CATEGORIES = ['All', 'Anxiety', 'Depression', 'Sleep', 'Relationships', 'Stress', 'Self-Care'];

const TYPE_COLORS = {
  Article: { bg: '#E0F4FF', fg: '#0369A1' },
  Video: { bg: '#FFE4E6', fg: '#BE123C' },
  Guide: { bg: '#FEF3C7', fg: '#92400E' },
  Interactive: { bg: '#F3E8FF', fg: '#6D28D9' },
  Tool: { bg: '#D1FAE5', fg: '#047857' },
};

export default function ResourcesScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResources = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return RESOURCES.filter((r) => {
      const matchesCategory =
        selectedCategory === 'All' || r.category === selectedCategory;
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Sticky-ish header (outside the ScrollView padding so the chip strip can be edge-to-edge) */}
      <View style={styles.headerWrap}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Resources</Text>
          <View style={{ width: 50 }} />
        </View>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search resources..."
            placeholderTextColor={COLORS.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
              <Text style={styles.clearIcon}>×</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipStrip}
        >
          {CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            return (
              <TouchableOpacity
                key={category}
                activeOpacity={0.85}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.resultBar}>
          <Text style={styles.resultText}>
            {filteredResources.length} result{filteredResources.length === 1 ? '' : 's'}
            {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredResources.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyTitle}>No resources found</Text>
            <Text style={styles.emptyText}>
              Try a different category or clear your search
            </Text>
          </View>
        ) : (
          filteredResources.map((resource) => {
            const typeColors =
              TYPE_COLORS[resource.type] || { bg: COLORS.gray100, fg: COLORS.gray700 };
            return (
              <TouchableOpacity
                key={resource.id}
                activeOpacity={0.85}
                style={styles.resourceCard}
              >
                <View style={styles.cardLeft}>
                  <Text style={styles.resourceEmoji}>{resource.emoji}</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.resourceTitle} numberOfLines={2}>
                    {resource.title}
                  </Text>
                  <View style={styles.metaRow}>
                    <View
                      style={[styles.typeTag, { backgroundColor: typeColors.bg }]}
                    >
                      <Text
                        style={[styles.typeTagText, { color: typeColors.fg }]}
                      >
                        {resource.type}
                      </Text>
                    </View>
                    <Text style={styles.dot}>·</Text>
                    <Text style={styles.metaText}>{resource.category}</Text>
                    <Text style={styles.dot}>·</Text>
                    <Text style={styles.metaText}>{resource.duration}</Text>
                  </View>
                </View>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },

  headerWrap: {
    backgroundColor: COLORS.white,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: { color: COLORS.primary, fontWeight: '600' },
  title: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
  },
  searchIcon: { fontSize: TYPOGRAPHY.base, marginRight: SPACING.sm },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray700,
  },
  clearIcon: {
    fontSize: 22,
    color: COLORS.gray500,
    paddingHorizontal: SPACING.sm,
    lineHeight: 22,
  },

  chipStrip: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  chipText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  chipTextActive: { color: COLORS.white },

  resultBar: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
  },
  resultText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
    fontWeight: '500',
  },

  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING['2xl'],
    gap: SPACING.md,
  },

  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    ...SHADOWS.sm,
  },
  cardLeft: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  resourceEmoji: { fontSize: 28 },
  cardBody: { flex: 1 },
  resourceTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  typeTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.xs,
  },
  typeTagText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  dot: { color: COLORS.gray400, marginHorizontal: 4, fontSize: TYPOGRAPHY.xs },
  metaText: { fontSize: TYPOGRAPHY.xs, color: COLORS.gray500 },
  arrow: {
    fontSize: TYPOGRAPHY.xl,
    color: COLORS.gray400,
    marginLeft: SPACING.sm,
    fontWeight: '600',
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['3xl'],
  },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.lg },
  emptyTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
    textAlign: 'center',
  },
});
