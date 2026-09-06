import React from 'react';
import { Trophy, AlertCircle, Sparkles, Bot, Swords } from 'lucide-react';

export default function GameStatus({
  winner,
  isDraw,
  currentPlayer,
  playerNames,
  isAiThinking,
  matchWinner,
  roundNumber,
  matchLength,
  aiPlayer,
}) {
  const isMatchMode = matchLength !== 'single';

  // Match winner takes highest priority
  if (matchWinner) {
    const matchWinnerName = playerNames[matchWinner] || `Player ${matchWinner}`;
    return (
      <div
        className="status-banner status-match-winner"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <Trophy size={22} aria-hidden="true" />
        <span>
          🏆 <strong>{matchWinnerName}</strong> wins the match!
        </span>
      </div>
    );
  }

  if (isAiThinking) {
    return (
      <div
        className="status-banner status-thinking"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <Bot size={20} className="bot-thinking-icon" aria-hidden="true" />
        <span className="thinking-text">
          {playerNames[aiPlayer] || 'AI'} is thinking
          <span className="dot-pulse">.</span>
          <span className="dot-pulse">.</span>
          <span className="dot-pulse">.</span>
        </span>
      </div>
    );
  }

  let statusText = '';
  let statusClass = '';
  let Icon = Sparkles;

  if (winner) {
    const winnerName = playerNames[winner] || `Player ${winner}`;
    statusText = isMatchMode
      ? `${winnerName} wins Round ${roundNumber}!`
      : `${winnerName} Wins!`;
    statusClass = 'status-winner';
    Icon = Trophy;
  } else if (isDraw) {
    statusText = isMatchMode ? `Round ${roundNumber} — Draw!` : "It's a Draw!";
    statusClass = 'status-draw';
    Icon = AlertCircle;
  } else {
    const currentName = playerNames[currentPlayer] || (currentPlayer === 'X' ? 'You' : 'Flowai');
    const roundLabel = isMatchMode ? ` · Round ${roundNumber}` : '';
    statusText = `${currentName}'s turn (${currentPlayer})${roundLabel}`;
    statusClass = currentPlayer === 'X' ? 'status-turn-x' : 'status-turn-o';
    Icon = isMatchMode ? Swords : Sparkles;
  }

  return (
    <div
      className={`status-banner ${statusClass}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <Icon size={20} aria-hidden="true" />
      <span>{statusText}</span>
    </div>
  );
}
