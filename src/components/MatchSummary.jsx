import React from 'react';
import { Trophy, Minus, Footprints, Clock, TrendingUp } from 'lucide-react';

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default function MatchSummary({ summary, matchLength, playerNames }) {
  if (!summary) return null;

  const { winner, winnerName, moveCount, durationSec, scores, roundNumber } = summary;
  const isDraw = winner === null;
  const isMatchMode = matchLength !== 'single';

  return (
    <div className="match-summary-card" role="region" aria-label="Round Summary">
      {/* Result Row */}
      <div className={`summary-result-row ${isDraw ? 'summary-draw' : 'summary-win'}`}>
        {isDraw ? (
          <Minus size={18} className="summary-result-icon" aria-hidden="true" />
        ) : (
          <Trophy size={18} className="summary-result-icon" aria-hidden="true" />
        )}
        <span className="summary-result-text">
          {isDraw
            ? `Round ${roundNumber} — Draw!`
            : `${winnerName} wins Round ${roundNumber}!`}
        </span>
      </div>

      {/* Stats Row */}
      <div className="summary-stats-row">
        <div className="summary-stat">
          <Footprints size={13} className="summary-stat-icon" aria-hidden="true" />
          <span className="summary-stat-val">{moveCount}</span>
          <span className="summary-stat-label">moves</span>
        </div>

        <div className="summary-divider" aria-hidden="true" />

        <div className="summary-stat">
          <Clock size={13} className="summary-stat-icon" aria-hidden="true" />
          <span className="summary-stat-val">{formatDuration(durationSec)}</span>
          <span className="summary-stat-label">duration</span>
        </div>

        {isMatchMode && (
          <>
            <div className="summary-divider" aria-hidden="true" />
            <div className="summary-stat">
              <TrendingUp size={13} className="summary-stat-icon" aria-hidden="true" />
              <span className="summary-stat-val">
                {scores.x}–{scores.o}
                {scores.draws > 0 ? ` (${scores.draws}D)` : ''}
              </span>
              <span className="summary-stat-label">match score</span>
            </div>
          </>
        )}
      </div>

      {/* Player labels in match mode */}
      {isMatchMode && (
        <div className="summary-match-labels" aria-hidden="true">
          <span className="summary-player-label tag-x">{playerNames.X}</span>
          <span className="summary-score-sep">vs</span>
          <span className="summary-player-label tag-o">{playerNames.O}</span>
        </div>
      )}
    </div>
  );
}
