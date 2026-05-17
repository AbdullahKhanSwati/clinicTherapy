import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from '../constants/colors';
import dataStore from '../utils/dataStore';

const TYPE_ICON = {
  article: 'file-text',
  video: 'video',
  document: 'paperclip',
  note: 'edit-3',
};

const TYPE_COLOR = {
  article: '#0369A1',
  video: '#BE123C',
  document: '#92400E',
  note: '#6D28D9',
};

export default function ResourcesScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [allResources, setAllResources] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await dataStore.initialize();
        const u = await dataStore.getCurrentUser();
        setUser(u);
        const [all, mine] = await Promise.all([
          dataStore.getResources(),
          u ? dataStore.getClientResourcesByClient(u.id) : Promise.resolve([]),
        ]);
        setAllResources(all || []);
        setAssigned(mine || []);
      } catch (e) {
        console.log('[Resources] load error', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const assignedResources = useMemo(() => {
    return assigned
      .map((a) => {
        const res = allResources.find((r) => r.id === a.resourceId);
        return res ? { ...res, assignmentId: a.id, note: a.note, assignedAt: a.assignedAt } : null;
      })
      .filter(Boolean);
  }, [assigned, allResources]);

  // Library = audience-filtered list, excluding ones already assigned
  const libraryResources = useMemo(() => {
    const role = user?.role;
    const assignedIds = new Set(assigned.map((a) => a.resourceId));
    return allResources.filter(
      (r) =>
        !assignedIds.has(r.id) &&
        (!r.audience || r.audience === 'all' || r.audience === role)
    );
  }, [allResources, assigned, user]);

  const categories = useMemo(() => {
    const set = new Set(['All']);
    allResources.forEach((r) => r.category && set.add(r.category));
    return Array.from(set);
  }, [allResources]);

  const filteredLibrary = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return libraryResources.filter((r) => {
      const matchesCategory =
        categoryFilter === 'All' || r.category === categoryFilter;
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        (r.category || '').toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [libraryResources, categoryFilter, searchQuery]);

  const openResource = (r) => {
    if (r.type === 'note' || !r.url) {
      Alert.alert(r.title, r.content || r.description || 'No content');
    } else {
      Linking.openURL(r.url).catch(() => {
        Alert.alert(r.title, `${r.description}\n\n${r.url}`);
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Feather name="arrow-left" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Resources</Text>
        <View style={{ width: 20 }} />
      </View>

      <View style={styles.searchBar}>
        <Feather
          name="search"
          size={16}
          color={COLORS.gray400}
          style={{ marginRight: SPACING.sm }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search resources"
          placeholderTextColor={COLORS.gray400}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Feather name="x" size={16} color={COLORS.gray500} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipRow}
      >
        {categories.map((cat) => {
          const active = categoryFilter === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setCategoryFilter(cat)}
              activeOpacity={0.85}
            >
              <Text
                style={[styles.chipText, active && styles.chipTextActive]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator color={COLORS.primary} />
          </View>
        ) : (
          <>
            {assignedResources.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>ASSIGNED TO YOU</Text>
                {assignedResources.map((r) => (
                  <ResourceCard
                    key={r.id}
                    resource={r}
                    isAssigned
                    onPress={() => openResource(r)}
                  />
                ))}
              </>
            )}

            <Text style={styles.sectionLabel}>LIBRARY</Text>

            {filteredLibrary.length === 0 ? (
              <View style={styles.emptyCard}>
                <Feather name="book-open" size={32} color={COLORS.gray300} />
                <Text style={styles.emptyTitle}>No resources</Text>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'Try a different search.' : 'Check back soon.'}
                </Text>
              </View>
            ) : (
              filteredLibrary.map((r) => (
                <ResourceCard
                  key={r.id}
                  resource={r}
                  onPress={() => openResource(r)}
                />
              ))
            )}
          </>
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const ResourceCard = ({ resource, isAssigned, onPress }) => {
  const icon = TYPE_ICON[resource.type] || 'link';
  const color = TYPE_COLOR[resource.type] || COLORS.gray600;
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.cardIcon, { backgroundColor: color + '15' }]}>
        <Feather name={icon} size={18} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardCategory}>
            {(resource.category || '').toUpperCase()}
          </Text>
          {isAssigned && (
            <View style={styles.assignedPill}>
              <Text style={styles.assignedPillText}>FROM THERAPIST</Text>
            </View>
          )}
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {resource.title}
        </Text>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {resource.description}
        </Text>
        {isAssigned && resource.note ? (
          <View style={styles.noteBox}>
            <Text style={styles.noteLabel}>NOTE</Text>
            <Text style={styles.noteText}>{resource.note}</Text>
          </View>
        ) : null}
      </View>
      <Feather name="chevron-right" size={18} color={COLORS.gray400} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  title: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: -0.3,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray700,
    fontWeight: '500',
    paddingVertical: 4,
  },

  chipScroll: { flexGrow: 0, marginTop: SPACING.sm },
  chipRow: { paddingHorizontal: SPACING.lg },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    marginRight: 6,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray600,
  },
  chipTextActive: { color: COLORS.white },

  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },

  loadingBlock: { padding: SPACING.xl, alignItems: 'center' },

  /* Card */
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    ...SHADOWS.sm,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  cardCategory: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1.2,
    flex: 1,
  },
  assignedPill: {
    backgroundColor: '#D9770615',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: BORDER_RADIUS.sm,
  },
  assignedPillText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  cardDesc: {
    fontSize: 12,
    color: COLORS.gray500,
    lineHeight: 17,
    fontWeight: '500',
  },
  noteBox: {
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginTop: SPACING.sm,
  },
  noteLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.gray500,
    letterSpacing: 1,
    marginBottom: 4,
  },
  noteText: {
    fontSize: 12,
    color: COLORS.gray700,
    fontStyle: 'italic',
    lineHeight: 17,
  },

  /* Empty */
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray700,
    marginTop: SPACING.md,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.gray500,
    fontWeight: '500',
  },
});
