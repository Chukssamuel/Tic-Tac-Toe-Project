import React from 'react';
import Cell from './Cell';

export default function Board({ board, boardSize, winningCells, onCellClick, isGameOver }) {
  return (
    <div
      className={`board-grid size-${boardSize}`}
      role="grid"
      aria-label={`${boardSize} by ${boardSize} Tic-Tac-Toe Board`}
      style={{ gridTemplateColumns: `repeat(${boardSize}, 1fr)` }}
    >
      {board.map((cellValue, index) => (
        <Cell
          key={index}
          index={index}
          value={cellValue}
          isWinningCell={winningCells.includes(index)}
          disabled={isGameOver || Boolean(cellValue)}
          onClick={() => onCellClick(index)}
        />
      ))}
    </div>
  );
}
