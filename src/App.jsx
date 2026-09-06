import React, { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import ModeSelector from './components/ModeSelector';
import GameStatus from './components/GameStatus';
import ScoreBoard from './components/ScoreBoard';
import Board from './components/Board';
import NewGameButton from './components/NewGameButton';
import MatchSummary from './components/MatchSummary';
import ThemeSelectorModal from './components/ThemeSelectorModal';
import StatsView from './components/StatsView';
import GameHistoryView from './components/GameHistoryView';
import ConfirmDialog from './components/ConfirmDialog';
import Footer from './components/Footer';
import { checkWinner, checkDraw } from './utils/gameLogic';
import { getAiMove } from './utils/aiLogic';
import { sounds } from './utils/soundEffects';
import {
  loadInitialState,
  saveScores,
  saveStreak,
  savePlayerNames,
  saveGameMode,
  saveDifficulty,
  saveMatchLength,
  saveColorMode,
  saveTheme,
  saveHumanSide,
  saveBoardSize,
  saveClockEnabled,
  saveClockMinutes,
  recordMatch,
  saveMatchHistory,
  savePieceColors,
} from './utils/storage';

const emptyBoard = (size) => Array(size * size).fill(null);

// Online mode is loaded on demand so the Firebase SDK doesn't weigh down
// the initial bundle for offline players.
const OnlineGame = lazy(() => import('./components/OnlineGame'));

export default function App() {
  // Load persistent state from localStorage
  const [initialData] = useState(() => loadInitialState());

  // Board size (persisted): 3 | 4 | 5
  const [boardSize, setBoardSize] = useState(initialData.boardSize || 3);
  const [board, setBoard] = useState(emptyBoard(initialData.boardSize || 3));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [winner, setWinner] = useState(null);
  const [winningCells, setWinningCells] = useState([]);
  const [isDraw, setIsDraw] = useState(false);

  // Game Mode & AI Difficulty (persisted)
  const [gameMode, setGameMode] = useState(initialData.gameMode);
  const [difficulty, setDifficulty] = useState(initialData.difficulty);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Which side the human plays vs the AI (persisted): 'X' | 'O'
  const [humanSide, setHumanSide] = useState(initialData.humanSide || 'X');

  // Match Length: 'single' | 3 | 5 (persisted)
  const [matchLength, setMatchLength] = useState(initialData.matchLength);

  // Color Mode: 'light' | 'dark' (persisted)
  const [colorMode, setColorMode] = useState(initialData.colorMode || 'light');

  // Active Theme (persisted)
  const [activeTheme, setActiveTheme] = useState(initialData.activeTheme || 'classic');

  // Custom piece colours (persisted) — null = use the theme's colour
  const [pieceColors, setPieceColors] = useState(initialData.pieceColors || { X: null, O: null });

  // Match Clock (persisted): enabled flag + minutes per player
  const [clockEnabled, setClockEnabled] = useState(Boolean(initialData.clockEnabled));
  const [clockMinutes, setClockMinutes] = useState(initialData.clockMinutes || 2);
  const clockBankSeconds = clockMinutes * 60;
  const [clocks, setClocks] = useState({
    X: (initialData.clockMinutes || 2) * 60,
    O: (initialData.clockMinutes || 2) * 60,
  });

  // Move history (for undo)
  const [moveHistory, setMoveHistory] = useState([]);

  // Match tracking
  const [roundNumber, setRoundNumber] = useState(1);
  const [matchWinner, setMatchWinner] = useState(null); // 'X' | 'O' | null

  // Round Summary (shown after each round ends)
  const [roundSummary, setRoundSummary] = useState(null);

  // Custom Player Names (persisted)
  const [playerNames, setPlayerNames] = useState(initialData.playerNames);

  // Scores & Win Streak (persisted)
  const [scores, setScores] = useState(initialData.scores);
  const [streak, setStreak] = useState(initialData.streak);

  // Match History (persisted)
  const [matchHistory, setMatchHistory] = useState(initialData.matchHistory);

  // Modals & Confirmation Dialog State
  const [showStats, setShowStats] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    onConfirm: null,
  });

  // Sound Mute State
  const [isMuted, setIsMuted] = useState(sounds.isMuted());

  const isGameOver = Boolean(winner || isDraw);
  const aiPlayer = humanSide === 'X' ? 'O' : 'X';
  const aiTimeoutRef = useRef(null);
  // Tracks when current round started (for duration calculation)
  const roundStartTimeRef = useRef(Date.now());

  // Helper: wins needed to claim match
  const winsNeeded = matchLength !== 'single' ? Math.ceil(matchLength / 2) : null;

  // Confetti celebration trigger
  const triggerCelebration = useCallback((big = false) => {
    try {
      confetti({
        particleCount: big ? 150 : 80,
        spread: big ? 100 : 70,
        origin: { y: 0.62 },
        colors: ['#059669', '#10B981', '#34D399', '#A7F3D0', '#14B8A6', '#F59E0B'],
      });
      setTimeout(() => {
        confetti({
          particleCount: big ? 80 : 50,
          angle: 60,
          spread: big ? 80 : 55,
          origin: { x: 0 },
          colors: ['#059669', '#2DD4BF', '#10B981'],
        });
        confetti({
          particleCount: big ? 80 : 50,
          angle: 120,
          spread: big ? 80 : 55,
          origin: { x: 1 },
          colors: ['#059669', '#2DD4BF', '#10B981'],
        });
      }, 200);
    } catch {
      // Graceful fallback
    }
  }, []);

  // Update win streak and persist
  const updateStreakOnWin = useCallback((winningPlayer) => {
    setStreak((prev) => {
      const newCount = prev.player === winningPlayer ? prev.count + 1 : 1;
      const newBest = Math.max(prev.best, newCount);
      const nextStreak = { player: winningPlayer, count: newCount, best: newBest };
      saveStreak(nextStreak);
      return nextStreak;
    });
  }, []);

  const updateStreakOnDraw = useCallback(() => {
    setStreak((prev) => {
      const nextStreak = { player: null, count: 0, best: prev.best };
      saveStreak(nextStreak);
      return nextStreak;
    });
  }, []);

  // Shared: finish a round with a winner (used by moves AND clock timeouts)
  const applyWin = useCallback(
    (winResult, moveCount, byTimeout = false) => {
      const w = winResult.winner;
      setWinner(w);
      setWinningCells(byTimeout ? [] : winResult.winningCells);

      const winnerKey = w.toLowerCase();
      const winnerName = playerNames[w] || `Player ${w}`;
      const durationSec = Math.max(1, Math.round((Date.now() - roundStartTimeRef.current) / 1000));

      setScores((prev) => {
        const nextScores = { ...prev, [winnerKey]: prev[winnerKey] + 1 };
        saveScores(nextScores);

        setRoundSummary({
          winner: w,
          winnerName,
          moveCount,
          durationSec,
          scores: nextScores,
          roundNumber,
          byTimeout,
        });

        if (winsNeeded !== null && nextScores[winnerKey] >= winsNeeded) {
          setMatchWinner(w);
          triggerCelebration(true); // big celebration for match win
          sounds.playWin();
        } else {
          triggerCelebration(false);
          sounds.playWin();
        }

        return nextScores;
      });

      updateStreakOnWin(w);

      // Record to persistent match history
      setMatchHistory((prevHistory) =>
        recordMatch(prevHistory, {
          gameMode,
          difficulty: gameMode === 'ai' ? difficulty : undefined,
          winner: w,
          winnerName,
          playerX: playerNames.X,
          playerO: playerNames.O,
          moveCount,
          roundNumber,
          byTimeout,
        })
      );
    },
    [playerNames, gameMode, difficulty, roundNumber, winsNeeded, updateStreakOnWin, triggerCelebration]
  );

  // Shared: finish a round in a draw
  const applyDraw = useCallback(
    (moveCount) => {
      setIsDraw(true);
      const durationSec = Math.max(1, Math.round((Date.now() - roundStartTimeRef.current) / 1000));

      setScores((prev) => {
        const nextScores = { ...prev, draws: prev.draws + 1 };
        saveScores(nextScores);

        setRoundSummary({
          winner: null,
          winnerName: 'Draw',
          moveCount,
          durationSec,
          scores: nextScores,
          roundNumber,
        });

        return nextScores;
      });

      updateStreakOnDraw();

      setMatchHistory((prevHistory) =>
        recordMatch(prevHistory, {
          gameMode,
          difficulty: gameMode === 'ai' ? difficulty : undefined,
          winner: null,
          winnerName: 'Draw',
          playerX: playerNames.X,
          playerO: playerNames.O,
          moveCount,
          roundNumber,
        })
      );

      sounds.playDraw();
    },
    [playerNames, gameMode, difficulty, roundNumber, updateStreakOnDraw]
  );

  // Process a move at index
  const makeMove = useCallback(
    (index, player) => {
      const nextBoard = [...board];
      nextBoard[index] = player;
      setBoard(nextBoard);
      setMoveHistory((prev) => [...prev, { index, player }]);

      sounds.playMove(player);

      const moveCount = nextBoard.filter(Boolean).length;
      const winResult = checkWinner(nextBoard);

      if (winResult.winner) {
        applyWin(winResult, moveCount);
        return;
      }

      if (checkDraw(nextBoard, null)) {
        applyDraw(moveCount);
        return;
      }

      setCurrentPlayer(player === 'X' ? 'O' : 'X');
    },
    [board, applyWin, applyDraw]
  );

  // Handle human click on a cell
  const handleCellClick = useCallback(
    (index) => {
      if (board[index] || winner || isDraw || isAiThinking || matchWinner) return;
      if (gameMode === 'ai' && currentPlayer !== humanSide) return;
      makeMove(index, currentPlayer);
    },
    [board, winner, isDraw, isAiThinking, matchWinner, gameMode, currentPlayer, humanSide, makeMove]
  );

  // AI Turn effect — the AI moves whenever it is the AI's turn, including first.
  // NOTE: isAiThinking is intentionally NOT a dependency here. Setting it inside
  // the effect must not re-run (and thus clear) the scheduled AI timer.
  useEffect(() => {
    if (
      gameMode === 'ai' &&
      currentPlayer === aiPlayer &&
      !winner &&
      !isDraw &&
      !matchWinner
    ) {
      setIsAiThinking(true);
      const delay = Math.floor(Math.random() * 200) + 450;

      aiTimeoutRef.current = setTimeout(() => {
        const aiMove = getAiMove(board, difficulty, aiPlayer, humanSide);
        if (aiMove !== null) {
          makeMove(aiMove, aiPlayer);
        }
        setIsAiThinking(false);
      }, delay);
    }

    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
  }, [gameMode, currentPlayer, aiPlayer, humanSide, winner, isDraw, board, difficulty, makeMove, matchWinner]);

  // Reset the board state for a fresh round (keeps scores & clocks)
  const resetBoardForNewRound = useCallback(() => {
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    setBoard(emptyBoard(boardSize));
    setMoveHistory([]);
    setCurrentPlayer('X');
    setWinner(null);
    setWinningCells([]);
    setIsDraw(false);
    setIsAiThinking(false);
    setRoundSummary(null);
    roundStartTimeRef.current = Date.now();
  }, [boardSize]);

  // Restart current round (preserves match scores & running clocks)
  const handleRestart = useCallback(() => {
    resetBoardForNewRound();
    if (!matchWinner) {
      setRoundNumber((prev) => (isGameOver ? prev + 1 : prev));
    }
    sounds.playReset();
  }, [resetBoardForNewRound, matchWinner, isGameOver]);

  // Start a completely new match (resets scores + round counter + clocks)
  const handleNewMatch = useCallback(() => {
    resetBoardForNewRound();
    const cleanScores = { x: 0, o: 0, draws: 0 };
    setScores(cleanScores);
    saveScores(cleanScores);
    setMatchWinner(null);
    setRoundNumber(1);
    setClocks({ X: clockBankSeconds, O: clockBankSeconds });
    sounds.playReset();
  }, [resetBoardForNewRound, clockBankSeconds]);

  // Rematch — identical to a new match (same settings)
  const handleRematch = useCallback(() => {
    handleNewMatch();
  }, [handleNewMatch]);

  // Undo: remove the human's last move (plus the AI's reply when vs AI)
  const handleUndo = useCallback(() => {
    if (matchWinner || winner || isDraw) return;

    const history = [...moveHistory];
    let popCount = 0;
    let nextPlayer = currentPlayer;

    if (gameMode === 'ai') {
      if (currentPlayer !== humanSide || isAiThinking) return;
      if (history.length < 2) return;
      popCount = 2;
      nextPlayer = humanSide;
    } else {
      if (history.length < 1) return;
      popCount = 1;
      nextPlayer = history[history.length - 1].player;
    }

    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);

    const newHistory = history.slice(0, history.length - popCount);
    const newBoard = emptyBoard(boardSize);
    newHistory.forEach((m) => {
      newBoard[m.index] = m.player;
    });

    setBoard(newBoard);
    setMoveHistory(newHistory);
    setCurrentPlayer(nextPlayer);
    setWinner(null);
    setWinningCells([]);
    setIsDraw(false);
    setIsAiThinking(false);
    setRoundSummary(null);
    sounds.playReset();
  }, [matchWinner, winner, isDraw, moveHistory, gameMode, currentPlayer, humanSide, isAiThinking, boardSize]);

  // Whether the Undo button should be enabled right now
  const canUndo =
    !matchWinner &&
    !winner &&
    !isDraw &&
    (gameMode === 'ai'
      ? currentPlayer === humanSide && !isAiThinking && moveHistory.length >= 2
      : moveHistory.length >= 1);

  // Request confirmation to reset scores
  const handleRequestResetStats = useCallback(() => {
    sounds.playClick();
    setConfirmDialog({
      isOpen: true,
      title: 'Reset Match Scores?',
      message:
        'Are you sure you want to reset all score counters and active streaks back to 0? This will start a fresh score sheet.',
      confirmLabel: 'Reset Scores',
      onConfirm: () => {
        const cleanScores = { x: 0, o: 0, draws: 0 };
        const cleanStreak = { player: null, count: 0, best: 0 };
        setScores(cleanScores);
        setStreak(cleanStreak);
        saveScores(cleanScores);
        saveStreak(cleanStreak);
        setMatchWinner(null);
        setRoundNumber(1);
        setClocks({ X: clockBankSeconds, O: clockBankSeconds });
        handleRestart();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  }, [handleRestart, clockBankSeconds]);

  // Request confirmation to clear game history
  const handleRequestClearHistory = useCallback(() => {
    sounds.playClick();
    setConfirmDialog({
      isOpen: true,
      title: 'Clear Game History?',
      message:
        'Are you sure you want to delete all recorded match history and stats? This cannot be undone.',
      confirmLabel: 'Clear All History',
      onConfirm: () => {
        setMatchHistory([]);
        saveMatchHistory([]);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  }, []);

  // Mode change handler (persisted)
  const handleModeChange = useCallback(
    (newMode) => {
      if (newMode === gameMode) return;
      sounds.playClick();
      setGameMode(newMode);
      saveGameMode(newMode);

      // Online play manages its own room state — leave the offline board untouched.
      if (newMode === 'online') return;

      let nextNames = playerNames;
      if (newMode === 'ai') {
        const human = humanSide;
        const ai = human === 'X' ? 'O' : 'X';
        const currentHumanName = playerNames[human];
        const humanName =
          currentHumanName && !['Flowai', 'Player 1', 'Player 2'].includes(currentHumanName)
            ? currentHumanName
            : 'You';
        nextNames = { ...playerNames, [human]: humanName, [ai]: 'Flowai' };
      } else {
        nextNames = {
          X: ['You', 'Flowai'].includes(playerNames.X) ? 'Player 1' : playerNames.X,
          O: ['You', 'Flowai'].includes(playerNames.O) ? 'Player 2' : playerNames.O,
        };
      }
      setPlayerNames(nextNames);
      savePlayerNames(nextNames);
      handleNewMatch();
    },
    [gameMode, playerNames, humanSide, handleNewMatch]
  );

  // Difficulty change handler (persisted)
  const handleDifficultyChange = useCallback((newDiff) => {
    sounds.playClick();
    setDifficulty(newDiff);
    saveDifficulty(newDiff);
  }, []);

  // Match length change handler (persisted) — resets the match
  const handleMatchLengthChange = useCallback(
    (newLength) => {
      if (newLength === matchLength) return;
      sounds.playClick();
      setMatchLength(newLength);
      saveMatchLength(newLength);
      handleNewMatch();
    },
    [matchLength, handleNewMatch]
  );

  // Human side change handler (persisted, AI mode only)
  const handleHumanSideChange = useCallback(
    (newSide) => {
      if (newSide === humanSide) return;
      sounds.playClick();
      setHumanSide(newSide);
      saveHumanSide(newSide);

      const ai = newSide === 'X' ? 'O' : 'X';
      const humanName = playerNames[newSide] === 'Flowai' ? 'You' : playerNames[newSide] || 'You';
      setPlayerNames((prev) => {
        const nextNames = { ...prev, [newSide]: humanName, [ai]: 'Flowai' };
        savePlayerNames(nextNames);
        return nextNames;
      });

      handleNewMatch();
    },
    [humanSide, playerNames, handleNewMatch]
  );

  // Board size change handler (persisted) — starts a fresh match on the new grid
  const handleBoardSizeChange = useCallback(
    (size) => {
      if (size === boardSize) return;
      sounds.playClick();
      setBoardSize(size);
      saveBoardSize(size);

      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
      const cleanScores = { x: 0, o: 0, draws: 0 };
      setScores(cleanScores);
      saveScores(cleanScores);
      setMatchWinner(null);
      setRoundNumber(1);
      setRoundSummary(null);
      roundStartTimeRef.current = Date.now();
      setBoard(emptyBoard(size));
      setMoveHistory([]);
      setCurrentPlayer('X');
      setWinner(null);
      setWinningCells([]);
      setIsDraw(false);
      setIsAiThinking(false);
      setClocks({ X: clockBankSeconds, O: clockBankSeconds });
      sounds.playReset();
    },
    [boardSize, clockBankSeconds]
  );

  // Match clock handlers (persisted)
  const handleToggleClock = useCallback(() => {
    sounds.playClick();
    const next = !clockEnabled;
    setClockEnabled(next);
    saveClockEnabled(next);
    if (next) {
      setClocks({ X: clockBankSeconds, O: clockBankSeconds });
    }
  }, [clockEnabled, clockBankSeconds]);

  const handleClockMinutesChange = useCallback((mins) => {
    sounds.playClick();
    setClockMinutes(mins);
    saveClockMinutes(mins);
    setClocks({ X: mins * 60, O: mins * 60 });
  }, []);

  // Update individual player name (persisted)
  const handleUpdatePlayerName = useCallback((playerKey, newName) => {
    sounds.playClick();
    setPlayerNames((prev) => {
      const nextNames = { ...prev, [playerKey]: newName };
      savePlayerNames(nextNames);
      return nextNames;
    });
  }, []);

  // Synchronize colorMode and activeTheme with DOM root
  useEffect(() => {
    document.documentElement.setAttribute('data-color-mode', colorMode);
  }, [colorMode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, [activeTheme]);

  // Apply custom piece colours as inline CSS variables.
  // Inline styles on <html> beat any theme selector, so custom colours
  // correctly override the active theme (and fall back when cleared).
  useEffect(() => {
    const root = document.documentElement;
    if (pieceColors.X) {
      root.style.setProperty('--player-x', pieceColors.X);
    } else {
      root.style.removeProperty('--player-x');
    }
    if (pieceColors.O) {
      root.style.setProperty('--player-o', pieceColors.O);
    } else {
      root.style.removeProperty('--player-o');
    }
  }, [pieceColors]);

  // Theme toggle handler (light/dark)
  const handleToggleTheme = useCallback(() => {
    sounds.playClick();
    setColorMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      saveColorMode(next);
      return next;
    });
  }, []);

  // Visual Theme select handler
  const handleSelectTheme = useCallback((themeId) => {
    sounds.playClick();
    setActiveTheme(themeId);
    saveTheme(themeId);
  }, []);

  // Custom piece colour handlers
  const handlePieceColorChange = useCallback((playerKey, color) => {
    sounds.playClick();
    setPieceColors((prev) => {
      const next = { ...prev, [playerKey]: color };
      savePieceColors(next);
      return next;
    });
  }, []);

  const handleResetPieceColors = useCallback(() => {
    sounds.playClick();
    const next = { X: null, O: null };
    setPieceColors(next);
    savePieceColors(next);
  }, []);

  // Sound toggle handler
  const handleToggleSound = useCallback(() => {
    const nextMuted = sounds.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) sounds.playClick();
  }, []);

  // Stats view toggle
  const handleToggleStats = useCallback(() => {
    sounds.playClick();
    setShowStats((prev) => !prev);
  }, []);

  // History view toggle
  const handleToggleHistory = useCallback(() => {
    sounds.playClick();
    setShowHistory((prev) => !prev);
  }, []);

  // ---- Match Clock: tick the active player down every second ----
  const clockRunning =
    gameMode !== 'online' && clockEnabled && !winner && !isDraw && !matchWinner;

  useEffect(() => {
    if (!clockRunning) return;
    const id = setInterval(() => {
      setClocks((prev) => ({
        ...prev,
        [currentPlayer]: Math.max(0, prev[currentPlayer] - 1),
      }));
    }, 1000);
    return () => clearInterval(id);
  }, [clockRunning, currentPlayer]);

  // ---- Match Clock: a player who runs out of time loses the round ----
  useEffect(() => {
    if (gameMode === 'online' || !clockEnabled || winner || isDraw || matchWinner) return;
    if (clocks.X <= 0 || clocks.O <= 0) {
      const loser = clocks.X <= 0 ? 'X' : 'O';
      const other = loser === 'X' ? 'O' : 'X';
      const moveCount = board.filter(Boolean).length;
      applyWin({ winner: other, winningCells: [] }, moveCount, true);
    }
  }, [clockEnabled, clocks, winner, isDraw, matchWinner, board, applyWin]);

  return (
    <div className="app-container">
      <Header
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        onOpenStats={handleToggleStats}
        onOpenHistory={handleToggleHistory}
        onOpenThemes={() => {
          sounds.playClick();
          setShowThemes(true);
        }}
        colorMode={colorMode}
        onToggleTheme={handleToggleTheme}
      />

      <main className="main-content">
        <div className="game-title-section">
          <h1 className="game-title">Samuel Tic-Tac-Toe</h1>
          <p className="game-subtitle">Classic Strategy &bull; Single or 2-Player</p>
        </div>

        <ModeSelector
          gameMode={gameMode}
          onModeChange={handleModeChange}
          difficulty={difficulty}
          onDifficultyChange={handleDifficultyChange}
          matchLength={matchLength}
          onMatchLengthChange={handleMatchLengthChange}
          humanSide={humanSide}
          onHumanSideChange={handleHumanSideChange}
          boardSize={boardSize}
          onBoardSizeChange={handleBoardSizeChange}
          clockEnabled={clockEnabled}
          onToggleClock={handleToggleClock}
          clockMinutes={clockMinutes}
          onClockMinutesChange={handleClockMinutesChange}
          disabled={isAiThinking}
        />

        {gameMode === 'online' ? (
          <Suspense
            fallback={
              <div className="online-container">
                <div className="online-card">
                  <div className="online-waiting-hint">
                    <span className="spin" aria-hidden="true">⏳</span>
                    <span>Loading online mode…</span>
                  </div>
                </div>
              </div>
            }
          >
            <OnlineGame onExit={() => handleModeChange('pvp')} />
          </Suspense>
        ) : (
        <div className="game-card">
          <ScoreBoard
            scores={scores}
            playerNames={playerNames}
            onUpdatePlayerName={handleUpdatePlayerName}
            gameMode={gameMode}
            humanSide={humanSide}
            currentPlayer={currentPlayer}
            isGameOver={isGameOver}
            streak={streak}
            matchLength={matchLength}
            clockEnabled={clockEnabled}
            clocks={clocks}
          />

          <GameStatus
            winner={winner}
            isDraw={isDraw}
            currentPlayer={currentPlayer}
            playerNames={playerNames}
            isAiThinking={isAiThinking}
            matchWinner={matchWinner}
            roundNumber={roundNumber}
            matchLength={matchLength}
            aiPlayer={aiPlayer}
          />

          <Board
            board={board}
            boardSize={boardSize}
            winningCells={winningCells}
            onCellClick={handleCellClick}
            isGameOver={isGameOver || isAiThinking || Boolean(matchWinner)}
          />

          {roundSummary && (
            <MatchSummary
              summary={roundSummary}
              matchLength={matchLength}
              playerNames={playerNames}
            />
          )}

          <NewGameButton
            onRestart={handleRestart}
            onResetAll={handleRequestResetStats}
            onNewMatch={handleNewMatch}
            onRematch={handleRematch}
            onUndo={handleUndo}
            canUndo={canUndo}
            isGameOver={isGameOver}
            matchWinner={matchWinner}
            matchLength={matchLength}
            disabled={isAiThinking}
          />
        </div>
        )}
      </main>

      {showStats && (
        <StatsView
          matchHistory={matchHistory}
          playerNames={playerNames}
          onClose={() => setShowStats(false)}
        />
      )}

      {showHistory && (
        <GameHistoryView
          matchHistory={matchHistory}
          onClearHistory={handleRequestClearHistory}
          onClose={() => setShowHistory(false)}
        />
      )}

      {showThemes && (
        <ThemeSelectorModal
          activeTheme={activeTheme}
          onSelectTheme={handleSelectTheme}
          pieceColors={pieceColors}
          onPieceColorChange={handlePieceColorChange}
          onResetPieceColors={handleResetPieceColors}
          onClose={() => setShowThemes(false)}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      <Footer />
    </div>
  );
}
