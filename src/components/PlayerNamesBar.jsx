import React, { useState } from 'react';
import { Edit2, Check, User, Bot } from 'lucide-react';

export default function PlayerNamesBar({
  playerNames,
  onUpdateNames,
  gameMode,
  disabled,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempNameX, setTempNameX] = useState(playerNames.X);
  const [tempNameO, setTempNameO] = useState(playerNames.O);

  const handleSave = () => {
    onUpdateNames({
      X: tempNameX.trim() || 'Player 1',
      O: gameMode === 'ai' ? 'Samuel AI' : (tempNameO.trim() || 'Player 2'),
    });
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setTempNameX(playerNames.X);
    setTempNameO(playerNames.O);
    setIsEditing(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  return (
    <div className="player-names-bar">
      {!isEditing ? (
        <div className="names-display">
          <div className="player-name-chip chip-x">
            <User size={14} aria-hidden="true" />
            <span className="chip-symbol">X:</span>
            <span className="chip-name">{playerNames.X}</span>
          </div>

          <span className="names-vs">VS</span>

          <div className="player-name-chip chip-o">
            {gameMode === 'ai' ? (
              <Bot size={14} aria-hidden="true" />
            ) : (
              <User size={14} aria-hidden="true" />
            )}
            <span className="chip-symbol">O:</span>
            <span className="chip-name">{playerNames.O}</span>
          </div>

          <button
            type="button"
            className="edit-names-btn"
            onClick={handleStartEdit}
            disabled={disabled}
            aria-label="Edit Player Names"
            title="Edit player names"
          >
            <Edit2 size={13} aria-hidden="true" />
            <span>Edit</span>
          </button>
        </div>
      ) : (
        <div className="names-edit-form">
          <div className="name-input-group">
            <label htmlFor="name-x-input" className="name-input-label label-x">X:</label>
            <input
              id="name-x-input"
              type="text"
              className="name-input"
              value={tempNameX}
              onChange={(e) => setTempNameX(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={15}
              placeholder="Player 1"
              autoFocus
            />
          </div>

          {gameMode !== 'ai' && (
            <div className="name-input-group">
              <label htmlFor="name-o-input" className="name-input-label label-o">O:</label>
              <input
                id="name-o-input"
                type="text"
                className="name-input"
                value={tempNameO}
                onChange={(e) => setTempNameO(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={15}
                placeholder="Player 2"
              />
            </div>
          )}

          <button
            type="button"
            className="save-names-btn"
            onClick={handleSave}
            aria-label="Save player names"
          >
            <Check size={14} aria-hidden="true" />
            <span>Save</span>
          </button>
        </div>
      )}
    </div>
  );
}

