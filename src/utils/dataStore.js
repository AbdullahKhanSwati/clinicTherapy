// DataStore - Manages all data persistence with AsyncStorage
// Simulates a backend database for the app

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  MOCK_USERS,
  MOOD_ENTRIES,
  JOURNAL_ENTRIES,
  WORKSHEETS_COMPLETED,
  WORKSHEET_ASSIGNMENTS,
  THERAPY_PROGRAMS,
  THERAPIST_NOTES,
  AFFIRMATIONS,
  COPING_TOOLS,
  RESOURCES,
  CLIENT_RESOURCES,
  DATE_IDEAS,
  CUSTOM_WORKSHEETS,
  COUPLE_PAIRINGS,
  PARTNER_CHECKINS,
  REPAIR_REQUESTS,
  APPRECIATIONS,
  CONFLICT_PAUSES,
  SHARED_GOALS,
} from '../data/mockData';

const STORE_KEYS = {
  USERS: 'app_users',
  MOOD_ENTRIES: 'app_mood_entries',
  JOURNAL_ENTRIES: 'app_journal_entries',
  WORKSHEETS_COMPLETED: 'app_worksheets_completed',
  WORKSHEET_ASSIGNMENTS: 'app_worksheet_assignments',
  THERAPY_PROGRAMS: 'app_therapy_programs',
  THERAPIST_NOTES: 'app_therapist_notes',
  CURRENT_USER: 'app_current_user',
  ASSIGNMENTS_SEED_VERSION: 'app_assignments_seed_version',
  CONTENT_SEED_VERSION: 'app_content_seed_version',
  AFFIRMATIONS: 'app_affirmations',
  COPING_TOOLS: 'app_coping_tools',
  RESOURCES: 'app_resources',
  CLIENT_RESOURCES: 'app_client_resources',
  DATE_IDEAS: 'app_date_ideas',
  CUSTOM_WORKSHEETS: 'app_custom_worksheets',
  ADMIN_CONTENT_SEED_VERSION: 'app_admin_content_seed_version',
  COUPLE_PAIRINGS: 'app_couple_pairings',
  PARTNER_CHECKINS: 'app_partner_checkins',
  REPAIR_REQUESTS: 'app_repair_requests',
  APPRECIATIONS: 'app_appreciations',
  CONFLICT_PAUSES: 'app_conflict_pauses',
  SHARED_GOALS: 'app_shared_goals',
  COUPLES_SYNC_SEED_VERSION: 'app_couples_sync_seed_version',
};

const ASSIGNMENTS_SEED_VERSION = 'v3-couples';
const CONTENT_SEED_VERSION = 'v1-couples';
const ADMIN_CONTENT_SEED_VERSION = 'v1-admin';
const COUPLES_SYNC_SEED_VERSION = 'v1-sync';

class DataStore {
  constructor() {
    this.initialized = false;
    this.cache = {};
  }

