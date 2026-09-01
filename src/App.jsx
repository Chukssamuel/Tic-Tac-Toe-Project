import React, { useState, useCallback, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import ModeSelector from './components/ModeSelector';
import GameStatus from './components/GameStatus';
import ScoreBoard from './components/ScoreBoard';
import Board from './components/Board';
import NewGameButton from './components/NewGameButton';
import StatsView from './components/StatsView';
import GameHistoryView from './components/GameHistoryView';
import ConfirmDialog from './components/ConfirmDialog';
import Footer from './components/Footer';
import { checkWinner, checkDraw } from './utils/gameLogic';
import { getAiMove, DIFFICULTY } from './utils/aiLogic';
import { sounds } from './utils/soundEffects';
import {
  loadInitialState,
  saveScores,
  saveStreak,
  savePlayerNames,
  saveGameMode,
  saveDifficulty,
  saveMatchLength,
  recordMatch,
  saveMatchHistory,
} from './utils/storage';

export default function App() {
  // Load persistent state from localStorage
  const [initialData] = useState(() => loadInitialState());

  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [winner, setWinner] = useState(null);
  const [winningCells, setWinningCells] = useState([]);
  const [isDraw, setIsDraw] = useState(false);

  // Game Mode & AI Difficulty (persisted)
  const [gameMode, setGameMode] = useState(initialData.gameMode);
  const [difficulty, setDifficulty] = useState(initialData.difficulty);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Match Length: 'single' | 3 | 5 (persisted)
  const [matchLength, setMatchLength] = useState(initialData.matchLength);

  // Match tracking
  const [roundNumber, setRoundNumber] = useState(1);
  const [matchWinner, setMatchWinner] = useState(null); // 'X' | 'O' | null

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
  const aiTimeoutRef = useRef(null);

  // Helper: wins needed to claim match
  const winsNeeded = matchLength !== 'single' ? Math.ceil(matchLength / 2) : null;

  // Confetti celebration trigger
  const triggerCelebration = useCallback((big = false) => {
    try {
      confetti({
        particleCount: big ? 150 : 80,
        spread: big ? 100 : 70,
        origin: { y: 0.62 },
        colors: ['#2563EB', '#1D4ED8', '#60A5FA', '#93C5FD', '#16A34A', '#F59E0B'],
      });
      setTimeout(() => {
        confetti({
          particleCount: big ? 80 : 50,
          angle: 60,
          spread: big ? 80 : 55,
          origin: { x: 0 },
          colors: ['#2563EB', '#38BDF8', '#10B981'],
        });
        confetti({
          particleCount: big ? 80 : 50,
          angle: 120,
          spread: big ? 80 : 55,
          origin: { x: 1 },
          colors: ['#2563EB', '#38BDF8', '#10B981'],
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

  // Process a move at index
  const makeMove = useCallback(
    (index, player) => {
      const nextBoard = [...board];
      nextBoard[index] = player;
      setBoard(nextBoard);

      sounds.playMove(player);

      const moveCount = nextBoard.filter(Boolean).length;
      const winResult = checkWinner(nextBoard);

      if (winResult.winner) {
        setWinner(winResult.winner);
        setWinningCells(winResult.winningCells);

        const winnerKey = winResult.winner.toLowerCase();
        const winnerName = playerNames[winResult.winner] || `Player ${winResult.winner}`;

        // Update scores and check if match is over
        setScores((prev) => {
          const nextScores = { ...prev, [winnerKey]: prev[winnerKey] + 1 };
          saveScores(nextScores);

          // Check match winner after score update
          if (winsNeeded !== null && nextScores[winnerKey] >= winsNeeded) {
            setMatchWinner(winResult.winner);
            triggerCelebration(true); // big celebration for match win
            sounds.playWin();
          } else {
            triggerCelebration(false);
            sounds.playWin();
          }

          return nextScores;
        });

        updateStreakOnWin(winResult.winner);

        // Record to persistent match history
        setMatchHistory((prevHistory) =>
          recordMatch(prevHistory, {
            gameMode,
            difficulty: gameMode === 'ai' ? difficulty : undefined,
            winner: winResult.winner,
            winnerName,
            playerX: playerNames.X,
            playerO: playerNames.O,
            moveCount,
            roundNumber,
          })
        );

        return;
      }

      if (checkDraw(nextBoard, null)) {
        setIsDraw(true);

        setScores((prev) => {
          const nextScores = { ...prev, draws: prev.draws + 1 };
          saveScores(nextScores);
          return nextScores;
        });

        updateStreakOnDraw();

        // Record draw to persistent match history
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
        return;
      }

      setCurrentPlayer(player === 'X' ? 'O' : 'X');
    },
    [
      board,
      playerNames,
      gameMode,
      difficulty,
      roundNumber,
      winsNeeded,
      updateStreakOnWin,
      updateStreakOnDraw,
      triggerCelebration,
    ]
  );

  // Handle human click on a cell
  const handleCellClick = useCallback(
    (index) => {
      if (board[index] || winner || isDraw || isAiThinking || matchWinner) return;
      if (gameMode === 'ai' && currentPlayer !== 'X') return;
      makeMove(index, currentPlayer);
    },
    [board, winner, isDraw, isAiThinking, matchWinner, gameMode, currentPlayer, makeMove]
  );

  // AI Turn effect
  useEffect(() => {
    if (
      gameMode === 'ai' &&
      currentPlayer === 'O' &&
      !winner &&
      !isDraw &&
      !isAiThinking &&
      !matchWinner
    ) {
      setIsAiThinking(true);
      const delay = Math.floor(Math.random() * 200) + 450;

      aiTimeoutRef.current = setTimeout(() => {
        const aiMove = getAiMove(board, difficulty, 'O', 'X');
        if (aiMove !== null) {
          makeMove(aiMove, 'O');
        }
        setIsAiThinking(false);
      }, delay);
    }

    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
  }, [gameMode, currentPlayer, winner, isDraw, board, difficulty, makeMove, isAiThinking, matchWinner]);

  // Restart current round (preserves match scores)
  const handleRestart = useCallback(() => {
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningCells([]);
    setIsDraw(false);
    setIsAiThinking(false);
    if (!matchWinner) {
      setRoundNumber((prev) => (isGameOver ? prev + 1 : prev));
    }
    sounds.playReset();
  }, [isGameOver, matchWinner]);

  // Start a completely new match (resets scores + round counter)
  const handleNewMatch = useCallback(() => {
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    const cleanScores = { x: 0, o: 0, draws: 0 };
    setScores(cleanScores);
    saveScores(cleanScores);
    setMatchWinner(null);
    setRoundNumber(1);
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningCells([]);
    setIsDraw(false);
    setIsAiThinking(false);
    sounds.playReset();
  }, []);

  // Rematch — same players, names, mode, difficulty and match length; just resets the board + scores
  const handleRematch = useCallback(() => {
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    const cleanScores = { x: 0, o: 0, draws: 0 };
    setScores(cleanScores);
    saveScores(cleanScores);
    setMatchWinner(null);
    setRoundNumber(1);
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningCells([]);
    setIsDraw(false);
    setIsAiThinking(false);
    sounds.playReset();
  }, []);

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
        handleRestart();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  }, [handleRestart]);

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

      let nextNames = playerNames;
      if (newMode === 'ai') {
        nextNames = {
          X: playerNames.X === 'Player 1' ? 'You' : playerNames.X,
          O: 'Flowai',
        };
      } else {
        nextNames = {
          X: playerNames.X === 'You' ? 'Player 1' : playerNames.X,
          O: playerNames.O === 'Flowai' ? 'Player 2' : playerNames.O,
        };
      }
      setPlayerNames(nextNames);
      savePlayerNames(nextNames);
      handleNewMatch();
    },
    [gameMode, playerNames, handleNewMatch]
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

  // Update individual player name (persisted)
  const handleUpdatePlayerName = useCallback((playerKey, newName) => {
    sounds.playClick();
    setPlayerNames((prev) => {
      const nextNames = { ...prev, [playerKey]: newName };
      savePlayerNames(nextNames);
      return nextNames;
    });
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

  return (
    <div className="app-container">
      <Header
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        onOpenStats={handleToggleStats}
        onOpenHistory={handleToggleHistory}
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
          disabled={isAiThinking}
        />

        <div className="game-card">
          <ScoreBoard
            scores={scores}
            playerNames={playerNames}
            onUpdatePlayerName={handleUpdatePlayerName}
            gameMode={gameMode}
            currentPlayer={currentPlayer}
            isGameOver={isGameOver}
            streak={streak}
            matchLength={matchLength}
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
          />

          <Board
            board={board}
            winningCells={winningCells}
            onCellClick={handleCellClick}
            isGameOver={isGameOver || isAiThinking || Boolean(matchWinner)}
          />

          <NewGameButton
            onRestart={handleRestart}
            onResetAll={handleRequestResetStats}
            onNewMatch={handleNewMatch}
            onRematch={handleRematch}
            isGameOver={isGameOver}
            matchWinner={matchWinner}
            matchLength={matchLength}
            disabled={isAiThinking}
          />
        </div>
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
