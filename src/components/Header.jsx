import React from 'react';
import { BarChart2, History, Palette } from 'lucide-react';
import SoundToggle from './SoundToggle';
import ThemeToggle from './ThemeToggle';

export default function Header({
  isMuted,
  onToggleSound,
  onOpenStats,
  onOpenHistory,
  onOpenThemes,
  colorMode,
  onToggleTheme,
}) {
  return (
    <header className="header" role="banner">
      <div className="header-content">
        <div className="brand-badge">
          <div className="brand-logo-icon" aria-hidden="true">S</div>
          <div className="brand-info">
            <span className="brand-name">Chukwuma Samuel</span>
            <span className="brand-tagline">Signature Games</span>
          </div>
        </div>
        <div className="header-meta">
          <button
            type="button"
            className="header-stats-btn"
            onClick={onOpenThemes}
            title="Customize Theme"
            aria-label="Customize theme"
          >
            <Palette size={16} aria-hidden="true" />
            <span className="header-stats-text">Themes</span>
          </button>
          <ThemeToggle colorMode={colorMode} onToggle={onToggleTheme} />
          <button
            type="button"
            className="header-stats-btn"
            onClick={onOpenHistory}
            title="View Game History"
            aria-label="View game history"
          >
            <History size={16} aria-hidden="true" />
            <span className="header-stats-text">History</span>
          </button>
          <button
            type="button"
            className="header-stats-btn"
            onClick={onOpenStats}
            title="View Overall Statistics"
            aria-label="View overall statistics"
          >
            <BarChart2 size={16} aria-hidden="true" />
            <span className="header-stats-text">Stats</span>
          </button>
          <SoundToggle isMuted={isMuted} onToggle={onToggleSound} />
        </div>
      </div>
    </header>
  );
}