  // Initialize store with mock data
  async initialize() {
    if (this.initialized) return;

    try {
      const existing = await AsyncStorage.getItem(STORE_KEYS.USERS);
      if (!existing) {
        console.log('[DataStore] Initializing with mock data');
        await this.setUsers(MOCK_USERS);
        await this.setMoodEntries(MOOD_ENTRIES);
        await this.setJournalEntries(JOURNAL_ENTRIES);
        await this.setWorksheetsCompleted(WORKSHEETS_COMPLETED);
        await this.setWorksheetAssignments(WORKSHEET_ASSIGNMENTS);
        await this.setTherapyPrograms(THERAPY_PROGRAMS);
        await this.setTherapistNotes(THERAPIST_NOTES);
        await this.setAffirmations(AFFIRMATIONS);
        await this.setCopingTools(COPING_TOOLS);
        await this.setResources(RESOURCES);
        await this.setClientResources(CLIENT_RESOURCES);
        await this.setDateIdeas(DATE_IDEAS);
        await this.setCustomWorksheets(CUSTOM_WORKSHEETS);
        await this.setCouplePairings(COUPLE_PAIRINGS);
        await this.setPartnerCheckins(PARTNER_CHECKINS);
        await this.setRepairRequests(REPAIR_REQUESTS);
        await this.setAppreciations(APPRECIATIONS);
        await this.setConflictPauses(CONFLICT_PAUSES);
        await this.setSharedGoals(SHARED_GOALS);
        await AsyncStorage.setItem(
          STORE_KEYS.ASSIGNMENTS_SEED_VERSION,
          ASSIGNMENTS_SEED_VERSION
        );
        await AsyncStorage.setItem(
          STORE_KEYS.ADMIN_CONTENT_SEED_VERSION,
          ADMIN_CONTENT_SEED_VERSION
        );
        await AsyncStorage.setItem(
          STORE_KEYS.COUPLES_SYNC_SEED_VERSION,
          COUPLES_SYNC_SEED_VERSION
        );
      } else {
        const seedVersion = await AsyncStorage.getItem(
          STORE_KEYS.ASSIGNMENTS_SEED_VERSION
        );
        if (seedVersion !== ASSIGNMENTS_SEED_VERSION) {
          console.log('[DataStore] Re-seeding assignments to', ASSIGNMENTS_SEED_VERSION);
          const existingAssignments = await this.getWorksheetAssignments();
          const existingIds = new Set(existingAssignments.map((a) => a.id));
          const merged = [
            ...existingAssignments,
            ...WORKSHEET_ASSIGNMENTS.filter((a) => !existingIds.has(a.id)),
          ];
          await this.setWorksheetAssignments(merged);
          await AsyncStorage.setItem(
            STORE_KEYS.ASSIGNMENTS_SEED_VERSION,
            ASSIGNMENTS_SEED_VERSION
          );
        }

        const contentVersion = await AsyncStorage.getItem(
          STORE_KEYS.CONTENT_SEED_VERSION
        );
        if (contentVersion !== CONTENT_SEED_VERSION) {
          console.log('[DataStore] Re-seeding moods + journals to', CONTENT_SEED_VERSION);

          // Merge new mood entries (de-dupe by userId+date+mood)
          const existingMoods = await this.getMoodEntries();
          const moodKey = (m) => `${m.userId}|${m.date}|${m.mood}`;
          const moodKeys = new Set(existingMoods.map(moodKey));
          const mergedMoods = [
            ...existingMoods,
            ...MOOD_ENTRIES.filter((m) => !moodKeys.has(moodKey(m))),
          ];
          await this.setMoodEntries(mergedMoods);

          // Merge new journal entries (by id)
          const existingJournals = await this.getJournalEntries();
          const journalIds = new Set(existingJournals.map((j) => j.id));
          const mergedJournals = [
            ...existingJournals,
            ...JOURNAL_ENTRIES.filter((j) => !journalIds.has(j.id)),
          ];
          await this.setJournalEntries(mergedJournals);

          await AsyncStorage.setItem(
            STORE_KEYS.CONTENT_SEED_VERSION,
            CONTENT_SEED_VERSION
          );
        }

        // Admin-managed content (affirmations, coping tools, resources, etc.)
        const adminVersion = await AsyncStorage.getItem(
          STORE_KEYS.ADMIN_CONTENT_SEED_VERSION
        );
        if (adminVersion !== ADMIN_CONTENT_SEED_VERSION) {
          console.log('[DataStore] Seeding admin-managed content');

          const seedById = async (storeKey, seedData, getter, setter) => {
            try {
              const existingItems = await getter();
              if (!existingItems || existingItems.length === 0) {
                await setter(seedData);
              } else {
                const ids = new Set(existingItems.map((x) => x.id));
                const merged = [
                  ...existingItems,
                  ...seedData.filter((x) => !ids.has(x.id)),
                ];
                await setter(merged);
              }
            } catch (e) {
              console.log('[DataStore] seed', storeKey, 'error', e);
            }
          };

          await seedById(
            STORE_KEYS.AFFIRMATIONS,
            AFFIRMATIONS,
            () => this.getAffirmations(),
            (v) => this.setAffirmations(v)
          );
          await seedById(
            STORE_KEYS.COPING_TOOLS,
            COPING_TOOLS,
            () => this.getCopingTools(),
            (v) => this.setCopingTools(v)
          );
          await seedById(
            STORE_KEYS.RESOURCES,
            RESOURCES,
            () => this.getResources(),
            (v) => this.setResources(v)
          );
          await seedById(
            STORE_KEYS.CLIENT_RESOURCES,
            CLIENT_RESOURCES,
            () => this.getClientResources(),
            (v) => this.setClientResources(v)
          );
          await seedById(
            STORE_KEYS.DATE_IDEAS,
            DATE_IDEAS,
            () => this.getDateIdeas(),
            (v) => this.setDateIdeas(v)
          );

          await AsyncStorage.setItem(
            STORE_KEYS.ADMIN_CONTENT_SEED_VERSION,
            ADMIN_CONTENT_SEED_VERSION
          );
        }

        // Couples-sync collections (pairings, check-ins, etc.)
        const syncVersion = await AsyncStorage.getItem(
          STORE_KEYS.COUPLES_SYNC_SEED_VERSION
        );
        if (syncVersion !== COUPLES_SYNC_SEED_VERSION) {
          console.log('[DataStore] Seeding couples sync collections');

          const seedById = async (storeKey, seedData, getter, setter) => {
            try {
              const existingItems = await getter();
              if (!existingItems || existingItems.length === 0) {
                await setter(seedData);
              } else {
                const ids = new Set(existingItems.map((x) => x.id));
                const merged = [
                  ...existingItems,
                  ...seedData.filter((x) => !ids.has(x.id)),
                ];
                await setter(merged);
              }
            } catch (e) {
              console.log('[DataStore] sync seed', storeKey, 'error', e);
            }
          };

          await seedById(
            STORE_KEYS.COUPLE_PAIRINGS,
            COUPLE_PAIRINGS,
            () => this.getCouplePairings(),
            (v) => this.setCouplePairings(v)
          );
          await seedById(
            STORE_KEYS.PARTNER_CHECKINS,
            PARTNER_CHECKINS,
            () => this.getPartnerCheckins(),
            (v) => this.setPartnerCheckins(v)
          );
          await seedById(
            STORE_KEYS.REPAIR_REQUESTS,
            REPAIR_REQUESTS,
            () => this.getRepairRequests(),
            (v) => this.setRepairRequests(v)
          );
          await seedById(
            STORE_KEYS.APPRECIATIONS,
            APPRECIATIONS,
            () => this.getAppreciations(),
            (v) => this.setAppreciations(v)
          );
          await seedById(
            STORE_KEYS.SHARED_GOALS,
            SHARED_GOALS,
            () => this.getSharedGoals(),
            (v) => this.setSharedGoals(v)
          );

          await AsyncStorage.setItem(
            STORE_KEYS.COUPLES_SYNC_SEED_VERSION,
            COUPLES_SYNC_SEED_VERSION
          );
        }
      }

      this.initialized = true;
    } catch (error) {
      console.error('[DataStore] Initialization error:', error);
    }
  }

