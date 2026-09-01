import {
  getStoredItem,
  setStoredItem,
  recordMatch,
  loadInitialState,
} from '../src/utils/storage.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('\n--- Running Unit Tests for Storage Engine ---');

// Mock localStorage for Node environment
globalThis.localStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Test 1: Load defaults when storage is empty
console.log('\n1. Testing Default Storage Fallbacks:');
const initial = loadInitialState();
assert(initial.scores.x === 0 && initial.scores.o === 0, 'Default scores initialized');
assert(Array.isArray(initial.matchHistory) && initial.matchHistory.length === 0, 'Empty match history initialized');

// Test 2: Record a match
console.log('\n2. Testing Match Recording:');
const history1 = recordMatch([], {
  gameMode: 'ai',
  winner: 'X',
  winnerName: 'You',
  playerX: 'You',
  playerO: 'Flowai',
  moveCount: 5,
});

assert(history1.length === 1, 'Match appended to history');
assert(history1[0].winnerName === 'You', 'Correct winner recorded');
assert(history1[0].moveCount === 5, 'Correct move count recorded');
assert(typeof history1[0].id === 'string', 'Generated unique match ID');

// Test 3: Reload from storage
console.log('\n3. Testing Storage Persistence:');
const reloaded = loadInitialState();
assert(reloaded.matchHistory.length === 1, 'Persisted match history reloaded successfully');
assert(reloaded.matchHistory[0].winner === 'X', 'Persisted match details match recorded data');

console.log(`\n========================================`);
console.log(`Storage Test Summary: ${passed} passed, ${failed} failed`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

