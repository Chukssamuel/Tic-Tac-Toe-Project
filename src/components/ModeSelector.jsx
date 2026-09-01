import React from 'react';
import { Users, Bot, Zap, ShieldAlert, Sparkles, Swords, Trophy } from 'lucide-react';
import { DIFFICULTY } from '../utils/aiLogic';

const MATCH_LENGTH_OPTIONS = [
  { value: 'single', label: 'Single Game', short: '∞' },
  { value: 3, label: 'Best of 3', short: 'Bo3' },
  { value: 5, label: 'Best of 5', short: 'Bo5' },
];

export default function ModeSelector({
  gameMode,
  onModeChange,
  difficulty,
  onDifficultyChange,
  matchLength,
  onMatchLengthChange,
  disabled,
}) {
  return (
    <div className="mode-selector-container">
      {/* Game Mode Tabs */}
      <div className="mode-tabs" role="tablist" aria-label="Game Mode Selection">
        <button
          type="button"
          role="tab"
          aria-selected={gameMode === 'pvp'}
          className={`mode-tab-btn ${gameMode === 'pvp' ? 'active' : ''}`}
          onClick={() => onModeChange('pvp')}
          disabled={disabled}
        >
          <Users size={16} aria-hidden="true" />
          <span>2-Player Local</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={gameMode === 'ai'}
          className={`mode-tab-btn ${gameMode === 'ai' ? 'active' : ''}`}
          onClick={() => onModeChange('ai')}
          disabled={disabled}
        >
          <Bot size={16} aria-hidden="true" />
          <span>vs Computer AI</span>
        </button>
      </div>

      {/* Match Length Row */}
      <div className="match-length-container" aria-label="Match Length">
        <div className="match-length-label-row">
          <Swords size={13} aria-hidden="true" />
          <span className="match-length-label">Match Format:</span>
        </div>
        <div className="match-length-pills" role="group" aria-label="Match Length Options">
          {MATCH_LENGTH_OPTIONS.map(({ value, label, short }) => (
            <button
              key={value}
              type="button"
              className={`match-length-pill ${matchLength === value ? 'active' : ''}`}
              onClick={() => onMatchLengthChange(value)}
              disabled={disabled}
              title={label}
              aria-pressed={matchLength === value}
            >
              {matchLength === value && <Trophy size={11} aria-hidden="true" />}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty (AI mode only) */}
      {gameMode === 'ai' && (
        <div className="difficulty-container" aria-label="AI Difficulty Level">
          <span className="difficulty-label">Difficulty:</span>
          <div className="difficulty-pills">
            <button
              type="button"
              className={`difficulty-pill ${difficulty === DIFFICULTY.EASY ? 'active' : ''}`}
              onClick={() => onDifficultyChange(DIFFICULTY.EASY)}
              disabled={disabled}
              title="Casual AI with random moves"
            >
              <Sparkles size={13} aria-hidden="true" />
              <span>Easy</span>
            </button>

            <button
              type="button"
              className={`difficulty-pill ${difficulty === DIFFICULTY.MEDIUM ? 'active' : ''}`}
              onClick={() => onDifficultyChange(DIFFICULTY.MEDIUM)}
              disabled={disabled}
              title="Tactical AI that blocks and takes winning moves"
            >
              <Zap size={13} aria-hidden="true" />
              <span>Medium</span>
            </button>

            <button
              type="button"
              className={`difficulty-pill ${difficulty === DIFFICULTY.HARD ? 'active' : ''}`}
              onClick={() => onDifficultyChange(DIFFICULTY.HARD)}
              disabled={disabled}
              title="Unbeatable Minimax AI"
            >
              <ShieldAlert size={13} aria-hidden="true" />
              <span>Hard (Unbeatable)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