  // USER MANAGEMENT
  async getUsers() {
    if (this.cache.users) return this.cache.users;
    try {
      const data = await AsyncStorage.getItem(STORE_KEYS.USERS);
      const users = data ? JSON.parse(data) : MOCK_USERS;
      this.cache.users = users;
      return users;
    } catch (error) {
      console.error('[DataStore] getUsers error:', error);
      return MOCK_USERS;
    }
  }

  async setUsers(users) {
    try {
      await AsyncStorage.setItem(STORE_KEYS.USERS, JSON.stringify(users));
      this.cache.users = users;
    } catch (error) {
      console.error('[DataStore] setUsers error:', error);
    }
  }

  async getUserById(userId) {
    const users = await this.getUsers();
    return users[userId];
  }

  async setCurrentUser(user) {
    try {
      await AsyncStorage.setItem(STORE_KEYS.CURRENT_USER, JSON.stringify(user));
      this.cache.currentUser = user;
    } catch (error) {
      console.error('[DataStore] setCurrentUser error:', error);
    }
  }

  async getCurrentUser() {
    if (this.cache.currentUser) return this.cache.currentUser;
    try {
      const data = await AsyncStorage.getItem(STORE_KEYS.CURRENT_USER);
      const user = data ? JSON.parse(data) : null;
      this.cache.currentUser = user;
      return user;
    } catch (error) {
      console.error('[DataStore] getCurrentUser error:', error);
      return null;
    }
  }

  // MOOD TRACKING
  async getMoodEntries() {
    if (this.cache.moodEntries) return this.cache.moodEntries;
    try {
      const data = await AsyncStorage.getItem(STORE_KEYS.MOOD_ENTRIES);
      const entries = data ? JSON.parse(data) : MOOD_ENTRIES;
      this.cache.moodEntries = entries;
      return entries;
    } catch (error) {
      console.error('[DataStore] getMoodEntries error:', error);
      return MOOD_ENTRIES;
    }
  }

  async setMoodEntries(entries) {
    try {
      await AsyncStorage.setItem(STORE_KEYS.MOOD_ENTRIES, JSON.stringify(entries));
      this.cache.moodEntries = entries;
    } catch (error) {
      console.error('[DataStore] setMoodEntries error:', error);
    }
  }

  async addMoodEntry(userId, mood, intensity, notes = '') {
    try {
      const entries = await this.getMoodEntries();
      const newEntry = {
        userId,
        date: new Date().toISOString(),
        mood,
        intensity,
        notes,
      };
      const updatedEntries = [...entries, newEntry];
      await this.setMoodEntries(updatedEntries);
      return newEntry;
    } catch (error) {
      console.error('[DataStore] addMoodEntry error:', error);
      return null;
    }
  }

