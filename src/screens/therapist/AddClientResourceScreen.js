import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
} from '../../constants/colors';
import {
  getProfileById,
  getCurrentUserId,
  listResources,
  listClientResources,
  assignClientResource,
} from '../../services/api';

const INK = '#1A2332';
const ACCENT = '#D97706';

const TYPE_ICON = {
  article: 'file-text',
  video: 'video',
  document: 'paperclip',
  note: 'edit-3',
};

export default function AddClientResourceScreen({ route, navigation }) {
  const { clientId } = route?.params || {};
  const [client, setClient] = useState(null);
  const [resources, setResources] = useState([]);
  const [alreadyAssigned, setAlreadyAssigned] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [c, allResources, clientResources] = await Promise.all([
          clientId ? getProfileById(clientId) : null,
          listResources(),
          clientId ? listClientResources(clientId) : Promise.resolve([]),
        ]);
        setClient(c);
        setResources(allResources || []);
        setAlreadyAssigned((clientResources || []).map((cr) => cr.resourceId));
      } catch (e) {
        console.log('[AddClientResource] load error', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [clientId]);

  const filtered = useMemo(() => {
    let list = resources;
    if (client?.role) {
      // Sort: matching audience first
      const matched = list.filter(
        (r) => r.audience === client.role || r.audience === 'all'
      );
      const others = list.filter(
        (r) => r.audience !== client.role && r.audience !== 'all'
      );
      list = [...matched, ...others];
    }
    if (!search.trim()) return list;
    const q = search.toLowerCase().trim();
    return list.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.category || '').toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q)
    );
  }, [resources, client, search]);

  const selected = useMemo(
    () => resources.find((r) => r.id === selectedId),
    [resources, selectedId]
  );

  const canSubmit = !!selectedId && !submitting;

  const handleAssign = async () => {
    if (!canSubmit || !clientId) return;
    try {
      setSubmitting(true);
      const therapistId = await getCurrentUserId();
      await assignClientResource({
        clientId,
        resourceId: selectedId,
        assignedBy: therapistId,
        note: note.trim() || null,
      });
      Alert.alert(
        'Resource assigned',
        `"${selected?.title}" is now in ${client?.name || 'the client'}'s profile.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      console.log('[AddClientResource] assign error', e);
      Alert.alert('Error', e?.message || 'Failed to assign. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.goBack()}
          >
            <Feather name="x" size={20} color={INK} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <ActivityIndicator color={INK} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
        >
          <Feather name="x" size={20} color={INK} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: SPACING.md }}>
          <Text style={styles.eyebrow}>ASSIGN RESOURCE</Text>
          <Text style={styles.headerTitle}>
            {client ? `For ${client.name}` : 'Add Resource'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.libraryBtn}
          onPress={() => navigation.navigate('CreateResource')}
          activeOpacity={0.85}
        >
          <Feather name="plus" size={14} color={INK} />
          <Text style={styles.libraryBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search */}
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={COLORS.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search resources by title or category"
            placeholderTextColor={COLORS.gray400}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x" size={16} color={COLORS.gray500} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionLabel}>RESOURCE LIBRARY</Text>

        {filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="book-open" size={32} color={COLORS.gray300} />
            <Text style={styles.emptyTitle}>No resources found</Text>
            <Text style={styles.emptyText}>
              {search
                ? 'Try a different search'
                : 'Create a resource first in the Content tab.'}
            </Text>
            <TouchableOpacity
              style={styles.emptyCta}
              onPress={() => navigation.navigate('CreateResource')}
              activeOpacity={0.85}
            >
              <Feather name="plus" size={14} color={COLORS.white} />
              <Text style={styles.emptyCtaText}>Create new resource</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map((r) => {
            const assigned = alreadyAssigned.includes(r.id);
            const active = selectedId === r.id;
            const icon = TYPE_ICON[r.type] || 'link';
            return (
              <TouchableOpacity
                key={r.id}
                style={[
                  styles.resourceCard,
                  active && styles.resourceCardActive,
                  assigned && { opacity: 0.5 },
                ]}
                onPress={() => !assigned && setSelectedId(r.id)}
                disabled={assigned}
                activeOpacity={0.85}
              >
                <View style={styles.resourceIcon}>
                  <Feather name={icon} size={18} color={ACCENT} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.resourceTopRow}>
                    <Text style={styles.resourceCategory}>
                      {(r.category || '').toUpperCase()}
                    </Text>
                    {assigned && (
                      <View style={styles.assignedBadge}>
                        <Text style={styles.assignedText}>ASSIGNED</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.resourceTitle} numberOfLines={1}>
                    {r.title}
                  </Text>
                  <Text style={styles.resourceDescription} numberOfLines={2}>
                    {r.description}
                  </Text>
                </View>
                {active && (
                  <View style={styles.checkBubble}>
                    <Feather name="check" size={14} color={COLORS.white} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}

        {selected && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: SPACING.lg }]}>
              NOTE TO CLIENT (OPTIONAL)
            </Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Why are you assigning this? What should they focus on?"
              placeholderTextColor={COLORS.gray400}
              value={note}
              onChangeText={setNote}
              multiline
              textAlignVertical="top"
            />
          </>
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>

      <View style={[styles.submitBar, { paddingBottom: insets.bottom + SPACING.md }]}>
        <TouchableOpacity
          style={[
            styles.submitBtn,
            !canSubmit && styles.submitBtnDisabled,
          ]}
          onPress={handleAssign}
          disabled={!canSubmit}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Feather name="send" size={16} color={COLORS.white} />
              <Text style={styles.submitBtnText}>
                {selected ? 'Assign Resource' : 'Select a resource'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

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
    color: ACCENT,
    letterSpacing: 1.4,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.5,
  },
  libraryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  libraryBtnText: {
    color: INK,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
    letterSpacing: 0.2,
  },

  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: INK,
    fontWeight: '500',
    marginLeft: 6,
    paddingVertical: 4,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.4,
    marginBottom: SPACING.md,
  },

  /* Resource card */
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  resourceCardActive: {
    borderColor: INK,
    borderWidth: 2,
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ACCENT + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  resourceTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  resourceCategory: {
    fontSize: 9,
    fontWeight: '800',
    color: ACCENT,
    letterSpacing: 1.2,
    flex: 1,
  },
  assignedBadge: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: BORDER_RADIUS.sm,
  },
  assignedText: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.gray500,
    letterSpacing: 0.6,
  },
  resourceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: INK,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  resourceDescription: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
    lineHeight: 16,
  },
  checkBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },

  /* Note input */
  noteInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: 13,
    color: INK,
    fontWeight: '500',
    minHeight: 80,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    lineHeight: 19,
  },

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
    backgroundColor: INK,
  },
  emptyCtaText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
    letterSpacing: 0.2,
  },

  /* Submit bar */
  submitBar: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: INK,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  submitBtnDisabled: { backgroundColor: COLORS.gray300 },
  submitBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14,
    marginLeft: 8,
    letterSpacing: 0.2,
  },
});
