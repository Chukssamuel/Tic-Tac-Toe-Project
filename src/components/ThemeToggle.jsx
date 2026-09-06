import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ colorMode, onToggle }) {
  const isDark = colorMode === 'dark';

  return (
    <button
      type="button"
      className="header-icon-btn"
      onClick={onToggle}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-pressed={isDark}
    >
      {isDark ? (
        <Sun size={18} className="sun-icon" aria-hidden="true" />
      ) : (
        <Moon size={18} className="moon-icon" aria-hidden="true" />
      )}
    </button>
  );
}