  async getMoodEntriesByUser(userId) {
    const entries = await this.getMoodEntries();
    return entries.filter(e => e.userId === userId).sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // JOURNAL ENTRIES
  async getJournalEntries() {
    if (this.cache.journalEntries) return this.cache.journalEntries;
    try {
      const data = await AsyncStorage.getItem(STORE_KEYS.JOURNAL_ENTRIES);
      const entries = data ? JSON.parse(data) : JOURNAL_ENTRIES;
      this.cache.journalEntries = entries;
      return entries;
    } catch (error) {
      console.error('[DataStore] getJournalEntries error:', error);
      return JOURNAL_ENTRIES;
    }
  }

  async setJournalEntries(entries) {
    try {
      await AsyncStorage.setItem(STORE_KEYS.JOURNAL_ENTRIES, JSON.stringify(entries));
      this.cache.journalEntries = entries;
    } catch (error) {
      console.error('[DataStore] setJournalEntries error:', error);
    }
  }

  async addJournalEntry(userId, title, content, mood) {
    try {
      const entries = await this.getJournalEntries();
      const newEntry = {
        id: `journal_${Date.now()}`,
        userId,
        date: new Date().toISOString(),
        title,
        content,
        mood,
      };
      const updatedEntries = [...entries, newEntry];
      await this.setJournalEntries(updatedEntries);
      return newEntry;
    } catch (error) {
      console.error('[DataStore] addJournalEntry error:', error);
      return null;
    }
  }

  async getJournalEntriesByUser(userId) {
    const entries = await this.getJournalEntries();
    return entries.filter(e => e.userId === userId).sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async createJournalEntry({ userId, title, content, mood, date }) {
    try {
      const entries = await this.getJournalEntries();
      const newEntry = {
        id: `journal_${Date.now()}`,
        userId,
        title,
        content,
        mood,
        date: date || new Date().toISOString(),
      };
      await this.setJournalEntries([...entries, newEntry]);
      return newEntry;
    } catch (error) {
      console.error('[DataStore] createJournalEntry error:', error);
      return null;
    }
  }

  async getJournalEntry(id) {
    const entries = await this.getJournalEntries();
    return entries.find(e => e.id === id) || null;
  }

  async updateJournalEntry(id, updates) {
    try {
      const entries = await this.getJournalEntries();
      const next = entries.map(e => (e.id === id ? { ...e, ...updates } : e));
      await this.setJournalEntries(next);
      return next.find(e => e.id === id) || null;
    } catch (error) {
      console.error('[DataStore] updateJournalEntry error:', error);
      return null;
    }
  }

  async deleteJournalEntry(id) {
    try {
      const entries = await this.getJournalEntries();
      const next = entries.filter(e => e.id !== id);
      await this.setJournalEntries(next);
      return true;
    } catch (error) {
      console.error('[DataStore] deleteJournalEntry error:', error);
      return false;
    }
  }

  // WORKSHEETS COMPLETED
  async getWorksheetsCompleted() {
    if (this.cache.worksheetsCompleted) return this.cache.worksheetsCompleted;
    try {
      const data = await AsyncStorage.getItem(STORE_KEYS.WORKSHEETS_COMPLETED);
      const completed = data ? JSON.parse(data) : WORKSHEETS_COMPLETED;
      this.cache.worksheetsCompleted = completed;
      return completed;
    } catch (error) {
      console.error('[DataStore] getWorksheetsCompleted error:', error);
      return WORKSHEETS_COMPLETED;
    }
  }

  async setWorksheetsCompleted(completed) {
    try {
      await AsyncStorage.setItem(STORE_KEYS.WORKSHEETS_COMPLETED, JSON.stringify(completed));
      this.cache.worksheetsCompleted = completed;
    } catch (error) {
      console.error('[DataStore] setWorksheetsCompleted error:', error);
    }
  }

  async saveCompletedWorksheet(userId, worksheetId, assignmentId, responses) {
    try {
      const completed = await this.getWorksheetsCompleted();
      const newCompletion = {
        id: `completed_${Date.now()}`,
        userId,
        worksheetId,
        assignmentId,
        completedDate: new Date().toISOString(),
        responses,
        sharedWithTherapist: true,
      };
      const updatedCompleted = [...completed, newCompletion];
      await this.setWorksheetsCompleted(updatedCompleted);

      // Update assignment status
      await this.updateAssignmentStatus(assignmentId, 'completed');

      return newCompletion;
    } catch (error) {
      console.error('[DataStore] saveCompletedWorksheet error:', error);
      return null;
    }
  }

  async getCompletedWorksheetsByUser(userId) {
    const completed = await this.getWorksheetsCompleted();
    return completed.filter(c => c.userId === userId).sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate));
  }

