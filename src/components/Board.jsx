import React from 'react';
import Cell from './Cell';

export default function Board({ board, winningCells, onCellClick, isGameOver }) {
  return (
    <div
      className="board-grid"
      role="grid"
      aria-label="3 by 3 Tic-Tac-Toe Board"
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

