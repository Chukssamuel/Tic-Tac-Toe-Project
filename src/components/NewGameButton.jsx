import React from 'react';
import { RotateCcw, Trash2, Swords } from 'lucide-react';

export default function NewGameButton({
  onRestart,
  onResetAll,
  onNewMatch,
  isGameOver,
  matchWinner,
  matchLength,
  disabled,
}) {
  const isMatchMode = matchLength !== 'single';
  const matchOver = Boolean(matchWinner);

  // Label logic
  const primaryLabel = matchOver
    ? 'New Match'
    : isGameOver
    ? 'Next Round'
    : 'Restart Round';

  const primaryAriaLabel = matchOver
    ? 'Start a new Best-of match'
    : isGameOver
    ? 'Play next round'
    : 'Restart current round';

  const handlePrimary = matchOver && onNewMatch ? onNewMatch : onRestart;

  return (
    <div className="actions-section">
      <button
        type="button"
        className="btn-primary"
        onClick={handlePrimary}
        disabled={disabled}
        aria-label={primaryAriaLabel}
      >
        {matchOver ? (
          <Swords size={18} aria-hidden="true" />
        ) : (
          <RotateCcw size={18} aria-hidden="true" />
        )}
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
