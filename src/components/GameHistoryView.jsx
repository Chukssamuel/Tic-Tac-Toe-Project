import React, { useState } from 'react';
import {
  X,
  History,
  Trophy,
  MinusCircle,
  Clock,
  Bot,
  Users,
  Trash2,
  Globe,
  Share2,
  Check,
  Plus,
  PenLine,
} from 'lucide-react';

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

function buildShareText(match) {
  const pX = match.playerX || 'Player 1';
  const pO = match.playerO || 'Player 2';
  const score = match.onlineScore ? ` (${match.onlineScore})` : '';
  if (match.winner === 'X') {
    return `🏆 ${match.winnerName || pX} beat ${pO} in Samuel Tic-Tac-Toe!${score}`;
  }
  if (match.winner === 'O') {
    return `🏆 ${match.winnerName || pO} beat ${pX} in Samuel Tic-Tac-Toe!${score}`;
  }
  return `🤝 ${pX} and ${pO} played a draw in Samuel Tic-Tac-Toe.${score}`;
}

export default function GameHistoryView({ matchHistory, onClearHistory, onClose, onLogResult }) {
  const [sharedId, setSharedId] = useState(null);
  const [showLogForm, setShowLogForm] = useState(false);
  const [yourName, setYourName] = useState('');
  const [oppName, setOppName] = useState('');
  const [outcome, setOutcome] = useState('win');

  const handleShare = async (match) => {
    const text = buildShareText(match);
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Samuel Tic-Tac-Toe', text });
      } else {
        await navigator.clipboard.writeText(text);
      }
      setSharedId(match.id);
      setTimeout(() => setSharedId(null), 2000);
    } catch {
      // share cancelled or clipboard unavailable — ignore
    }
  };

  const submitLog = () => {
    const y = yourName.trim() || 'You';
    const o = oppName.trim() || 'Player 2';
    let winner = null;
    let winnerName = 'Draw';
    if (outcome === 'win') {
      winner = 'X';
      winnerName = y;
    } else if (outcome === 'loss') {
      winner = 'O';
      winnerName = o;
    }
    if (typeof onLogResult === 'function') {
      onLogResult({ winner, winnerName, playerX: y, playerO: o });
    }
    setShowLogForm(false);
    setYourName('');
    setOppName('');
    setOutcome('win');
  };

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
          <div className="history-count-bar">
            <span>
              Showing last {matchHistory.length} completed {matchHistory.length === 1 ? 'round' : 'rounds'}
            </span>
            <div className="history-toolbar-actions">
              {onLogResult && (
                <button
                  type="button"
                  className="history-log-btn"
                  onClick={() => setShowLogForm((v) => !v)}
                  title="Manually record a result"
                >
                  <Plus size={13} />
                  <span>Log Result</span>
                </button>
              )}
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
          </div>

          {showLogForm && (
            <div className="log-form">
              <div className="log-form-row">
                <input
                  type="text"
                  className="online-input"
                  placeholder="Your name"
                  value={yourName}
                  onChange={(e) => setYourName(e.target.value)}
                  maxLength={15}
                />
                <input
                  type="text"
                  className="online-input"
                  placeholder="Opponent name"
                  value={oppName}
                  onChange={(e) => setOppName(e.target.value)}
                  maxLength={15}
                />
              </div>
              <div className="log-outcome-row" role="group" aria-label="Result outcome">
                <button
                  type="button"
                  className={`log-outcome-btn ${outcome === 'win' ? 'active' : ''}`}
                  onClick={() => setOutcome('win')}
                  aria-pressed={outcome === 'win'}
                >
                  I won
                </button>
                <button
                  type="button"
                  className={`log-outcome-btn ${outcome === 'draw' ? 'active' : ''}`}
                  onClick={() => setOutcome('draw')}
                  aria-pressed={outcome === 'draw'}
                >
                  Draw
                </button>
                <button
                  type="button"
                  className={`log-outcome-btn ${outcome === 'loss' ? 'active' : ''}`}
                  onClick={() => setOutcome('loss')}
                  aria-pressed={outcome === 'loss'}
                >
                  I lost
                </button>
              </div>
              <div className="online-actions-row">
                <button type="button" className="btn-primary online-btn" onClick={submitLog}>
                  <PenLine size={15} />
                  <span>Save Result</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary online-btn"
                  onClick={() => setShowLogForm(false)}
                >
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          )}

          {matchHistory.length === 0 && !showLogForm ? (
            <div className="stats-empty-state">
              <History size={36} className="stats-empty-icon" />
              <p className="stats-empty-title">No completed rounds yet</p>
              <p className="stats-empty-desc">
                Your past matches, winners, move counts, and timestamps will appear here after each round!
              </p>
            </div>
          ) : (
            <div className="history-list">
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
                        ) : match.gameMode === 'online' ? (
                          <>
                            <Globe size={12} />
                            <span>Online</span>
                          </>
                        ) : match.gameMode === 'manual' ? (
                          <>
                            <PenLine size={12} />
                            <span>Manual</span>
                          </>
                        ) : (
                          <>
                            <Users size={12} />
                            <span>Local 2P</span>
                          </>
                        )}
                      </div>

                      <div className="history-meta-row">
                        <span className="history-moves">
                          {match.gameMode === 'online'
                            ? match.onlineScore || 'Online match'
                            : `${match.moveCount} moves`}
                        </span>
                        <span className="history-dot">&bull;</span>
                        <span className="history-time" title={match.timestamp ? new Date(match.timestamp).toLocaleString() : ''}>
                          <Clock size={11} />
                          {formatTimestamp(match.timestamp)}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="history-share-btn"
                        onClick={() => handleShare(match)}
                        title="Share this result"
                      >
                        {sharedId === match.id ? <Check size={12} /> : <Share2 size={12} />}
                        <span>{sharedId === match.id ? 'Shared' : 'Share'}</span>
                      </button>
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
