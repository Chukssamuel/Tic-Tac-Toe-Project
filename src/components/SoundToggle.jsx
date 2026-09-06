import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function SoundToggle({ isMuted, onToggle }) {
  return (
    <button
      type="button"
      className="header-icon-btn"
      onClick={onToggle}
      aria-label={isMuted ? 'Unmute game sound effects' : 'Mute game sound effects'}
      title={isMuted ? 'Sound is muted — click to unmute' : 'Sound is on — click to mute'}
      aria-pressed={isMuted}
    >
      {isMuted ? (
        <VolumeX size={18} aria-hidden="true" />
      ) : (
        <Volume2 size={18} aria-hidden="true" />
      )}
    </button>
  );
}
