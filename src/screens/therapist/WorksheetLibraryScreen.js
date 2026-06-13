import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/colors';
import { listWorksheets } from '../../services/api';

const DIFFICULTIES = ['All', 'beginner', 'intermediate', 'advanced'];

export default function WorksheetLibraryScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [allWorksheets, setAllWorksheets] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          setLoading(true);
          const list = await listWorksheets();
          if (!cancelled) setAllWorksheets(list || []);
        } catch (e) {
          console.log('[WorksheetLibrary] load error', e);
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  // Derive the category list from the actual worksheet catalog
  const CATEGORIES = useMemo(() => {
    const seen = new Set();
    allWorksheets.forEach((w) => {
      if (w.category) seen.add(w.category);
    });
    return ['All', ...Array.from(seen).sort()];
  }, [allWorksheets]);

  // Filter worksheets based on search and selections
  const filteredWorksheets = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return allWorksheets.filter(worksheet => {
      const matchesSearch =
        (worksheet.title || '').toLowerCase().includes(q) ||
        (worksheet.description || '').toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === 'All' || worksheet.category === selectedCategory;

      const matchesDifficulty =
        selectedDifficulty === 'All' || worksheet.difficulty === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [allWorksheets, searchQuery, selectedCategory, selectedDifficulty]);

  // Tapping a worksheet drops the therapist into the Assign flow with that
  // worksheet pre-selected. There is no separate WorksheetPreview screen yet.
  const handleSelectWorksheet = (worksheet) => {
    navigation.navigate('AssignWorksheet', {
      worksheetId: worksheet.id,
    });
  };

  const renderWorksheetCard = ({ item: worksheet }) => {
    const difficultyColor =
      worksheet.difficulty === 'beginner'
        ? COLORS.success
        : worksheet.difficulty === 'intermediate'
        ? COLORS.warning
        : COLORS.error;

    return (
      <TouchableOpacity
        style={styles.worksheetCard}
        onPress={() => handleSelectWorksheet(worksheet)}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.worksheetTitle}>{worksheet.title}</Text>
            <Text style={styles.worksheetCategory}>{worksheet.category}</Text>
          </View>
          <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor + '20' }]}>
            <Text style={[styles.difficultyText, { color: difficultyColor }]}>
              {worksheet.difficulty}
            </Text>
          </View>
        </View>

        <Text style={styles.worksheetDescription}>{worksheet.description}</Text>

        <View style={styles.cardFooter}>
          <Text style={styles.time}>⏱️ {worksheet.estimatedTime}</Text>
          <Text style={styles.audience}>👥 {worksheet.targetAudience}</Text>
          <TouchableOpacity
            style={styles.previewButton}
            onPress={() => handleSelectWorksheet(worksheet)}
          >
            <Text style={styles.previewButtonText}>Assign</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Worksheet Library</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search worksheets..."
            placeholderTextColor={COLORS.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Text style={styles.searchIcon}>🔍</Text>
        </View>

        {/* Category Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {CATEGORIES.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterChip,
                  selectedCategory === category && styles.filterChipActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedCategory === category && styles.filterChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Difficulty Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Difficulty</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {DIFFICULTIES.map(difficulty => (
              <TouchableOpacity
                key={difficulty}
                style={[
                  styles.filterChip,
                  selectedDifficulty === difficulty && styles.filterChipActive,
                ]}
                onPress={() => setSelectedDifficulty(difficulty)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedDifficulty === difficulty && styles.filterChipTextActive,
                  ]}
                >
                  {difficulty}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Results Count */}
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsText}>
            {filteredWorksheets.length} worksheet{filteredWorksheets.length !== 1 ? 's' : ''} found
          </Text>
        </View>

        {/* Worksheets List */}
        {loading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.emptySubtext}>Loading worksheets…</Text>
          </View>
        ) : filteredWorksheets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyText}>
              {allWorksheets.length === 0
                ? 'No worksheets in the library yet'
                : 'No worksheets match your filters'}
            </Text>
            <Text style={styles.emptySubtext}>
              {allWorksheets.length === 0
                ? 'Create your first worksheet from the module hub'
                : 'Try adjusting your filters'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredWorksheets}
            renderItem={renderWorksheetCard}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  backButton: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING['2xl'],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.gray700,
  },
  searchIcon: {
    fontSize: TYPOGRAPHY.lg,
  },
  filterSection: {
    marginBottom: SPACING.lg,
  },
  filterLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.md,
  },
  filterScroll: {
    marginHorizontal: -SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    marginRight: SPACING.md,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '500',
    color: COLORS.gray700,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  resultsInfo: {
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  resultsText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  worksheetCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  worksheetTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
    flex: 1,
  },
  worksheetCategory: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray500,
  },
  difficultyBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  difficultyText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
  },
  worksheetDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray600,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    gap: SPACING.md,
  },
  time: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray600,
  },
  audience: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.gray600,
  },
  previewButton: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginLeft: 'auto',
  },
  previewButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['3xl'],
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SPACING.lg,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.gray500,
  },
});
