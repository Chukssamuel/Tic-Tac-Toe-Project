import { getAiMove, getAvailableMoves, findImmediateWinningMove, DIFFICULTY } from '../src/utils/aiLogic.js';

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

console.log('\n--- Running Unit Tests for Samuel Tic-Tac-Toe AI Engine ---');

// 1. Available Moves
console.log('\n1. Testing Available Moves:');
const b1 = ['X', 'O', null, null, 'X', null, 'O', null, null];
const moves = getAvailableMoves(b1);
assert(moves.length === 5, 'Found 5 empty cells');
assert(JSON.stringify(moves) === JSON.stringify([2, 3, 5, 7, 8]), 'Correct empty cell indices');

// 2. Immediate Winning Moves
console.log('\n2. Testing Immediate Winning Move Detection:');
// Row 0: [O, O, null] -> index 2 is win for O
const winBoard = ['O', 'O', null, 'X', 'X', null, null, null, null];
const winMoveO = findImmediateWinningMove(winBoard, 'O');
assert(winMoveO === 2, 'Detected index 2 as winning move for O');

const blockMoveX = findImmediateWinningMove(winBoard, 'X');
assert(blockMoveX === 5, 'Detected index 5 as winning move for X');

// 3. Medium AI Behavior (Take Win & Block Win)
console.log('\n3. Testing Medium AI Behavior:');
// Board where O can win at index 2
const medWinMove = getAiMove(winBoard, DIFFICULTY.MEDIUM, 'O', 'X');
assert(medWinMove === 2, 'Medium AI seized the winning move at index 2');

// Board where X is about to win at index 8 -> O must block index 8
const blockBoard = [
  'X', 'O', null,
  null, 'X', null,
  null, null, null
];
// X has [0, 4], about to win at 8
const medBlockMove = getAiMove(blockBoard, DIFFICULTY.MEDIUM, 'O', 'X');
assert(medBlockMove === 8, 'Medium AI blocked Human X diagonal win at index 8');

// 4. Hard AI / Minimax Unbeatable Logic
console.log('\n4. Testing Hard (Minimax) AI Logic:');
// X has taken corners [0, 8]. AI must take center [4] or optimal block to prevent fork
const forkThreatBoard = [
  'X', null, null,
  null, 'O', null,
  null, null, 'X'
];
const hardMove = getAiMove(forkThreatBoard, DIFFICULTY.HARD, 'O', 'X');
const validDefenseMoves = [1, 3, 5, 7];
assert(
  validDefenseMoves.includes(hardMove),
  `Hard AI chose edge move ${hardMove} to counter corner diagonal fork threat`
);

// Hard AI wins when winning move is available
const hardWinBoard = [
  'O', 'O', null,
  'X', 'X', null,
  null, null, null
];
const hardWin = getAiMove(hardWinBoard, DIFFICULTY.HARD, 'O', 'X');
assert(hardWin === 2, 'Hard AI took guaranteed win at index 2');

// Hard AI blocks when Human is about to win
const hardBlockBoard = [
  'X', 'X', null,
  'O', null, null,
  null, null, null
];
const hardBlock = getAiMove(hardBlockBoard, DIFFICULTY.HARD, 'O', 'X');
assert(hardBlock === 2, 'Hard AI blocked Human win at index 2');

console.log(`\n========================================`);
console.log(`AI Test Summary: ${passed} passed, ${failed} failed`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

