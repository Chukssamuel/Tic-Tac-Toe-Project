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
  HUMAN_SIDE: 'samuel_ttt_human_side',
  BOARD_SIZE: 'samuel_ttt_board_size',
  CLOCK_ENABLED: 'samuel_ttt_clock_enabled',
  CLOCK_MINUTES: 'samuel_ttt_clock_minutes',
  PIECE_COLORS: 'samuel_ttt_piece_colors',
};

const DEFAULT_SCORES = { x: 0, o: 0, draws: 0 };
const DEFAULT_STREAK = { player: null, count: 0, best: 0 };
const DEFAULT_NAMES = { X: 'Player 1', O: 'Player 2' };

/**
 * Safely loads JSON data from localStorage with fallback.
 * Bail out if `localStorage` is unavailable (e.g. server-side rendering).
 */
export function getStoredItem(key, fallback) {
  if (typeof localStorage === 'undefined') {
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
 * Safely writes JSON data to localStorage.
 * Bail out if `localStorage` is unavailable (e.g. server-side rendering).
 */
export function setStoredItem(key, value) {
  if (typeof localStorage === 'undefined') {
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
    activeTheme: getStoredItem(STORAGE_KEYS.THEME, 'classic'), // 'classic' | 'neon' | 'cyberpunk' | 'minimal' | 'glassmorphism' | 'forest'
    humanSide: getStoredItem(STORAGE_KEYS.HUMAN_SIDE, 'X'), // 'X' | 'O' (vs AI)
    boardSize: getStoredItem(STORAGE_KEYS.BOARD_SIZE, 3), // 3 | 4 | 5
    clockEnabled: getStoredItem(STORAGE_KEYS.CLOCK_ENABLED, false),
    clockMinutes: getStoredItem(STORAGE_KEYS.CLOCK_MINUTES, 2), // 1 | 2 | 3 | 5
    pieceColors: getStoredItem(STORAGE_KEYS.PIECE_COLORS, { X: null, O: null }),
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
 * Persists Active Theme ('classic' | 'neon' | 'cyberpunk' | 'minimal' | 'glassmorphism' | 'forest')
 */
export function saveTheme(theme) {
  setStoredItem(STORAGE_KEYS.THEME, theme);
}

/**
 * Persists the human's side ('X' | 'O') when playing vs the AI
 */
export function saveHumanSide(side) {
  setStoredItem(STORAGE_KEYS.HUMAN_SIDE, side);
}

/**
 * Persists the board size (3 | 4 | 5)
 */
export function saveBoardSize(size) {
  setStoredItem(STORAGE_KEYS.BOARD_SIZE, size);
}

/**
 * Persists whether the match clock is enabled
 */
export function saveClockEnabled(enabled) {
  setStoredItem(STORAGE_KEYS.CLOCK_ENABLED, enabled);
}

/**
 * Persists the match clock time bank in minutes
 */
export function saveClockMinutes(minutes) {
  setStoredItem(STORAGE_KEYS.CLOCK_MINUTES, minutes);
}

/**
 * Persists custom piece colours for X and O.
 * A value of `null` means "use the active theme's colour".
 */
export function savePieceColors(colors) {
  setStoredItem(STORAGE_KEYS.PIECE_COLORS, colors);
}

/**
 * Appends a completed match record to history and saves to localStorage
 */
export function recordMatch(history, matchData) {
  const newRecord = {
    id: `match_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    ...matchData,
  };
  const updatedHistory = [newRecord, ...history];
  saveMatchHistory(updatedHistory);
  return updatedHistory;
}
