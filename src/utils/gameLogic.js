/**
 * Samuel Tic-Tac-Toe — Game Logic & Rule Engine
 * Built for Chukwuma Samuel
 *
 * Supports 3x3, 4x4 and 5x5 boards. Winning = a full row, column or
 * diagonal of length N (3-in-a-row on 3x3, 4 on 4x4, 5 on 5x5).
 */

export const WINNING_COMBINATIONS = [
  // Rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Columns
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonals
  [0, 4, 8],
  [2, 4, 6],
];

/**
 * Infers the board size (width/height) from the number of cells.
 * @param {number} cellCount
 * @returns {number}
 */
export function getBoardSizeFromCells(cellCount) {
  return Math.round(Math.sqrt(cellCount));
}

/**
 * Generates every winning line (rows, columns and both diagonals)
 * for a square board of the given size.
 * @param {number} size - Board width/height (e.g. 3, 4, 5)
 * @returns {number[][]}
 */
export function getWinningLines(size) {
  const lines = [];

  // Rows
  for (let r = 0; r < size; r++) {
    const row = [];
    for (let c = 0; c < size; c++) row.push(r * size + c);
    lines.push(row);
  }

  // Columns
  for (let c = 0; c < size; c++) {
    const col = [];
    for (let r = 0; r < size; r++) col.push(r * size + c);
    lines.push(col);
  }

  // Diagonal: top-left -> bottom-right
  const diag1 = [];
  for (let i = 0; i < size; i++) diag1.push(i * size + i);
  lines.push(diag1);

  // Diagonal: top-right -> bottom-left
  const diag2 = [];
  for (let i = 0; i < size; i++) diag2.push(i * size + (size - 1 - i));
  lines.push(diag2);

  return lines;
}

/**
 * Checks whether the current board state contains a winner.
 * Works for any square board (3x3, 4x4, 5x5, ...).
 * @param {Array<string|null>} board - Flat array of cells.
 * @returns {{ winner: 'X' | 'O' | null, winningCells: number[] }}
 */
export function checkWinner(board) {
  if (!board || board.length === 0) {
    return { winner: null, winningCells: [] };
  }

  const size = getBoardSizeFromCells(board.length);
  const lines = size === 3 ? WINNING_COMBINATIONS : getWinningLines(size);

  for (const line of lines) {
    const first = board[line[0]];
    if (first && line.every((idx) => board[idx] === first)) {
      return {
        winner: first,
        winningCells: line,
      };
    }
  }

  return {
    winner: null,
    winningCells: [],
  };
}

/**
 * Checks whether the game ended in a draw.
 * @param {Array<string|null>} board - The flat board array.
 * @param {string|null} winner - The current winner if any.
 * @returns {boolean}
 */
export function checkDraw(board, winner) {
  if (winner) return false;
  return board.every((cell) => cell !== null && cell !== '');
}

/**
 * Checks whether the board is completely empty.
 * @param {Array<string|null>} board
 * @returns {boolean}
 */
export function isBoardEmpty(board) {
  return board.every((cell) => cell === null || cell === '');
}

/**
 * Returns a human-friendly status string for screen readers and UI.
 * @param {string|null} winner
 * @param {boolean} isDraw
 * @param {string} currentPlayer
 * @returns {string}
 */
export function getStatusMessage(winner, isDraw, currentPlayer) {
  if (winner) {
    return `Player ${winner} Wins!`;
  }
  if (isDraw) {
    return "It's a Draw!";
  }
  return `Player ${currentPlayer}'s Turn`;
}
