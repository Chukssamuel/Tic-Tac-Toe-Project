/**
 * Samuel Tic-Tac-Toe — AI Opponent & Difficulty Engine
 * Built for Chukwuma Samuel
 */

import { WINNING_COMBINATIONS, checkWinner, checkDraw } from './gameLogic.js';

export const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

/**
 * Returns an array of indices of all empty cells.
 * @param {Array<string|null>} board
 * @returns {number[]}
 */
export function getAvailableMoves(board) {
  const moves = [];
  board.forEach((cell, index) => {
    if (cell === null || cell === '') {
      moves.push(index);
    }
  });
  return moves;
}

/**
 * Finds if there is an immediate winning move for the given player.
 * @param {Array<string|null>} board
 * @param {string} player
 * @returns {number|null}
 */
export function findImmediateWinningMove(board, player) {
  const availableMoves = getAvailableMoves(board);
  for (const move of availableMoves) {
    const tempBoard = [...board];
    tempBoard[move] = player;
    if (checkWinner(tempBoard).winner === player) {
      return move;
    }
  }
  return null;
}

/**
 * Minimax algorithm implementation for unbeatable Hard AI.
 * @param {Array<string|null>} board
 * @param {number} depth
 * @param {boolean} isMaximizing
 * @param {string} aiPlayer
 * @param {string} humanPlayer
 * @returns {{ score: number, move?: number }}
 */
function minimax(board, depth, isMaximizing, aiPlayer, humanPlayer) {
  const { winner } = checkWinner(board);

  if (winner === aiPlayer) {
    return { score: 10 - depth };
  }
  if (winner === humanPlayer) {
    return { score: depth - 10 };
  }
  if (checkDraw(board, winner)) {
    return { score: 0 };
  }

  const availableMoves = getAvailableMoves(board);

  if (isMaximizing) {
    let bestScore = -Infinity;
    let bestMove = availableMoves[0];

    for (const move of availableMoves) {
      board[move] = aiPlayer;
      const result = minimax(board, depth + 1, false, aiPlayer, humanPlayer);
      board[move] = null;

      if (result.score > bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
    }
    return { score: bestScore, move: bestMove };
  } else {
    let bestScore = Infinity;
    let bestMove = availableMoves[0];

    for (const move of availableMoves) {
      board[move] = humanPlayer;
      const result = minimax(board, depth + 1, true, aiPlayer, humanPlayer);
      board[move] = null;

      if (result.score < bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
    }
    return { score: bestScore, move: bestMove };
  }
}

/**
 * Calculates the next best move for the AI based on the chosen difficulty.
 * @param {Array<string|null>} board
 * @param {'easy'|'medium'|'hard'} difficulty
 * @param {string} aiPlayer ('O' by default)
 * @param {string} humanPlayer ('X' by default)
 * @returns {number|null} Index of the chosen move
 */
export function getAiMove(board, difficulty = DIFFICULTY.MEDIUM, aiPlayer = 'O', humanPlayer = 'X') {
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) return null;

  // 1. Easy: Completely random move
  if (difficulty === DIFFICULTY.EASY) {
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
  }

  // 2. Medium: Smart tactical rules (takes win, blocks opponent win, prioritizes center)
  if (difficulty === DIFFICULTY.MEDIUM) {
    // Check if AI can win immediately
    const winMove = findImmediateWinningMove(board, aiPlayer);
    if (winMove !== null) return winMove;

    // Check if human is about to win -> block it!
    const blockMove = findImmediateWinningMove(board, humanPlayer);
    if (blockMove !== null) return blockMove;

    // Take center cell (4) with 75% probability if available
    if (availableMoves.includes(4) && Math.random() < 0.75) {
      return 4;
    }

    // Take random corner with 50% probability
    const corners = [0, 2, 6, 8].filter((idx) => availableMoves.includes(idx));
    if (corners.length > 0 && Math.random() < 0.5) {
      return corners[Math.floor(Math.random() * corners.length)];
    }

    // Otherwise random available move
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
  }

  // 3. Hard: Unbeatable Minimax
  if (difficulty === DIFFICULTY.HARD) {
    // If board is empty, picking a corner or center is fast and optimal
    if (availableMoves.length === 9) {
      const openings = [0, 2, 4, 6, 8];
      return openings[Math.floor(Math.random() * openings.length)];
    }

    const result = minimax([...board], 0, true, aiPlayer, humanPlayer);
    return result.move ?? availableMoves[0];
  }

  return availableMoves[0];
}

