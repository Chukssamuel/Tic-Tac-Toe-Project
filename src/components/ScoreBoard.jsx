import React, { useState, useRef, useEffect } from 'react';
import { Flame, Edit2, Check, Clock } from 'lucide-react';

/** Renders win pip dots for Best-of-N match mode */
function WinPips({ wins, target }) {
  return (
    <div className="win-pips" aria-label={`${wins} of ${target} wins needed`}>
      {Array.from({ length: target }).map((_, i) => (
        <span
          key={i}
          className={`win-pip ${i < wins ? 'filled' : 'empty'}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

/** Formats a number of seconds as m:ss */
function formatClock(seconds) {
  const safe = Math.max(0, seconds);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function ScoreBoard({
  scores,
  playerNames,
  onUpdatePlayerName,
  gameMode,
  humanSide,
  currentPlayer,
  isGameOver,
  streak,
  matchLength,
  clockEnabled,
  clocks,
}) {
  const isStreakActive = streak && streak.count > 1;
  const isMatchMode = matchLength !== 'single';
  const winsNeeded = isMatchMode ? Math.ceil(matchLength / 2) : null;

  const [editingPlayer, setEditingPlayer] = useState(null); // 'X' | 'O' | null
  const [tempName, setTempName] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editingPlayer && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingPlayer]);

  const handleStartEdit = (playerKey) => {
    if (!isPlayerEditable(playerKey)) return;
    setEditingPlayer(playerKey);
    setTempName(playerNames[playerKey] || '');
  };

  const handleSave = (playerKey) => {
    if (editingPlayer !== playerKey) return;
    const trimmed = tempName.trim();
    let finalName = trimmed;
    if (!finalName) {
      if (gameMode === 'ai') {
        finalName = playerKey === humanSide ? 'You' : 'Flowai';
      } else {
        finalName = playerKey === 'X' ? 'Player 1' : 'Player 2';
      }
    }
    onUpdatePlayerName(playerKey, finalName);
    setEditingPlayer(null);
  };

  const handleKeyDown = (e, playerKey) => {
    if (e.key === 'Enter') {
      handleSave(playerKey);
    } else if (e.key === 'Escape') {
      setEditingPlayer(null);
    }
  };

  // In AI mode, only the human's own box is editable
  const isPlayerEditable = (playerKey) => {
    if (gameMode !== 'ai') return true;
    return playerKey === humanSide;
  };

  const clockLow = (playerKey) => clocks[playerKey] <= 20;

  return (
    <div className="score-board-wrapper">
      {/* Match Progress Badge (Best-of-N only) */}
      {isMatchMode && (
        <div className="match-progress-bar">
          <span className="match-progress-label">
            Best of {matchLength} &mdash; First to <strong>{winsNeeded}</strong> wins
          </span>
        </div>
      )}

      <div className="score-board" aria-label="Game Scoreboard">
        {/* Player X Score Card */}
        <div
          className={`score-box x-box ${
            !isGameOver && currentPlayer === 'X' ? 'active' : ''
          }`}
        >
          <div className="score-box-header">
            {editingPlayer === 'X' ? (
              <div className="inline-edit-wrapper">
                <input
                  ref={inputRef}
                  type="text"
                  className="score-name-input"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={() => handleSave('X')}
                  onKeyDown={(e) => handleKeyDown(e, 'X')}
                  maxLength={15}
                  placeholder="You"
                />
                <button
                  type="button"
                  className="inline-save-btn"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSave('X');
                  }}
                  title="Save name"
                >
                  <Check size={12} />
                </button>
              </div>
            ) : (
              <div
                className="score-box-label-row"
                onClick={() => handleStartEdit('X')}
                title={isPlayerEditable('X') ? 'Click to edit name' : playerNames.X}
              >
                <span className="score-box-label">{playerNames.X} (X)</span>
                {isPlayerEditable('X') && (
                  <button
                    type="button"
                    className="score-edit-icon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit('X');
                    }}
                    aria-label={`Edit name for Player X`}
                  >
                    <Edit2 size={11} />
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="score-box-val">{scores.x}</div>
          {clockEnabled && (
            <div
              className={`clock-readout ${
                !isGameOver && currentPlayer === 'X' ? 'clock-active' : ''
              } ${clockLow('X') ? 'clock-low' : ''}`}
              title="Remaining time for X"
            >
              <Clock size={11} aria-hidden="true" />
              <span>{formatClock(clocks.X)}</span>
            </div>
          )}
          {isMatchMode && <WinPips wins={scores.x} target={winsNeeded} />}
        </div>

        {/* Draws Card */}
        <div className="score-box draw-box">
          <div className="score-box-header">
            <div className="score-box-label-row">
              <span className="score-box-label">Draws</span>
            </div>
          </div>
          <div className="score-box-val">{scores.draws}</div>
        </div>

        {/* Player O Score Card */}
        <div
          className={`score-box o-box ${
            !isGameOver && currentPlayer === 'O' ? 'active' : ''
          }`}
        >
          <div className="score-box-header">
            {editingPlayer === 'O' ? (
              <div className="inline-edit-wrapper">
                <input
                  ref={inputRef}
                  type="text"
                  className="score-name-input"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={() => handleSave('O')}
                  onKeyDown={(e) => handleKeyDown(e, 'O')}
                  maxLength={15}
                  placeholder={gameMode === 'ai' ? 'Flowai' : 'Player 2'}
                />
                <button
                  type="button"
                  className="inline-save-btn"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSave('O');
                  }}
                  title="Save name"
                >
                  <Check size={12} />
                </button>
              </div>
            ) : (
              <div
                className="score-box-label-row"
                onClick={() => handleStartEdit('O')}
                title={isPlayerEditable('O') ? 'Click to edit name' : playerNames.O}
              >
                <span className="score-box-label">{playerNames.O} (O)</span>
                {isPlayerEditable('O') && (
                  <button
                    type="button"
                    className="score-edit-icon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit('O');
                    }}
                    aria-label={`Edit name for Player O`}
                  >
                    <Edit2 size={11} />
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="score-box-val">{scores.o}</div>
          {clockEnabled && (
            <div
              className={`clock-readout ${
                !isGameOver && currentPlayer === 'O' ? 'clock-active' : ''
              } ${clockLow('O') ? 'clock-low' : ''}`}
              title="Remaining time for O"
            >
              <Clock size={11} aria-hidden="true" />
              <span>{formatClock(clocks.O)}</span>
            </div>
          )}
          {isMatchMode && <WinPips wins={scores.o} target={winsNeeded} />}
        </div>
      </div>

      {streak && (
        <div className="streak-bar">
          <div className={`streak-badge ${isStreakActive ? 'on-fire' : ''}`}>
            <Flame size={14} className={isStreakActive ? 'flame-icon animated' : 'flame-icon'} />
            <span className="streak-text">
              {streak.count > 0 && streak.player ? (
                <>
                  <strong>{playerNames[streak.player]}</strong> Streak:{' '}
                  <strong>{streak.count} {streak.count === 1 ? 'win' : 'wins'}</strong>
                </>
              ) : (
                'Current Streak: 0'
              )}
            </span>
          </div>
          {streak.best > 1 && (
            <span className="best-streak-text">
              Best Streak: <strong>{streak.best}</strong> 🔥
            </span>
          )}
        </div>
      )}
    </div>
  );
}
