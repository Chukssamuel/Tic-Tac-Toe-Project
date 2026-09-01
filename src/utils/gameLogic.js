/**
 * Samuel Tic-Tac-Toe — Game Logic & Rule Engine
 * Built for Chukwuma Samuel
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
 * Checks whether the current board state contains a winner.
 * @param {Array<string|null>} board - The 9-element array representing the 3x3 board.
 * @returns {{ winner: 'X' | 'O' | null, winningCells: number[] }}
 */
export function checkWinner(board) {
  if (!board || board.length !== 9) {
    return { winner: null, winningCells: [] };
  }

  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        winner: board[a],
        winningCells: combination,
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
 * @param {Array<string|null>} board - The 9-element board array.
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

