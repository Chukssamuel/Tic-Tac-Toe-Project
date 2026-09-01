import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ colorMode, onToggle }) {
  const isDark = colorMode === 'dark';

  return (
    <button
      type="button"
      className="theme-toggle-btn"
      onClick={onToggle}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-pressed={isDark}
    >
      {isDark ? (
        <Sun size={16} className="theme-toggle-icon sun-icon" aria-hidden="true" />
      ) : (
        <Moon size={16} className="theme-toggle-icon moon-icon" aria-hidden="true" />
      )}
      <span className="theme-toggle-label">{isDark ? 'Light' : 'Dark'}</span>
    </button>
  );
}

