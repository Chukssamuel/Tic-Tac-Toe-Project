import {
  checkWinner,
  checkDraw,
  getWinningLines,
  getBoardSizeFromCells,
} from '../src/utils/gameLogic.js';
import { getAiMove, getCenterCells, getCornerCells, DIFFICULTY } from '../src/utils/aiLogic.js';

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

console.log('\n--- Running Tests for Larger Board Sizes (4x4 & 5x5) ---');

// 1. Winning line generation
console.log('\n1. Winning line generation:');
assert(getWinningLines(3).length === 8, '3x3 board has 8 winning lines');
assert(getWinningLines(4).length === 10, '4x4 board has 10 winning lines (4 rows + 4 cols + 2 diagonals)');
assert(getWinningLines(5).length === 12, '5x5 board has 12 winning lines');
assert(getBoardSizeFromCells(16) === 4, '16 cells -> size 4');
assert(getBoardSizeFromCells(25) === 5, '25 cells -> size 5');

// 2. Center & corner helpers
console.log('\n2. Center & corner helpers:');
assert(JSON.stringify(getCenterCells(3)) === JSON.stringify([4]), '3x3 center is [4]');
assert(JSON.stringify(getCenterCells(4).sort((a, b) => a - b)) === JSON.stringify([5, 6, 9, 10]), '4x4 centers are [5,6,9,10]');
assert(JSON.stringify(getCenterCells(5)) === JSON.stringify([12]), '5x5 center is [12]');
assert(JSON.stringify(getCornerCells(4)) === JSON.stringify([0, 3, 12, 15]), '4x4 corners are [0,3,12,15]');

// 3. Win detection on a 4x4 board
console.log('\n3. Win detection on 4x4:');
// Row win: fill row 1 (indices 4,5,6,7)
const rowWin4 = Array(16).fill(null);
[4, 5, 6, 7].forEach((i) => (rowWin4[i] = 'O'));
assert(checkWinner(rowWin4).winner === 'O', '4x4 row win detected for O');
assert(JSON.stringify(checkWinner(rowWin4).winningCells) === JSON.stringify([4, 5, 6, 7]), '4x4 row winning cells correct');

// Column win: column 3 (indices 3,7,11,15)
const colWin4 = Array(16).fill(null);
[3, 7, 11, 15].forEach((i) => (colWin4[i] = 'X'));
assert(checkWinner(colWin4).winner === 'X', '4x4 column win detected for X');

// Diagonal win: top-left -> bottom-right (0,5,10,15)
const diagWin4 = Array(16).fill(null);
[0, 5, 10, 15].forEach((i) => (diagWin4[i] = 'X'));
assert(checkWinner(diagWin4).winner === 'X', '4x4 main diagonal win detected');

// Anti-diagonal win: top-right -> bottom-left (3,6,9,12)
const antiDiag4 = Array(16).fill(null);
[3, 6, 9, 12].forEach((i) => (antiDiag4[i] = 'O'));
assert(checkWinner(antiDiag4).winner === 'O', '4x4 anti-diagonal win detected');

// 4. Win detection on a 5x5 board
console.log('\n4. Win detection on 5x5:');
const rowWin5 = Array(25).fill(null);
[0, 1, 2, 3, 4].forEach((i) => (rowWin5[i] = 'X'));
assert(checkWinner(rowWin5).winner === 'X', '5x5 row win detected');

const diagWin5 = Array(25).fill(null);
[0, 6, 12, 18, 24].forEach((i) => (diagWin5[i] = 'O'));
assert(checkWinner(diagWin5).winner === 'O', '5x5 diagonal win detected');

// 5. Draw detection on a full 4x4 board with no winner
console.log('\n5. Draw detection on 4x4:');
// Explicit pattern with no full row/column/diagonal for either player
const full4 = ['X', 'X', 'O', 'O', 'O', 'O', 'X', 'X', 'X', 'X', 'O', 'O', 'O', 'O', 'X', 'X'];
assert(checkWinner(full4).winner === null, 'Full 4x4 board has no winner');
assert(checkDraw(full4, null) === true, 'Full 4x4 board is a draw');

// 6. AI on larger boards: wins and blocks correctly
console.log('\n6. AI on larger boards:');
// 4x4: O can win immediately on row 1 (indices 4,5,6 need one more at 7)
const aiWin4 = Array(16).fill(null);
aiWin4[4] = 'O';
aiWin4[5] = 'O';
aiWin4[6] = 'O';
const aiWinMove = getAiMove(aiWin4, DIFFICULTY.MEDIUM, 'O', 'X');
assert(aiWinMove === 7, 'Medium AI on 4x4 takes immediate winning move at index 7');

// 4x4: AI must block human X's immediate win (X has 0,1,2 -> block 3)
const aiBlock4 = Array(16).fill(null);
aiBlock4[0] = 'X';
aiBlock4[1] = 'X';
aiBlock4[2] = 'X';
const aiBlockMove = getAiMove(aiBlock4, DIFFICULTY.HARD, 'O', 'X');
assert(aiBlockMove === 3, 'Hard AI on 4x4 blocks human win at index 3');

console.log(`\n========================================`);
console.log(`Board Logic Test Summary: ${passed} passed, ${failed} failed`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
