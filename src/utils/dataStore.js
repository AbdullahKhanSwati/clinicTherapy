// DataStore - Manages all data persistence with AsyncStorage
// Simulates a backend database for the app

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_USERS, MOOD_ENTRIES, JOURNAL_ENTRIES, WORKSHEETS_COMPLETED, WORKSHEET_ASSIGNMENTS, THERAPY_PROGRAMS, THERAPIST_NOTES } from '../data/mockData';

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
};

const ASSIGNMENTS_SEED_VERSION = 'v2';

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
        await AsyncStorage.setItem(
          STORE_KEYS.ASSIGNMENTS_SEED_VERSION,
          ASSIGNMENTS_SEED_VERSION
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

  // Invalidate cache
  invalidateCache() {
    this.cache = {};
  }
}

export default new DataStore();