  // WORKSHEET ASSIGNMENTS
  async getWorksheetAssignments() {
    if (this.cache.assignments) return this.cache.assignments;
    try {
      const data = await AsyncStorage.getItem(STORE_KEYS.WORKSHEET_ASSIGNMENTS);
      const assignments = data ? JSON.parse(data) : WORKSHEET_ASSIGNMENTS;
      this.cache.assignments = assignments;
      return assignments;
    } catch (error) {
      console.error('[DataStore] getWorksheetAssignments error:', error);
      return WORKSHEET_ASSIGNMENTS;
    }
  }

  async setWorksheetAssignments(assignments) {
    try {
      await AsyncStorage.setItem(STORE_KEYS.WORKSHEET_ASSIGNMENTS, JSON.stringify(assignments));
      this.cache.assignments = assignments;
    } catch (error) {
      console.error('[DataStore] setWorksheetAssignments error:', error);
    }
  }

  async assignWorksheet(clientId, therapistId, worksheetId, dueDate, notes = '', priority = 'medium') {
    try {
      const assignments = await this.getWorksheetAssignments();
      const newAssignment = {
        id: `assign_${Date.now()}`,
        clientId,
        therapistId,
        worksheetId,
        assignedDate: new Date().toISOString(),
        dueDate,
        status: 'pending',
        priority,
        notes,
        sharedWith: 'therapist',
      };
      const updatedAssignments = [...assignments, newAssignment];
      await this.setWorksheetAssignments(updatedAssignments);
      return newAssignment;
    } catch (error) {
      console.error('[DataStore] assignWorksheet error:', error);
      return null;
    }
  }

  async updateAssignmentStatus(assignmentId, status) {
    try {
      const assignments = await this.getWorksheetAssignments();
      const updatedAssignments = assignments.map(a => 
        a.id === assignmentId ? { ...a, status } : a
      );
      await this.setWorksheetAssignments(updatedAssignments);
    } catch (error) {
      console.error('[DataStore] updateAssignmentStatus error:', error);
    }
  }

  async getAssignmentsByClient(clientId) {
    const assignments = await this.getWorksheetAssignments();
    return assignments.filter(a => a.clientId === clientId).sort((a, b) => new Date(b.assignedDate) - new Date(a.assignedDate));
  }

  async getAssignmentsByTherapist(therapistId) {
    const assignments = await this.getWorksheetAssignments();
    return assignments.filter(a => a.therapistId === therapistId).sort((a, b) => new Date(b.assignedDate) - new Date(a.assignedDate));
  }

  // THERAPY PROGRAMS
  async getTherapyPrograms() {
    if (this.cache.programs) return this.cache.programs;
    try {
      const data = await AsyncStorage.getItem(STORE_KEYS.THERAPY_PROGRAMS);
      const programs = data ? JSON.parse(data) : THERAPY_PROGRAMS;
      this.cache.programs = programs;
      return programs;
    } catch (error) {
      console.error('[DataStore] getTherapyPrograms error:', error);
      return THERAPY_PROGRAMS;
    }
  }

  async setTherapyPrograms(programs) {
    try {
      await AsyncStorage.setItem(STORE_KEYS.THERAPY_PROGRAMS, JSON.stringify(programs));
      this.cache.programs = programs;
    } catch (error) {
      console.error('[DataStore] setTherapyPrograms error:', error);
    }
  }

  // THERAPIST NOTES
  async getTherapistNotes() {
    if (this.cache.notes) return this.cache.notes;
    try {
      const data = await AsyncStorage.getItem(STORE_KEYS.THERAPIST_NOTES);
      const notes = data ? JSON.parse(data) : THERAPIST_NOTES;
      this.cache.notes = notes;
      return notes;
    } catch (error) {
      console.error('[DataStore] getTherapistNotes error:', error);
      return THERAPIST_NOTES;
    }
  }

  async setTherapistNotes(notes) {
    try {
      await AsyncStorage.setItem(STORE_KEYS.THERAPIST_NOTES, JSON.stringify(notes));
      this.cache.notes = notes;
    } catch (error) {
      console.error('[DataStore] setTherapistNotes error:', error);
    }
  }

  async addTherapistNote(clientId, therapistId, content, category = 'observation') {
    try {
      const notes = await this.getTherapistNotes();
      const newNote = {
        id: `note_${Date.now()}`,
        clientId,
        therapistId,
        date: new Date().toISOString(),
        content,
        category,
      };
      const updatedNotes = [...notes, newNote];
      await this.setTherapistNotes(updatedNotes);
      return newNote;
    } catch (error) {
      console.error('[DataStore] addTherapistNote error:', error);
      return null;
    }
  }

