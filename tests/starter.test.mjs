import { getNextStarter } from '../src/utils/gameLogic.js';

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

console.log('\n--- Running Tests for "Loser Goes First" Starter Logic ---');

// X wins -> O (the loser) starts next
assert(getNextStarter('X', 'X') === 'O', 'X won → O starts next');
assert(getNextStarter('O', 'X') === 'O', 'X won (O started) → O starts next');
// O wins -> X (the loser) starts next
assert(getNextStarter('X', 'O') === 'X', 'O won → X starts next');
assert(getNextStarter('O', 'O') === 'X', 'O won (O started) → X starts next');
// Draw -> alternate
assert(getNextStarter('X', null) === 'O', 'Draw after X started → O starts next');
assert(getNextStarter('O', null) === 'X', 'Draw after O started → X starts next');

console.log(`\n========================================`);
console.log(`Starter Logic Test Summary: ${passed} passed, ${failed} failed`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
