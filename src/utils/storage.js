/**
 * Samuel Tic-Tac-Toe — Local Storage & Persistence Engine
 * Built for Chukwuma Samuel
 */

const STORAGE_KEYS = {
  SCORES: 'samuel_ttt_scores',
  STREAK: 'samuel_ttt_streak',
  PLAYER_NAMES: 'samuel_ttt_player_names',
  MATCH_HISTORY: 'samuel_ttt_match_history',
  GAME_MODE: 'samuel_ttt_game_mode',
  DIFFICULTY: 'samuel_ttt_difficulty',
  MATCH_LENGTH: 'samuel_ttt_match_length',
  COLOR_MODE: 'samuel_ttt_color_mode',
  THEME: 'samuel_ttt_theme',
};

const DEFAULT_SCORES = { x: 0, o: 0, draws: 0 };
const DEFAULT_STREAK = { player: null, count: 0, best: 0 };
const DEFAULT_NAMES = { X: 'Player 1', O: 'Player 2' };

/**
 * Safely loads JSON data from localStorage with fallback
 */
export function getStoredItem(key, fallback) {
  if (typeof window === 'undefined' && typeof localStorage === 'undefined') {
    return fallback;
  }
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

/**
 * Safely writes JSON data to localStorage
 */
export function setStoredItem(key, value) {
  if (typeof window === 'undefined' && typeof localStorage === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error saving ${key} to localStorage:`, err);
  }
}

/**
 * Loads all initial persistent state for the application
 */
export function loadInitialState() {
  return {
    scores: getStoredItem(STORAGE_KEYS.SCORES, DEFAULT_SCORES),
    streak: getStoredItem(STORAGE_KEYS.STREAK, DEFAULT_STREAK),
    playerNames: getStoredItem(STORAGE_KEYS.PLAYER_NAMES, DEFAULT_NAMES),
    matchHistory: getStoredItem(STORAGE_KEYS.MATCH_HISTORY, []),
    gameMode: getStoredItem(STORAGE_KEYS.GAME_MODE, 'pvp'),
    difficulty: getStoredItem(STORAGE_KEYS.DIFFICULTY, 'medium'),
    matchLength: getStoredItem(STORAGE_KEYS.MATCH_LENGTH, 'single'), // 'single' | 3 | 5
    colorMode: getStoredItem(STORAGE_KEYS.COLOR_MODE, 'light'), // 'light' | 'dark'
    activeTheme: getStoredItem(STORAGE_KEYS.THEME, 'classic'), // 'classic' | 'neon' | 'cyberpunk' | 'minimal' | 'glassmorphism'
  };
}

/**
 * Persists scores
 */
export function saveScores(scores) {
  setStoredItem(STORAGE_KEYS.SCORES, scores);
}

/**
 * Persists streak
 */
export function saveStreak(streak) {
  setStoredItem(STORAGE_KEYS.STREAK, streak);
}

/**
 * Persists player names
 */
export function savePlayerNames(names) {
  setStoredItem(STORAGE_KEYS.PLAYER_NAMES, names);
}

/**
 * Persists match history
 */
export function saveMatchHistory(history) {
  setStoredItem(STORAGE_KEYS.MATCH_HISTORY, history);
}

/**
 * Persists game mode
 */
export function saveGameMode(mode) {
  setStoredItem(STORAGE_KEYS.GAME_MODE, mode);
}

/**
 * Persists AI difficulty
 */
export function saveDifficulty(diff) {
  setStoredItem(STORAGE_KEYS.DIFFICULTY, diff);
}

/**
 * Persists Match Length ('single' | 3 | 5)
 */
export function saveMatchLength(length) {
  setStoredItem(STORAGE_KEYS.MATCH_LENGTH, length);
}

/**
 * Persists Color Mode ('light' | 'dark')
 */
export function saveColorMode(mode) {
  setStoredItem(STORAGE_KEYS.COLOR_MODE, mode);
}

/**
 * Persists Active Theme ('classic' | 'neon' | 'cyberpunk' | 'minimal' | 'glassmorphism')
 */
export function saveTheme(theme) {
  setStoredItem(STORAGE_KEYS.THEME, theme);
}

/**
 * Appends a completed match record to history and saves to localStorage
 */
export function recordMatch(history, matchData) {
  const newRecord = {
    id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    timestamp: Date.now(),
    ...matchData,
  };
  const updatedHistory = [newRecord, ...history];
  saveMatchHistory(updatedHistory);
  return updatedHistory;
}
