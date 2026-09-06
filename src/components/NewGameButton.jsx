import React from 'react';
import { RotateCcw, Trash2, Swords, RefreshCw, Undo2 } from 'lucide-react';

export default function NewGameButton({
  onRestart,
  onResetAll,
  onNewMatch,
  onRematch,
  onUndo,
  canUndo,
  isGameOver,
  matchWinner,
  matchLength,
  disabled,
}) {
  const isMatchMode = matchLength !== 'single';
  const matchOver = Boolean(matchWinner);

  // After a match ends in Best-of-N, show Rematch + New Match
  if (matchOver && isMatchMode) {
    return (
      <div className="actions-section">
        <button
          type="button"
          className="btn-primary"
          onClick={onRematch}
          disabled={disabled}
          aria-label="Rematch — same players and settings"
        >
          <RefreshCw size={18} aria-hidden="true" />
          <span>Rematch</span>
        </button>

        <button
          type="button"
          className="btn-secondary"
          onClick={onNewMatch}
          disabled={disabled}
          title="Start a new match (resets scores)"
          aria-label="Start a brand-new match"
        >
          <Swords size={16} aria-hidden="true" />
          <span className="btn-secondary-text">New Match</span>
        </button>
      </div>
    );
  }

  // Standard round controls
  const primaryLabel = isGameOver ? 'Next Round' : 'Restart Round';
  const primaryAriaLabel = isGameOver ? 'Play next round' : 'Restart current round';

  return (
    <div className="actions-section">
      {onUndo && (
        <button
          type="button"
          className="btn-undo"
          onClick={onUndo}
          disabled={!canUndo || disabled}
          title="Undo your last move"
          aria-label="Undo last move"
        >
          <Undo2 size={16} aria-hidden="true" />
          <span>Undo</span>
        </button>
      )}

      <button
        type="button"
        className="btn-primary"
        onClick={onRestart}
        disabled={disabled}
        aria-label={primaryAriaLabel}
      >
        <RotateCcw size={18} aria-hidden="true" />
        <span>{primaryLabel}</span>
      </button>

      {onResetAll && (
        <button
          type="button"
          className="btn-secondary"
          onClick={onResetAll}
          disabled={disabled}
          title="Reset all scores, streaks, and match stats"
          aria-label="Reset all match statistics"
        >
          <Trash2 size={16} aria-hidden="true" />
          <span className="btn-secondary-text">Reset Stats</span>
        </button>
      )}
    </div>
  );
}