  async getNotesByClient(clientId) {
    const notes = await this.getTherapistNotes();
    return notes.filter(n => n.clientId === clientId).sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // ============================
  // ADMIN-MANAGED CONTENT — generic CRUD helpers
  // ============================
  async _getCollection(storeKey, cacheKey, fallback) {
    if (this.cache[cacheKey]) return this.cache[cacheKey];
    try {
      const data = await AsyncStorage.getItem(storeKey);
      const list = data ? JSON.parse(data) : fallback;
      this.cache[cacheKey] = list;
      return list;
    } catch (e) {
      console.error('[DataStore]', cacheKey, 'get error:', e);
      return fallback;
    }
  }

  async _setCollection(storeKey, cacheKey, items) {
    try {
      await AsyncStorage.setItem(storeKey, JSON.stringify(items));
      this.cache[cacheKey] = items;
    } catch (e) {
      console.error('[DataStore]', cacheKey, 'set error:', e);
    }
  }

  async _addToCollection(storeKey, cacheKey, item, prefix) {
    const list = await this._getCollection(storeKey, cacheKey, []);
    const newItem = {
      id: item.id || `${prefix}_${Date.now()}`,
      createdAt: item.createdAt || new Date().toISOString(),
      ...item,
    };
    // Ensure id and createdAt aren't overridden by item if it had them
    if (!item.id) newItem.id = `${prefix}_${Date.now()}`;
    if (!item.createdAt) newItem.createdAt = new Date().toISOString();
    const updated = [newItem, ...list];
    await this._setCollection(storeKey, cacheKey, updated);
    return newItem;
  }

  async _updateInCollection(storeKey, cacheKey, id, patch) {
    const list = await this._getCollection(storeKey, cacheKey, []);
    const updated = list.map((x) => (x.id === id ? { ...x, ...patch } : x));
    await this._setCollection(storeKey, cacheKey, updated);
  }

  async _deleteFromCollection(storeKey, cacheKey, id) {
    const list = await this._getCollection(storeKey, cacheKey, []);
    const updated = list.filter((x) => x.id !== id);
    await this._setCollection(storeKey, cacheKey, updated);
  }

  // ===== AFFIRMATIONS =====
  async getAffirmations() {
    return this._getCollection(STORE_KEYS.AFFIRMATIONS, 'affirmations', []);
  }
  async setAffirmations(items) {
    return this._setCollection(STORE_KEYS.AFFIRMATIONS, 'affirmations', items);
  }
  async addAffirmation(data) {
    return this._addToCollection(STORE_KEYS.AFFIRMATIONS, 'affirmations', data, 'af');
  }
  async updateAffirmation(id, patch) {
    return this._updateInCollection(STORE_KEYS.AFFIRMATIONS, 'affirmations', id, patch);
  }
  async deleteAffirmation(id) {
    return this._deleteFromCollection(STORE_KEYS.AFFIRMATIONS, 'affirmations', id);
  }

  // ===== COPING TOOLS =====
  async getCopingTools() {
    return this._getCollection(STORE_KEYS.COPING_TOOLS, 'copingTools', []);
  }
  async setCopingTools(items) {
    return this._setCollection(STORE_KEYS.COPING_TOOLS, 'copingTools', items);
  }
  async addCopingTool(data) {
    return this._addToCollection(STORE_KEYS.COPING_TOOLS, 'copingTools', data, 'ct');
  }
  async updateCopingTool(id, patch) {
    return this._updateInCollection(STORE_KEYS.COPING_TOOLS, 'copingTools', id, patch);
  }
  async deleteCopingTool(id) {
    return this._deleteFromCollection(STORE_KEYS.COPING_TOOLS, 'copingTools', id);
  }

  // ===== RESOURCES (library, admin-managed) =====
  async getResources() {
    return this._getCollection(STORE_KEYS.RESOURCES, 'resources', []);
  }
  async setResources(items) {
    return this._setCollection(STORE_KEYS.RESOURCES, 'resources', items);
  }
  async addResource(data) {
    return this._addToCollection(STORE_KEYS.RESOURCES, 'resources', data, 'res');
  }
  async updateResource(id, patch) {
    return this._updateInCollection(STORE_KEYS.RESOURCES, 'resources', id, patch);
  }
  async deleteResource(id) {
    // Also clean up client-resource assignments referencing this resource
    await this._deleteFromCollection(STORE_KEYS.RESOURCES, 'resources', id);
    const assignments = await this.getClientResources();
    const filtered = assignments.filter((cr) => cr.resourceId !== id);
    await this.setClientResources(filtered);
  }

  // ===== CLIENT RESOURCES (per-client assignments) =====
  async getClientResources() {
    return this._getCollection(
      STORE_KEYS.CLIENT_RESOURCES,
      'clientResources',
      []
    );
  }
  async setClientResources(items) {
    return this._setCollection(
      STORE_KEYS.CLIENT_RESOURCES,
      'clientResources',
      items
    );
  }
  async getClientResourcesByClient(clientId) {
    const all = await this.getClientResources();
    return all
      .filter((cr) => cr.clientId === clientId)
      .sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt));
  }
  async assignResourceToClient(clientId, resourceId, therapistId, note = '') {
    return this._addToCollection(
      STORE_KEYS.CLIENT_RESOURCES,
      'clientResources',
      {
        clientId,
        resourceId,
        assignedBy: therapistId,
        assignedAt: new Date().toISOString(),
        note,
      },
      'cr'
    );
  }
  async removeClientResource(id) {
    return this._deleteFromCollection(
      STORE_KEYS.CLIENT_RESOURCES,
      'clientResources',
      id
    );
  }

  // ===== DATE IDEAS =====
  async getDateIdeas() {
    return this._getCollection(STORE_KEYS.DATE_IDEAS, 'dateIdeas', []);
  }
  async setDateIdeas(items) {
    return this._setCollection(STORE_KEYS.DATE_IDEAS, 'dateIdeas', items);
  }
  async addDateIdea(data) {
    return this._addToCollection(STORE_KEYS.DATE_IDEAS, 'dateIdeas', data, 'di');
  }
  async updateDateIdea(id, patch) {
    return this._updateInCollection(STORE_KEYS.DATE_IDEAS, 'dateIdeas', id, patch);
  }
  async deleteDateIdea(id) {
    return this._deleteFromCollection(STORE_KEYS.DATE_IDEAS, 'dateIdeas', id);
  }

  // ===== CUSTOM WORKSHEETS (admin-created, merged with templates) =====
  async getCustomWorksheets() {
    return this._getCollection(
      STORE_KEYS.CUSTOM_WORKSHEETS,
      'customWorksheets',
      []
    );
  }
  async setCustomWorksheets(items) {
    return this._setCollection(
      STORE_KEYS.CUSTOM_WORKSHEETS,
      'customWorksheets',
      items
    );
  }
  async addCustomWorksheet(data) {
    return this._addToCollection(
      STORE_KEYS.CUSTOM_WORKSHEETS,
      'customWorksheets',
      data,
      'ws_custom'
    );
  }
  async deleteCustomWorksheet(id) {
    return this._deleteFromCollection(
      STORE_KEYS.CUSTOM_WORKSHEETS,
      'customWorksheets',
      id
    );
  }

  // ============================
  // COUPLES SYNC — pairings, check-ins, repair requests, appreciations,
  // conflict pauses, shared goals
  // ============================

  // ===== COUPLE PAIRINGS =====
  async getCouplePairings() {
    return this._getCollection(STORE_KEYS.COUPLE_PAIRINGS, 'couplePairings', []);
  }
  async setCouplePairings(items) {
    return this._setCollection(STORE_KEYS.COUPLE_PAIRINGS, 'couplePairings', items);
  }
  async getActivePairingForUser(userId) {
    const all = await this.getCouplePairings();
    return all.find(
      (p) =>
        p.status === 'active' &&
        (p.partnerAId === userId || p.partnerBId === userId)
    );
  }
  async getPartnerIdForUser(userId) {
    const p = await this.getActivePairingForUser(userId);
    if (!p) return null;
    return p.partnerAId === userId ? p.partnerBId : p.partnerAId;
  }
  async createPairingInvite(userId) {
    const code =
      'COUP-' +
      Math.random().toString(36).slice(2, 7).toUpperCase() +
      '-' +
      Math.random().toString(36).slice(2, 7).toUpperCase();
    return this._addToCollection(
      STORE_KEYS.COUPLE_PAIRINGS,
      'couplePairings',
      {
        partnerAId: userId,
        partnerBId: null,
        inviteCode: code,
        status: 'pending',
        createdAt: new Date().toISOString(),
        pairedAt: null,
      },
      'cp'
    );
  }
  async acceptPairingInvite(code, userId) {
    const all = await this.getCouplePairings();
    const pairing = all.find(
      (p) =>
        p.inviteCode === code &&
        p.status === 'pending' &&
        p.partnerAId !== userId
    );
    if (!pairing) {
      throw new Error('Invite code not found or already used.');
    }
    return this._updateInCollection(
      STORE_KEYS.COUPLE_PAIRINGS,
      'couplePairings',
      pairing.id,
      {
        partnerBId: userId,
        status: 'active',
        pairedAt: new Date().toISOString(),
      }
    );
  }
  async disconnectPairing(pairingId) {
    return this._updateInCollection(
      STORE_KEYS.COUPLE_PAIRINGS,
      'couplePairings',
      pairingId,
      { status: 'disconnected', disconnectedAt: new Date().toISOString() }
    );
  }

  // ===== PARTNER CHECK-INS =====
  async getPartnerCheckins() {
    return this._getCollection(STORE_KEYS.PARTNER_CHECKINS, 'partnerCheckins', []);
  }
  async setPartnerCheckins(items) {
    return this._setCollection(STORE_KEYS.PARTNER_CHECKINS, 'partnerCheckins', items);
  }
  async getCheckinsByUser(userId) {
    const all = await this.getPartnerCheckins();
    return all
      .filter((c) => c.userId === userId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  async getLatestCheckinForUser(userId) {
    const list = await this.getCheckinsByUser(userId);
    return list[0] || null;
  }
  async addPartnerCheckin(data) {
    return this._addToCollection(
      STORE_KEYS.PARTNER_CHECKINS,
      'partnerCheckins',
      { ...data, date: data.date || new Date().toISOString() },
      'pci'
    );
  }

  // ===== REPAIR REQUESTS =====
  async getRepairRequests() {
    return this._getCollection(STORE_KEYS.REPAIR_REQUESTS, 'repairRequests', []);
  }
  async setRepairRequests(items) {
    return this._setCollection(STORE_KEYS.REPAIR_REQUESTS, 'repairRequests', items);
  }
  async getRepairRequestsForUser(userId) {
    const all = await this.getRepairRequests();
    return all
      .filter((r) => r.fromUserId === userId || r.toUserId === userId)
      .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
  }
  async sendRepairRequest(fromUserId, toUserId, message) {
    return this._addToCollection(
      STORE_KEYS.REPAIR_REQUESTS,
      'repairRequests',
      {
        fromUserId,
        toUserId,
        message,
        sentAt: new Date().toISOString(),
        status: 'sent',
      },
      'rr'
    );
  }
  async respondToRepairRequest(id, response) {
    return this._updateInCollection(
      STORE_KEYS.REPAIR_REQUESTS,
      'repairRequests',
      id,
      {
        status: 'acknowledged',
        response,
        respondedAt: new Date().toISOString(),
      }
    );
  }

  // ===== APPRECIATIONS =====
  async getAppreciations() {
    return this._getCollection(STORE_KEYS.APPRECIATIONS, 'appreciations', []);
  }
  async setAppreciations(items) {
    return this._setCollection(STORE_KEYS.APPRECIATIONS, 'appreciations', items);
  }
  async getAppreciationsForUser(userId) {
    const all = await this.getAppreciations();
    return all
      .filter((a) => a.fromUserId === userId || a.toUserId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  async sendAppreciation(fromUserId, toUserId, type, text) {
    return this._addToCollection(
      STORE_KEYS.APPRECIATIONS,
      'appreciations',
      { fromUserId, toUserId, type, text },
      'ap'
    );
  }

  // ===== CONFLICT PAUSES =====
  async getConflictPauses() {
    return this._getCollection(STORE_KEYS.CONFLICT_PAUSES, 'conflictPauses', []);
  }
  async setConflictPauses(items) {
    return this._setCollection(STORE_KEYS.CONFLICT_PAUSES, 'conflictPauses', items);
  }
  async startConflictPause(initiatedByUserId, partnerId, durationMin = 20) {
    return this._addToCollection(
      STORE_KEYS.CONFLICT_PAUSES,
      'conflictPauses',
      {
        initiatedByUserId,
        partnerId,
        durationMin,
        startedAt: new Date().toISOString(),
        status: 'active',
      },
      'cpz'
    );
  }
  async completeConflictPause(id, returnNote = '') {
    return this._updateInCollection(
      STORE_KEYS.CONFLICT_PAUSES,
      'conflictPauses',
      id,
      {
        status: 'completed',
        completedAt: new Date().toISOString(),
        returnNote,
      }
    );
  }

  // ===== SHARED GOALS =====
  async getSharedGoals() {
    return this._getCollection(STORE_KEYS.SHARED_GOALS, 'sharedGoals', []);
  }
  async setSharedGoals(items) {
    return this._setCollection(STORE_KEYS.SHARED_GOALS, 'sharedGoals', items);
  }
  async getSharedGoalsForPairing(pairingId) {
    const all = await this.getSharedGoals();
    return all.filter((g) => g.pairingId === pairingId);
  }
  async addSharedGoal(pairingId, title, description) {
    return this._addToCollection(
      STORE_KEYS.SHARED_GOALS,
      'sharedGoals',
      {
        pairingId,
        title,
        description: description || '',
        progress: 0,
        therapistReviewed: false,
      },
      'sg'
    );
  }
  async updateSharedGoalProgress(id, progress) {
    return this._updateInCollection(
      STORE_KEYS.SHARED_GOALS,
      'sharedGoals',
      id,
      { progress }
    );
  }

  // Invalidate cache
  invalidateCache() {
    this.cache = {};
  }
}

export default new DataStore();
