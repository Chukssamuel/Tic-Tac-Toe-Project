import { checkWinner, checkDraw, isBoardEmpty, getStatusMessage, WINNING_COMBINATIONS } from '../src/utils/gameLogic.js';

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

console.log('\n--- Running Unit Tests for Samuel Tic-Tac-Toe Game Logic ---');

// 1. Test All 8 Winning Combinations for Player X
console.log('\n1. Testing All 8 Winning Combinations (Player X):');
WINNING_COMBINATIONS.forEach((comb, idx) => {
  const board = Array(9).fill(null);
  comb.forEach((pos) => (board[pos] = 'X'));
  const res = checkWinner(board);
  assert(res.winner === 'X', `Combination #${idx + 1} [${comb.join(',')}] detected X win`);
  assert(
    JSON.stringify(res.winningCells) === JSON.stringify(comb),
    `Combination #${idx + 1} returned correct winningCells [${comb.join(',')}]`
  );
});

// 2. Test All 8 Winning Combinations for Player O
console.log('\n2. Testing Winning Combinations (Player O):');
const oComb = [0, 4, 8];
const oBoard = Array(9).fill(null);
oComb.forEach((pos) => (oBoard[pos] = 'O'));
const oRes = checkWinner(oBoard);
assert(oRes.winner === 'O', 'Diagonal combination [0,4,8] detected O win');

// 3. Test Draw Condition
console.log('\n3. Testing Draw Condition:');
// Board:
// X O X
// X X O
// O X O
const drawBoard = ['X', 'O', 'X', 'X', 'X', 'O', 'O', 'X', 'O'];
const drawWinRes = checkWinner(drawBoard);
const isDraw = checkDraw(drawBoard, drawWinRes.winner);
assert(drawWinRes.winner === null, 'No winner on full tie board');
assert(isDraw === true, 'Correctly detected draw condition');

// 4. Test Incomplete Game State (No win, not full)
console.log('\n4. Testing Incomplete Game State:');
const inProgressBoard = ['X', 'O', null, 'X', null, null, null, null, null];
const inProgRes = checkWinner(inProgressBoard);
const inProgDraw = checkDraw(inProgressBoard, inProgRes.winner);
assert(inProgRes.winner === null, 'No winner in progress');
assert(inProgDraw === false, 'Not a draw when empty cells remain');

// 5. Test Empty Board
console.log('\n5. Testing Empty Board:');
const emptyBoard = Array(9).fill(null);
assert(isBoardEmpty(emptyBoard) === true, 'Empty board recognized');
assert(checkWinner(emptyBoard).winner === null, 'Empty board has no winner');
assert(checkDraw(emptyBoard, null) === false, 'Empty board is not a draw');

// 6. Test Status Messages
console.log('\n6. Testing Status Messages:');
assert(getStatusMessage('X', false, 'O') === 'Player X Wins!', 'Correct winner X message');
assert(getStatusMessage('O', false, 'X') === 'Player O Wins!', 'Correct winner O message');
assert(getStatusMessage(null, true, 'X') === "It's a Draw!", 'Correct draw message');
assert(getStatusMessage(null, false, 'X') === "Player X's Turn", 'Correct turn message for X');
assert(getStatusMessage(null, false, 'O') === "Player O's Turn", 'Correct turn message for O');

console.log(`\n========================================`);
console.log(`Test Summary: ${passed} passed, ${failed} failed`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

