import React, { useState, useEffect, useRef } from 'react';
import { BarChart2, History, Palette, MoreVertical } from 'lucide-react';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the menu on outside click or Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const closeAndRun = (fn) => {
    setMenuOpen(false);
    fn();
  };

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
          <SoundToggle isMuted={isMuted} onToggle={onToggleSound} />
          <ThemeToggle colorMode={colorMode} onToggle={onToggleTheme} />

          <div className="header-menu" ref={menuRef}>
            <button
              type="button"
              className="header-icon-btn"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="More options"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              title="More options"
            >
              <MoreVertical size={18} aria-hidden="true" />
            </button>

            {menuOpen && (
              <div className="header-dropdown" role="menu" aria-label="More options">
                <button
                  type="button"
                  role="menuitem"
                  className="header-dropdown-item"
                  onClick={() => closeAndRun(onOpenThemes)}
                >
                  <Palette size={16} aria-hidden="true" />
                  <span>Themes</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="header-dropdown-item"
                  onClick={() => closeAndRun(onOpenStats)}
                >
                  <BarChart2 size={16} aria-hidden="true" />
                  <span>Stats</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="header-dropdown-item"
                  onClick={() => closeAndRun(onOpenHistory)}
                >
                  <History size={16} aria-hidden="true" />
                  <span>History</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
