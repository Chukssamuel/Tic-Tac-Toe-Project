import React from 'react';
import { X, Trophy, Award, Zap, BarChart2, Activity, Target, Globe } from 'lucide-react';

export default function StatsView({ matchHistory, playerNames, onClose }) {
  const totalGames = matchHistory.length;

  const xWins = matchHistory.filter((m) => m.winner === 'X').length;
  const oWins = matchHistory.filter((m) => m.winner === 'O').length;
  const draws = matchHistory.filter((m) => m.winner === null).length;

  const xWinRate = totalGames > 0 ? Math.round((xWins / totalGames) * 100) : 0;
  const oWinRate = totalGames > 0 ? Math.round((oWins / totalGames) * 100) : 0;
  const drawRate = totalGames > 0 ? Math.round((draws / totalGames) * 100) : 0;

  // AI games vs Local games vs Online games
  const aiGames = matchHistory.filter((m) => m.gameMode === 'ai');
  const localGames = matchHistory.filter((m) => m.gameMode === 'pvp');
  const onlineGames = matchHistory.filter((m) => m.gameMode === 'online');

  const humanVsAiWins = aiGames.filter((m) => m.winner === 'X').length;
  const aiVsHumanWins = aiGames.filter((m) => m.winner === 'O').length;
  const aiDraws = aiGames.filter((m) => m.winner === null).length;

  // Average moves
  const totalMoves = matchHistory.reduce((acc, m) => acc + (m.moveCount || 0), 0);
  const avgMoves = totalGames > 0 ? (totalMoves / totalGames).toFixed(1) : 0;

  // Fastest win
  const winningGames = matchHistory.filter((m) => m.winner !== null && m.moveCount);
  const fastestWin =
    winningGames.length > 0
      ? Math.min(...winningGames.map((m) => m.moveCount))
      : null;

  return (
    <div className="stats-modal-overlay" role="dialog" aria-modal="true" aria-label="Overall Statistics">
      <div className="stats-modal-card">
        <div className="stats-header">
          <div className="stats-title-row">
            <BarChart2 className="stats-icon-header" size={22} />
            <h2 className="stats-title">Overall Statistics</h2>
          </div>
          <button
            type="button"
            className="stats-close-btn"
            onClick={onClose}
            aria-label="Close statistics modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="stats-body">
          {totalGames === 0 ? (
            <div className="stats-empty-state">
              <Activity size={36} className="stats-empty-icon" />
              <p className="stats-empty-title">No games recorded yet</p>
              <p className="stats-empty-desc">
                Play a few rounds to track your lifetime statistics, win rates, and records!
              </p>
            </div>
          ) : (
            <>
              {/* Top Overview Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Total Played</div>
                  <div className="stat-value">{totalGames}</div>
                  <div className="stat-sub">All Sessions</div>
                </div>

                <div className="stat-card stat-x">
                  <div className="stat-label">{playerNames.X} Wins</div>
                  <div className="stat-value">{xWins}</div>
                  <div className="stat-sub">{xWinRate}% Win Rate</div>
                </div>

                <div className="stat-card stat-draw">
                  <div className="stat-label">Draws</div>
                  <div className="stat-value">{draws}</div>
                  <div className="stat-sub">{drawRate}% of games</div>
                </div>

                <div className="stat-card stat-o">
                  <div className="stat-label">{playerNames.O} Wins</div>
                  <div className="stat-value">{oWins}</div>
                  <div className="stat-sub">{oWinRate}% Win Rate</div>
                </div>
              </div>

              {/* Win Rate Progress Bar */}
              <div className="stats-section-box">
                <div className="section-box-title">Outcome Distribution</div>
                <div className="stat-progress-bar">
                  {xWinRate > 0 && (
                    <div
                      className="progress-segment seg-x"
                      style={{ width: `${xWinRate}%` }}
                      title={`${playerNames.X} (${xWinRate}%)`}
                    />
                  )}
                  {drawRate > 0 && (
                    <div
                      className="progress-segment seg-draw"
                      style={{ width: `${drawRate}%` }}
                      title={`Draws (${drawRate}%)`}
                    />
                  )}
                  {oWinRate > 0 && (
                    <div
                      className="progress-segment seg-o"
                      style={{ width: `${oWinRate}%` }}
                      title={`${playerNames.O} (${oWinRate}%)`}
                    />
                  )}
                </div>
                <div className="progress-legend">
                  <span className="legend-item"><span className="dot dot-x" /> {playerNames.X} ({xWins})</span>
                  <span className="legend-item"><span className="dot dot-draw" /> Draws ({draws})</span>
                  <span className="legend-item"><span className="dot dot-o" /> {playerNames.O} ({oWins})</span>
                </div>
              </div>

              {/* Records & Fun Stats */}
              <div className="stats-section-box">
                <div className="section-box-title">Performance Records</div>
                <div className="records-grid">
                  <div className="record-item">
                    <Zap size={16} className="record-icon text-primary" />
                    <div>
                      <span className="record-name">Avg. Moves / Game:</span>
                      <span className="record-val">{avgMoves} moves</span>
                    </div>
                  </div>

                  <div className="record-item">
                    <Trophy size={16} className="record-icon text-success" />
                    <div>
                      <span className="record-name">Fastest Victory:</span>
                      <span className="record-val">
                        {fastestWin ? `${fastestWin} moves` : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="record-item">
                    <Target size={16} className="record-icon text-ai" />
                    <div>
                      <span className="record-name">vs Flowai AI:</span>
                      <span className="record-val">
                        {aiGames.length > 0
                          ? `${humanVsAiWins}W - ${aiVsHumanWins}L - ${aiDraws}D`
                          : 'No AI games'}
                      </span>
                    </div>
                  </div>

                  <div className="record-item">
                    <Award size={16} className="record-icon text-local" />
                    <div>
                      <span className="record-name">2-Player Local:</span>
                      <span className="record-val">
                        {localGames.length > 0 ? `${localGames.length} played` : 'No local games'}
                      </span>
                    </div>
                  </div>

                  <div className="record-item">
                    <Globe size={16} className="record-icon text-ai" />
                    <div>
                      <span className="record-name">Play Online:</span>
                      <span className="record-val">
                        {onlineGames.length > 0 ? `${onlineGames.length} played` : 'No online games'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

