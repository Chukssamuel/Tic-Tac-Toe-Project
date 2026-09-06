import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Globe,
  Copy,
  Check,
  LogOut,
  UserPlus,
  Link2,
  WifiOff,
  Loader2,
  AlertCircle,
  RefreshCw,
  Send,
  Swords,
  Share2,
  History,
} from 'lucide-react';
import Board from './Board';
import GameStatus from './GameStatus';
import CelebrationBanner from './CelebrationBanner';
import {
  createRoom,
  joinRoom,
  watchRoom,
  makeMove,
  playAgain,
  setSide,
  sendChat,
  heartbeat,
  matchLengthFromTarget,
  listFinishedRooms,
} from '../utils/online';
import { sounds } from '../utils/soundEffects';

const HEARTBEAT_MS = 5000;
const STALE_MS = 16000;

const BOARD_SIZES = [3, 4, 5];

const MATCH_OPTIONS = [
  { value: 1, label: 'Single Game' },
  { value: 2, label: 'First to 2 (Best of 3)' },
  { value: 3, label: 'First to 3 (Best of 5)' },
  { value: 4, label: 'First to 4 (Best of 7)' },
  { value: 5, label: 'First to 5 (Best of 9)' },
];

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function SidePicker({ mySide, oppSide, onPick }) {
  return (
    <div className="online-side-picker" role="group" aria-label="Choose your side">
      {['X', 'O'].map((s) => {
        const taken = oppSide === s;
        const mine = mySide === s;
        return (
          <button
            key={s}
            type="button"
            className={`side-pick-btn ${mine ? 'active' : ''}`}
            disabled={taken}
            onClick={() => onPick(s)}
            aria-pressed={mine}
          >
            <span className="side-pick-symbol">{s}</span>
            <span className="side-pick-status">
              {taken ? 'Taken by opponent' : mine ? 'You' : 'Free'}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function OnlineGame({ onExit, onMatchComplete, restoredRooms = [], onRestoreMatch }) {
  const [phase, setPhase] = useState('menu'); // menu | inroom | error
  const [role, setRole] = useState(null); // 'host' | 'guest'
  const [roomCode, setRoomCode] = useState('');
  const [room, setRoom] = useState(null);
  const [hostName, setHostName] = useState('');
  const [guestName, setGuestName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [boardSize, setBoardSize] = useState(3);
  const [matchTarget, setMatchTarget] = useState(1);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [chatText, setChatText] = useState('');
  const [showBanner, setShowBanner] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [restoreList, setRestoreList] = useState([]);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreError, setRestoreError] = useState('');

  const unsubscribeRef = useRef(null);
  const chatLogRef = useRef(null);
  const recordedMatchIdRef = useRef(null);
  const bannerShownRef = useRef(null);

  // --- read ?room= from the URL and auto-join ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('room');
    if (code && /^[A-Za-z0-9]{4,12}$/.test(code.trim())) {
      handleJoin(code.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- cleanup watcher on unmount ---
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, []);

  // --- heartbeat loop ---
  useEffect(() => {
    if (!roomCode || !role || phase === 'error') return;
    const id = setInterval(() => heartbeat(roomCode, role), HEARTBEAT_MS);
    return () => clearInterval(id);
  }, [roomCode, role, phase]);

  // --- auto-scroll chat ---
  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [room?.chat?.length]);

  // --- record the match result locally (stats & history) once per match ---
  useEffect(() => {
    if (!room || !onMatchComplete) return;
    if (room.status !== 'over') return;
    if (recordedMatchIdRef.current === room.matchId) return;

    recordedMatchIdRef.current = room.matchId;
    const mySide = role === 'host' ? room.hostSide : room.guestSide;
    const xName = room.hostSide === 'X' ? room.hostName || 'Player 1' : room.guestName || 'Player 2';
    const oName = room.hostSide === 'O' ? room.hostName || 'Player 1' : room.guestName || 'Player 2';

    onMatchComplete({
      winner: room.matchWinner || null,
      winnerName: room.matchWinner ? (room.matchWinner === 'X' ? xName : oName) : 'Draw',
      playerX: xName,
      playerO: oName,
      scoreX: room.scoreX,
      scoreO: room.scoreO,
      draws: room.draws,
      mySide,
      matchTarget: room.matchTarget,
      boardSize: room.boardSize,
    });
  }, [room, role, onMatchComplete]);

  // --- pop the celebratory banner once per concluded match ---
  useEffect(() => {
    if (room && room.status === 'over' && bannerShownRef.current !== room.matchId) {
      bannerShownRef.current = room.matchId;
      setShowBanner(true);
    }
  }, [room]);

  const startWatching = useCallback((code) => {
    if (unsubscribeRef.current) unsubscribeRef.current();
    unsubscribeRef.current = watchRoom(code, (data, err) => {
      if (err) {
        setError(String(err.message || err));
        setPhase('error');
        return;
      }
      if (!data) {
        setError('The room was closed by the host.');
        setPhase('error');
        return;
      }
      setRoom(data);
    });
  }, []);

  const handleCreate = async () => {
    setBusy(true);
    setError('');
    try {
      const code = await createRoom({
        hostName: hostName.trim() || 'Player 1',
        boardSize,
        matchTarget,
      });
      recordedMatchIdRef.current = null;
      bannerShownRef.current = null;
      setRoomCode(code);
      setRole('host');
      setPhase('inroom');
      startWatching(code);
    } catch (err) {
      setError(String(err.message || err));
      setPhase('error');
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async (code) => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await joinRoom(code, guestName.trim() || 'Player 2');
      recordedMatchIdRef.current = null;
      bannerShownRef.current = null;
      setRoomCode(code.toUpperCase().trim());
      setRole('guest');
      setPhase('inroom');
      startWatching(code);
    } catch (err) {
      setError(String(err.message || err));
      setPhase('error');
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = () => {
    if (unsubscribeRef.current) unsubscribeRef.current();
    unsubscribeRef.current = null;
    recordedMatchIdRef.current = null;
    bannerShownRef.current = null;
    setRoom(null);
    setRoomCode('');
    setRole(null);
    setPhase('menu');
    setError('');
    setChatText('');
    setShowBanner(false);
  };

  const handleCopy = async () => {
    const link = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link to share:', link);
    }
  };

  // --- share the match/round result ---
  const buildShareText = () => {
    if (!room) return '🎮 Playing Samuel Tic-Tac-Toe!';
    const xName =
      room.hostSide === 'X' ? room.hostName || 'Player 1' : room.guestName || 'Player 2';
    const oName =
      room.hostSide === 'O' ? room.hostName || 'Player 1' : room.guestName || 'Player 2';

    if (room.matchWinner) {
      const wName = room.matchWinner === 'X' ? xName : oName;
      const lName = room.matchWinner === 'X' ? oName : xName;
      return `🏆 ${wName} beat ${lName} ${room.scoreX}–${room.scoreO}${
        room.draws ? ` (${room.draws} draw${room.draws > 1 ? 's' : ''})` : ''
      } in Samuel Tic-Tac-Toe!`;
    }
    if (room.winner) {
      const wName = room.winner === 'X' ? xName : oName;
      return `🎯 ${wName} won Round ${room.round} — series ${room.scoreX}–${room.scoreO} in Samuel Tic-Tac-Toe!`;
    }
    if (room.isDraw) {
      return `🤝 Round ${room.round} was a draw — series ${room.scoreX}–${room.scoreO} in Samuel Tic-Tac-Toe.`;
    }
    return '🎮 Playing Samuel Tic-Tac-Toe!';
  };

  const handleShare = async () => {
    const text = buildShareText();
    const url = `${window.location.origin}${window.location.pathname}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Samuel Tic-Tac-Toe', text, url });
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      }
    } catch {
      // share cancelled or clipboard unavailable — ignore
    }
  };

  // --- restore past results ---
  const openRestore = async () => {
    setRestoreOpen(true);
    setRestoreLoading(true);
    setRestoreError('');
    try {
      const list = await listFinishedRooms();
      setRestoreList(list);
    } catch (err) {
      setRestoreError(String(err.message || err));
    } finally {
      setRestoreLoading(false);
    }
  };

  const doRestore = (r, mySide) => {
    const winner = r.winner || null;
    if (typeof onRestoreMatch === 'function') {
      onRestoreMatch(
        {
          winner,
          winnerName: winner ? (winner === 'X' ? r.xName : r.oName) : 'Draw',
          playerX: r.xName,
          playerO: r.oName,
          scoreX: r.scoreX,
          scoreO: r.scoreO,
          draws: r.draws,
          mySide,
          matchTarget: 1,
          boardSize: r.boardSize,
        },
        r.id
      );
    }
  };

  const handlePickSide = async (side) => {
    try {
      await setSide(roomCode, role, side);
    } catch (err) {
      setError(String(err.message || err));
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    const text = chatText.trim();
    if (!text || !room) return;
    setChatText('');
    const name = role === 'host' ? room.hostName || 'Player 1' : room.guestName || 'Player 2';
    await sendChat(room.code, role, name, text).catch(() => {});
  };

  // ---- derived state ----
  const mySide = role === 'host' ? room?.hostSide ?? null : room?.guestSide ?? null;
  const oppSide = role === 'host' ? room?.guestSide ?? null : room?.hostSide ?? null;
  const myName = role === 'host' ? room?.hostName || 'Player 1' : room?.guestName || 'Player 2';

  const xName = room
    ? (room.hostSide === 'X' ? room.hostName : room.guestName) || 'Player X'
    : 'Player X';
  const oName = room
    ? (room.hostSide === 'O' ? room.hostName : room.guestName) || 'Player O'
    : 'Player O';
  const playerNames = { X: xName, O: oName };

  const opponentPresent = room
    ? role === 'host'
      ? Boolean(room.guestName) && Date.now() - (room.guestHeartbeat || 0) < STALE_MS
      : Boolean(room.hostName) && Date.now() - (room.hostHeartbeat || 0) < STALE_MS
    : false;

  const isMyTurn =
    room && !room.winner && !room.isDraw && !room.matchWinner && room.currentPlayer === mySide;
  const roundOver = Boolean(room?.winner || room?.isDraw);

  const onCellClick = (index) => {
    if (!room || !isMyTurn) return;
    if (room.board[index]) return;
    makeMove(room.code, index, mySide).catch(() => {});
  };

  const matchLabel =
    room?.matchTarget === 1 ? 'Single Game' : `First to ${room?.matchTarget} wins`;

  const bannerWinnerName = room?.matchWinner
    ? room.matchWinner === 'X'
      ? xName
      : oName
    : null;
  const bannerIsDraw = room?.status === 'over' && !room?.matchWinner;

  // ---------------------------------------------------------------- menu
  if (phase === 'menu') {
    return (
      <div className="online-container">
        <div className="online-card">
          <div className="online-card-head">
            <Globe size={20} aria-hidden="true" />
            <span>Play Online</span>
          </div>
          <p className="online-card-sub">
            Create a room and share the link — or join a friend's room with their code.
            You'll each pick <strong>X</strong> or <strong>O</strong> before the game starts.
          </p>

          <div className="online-menu">
            <div className="online-panel">
              <span className="online-panel-title">Host a game</span>

              <div className="host-option-group">
                <span className="host-option-label">Board size</span>
                <div className="host-pills" role="group" aria-label="Board size">
                  {BOARD_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`host-pill ${boardSize === size ? 'active' : ''}`}
                      onClick={() => setBoardSize(size)}
                      aria-pressed={boardSize === size}
                    >
                      {size}×{size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="host-option-group">
                <span className="host-option-label">Match format</span>
                <div className="host-pills host-pills-col" role="group" aria-label="Match format">
                  {MATCH_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`host-pill ${matchTarget === opt.value ? 'active' : ''}`}
                      onClick={() => setMatchTarget(opt.value)}
                      aria-pressed={matchTarget === opt.value}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                className="online-input"
                placeholder="Your name (optional)"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                maxLength={15}
              />
              <button
                type="button"
                className="btn-primary online-btn"
                onClick={handleCreate}
                disabled={busy}
              >
                {busy ? <Loader2 size={16} className="spin" /> : <Link2 size={16} />}
                <span>Create Room</span>
              </button>
            </div>

            <div className="online-divider">
              <span>or</span>
            </div>

            <div className="online-panel">
              <span className="online-panel-title">Join a game</span>
              <input
                type="text"
                className="online-input online-code-input"
                placeholder="Enter room code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={8}
              />
              <input
                type="text"
                className="online-input"
                placeholder="Your name (optional)"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                maxLength={15}
              />
              <button
                type="button"
                className="btn-primary online-btn"
                onClick={() => handleJoin(joinCode)}
                disabled={busy || joinCode.trim().length < 4}
              >
                {busy ? <Loader2 size={16} className="spin" /> : <UserPlus size={16} />}
                <span>Join Room</span>
              </button>
            </div>
          </div>

          <div className="online-panel">
            <span className="online-panel-title">Restore a past result</span>
            {!restoreOpen ? (
              <>
                <p className="restore-hint">
                  Played before results were being saved? Recover your finished games here.
                </p>
                <button type="button" className="btn-secondary online-btn" onClick={openRestore}>
                  <History size={15} />
                  <span>Recover finished games</span>
                </button>
              </>
            ) : restoreLoading ? (
              <div className="online-waiting-hint">
                <Loader2 size={14} className="spin" />
                <span>Looking up your games…</span>
              </div>
            ) : restoreError ? (
              <p className="restore-hint restore-error">{restoreError}</p>
            ) : restoreList.length === 0 ? (
              <p className="restore-hint">No finished games found in your account.</p>
            ) : (
              <div className="restore-list">
                {restoreList.map((r) => {
                  const already = restoredRooms.includes(r.id);
                  return (
                    <div key={r.id} className={`restore-item ${already ? 'restore-done' : ''}`}>
                      <div className="restore-item-main">
                        <strong>
                          {r.xName} (X) vs {r.oName} (O)
                        </strong>
                        <span className="restore-score">
                          {r.scoreX}–{r.scoreO}
                          {r.winner ? ` · ${r.winner === 'X' ? r.xName : r.oName} won` : ' · draw'}
                        </span>
                        <span className="restore-meta">Room {r.code}</span>
                      </div>
                      {already ? (
                        <span className="restore-done-badge">✓ Recorded</span>
                      ) : (
                        <div className="restore-btns">
                          <button type="button" onClick={() => doRestore(r, 'X')}>
                            I was X
                          </button>
                          <button type="button" onClick={() => doRestore(r, 'O')}>
                            I was O
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button type="button" className="online-back" onClick={onExit}>
            <LogOut size={14} />
            <span>Back to offline modes</span>
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------- error
  if (phase === 'error') {
    return (
      <div className="online-container">
        <div className="online-card">
          <div className="online-card-head">
            <AlertCircle size={20} aria-hidden="true" />
            <span>Something went wrong</span>
          </div>
          <p className="online-card-sub">{error}</p>
          <div className="online-actions-row">
            <button type="button" className="btn-primary online-btn" onClick={handleLeave}>
              <span>Back</span>
            </button>
            <button type="button" className="btn-secondary online-btn" onClick={onExit}>
              <span>Offline modes</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------- connecting
  if (!room) {
    return (
      <div className="online-container">
        <div className="online-card">
          <div className="online-waiting-hint">
            <Loader2 size={16} className="spin" />
            <span>Connecting…</span>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------- lobby
  if (room.status === 'lobby') {
    return (
      <div className="online-container">
        <div className="online-card">
          <div className="online-card-head">
            <Globe size={20} aria-hidden="true" />
            <span>Room {roomCode}</span>
          </div>

          <div className="room-code-display" aria-label="Room code">
            <span className="room-code-text">{roomCode}</span>
            <span className="room-link-preview">
              {`${window.location.origin}${window.location.pathname}?room=${roomCode}`}
            </span>
          </div>

          <div className="online-lobby-row">
            <span className="lobby-you">
              You: <strong>{myName}</strong>
            </span>
            <span className="lobby-opp">
              {opponentPresent
                ? `Opponent: ${role === 'host' ? room.guestName : room.hostName}`
                : 'Waiting for opponent…'}
            </span>
          </div>

          <div className="online-panel">
            <span className="online-panel-title">Choose your side</span>
            <SidePicker mySide={mySide} oppSide={oppSide} onPick={handlePickSide} />
            {mySide ? (
              <p className="lobby-status-text">
                You're playing as <strong>{mySide}</strong>.{' '}
                {oppSide
                  ? 'Starting…'
                  : 'Waiting for your opponent to pick their side…'}
              </p>
            ) : (
              <p className="lobby-status-text">Pick X or O to lock in your side.</p>
            )}
          </div>

          <div className="online-lobby-meta">
            <span>
              Board: <strong>{room.boardSize}×{room.boardSize}</strong>
            </span>
            <span>
              Format: <strong>{matchLabel}</strong>
            </span>
            <span>X always moves first</span>
          </div>

          <div className="online-actions-row">
            {role === 'host' && (
              <button type="button" className="btn-primary online-btn" onClick={handleCopy}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            )}
            <button type="button" className="btn-secondary online-btn" onClick={handleLeave}>
              <LogOut size={15} />
              <span>Leave</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------- playing
  return (
    <div className="online-container">
      <div className="online-meta">
        <span className="online-meta-pill">
          <Globe size={13} aria-hidden="true" /> Room {roomCode}
        </span>
        <span className="online-meta-pill">
          {room.boardSize}×{room.boardSize} · {matchLabel}
        </span>
        {opponentPresent ? (
          <span className="online-meta-pill online-meta-ok">Connected</span>
        ) : (
          <span className="online-meta-pill online-meta-off">
            <WifiOff size={13} aria-hidden="true" /> Opponent disconnected
          </span>
        )}
      </div>

      <div className="game-card online-game-card">
        {/* series score strip */}
        <div className="online-score-strip">
          <div className="oss-side">
            <span className="oss-name">{xName} (X)</span>
            <strong>{room.scoreX}</strong>
          </div>
          <div className="oss-mid">
            <span>Draws</span>
            <strong>{room.draws}</strong>
          </div>
          <div className="oss-side">
            <span className="oss-name">{oName} (O)</span>
            <strong>{room.scoreO}</strong>
          </div>
          <div className="oss-format">
            {room.matchTarget === 1 ? 'Single' : `First to ${room.matchTarget}`}
            <br />
            Round {room.round}
          </div>
        </div>

        <GameStatus
          winner={room.winner}
          isDraw={room.isDraw}
          currentPlayer={room.currentPlayer}
          playerNames={playerNames}
          isAiThinking={false}
          matchWinner={room.matchWinner}
          roundNumber={room.round}
          matchLength={matchLengthFromTarget(room.matchTarget)}
          aiPlayer="O"
        />

        <Board
          board={room.board}
          boardSize={room.boardSize}
          winningCells={room.winningCells}
          onCellClick={onCellClick}
          isGameOver={Boolean(room.winner || room.isDraw || room.matchWinner) || !isMyTurn || !opponentPresent}
        />

        {(roundOver || room.matchWinner) && (
          <div className="online-actions-row">
            <button type="button" className="btn-primary online-btn" onClick={() => playAgain(roomCode)}>
              {room.matchTarget === 1 ? <RefreshCw size={16} /> : room.matchWinner ? <RefreshCw size={16} /> : <Swords size={16} />}
              <span>
                {room.matchTarget === 1
                  ? 'Play Again'
                  : room.matchWinner
                  ? 'Rematch'
                  : 'Next Round'}
              </span>
            </button>
            <button type="button" className="btn-secondary online-btn" onClick={handleShare}>
              {shared ? <Check size={15} /> : <Share2 size={15} />}
              <span>{shared ? 'Shared!' : 'Share Result'}</span>
            </button>
            <button type="button" className="btn-secondary online-btn" onClick={handleLeave}>
              <LogOut size={15} />
              <span>Leave</span>
            </button>
          </div>
        )}

        {!opponentPresent && (
          <p className="online-waiting-hint">
            <WifiOff size={14} aria-hidden="true" />
            <span>Your opponent has left or lost connection.</span>
          </p>
        )}
      </div>

      {/* chat */}
      <div className="online-card online-chat-card">
        <div className="online-chat-log" ref={chatLogRef} aria-label="Chat messages">
          {(room.chat || []).length === 0 ? (
            <span className="chat-empty">No messages yet — say hi! 👋</span>
          ) : (
            (room.chat || []).map((m) => (
              <div key={m.id} className={`chat-msg ${m.sender === role ? 'mine' : 'theirs'}`}>
                <span className="chat-name">{m.name}</span>
                <span className="chat-text">{m.text}</span>
                <span className="chat-time">{formatTime(m.ts)}</span>
              </div>
            ))
          )}
        </div>
        <form className="online-chat-input" onSubmit={handleChatSubmit}>
          <input
            type="text"
            className="chat-input-field"
            placeholder="Send a message…"
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            maxLength={200}
            aria-label="Chat message"
          />
          <button type="submit" className="online-chat-send" aria-label="Send message">
            <Send size={16} />
          </button>
        </form>
      </div>

      <CelebrationBanner
        open={showBanner}
        winnerName={bannerWinnerName}
        isDraw={bannerIsDraw}
        xName={xName}
        oName={oName}
        scoreX={room.scoreX ?? 0}
        scoreO={room.scoreO ?? 0}
        draws={room.draws ?? 0}
        onClose={() => setShowBanner(false)}
        onPlayAgain={() => {
          setShowBanner(false);
          playAgain(roomCode);
        }}
      />
    </div>
  );
}
