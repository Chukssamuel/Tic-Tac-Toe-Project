/**
 * Samuel Tic-Tac-Toe — Online Multiplayer Engine (Firestore)
 *
 * Each game room is a Firestore document. Players share a link, join the same
 * document, and both listen to live updates.
 *
 * Both players choose their side (X or O) in a lobby — first come, first
 * served. The host also picks the board size and match format ("first to N").
 * X always moves first.
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { checkWinner, checkDraw } from './gameLogic.js';
import firebaseConfig from '../firebaseConfig.js';

let db = null;
let initError = null;

/** Lazily initializes Firebase once. Throws if the config is not set. */
export function initFirebase() {
  if (db) return db;
  if (initError) throw initError;

  const missing =
    !firebaseConfig.apiKey ||
    firebaseConfig.apiKey === 'YOUR_API_KEY' ||
    !firebaseConfig.projectId ||
    firebaseConfig.projectId === 'YOUR_PROJECT_ID';

  if (missing) {
    initError = new Error('Firebase is not configured yet.');
    throw initError;
  }

  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (err) {
    initError = err;
    throw err;
  }
  return db;
}

/** Generates a 6-character, unambiguous room code. */
export function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Converts a "first to N" target into the match-length representation used by
 * the shared GameStatus component ('single' | 3 | 5 | 7 | 9).
 */
export function matchLengthFromTarget(target) {
  return target === 1 ? 'single' : target * 2 - 1;
}

/** Creates a new room. Returns the room code. */
export async function createRoom({ hostName = 'Player 1', boardSize = 3, matchTarget = 1 } = {}) {
  const firestore = initFirebase();
  const code = generateRoomCode();
  const ref = doc(firestore, 'rooms', code);

  await setDoc(ref, {
    code,
    board: Array(boardSize * boardSize).fill(null),
    currentPlayer: null,
    winner: null,
    winningCells: [],
    isDraw: false,
    moveCount: 0,
    boardSize,
    matchTarget,
    scoreX: 0,
    scoreO: 0,
    draws: 0,
    round: 1,
    matchId: 1,
    matchWinner: null,
    status: 'lobby', // lobby | playing | over
    hostName,
    guestName: null,
    hostSide: null,
    guestSide: null,
    hostHeartbeat: Date.now(),
    guestHeartbeat: 0,
    chat: [],
    createdAt: serverTimestamp(),
    lastActiveAt: serverTimestamp(),
  });

  return code;
}

/** Joins an existing room as the guest. Returns the room data. */
export async function joinRoom(code, guestName = 'Player 2') {
  const firestore = initFirebase();
  const ref = doc(firestore, 'rooms', code.toUpperCase().trim());
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error('Room not found. Check the code and try again.');
  }

  const data = snap.data();
  if (data.status === 'playing' && data.guestName) {
    throw new Error('That room is already full and in progress.');
  }

  await updateDoc(ref, {
    guestName,
    guestHeartbeat: Date.now(),
    lastActiveAt: serverTimestamp(),
  });

  return data;
}

/** Sets (or changes) a player's side while the room is still in the lobby. */
export async function setSide(code, role, side) {
  const firestore = initFirebase();
  const ref = doc(firestore, 'rooms', code.toUpperCase().trim());
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Room not found.');

  const data = snap.data();
  if (data.status !== 'lobby') throw new Error('The game has already started.');

  const oppSide = role === 'host' ? data.guestSide : data.hostSide;
  if (oppSide === side) throw new Error('That side is already taken by your opponent.');

  const updates = role === 'host' ? { hostSide: side } : { guestSide: side };
  const hostSide = role === 'host' ? side : data.hostSide;
  const guestSide = role === 'guest' ? side : data.guestSide;

  if (hostSide && guestSide) {
    updates.status = 'playing';
    updates.currentPlayer = 'X'; // X always moves first
  }
  updates.lastActiveAt = serverTimestamp();

  await updateDoc(ref, updates);
  return true;
}

