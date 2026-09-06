/**
 * Samuel Tic-Tac-Toe — AI Opponent & Difficulty Engine
 * Built for Chukwuma Samuel
 *
 * Supports 3x3, 4x4 and 5x5 boards, and playing as either X or O.
 */

import {
  checkWinner,
  checkDraw,
  getWinningLines,
  getBoardSizeFromCells,
} from './gameLogic.js';

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
 * The center cell(s) of an NxN board. Odd sizes have a single center
 * (e.g. 3x3 -> [4], 5x5 -> [12]); even sizes have four (4x4 -> [5,6,9,10]).
 * @param {number} size
 * @returns {number[]}
 */
export function getCenterCells(size) {
  const mids = [];
  if (size % 2 === 1) {
    mids.push(Math.floor(size / 2));
  } else {
    mids.push(size / 2 - 1, size / 2);
  }

  const cells = [];
  for (const r of mids) {
    for (const c of mids) {
      cells.push(r * size + c);
    }
  }
  return cells;
}

/**
 * The four corner cells of an NxN board.
 * @param {number} size
 * @returns {number[]}
 */
export function getCornerCells(size) {
  return [0, size - 1, size * (size - 1), size * size - 1];
}

/**
 * Minimax algorithm implementation for unbeatable Hard AI on 3x3.
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
 * Strong-but-not-unbeatable heuristic for boards larger than 3x3,
 * where a full minimax search would be too slow.
 * Priority: win now > block human win > center > corner > random.
 * @param {Array<string|null>} board
 * @param {string} aiPlayer
 * @param {string} humanPlayer
 * @returns {number|null}
 */
function heuristicMove(board, aiPlayer, humanPlayer) {
  const size = getBoardSizeFromCells(board.length);
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) return null;

  // 1. Take an immediate win
  const winMove = findImmediateWinningMove(board, aiPlayer);
  if (winMove !== null) return winMove;

  // 2. Block the human's immediate win
  const blockMove = findImmediateWinningMove(board, humanPlayer);
  if (blockMove !== null) return blockMove;

  // 3. Prefer a center cell
  const centers = getCenterCells(size).filter((idx) => availableMoves.includes(idx));
  if (centers.length > 0 && Math.random() < 0.8) {
    return centers[Math.floor(Math.random() * centers.length)];
  }

  // 4. Prefer a corner
  const corners = getCornerCells(size).filter((idx) => availableMoves.includes(idx));
  if (corners.length > 0 && Math.random() < 0.6) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  // 5. Otherwise a random move
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

/**
 * Calculates the next best move for the AI based on the chosen difficulty.
 * The AI can play as either 'X' or 'O'.
 * @param {Array<string|null>} board
 * @param {'easy'|'medium'|'hard'} difficulty
 * @param {string} aiPlayer ('X' or 'O')
 * @param {string} humanPlayer ('X' or 'O')
 * @returns {number|null} Index of the chosen move
 */
export function getAiMove(board, difficulty = DIFFICULTY.MEDIUM, aiPlayer = 'O', humanPlayer = 'X') {
  const size = getBoardSizeFromCells(board.length);
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) return null;

  // 1. Easy: Completely random move
  if (difficulty === DIFFICULTY.EASY) {
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
  }

  // 2. Medium: Smart tactical rules (takes win, blocks opponent win, prefers center)
  if (difficulty === DIFFICULTY.MEDIUM) {
    const winMove = findImmediateWinningMove(board, aiPlayer);
    if (winMove !== null) return winMove;

    const blockMove = findImmediateWinningMove(board, humanPlayer);
    if (blockMove !== null) return blockMove;

    const centers = getCenterCells(size).filter((idx) => availableMoves.includes(idx));
    if (centers.length > 0 && Math.random() < 0.75) {
      return centers[Math.floor(Math.random() * centers.length)];
    }

    const corners = getCornerCells(size).filter((idx) => availableMoves.includes(idx));
    if (corners.length > 0 && Math.random() < 0.5) {
      return corners[Math.floor(Math.random() * corners.length)];
    }

    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  // 3. Hard: Unbeatable Minimax on 3x3; strong heuristic on larger boards
  if (difficulty === DIFFICULTY.HARD) {
    if (size === 3) {
      // If board is empty, picking a corner or center is fast and optimal
      if (availableMoves.length === 9) {
        const openings = [0, 2, 4, 6, 8];
        return openings[Math.floor(Math.random() * openings.length)];
      }

      const result = minimax([...board], 0, true, aiPlayer, humanPlayer);
      return result.move ?? availableMoves[0];
    }

    return heuristicMove(board, aiPlayer, humanPlayer);
  }

  return availableMoves[0];
}
