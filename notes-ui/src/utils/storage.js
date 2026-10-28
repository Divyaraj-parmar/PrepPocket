import { initialNotes, initialQuestions } from '../data/initialData';

const STORAGE_KEYS = {
  NOTES: 'preppocket_notes',
  QUESTIONS: 'preppocket_questions',
  VERSION: 'preppocket_storage_version',
  LAST_TAB: 'preppocket_last_tab'
};

const CURRENT_VERSION = 'v1.0';

export const storage = {
  getNotes: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Error reading notes from localStorage:', e);
    }
    // Seed default notes
    storage.saveNotes(initialNotes);
    return initialNotes;
  },

  getQuestions: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Error reading questions from localStorage:', e);
    }
    // Seed default questions
    storage.saveQuestions(initialQuestions);
    return initialQuestions;
  },

  saveNotes: (notes) => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    } catch (e) {
      console.error('Error saving notes to localStorage:', e);
    }
  },

  saveQuestions: (questions) => {
    try {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
    } catch (e) {
      console.error('Error saving questions to localStorage:', e);
    }
  },

  resetToDefault: () => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(initialNotes));
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(initialQuestions));
      localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
    } catch (e) {
      console.error('Error resetting demo data:', e);
    }
    return {
      notes: initialNotes,
      questions: initialQuestions
    };
  },

  getLastTab: () => {
    try {
      const tab = localStorage.getItem(STORAGE_KEYS.LAST_TAB);
      if (tab === 'notes' || tab === 'questions') return tab;
    } catch (e) {
      console.warn('Error reading last tab from localStorage:', e);
    }
    return 'notes'; // default
  },

  saveLastTab: (tab) => {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_TAB, tab);
    } catch (e) {
      console.warn('Error saving last tab to localStorage:', e);
    }
  }
};