/** Subscribes to a room's live updates. Returns an unsubscribe function. */
export function watchRoom(code, callback) {
  const firestore = initFirebase();
  const ref = doc(firestore, 'rooms', code.toUpperCase().trim());
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        callback(null);
        return;
      }
      callback({ ...snap.data(), code: snap.id });
    },
    (err) => callback(null, err)
  );
}

/** Validates and writes the player's move. Returns true on success. */
export async function makeMove(code, index, player) {
  const firestore = initFirebase();
  const ref = doc(firestore, 'rooms', code.toUpperCase().trim());
  const snap = await getDoc(ref);
  if (!snap.exists()) return false;

  const data = snap.data();
  if (data.status !== 'playing') return false;
  if (data.winner || data.isDraw || data.matchWinner) return false;
  if (data.currentPlayer !== player) return false;
  if (data.board[index]) return false;

  const board = [...data.board];
  board[index] = player;

  const win = checkWinner(board);
  const draw = !win.winner && checkDraw(board, null);
  const moveCount = board.filter(Boolean).length;

  let { scoreX, scoreO, draws, round } = data;
  let matchWinner = null;
  let status = 'playing';

  if (win.winner) {
    if (win.winner === 'X') scoreX += 1;
    else scoreO += 1;
    if (data.matchTarget === 1) {
      // Single game: every round is the whole match
      matchWinner = win.winner;
      status = 'over';
    } else if (scoreX >= data.matchTarget || scoreO >= data.matchTarget) {
      matchWinner = win.winner;
      status = 'over';
    }
  } else if (draw) {
    draws += 1;
    if (data.matchTarget === 1) {
      // A drawn single game also ends the match (with no winner)
      status = 'over';
    }
  }

  await updateDoc(ref, {
    board,
    currentPlayer: win.winner || draw ? null : player === 'X' ? 'O' : 'X',
    winner: win.winner,
    winningCells: win.winningCells,
    isDraw: draw,
    moveCount,
    scoreX,
    scoreO,
    draws,
    round,
    matchWinner,
    status,
    lastActiveAt: serverTimestamp(),
  });

  return true;
}

/**
 * Next round (keeps scores) — or, if the match has a winner, a full rematch
 * (resets scores, round counter and match winner, keeps sides & settings).
 */
export async function playAgain(code) {
  const firestore = initFirebase();
  const ref = doc(firestore, 'rooms', code.toUpperCase().trim());
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();
  // The match is over whenever the room status is 'over' (single game won or
  // drawn, or a series reaching its target). A drawn round inside a series is
  // NOT a rematch — it just advances to the next round.
  const rematch = data.status === 'over';

  await updateDoc(ref, {
    board: Array(data.boardSize * data.boardSize).fill(null),
    currentPlayer: 'X',
    winner: null,
    winningCells: [],
    isDraw: false,
    moveCount: 0,
    round: rematch ? 1 : data.round + 1,
    scoreX: rematch ? 0 : data.scoreX,
    scoreO: rematch ? 0 : data.scoreO,
    draws: rematch ? 0 : data.draws,
    matchId: rematch ? (data.matchId || 1) + 1 : data.matchId || 1,
    matchWinner: null,
    status: 'playing',
    lastActiveAt: serverTimestamp(),
  });
}

/** Appends a chat message (keeps the last 100). */
export async function sendChat(code, sender, name, text) {
  const firestore = initFirebase();
  const ref = doc(firestore, 'rooms', code.toUpperCase().trim());
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();
  const chat = [
    ...(data.chat || []),
    {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      sender,
      name,
      text,
      ts: Date.now(),
    },
  ].slice(-100);

  await updateDoc(ref, { chat });
}

/** Sends a heartbeat so the opponent can detect presence. */
export async function heartbeat(code, role) {
  const firestore = initFirebase();
  const ref = doc(firestore, 'rooms', code.toUpperCase().trim());
  try {
    await updateDoc(ref, {
      [role === 'host' ? 'hostHeartbeat' : 'guestHeartbeat']: Date.now(),
    });
  } catch {
    // ignore transient heartbeat failures
  }
}
