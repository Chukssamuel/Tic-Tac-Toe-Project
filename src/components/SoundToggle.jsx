import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function SoundToggle({ isMuted, onToggle }) {
  return (
    <button
      type="button"
      className="sound-toggle-btn"
      onClick={onToggle}
      aria-label={isMuted ? 'Unmute game sound effects' : 'Mute game sound effects'}
      title={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
    >
      {isMuted ? (
        <VolumeX size={18} aria-hidden="true" />
      ) : (
        <Volume2 size={18} aria-hidden="true" />
      )}
      <span className="sound-toggle-text">{isMuted ? 'Muted' : 'Sound On'}</span>
    </button>
  );
}

