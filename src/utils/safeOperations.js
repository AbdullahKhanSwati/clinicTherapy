import AsyncStorage from '@react-native-async-storage/async-storage';

// Safe async storage operations with error handling
export const safeAsyncStorage = {
  getItem: async (key, defaultValue = null) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null ? value : defaultValue;
    } catch (error) {
      console.log('[v0] Error getting async storage item:', key, error);
      return defaultValue;
    }
  },

  setItem: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.log('[v0] Error setting async storage item:', key, error);
      return false;
    }
  },

  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.log('[v0] Error removing async storage item:', key, error);
      return false;
    }
  },

  multiSet: async (items) => {
    try {
      await AsyncStorage.multiSet(items);
      return true;
    } catch (error) {
      console.log('[v0] Error in multiSet:', error);
      return false;
    }
  },

  multiRemove: async (keys) => {
    try {
      await AsyncStorage.multiRemove(keys);
      return true;
    } catch (error) {
      console.log('[v0] Error in multiRemove:', error);
      return false;
    }
  },
};

// Safe JSON parsing
export const safeJsonParse = (jsonString, defaultValue = null) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.log('[v0] Error parsing JSON:', error);
    return defaultValue;
  }
};

// Safe function wrapper for catching async errors
export const tryCatch = async (asyncFn, fallbackValue = null) => {
  try {
    return await asyncFn();
  } catch (error) {
    console.log('[v0] Async operation error:', error);
    return fallbackValue;
  }
};

// Debounce utility for reducing rapid calls
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
