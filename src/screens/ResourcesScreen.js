import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/colors';

const RESOURCES = [
  {
    id: 1,
    category: 'Anxiety',
    title: 'Understanding Anxiety Disorders',
    type: 'Article',
    duration: '8 min read',
    emoji: '😰',
  },
  {
    id: 2,
    category: 'Anxiety',
    title: 'Breathing Techniques for Panic',
    type: 'Video',
    duration: '5 min',
    emoji: '🌬️',
  },
  {
    id: 3,
    category: 'Depression',
    title: 'Cognitive Distortions Explained',
    type: 'Article',
    duration: '10 min read',
    emoji: '💭',
  },
  {
    id: 4,
    category: 'Depression',
    title: 'Building a Routine',
    type: 'Guide',
    duration: '15 min',
    emoji: '📋',
  },
  {
    id: 5,
    category: 'Sleep',
    title: 'Sleep Hygiene Tips',
    type: 'Article',
    duration: '6 min read',
    emoji: '😴',
  },
  {
    id: 6,
    category: 'Relationships',
    title: 'Healthy Communication Skills',
    type: 'Video',
    duration: '12 min',
    emoji: '💬',
  },
  {
    id: 7,
    category: 'Stress',
    title: 'Stress Management Techniques',
    type: 'Interactive',
    duration: '20 min',
    emoji: '🧘',
  },
  {
    id: 8,
    category: 'Self-Care',
    title: 'Daily Self-Care Checklist',
    type: 'Tool',
    duration: '5 min',
    emoji: '💪',
  },
];

const CATEGORIES = ['All', 'Anxiety', 'Depression', 'Sleep', 'Relationships', 'Stress', 'Self-Care'];

export default function ResourcesScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResources = RESOURCES.filter(resource => {
    const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory;
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Resources</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search resources..."
            placeholderTextColor={COLORS.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Text style={styles.searchIcon}>🔍</Text>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Resources List */}
        <View style={styles.resourcesContainer}>
          {filteredResources.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📚</Text>
              <Text style={styles.emptyTitle}>No resources found</Text>
              <Text style={styles.emptyText}>Try adjusting your search or category filter</Text>
            </View>
          ) : (
            filteredResources.map(resource => (
              <TouchableOpacity key={resource.id} style={styles.resourceCard}>
                <View style={styles.resourceHeader}>
                  <Text style={styles.resourceEmoji}>{resource.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <View style={styles.resourceTitleRow}>
                      <Text style={styles.resourceTitle}>{resource.title}</Text>
                      <View style={styles.typeTag}>
                        <Text style={styles.typeTagText}>{resource.type}</Text>
                      </View>
                    </View>
                    <Text style={styles.resourceCategory}>{resource.category}</Text>
                  </View>
                </View>
                <View style={styles.resourceFooter}>
                  <Text style={styles.duration}>⏱️ {resource.duration}</Text>
                  <Text style={styles.arrow}>→</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['2xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    marginBottom: SPACING.lg,
  },
  backButton: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingRight: 40,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray700,
  },
  searchIcon: {
    position: 'absolute',
    right: SPACING.lg,
    top: SPACING.md,
    fontSize: TYPOGRAPHY.lg,
  },
  categoriesContainer: {
    paddingHorizontal: 0,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  categoryChip: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.sm,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  categoryChipTextActive: {
    color: COLORS.white,
  },
  resourcesContainer: {
    gap: SPACING.md,
  },
  resourceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  resourceHeader: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  resourceEmoji: {
    fontSize: 28,
  },
  resourceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.xs,
  },
  resourceTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  typeTag: {
    backgroundColor: COLORS.primaryLighter,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  typeTagText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  resourceCategory: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
  },
  resourceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  duration: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray600,
  },
  arrow: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['3xl'],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.lg,
  },
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
