import React from 'react';

export default function Cell({ value, index, onClick, isWinningCell, disabled }) {
  const label = `Row ${Math.floor(index / 3) + 1}, Column ${(index % 3) + 1}: ${
    value ? `marked ${value}` : 'empty'
  }${isWinningCell ? ', winning cell' : ''}`;

  return (
    <button
      type="button"
      className={`cell-button ${isWinningCell ? 'winning-cell' : ''}`}
      onClick={onClick}
      disabled={disabled || Boolean(value)}
      aria-label={label}
      data-index={index}
    >
      {value === 'X' && (
        <span className="symbol-x" aria-hidden="true">
          X
        </span>
      )}
      {value === 'O' && (
        <span className="symbol-o" aria-hidden="true">
          O
        </span>
      )}
    </button>
  );
}

