import React from 'react';
import {
  Users,
  Bot,
  Zap,
  ShieldAlert,
  Sparkles,
  Swords,
  Trophy,
  Grid3x3,
  Timer,
  User,
} from 'lucide-react';
import { DIFFICULTY } from '../utils/aiLogic';

const MATCH_LENGTH_OPTIONS = [
  { value: 'single', label: 'Single Game', short: '∞' },
  { value: 3, label: 'Best of 3', short: 'Bo3' },
  { value: 5, label: 'Best of 5', short: 'Bo5' },
];

const BOARD_SIZE_OPTIONS = [3, 4, 5];
const CLOCK_MINUTE_OPTIONS = [1, 2, 3, 5];

export default function ModeSelector({
  gameMode,
  onModeChange,
  difficulty,
  onDifficultyChange,
  matchLength,
  onMatchLengthChange,
  humanSide,
  onHumanSideChange,
  boardSize,
  onBoardSizeChange,
  clockEnabled,
  onToggleClock,
  clockMinutes,
  onClockMinutesChange,
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

      {/* Play As (AI mode only) */}
      {gameMode === 'ai' && (
        <div className="side-selector-container" aria-label="Choose your side">
          <span className="side-selector-label">
            <User size={13} aria-hidden="true" />
            <span>Play as:</span>
          </span>
          <div className="side-selector-pills" role="group" aria-label="Play as options">
            <button
              type="button"
              className={`side-selector-pill ${humanSide === 'X' ? 'active' : ''}`}
              onClick={() => onHumanSideChange('X')}
              disabled={disabled}
              title="Play as X — you move first"
              aria-pressed={humanSide === 'X'}
            >
              <span className="side-symbol">X</span>
              <span>You go first</span>
            </button>
            <button
              type="button"
              className={`side-selector-pill ${humanSide === 'O' ? 'active' : ''}`}
              onClick={() => onHumanSideChange('O')}
              disabled={disabled}
              title="Play as O — the AI moves first"
              aria-pressed={humanSide === 'O'}
            >
              <span className="side-symbol">O</span>
              <span>AI goes first</span>
            </button>
          </div>
        </div>
      )}

      {/* Board Size */}
      <div className="board-size-container" aria-label="Board size">
        <span className="board-size-label">
          <Grid3x3 size={13} aria-hidden="true" />
          <span>Board:</span>
        </span>
        <div className="board-size-pills" role="group" aria-label="Board size options">
          {BOARD_SIZE_OPTIONS.map((size) => (
            <button
              key={size}
              type="button"
              className={`board-size-pill ${boardSize === size ? 'active' : ''}`}
              onClick={() => onBoardSizeChange(size)}
              disabled={disabled}
              title={`${size} by ${size} board`}
              aria-pressed={boardSize === size}
            >
              {size}×{size}
            </button>
          ))}
        </div>
      </div>

      {/* Match Clock */}
      <div className="clock-container" aria-label="Match clock">
        <div className="clock-label-row">
          <Timer size={13} aria-hidden="true" />
          <span className="clock-label">Match Clock:</span>
        </div>
        <div className="clock-controls">
          <button
            type="button"
            className={`clock-toggle ${clockEnabled ? 'active' : ''}`}
            onClick={onToggleClock}
            disabled={disabled}
            aria-pressed={clockEnabled}
            title={clockEnabled ? 'Turn the match clock off' : 'Turn the match clock on'}
          >
            {clockEnabled ? 'On' : 'Off'}
          </button>
          {clockEnabled && (
            <div className="clock-minutes-pills" role="group" aria-label="Time per player">
              {CLOCK_MINUTE_OPTIONS.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  className={`clock-minute-pill ${clockMinutes === mins ? 'active' : ''}`}
                  onClick={() => onClockMinutesChange(mins)}
                  disabled={disabled}
                  title={`${mins} minute${mins > 1 ? 's' : ''} per player`}
                  aria-pressed={clockMinutes === mins}
                >
                  {mins} min
                </button>
              ))}
            </div>
          )}
        </div>
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
              title="Hard AI — unbeatable on 3x3, strong on larger boards"
            >
              <ShieldAlert size={13} aria-hidden="true" />
              <span>Hard</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
