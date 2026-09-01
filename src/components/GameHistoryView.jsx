import React from 'react';
import { X, History, Trophy, MinusCircle, Clock, Bot, Users, Trash2 } from 'lucide-react';

function formatTimestamp(ts) {
  if (!ts) return '';
  const date = new Date(ts);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function GameHistoryView({ matchHistory, onClearHistory, onClose }) {
  return (
    <div
      className="stats-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Game History"
    >
      <div className="stats-modal-card history-modal-card">
        <div className="stats-header">
          <div className="stats-title-row">
            <History className="stats-icon-header" size={22} />
            <h2 className="stats-title">Game History</h2>
          </div>
          <button
            type="button"
            className="stats-close-btn"
            onClick={onClose}
            aria-label="Close history modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="stats-body">
          {matchHistory.length === 0 ? (
            <div className="stats-empty-state">
              <History size={36} className="stats-empty-icon" />
              <p className="stats-empty-title">No completed rounds yet</p>
              <p className="stats-empty-desc">
                Your past matches, winners, move counts, and timestamps will appear here after each round!
              </p>
            </div>
          ) : (
            <div className="history-list">
              <div className="history-count-bar">
                <span>Showing last {matchHistory.length} completed {matchHistory.length === 1 ? 'round' : 'rounds'}</span>
                {onClearHistory && (
                  <button
                    type="button"
                    className="clear-history-btn"
                    onClick={onClearHistory}
                    title="Delete all match history"
                  >
                    <Trash2 size={13} />
                    <span>Clear History</span>
                  </button>
                )}
              </div>

              {matchHistory.map((match, index) => {
                const isDraw = match.winner === null;
                const isXWin = match.winner === 'X';

                return (
                  <div
                    key={match.id || index}
                    className={`history-item ${
                      isDraw
                        ? 'history-draw'
                        : isXWin
                        ? 'history-win-x'
                        : 'history-win-o'
                    }`}
                  >
                    <div className="history-item-left">
                      <div className="history-result-badge">
                        {isDraw ? (
                          <MinusCircle size={16} className="text-draw" />
                        ) : (
                          <Trophy size={16} className={isXWin ? 'text-primary' : 'text-ai'} />
                        )}
                        <span className="history-winner-text">
                          {isDraw ? 'Draw' : `${match.winnerName} (${match.winner})`}
                        </span>
                      </div>

                      <div className="history-matchup">
                        <span className="player-tag tag-x">{match.playerX || 'Player 1'} (X)</span>
                        <span className="matchup-vs">vs</span>
                        <span className="player-tag tag-o">{match.playerO || 'Player 2'} (O)</span>
                      </div>
                    </div>

                    <div className="history-item-right">
                      <div className="history-mode-pill">
                        {match.gameMode === 'ai' ? (
                          <>
                            <Bot size={12} />
                            <span>AI {match.difficulty ? `(${match.difficulty})` : ''}</span>
                          </>
                        ) : (
                          <>
                            <Users size={12} />
                            <span>Local 2P</span>
                          </>
                        )}
                      </div>

                      <div className="history-meta-row">
                        <span className="history-moves">{match.moveCount} moves</span>
                        <span className="history-dot">&bull;</span>
                        <span className="history-time" title={match.timestamp ? new Date(match.timestamp).toLocaleString() : ''}>
                          <Clock size={11} />
                          {formatTimestamp(match.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
