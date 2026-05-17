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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
} from '../../constants/colors';
import { WORKSHEET_TEMPLATES } from '../../data/worksheetTemplates';
import dataStore from '../../utils/dataStore';

const INK = '#1A2332';
const ACCENT = COLORS.primary;
const SUCCESS = '#15803D';

const ROLE_COLOR = {
  child: '#9333EA',
  teen: '#0891B2',
  couples: '#D4536B',
  family: '#15803D',
};

const PRIORITIES = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
];

const DUE_OPTIONS = [
  { id: '3', label: '3 days', days: 3 },
  { id: '7', label: '1 week', days: 7 },
  { id: '14', label: '2 weeks', days: 14 },
  { id: '30', label: '1 month', days: 30 },
];

export default function AssignWorksheetScreen({ route, navigation }) {
  const initialClientId = route?.params?.clientId || null;
  const initialWorksheetId = route?.params?.worksheetId || null;

  const [clients, setClients] = useState([]);
  const [customWorksheets, setCustomWorksheets] = useState([]);
  const [therapist, setTherapist] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState(initialClientId);
  const [selectedWorksheetId, setSelectedWorksheetId] = useState(initialWorksheetId);
  const [priority, setPriority] = useState('medium');
  const [dueChoice, setDueChoice] = useState('7');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clientSearch, setClientSearch] = useState('');
  const [worksheetSearch, setWorksheetSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        await dataStore.initialize();
        const [users, current, custom] = await Promise.all([
          dataStore.getUsers(),
          dataStore.getCurrentUser(),
          dataStore.getCustomWorksheets(),
        ]);
        setClients(
          Object.values(users || {}).filter((u) => u.role !== 'therapist')
        );
        setTherapist(current);
        setCustomWorksheets(custom || []);
      } catch (e) {
        console.log('[AssignWorksheet] load error', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const allWorksheets = useMemo(
    () => [...Object.values(WORKSHEET_TEMPLATES), ...(customWorksheets || [])],
    [customWorksheets]
  );

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === selectedClientId),
    [clients, selectedClientId]
  );

  const selectedWorksheet = useMemo(
    () =>
      selectedWorksheetId
        ? allWorksheets.find((w) => w.id === selectedWorksheetId)
        : null,
    [selectedWorksheetId, allWorksheets]
  );

  const filteredClients = useMemo(() => {
    if (!clientSearch) return clients;
    const q = clientSearch.toLowerCase().trim();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
    );
  }, [clients, clientSearch]);

  const filteredWorksheets = useMemo(() => {
    let list = allWorksheets;
    // If a client is selected, prioritize worksheets matching their audience
    if (selectedClient) {
      const matchedAudience = allWorksheets.filter(
        (w) => w.targetAudience === selectedClient.role
      );
      const others = allWorksheets.filter(
        (w) => w.targetAudience !== selectedClient.role
      );
      list = [...matchedAudience, ...others];
    }
    if (!worksheetSearch) return list;
    const q = worksheetSearch.toLowerCase().trim();
    return list.filter(
      (w) =>
        w.title.toLowerCase().includes(q) ||
        w.category.toLowerCase().includes(q)
    );
  }, [allWorksheets, selectedClient, worksheetSearch]);

  const canSubmit = selectedClientId && selectedWorksheetId && !submitting;

  const handleAssign = async () => {
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      const due = new Date();
      const days = DUE_OPTIONS.find((d) => d.id === dueChoice)?.days || 7;
      due.setDate(due.getDate() + days);

      await dataStore.assignWorksheet(
        selectedClientId,
        therapist?.id || 'therapist1',
        selectedWorksheetId,
        due.toISOString(),
        notes,
        priority
      );

      Alert.alert(
        'Assignment Sent',
        `${selectedWorksheet?.title} has been assigned to ${selectedClient?.name}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      console.log('[AssignWorksheet] error', e);
      Alert.alert('Error', 'Failed to assign worksheet. Please try again.');
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
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
        >
          <Feather name="x" size={20} color={INK} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: SPACING.md }}>
          <Text style={styles.eyebrow}>NEW ASSIGNMENT</Text>
          <Text style={styles.headerTitle}>Assign Worksheet</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step 1: Choose client */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View
              style={[
                styles.stepNumber,
                selectedClientId && styles.stepNumberDone,
              ]}
            >
              {selectedClientId ? (
                <Feather name="check" size={14} color={COLORS.white} />
              ) : (
                <Text style={styles.stepNumberText}>1</Text>
              )}
            </View>
            <Text style={styles.stepTitle}>Choose a client</Text>
          </View>

          {selectedClient ? (
            <TouchableOpacity
              style={styles.selectedClientCard}
              onPress={() => setSelectedClientId(null)}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.selectedAvatar,
                  { backgroundColor: selectedClient.profileColor || ACCENT },
                ]}
              >
                <Text style={styles.selectedAvatarText}>
                  {selectedClient.avatar || '👤'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.selectedName}>{selectedClient.name}</Text>
                <Text style={styles.selectedRole}>
                  {(selectedClient.role || '').toUpperCase()} ·{' '}
                  {selectedClient.email}
                </Text>
              </View>
              <Feather name="x-circle" size={20} color={COLORS.gray400} />
            </TouchableOpacity>
          ) : (
            <>
              <View style={styles.searchBar}>
                <Feather name="search" size={14} color={COLORS.gray400} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search clients"
                  placeholderTextColor={COLORS.gray400}
                  value={clientSearch}
                  onChangeText={setClientSearch}
                />
              </View>
              <View style={styles.clientList}>
                {filteredClients.length === 0 ? (
                  <Text style={styles.emptyInlineText}>No clients found</Text>
                ) : (
                  filteredClients.map((c) => {
                    const roleColor = ROLE_COLOR[c.role] || COLORS.gray500;
                    return (
                      <TouchableOpacity
                        key={c.id}
                        style={styles.clientRow}
                        onPress={() => setSelectedClientId(c.id)}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.clientRowAvatar,
                            { backgroundColor: c.profileColor || ACCENT },
                          ]}
                        >
                          <Text style={styles.clientRowAvatarText}>
                            {c.avatar || '👤'}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.clientRowName}>{c.name}</Text>
                          <View style={styles.clientRowMeta}>
                            <View
                              style={[
                                styles.roleMini,
                                { backgroundColor: roleColor + '15' },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.roleMiniText,
                                  { color: roleColor },
                                ]}
                              >
                                {(c.role || '').toUpperCase()}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            </>
          )}
        </View>

        {/* Step 2: Choose worksheet */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View
              style={[
                styles.stepNumber,
                selectedWorksheetId && styles.stepNumberDone,
              ]}
            >
              {selectedWorksheetId ? (
                <Feather name="check" size={14} color={COLORS.white} />
              ) : (
                <Text style={styles.stepNumberText}>2</Text>
              )}
            </View>
            <Text style={styles.stepTitle}>Choose a worksheet</Text>
          </View>

          {selectedWorksheet ? (
            <TouchableOpacity
              style={styles.selectedWsCard}
              onPress={() => setSelectedWorksheetId(null)}
              activeOpacity={0.85}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.selectedWsCategory}>
                  {selectedWorksheet.category.toUpperCase()}
                </Text>
                <Text style={styles.selectedWsTitle}>
                  {selectedWorksheet.title}
                </Text>
                <Text style={styles.selectedWsMeta}>
                  {selectedWorksheet.estimatedTime} ·{' '}
                  {selectedWorksheet.difficulty}
                </Text>
              </View>
              <Feather name="x-circle" size={20} color={COLORS.gray400} />
            </TouchableOpacity>
          ) : (
            <>
              <View style={styles.searchBar}>
                <Feather name="search" size={14} color={COLORS.gray400} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search worksheets"
                  placeholderTextColor={COLORS.gray400}
                  value={worksheetSearch}
                  onChangeText={setWorksheetSearch}
                />
              </View>
              <View style={styles.wsList}>
                {filteredWorksheets.slice(0, 12).map((w) => {
                  const matchesClient =
                    selectedClient &&
                    w.targetAudience === selectedClient.role;
                  return (
                    <TouchableOpacity
                      key={w.id}
                      style={styles.wsRow}
                      onPress={() => setSelectedWorksheetId(w.id)}
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1 }}>
                        <View style={styles.wsRowHeader}>
                          <Text style={styles.wsRowCategory}>
                            {w.category.toUpperCase()}
                          </Text>
                          {matchesClient && (
                            <View style={styles.matchBadge}>
                              <Text style={styles.matchBadgeText}>MATCH</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.wsRowTitle}>{w.title}</Text>
                        <Text style={styles.wsRowMeta}>
                          {w.estimatedTime} · {w.targetAudience} ·{' '}
                          {w.difficulty}
                        </Text>
                      </View>
                      <Feather
                        name="chevron-right"
                        size={18}
                        color={COLORS.gray400}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </View>

        {/* Step 3: Settings */}
        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepTitle}>Configure</Text>
          </View>

          <Text style={styles.fieldLabel}>DUE IN</Text>
          <View style={styles.optionRow}>
            {DUE_OPTIONS.map((opt) => {
              const active = dueChoice === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.optionChip, active && styles.optionChipActive]}
                  onPress={() => setDueChoice(opt.id)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      active && styles.optionChipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>PRIORITY</Text>
          <View style={styles.optionRow}>
            {PRIORITIES.map((opt) => {
              const active = priority === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.optionChip, active && styles.optionChipActive]}
                  onPress={() => setPriority(opt.id)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      active && styles.optionChipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>NOTES (OPTIONAL)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add context or instructions for the client"
            placeholderTextColor={COLORS.gray400}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={{ height: SPACING.xl }} />
      </ScrollView>

      {/* Sticky submit */}
      <View style={styles.submitBar}>
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
                {canSubmit
                  ? 'Send Assignment'
                  : selectedClientId
                  ? 'Choose a worksheet'
                  : 'Choose a client'}
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

  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  stepCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  stepNumberDone: { backgroundColor: SUCCESS },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.gray500,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.2,
  },

  /* Search */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: INK,
    fontWeight: '500',
    marginLeft: 6,
    paddingVertical: 2,
  },

  /* Client list */
  clientList: { maxHeight: 280 },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  clientRowAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  clientRowAvatarText: { fontSize: 18 },
  clientRowName: {
    fontSize: 13,
    fontWeight: '700',
    color: INK,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  clientRowMeta: { flexDirection: 'row' },
  roleMini: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  roleMiniText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },

  selectedClientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  selectedAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  selectedAvatarText: { fontSize: 22 },
  selectedName: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  selectedRole: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '600',
  },

  /* Worksheet list */
  wsList: { maxHeight: 320 },
  wsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  wsRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  wsRowCategory: {
    fontSize: 9,
    fontWeight: '700',
    color: ACCENT,
    letterSpacing: 1.2,
  },
  matchBadge: {
    backgroundColor: SUCCESS + '15',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: BORDER_RADIUS.sm,
    marginLeft: 6,
  },
  matchBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: SUCCESS,
    letterSpacing: 0.8,
  },
  wsRowTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: INK,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  wsRowMeta: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
    textTransform: 'capitalize',
  },

  selectedWsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  selectedWsCategory: {
    fontSize: 9,
    fontWeight: '700',
    color: ACCENT,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  selectedWsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  selectedWsMeta: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
    textTransform: 'capitalize',
  },

  /* Fields */
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 1.2,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    marginRight: 6,
    marginBottom: 6,
  },
  optionChipActive: {
    backgroundColor: INK,
    borderColor: INK,
  },
  optionChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray600,
  },
  optionChipTextActive: { color: COLORS.white },

  notesInput: {
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: 13,
    color: INK,
    minHeight: 80,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },

  emptyInlineText: {
    fontSize: 12,
    color: COLORS.gray500,
    textAlign: 'center',
    fontWeight: '500',
    paddingVertical: SPACING.md,
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
  submitBtnDisabled: {
    backgroundColor: COLORS.gray300,
  },
  submitBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14,
    marginLeft: 8,
    letterSpacing: 0.2,
  },
});
