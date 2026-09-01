import React from 'react';
import { X, Palette, Check, Sparkles } from 'lucide-react';

const THEMES = [
  {
    id: 'classic',
    name: 'Classic Blue',
    desc: 'Signature clean blue aesthetic with sharp contrasts',
    colors: ['#2563EB', '#0284C7', '#16A34A'],
  },
  {
    id: 'neon',
    name: 'Neon Glow',
    desc: 'High-energy electric cyan and hot magenta with glowing trails',
    colors: ['#00F5FF', '#FF007F', '#10B981'],
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    desc: 'Futuristic electric yellow, neon purple and bold retro sci-fi flair',
    colors: ['#FEE715', '#A855F7', '#EC4899'],
  },
  {
    id: 'minimal',
    name: 'Minimalist',
    desc: 'Understated monochrome typography and ultra-clean geometry',
    colors: ['#0F172A', '#64748B', '#CBD5E1'],
  },
  {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    desc: 'Translucent frosted glass with soft glowing aurora gradients',
    colors: ['#8B5CF6', '#06B6D4', '#EC4899'],
  },
];

export default function ThemeSelectorModal({ activeTheme, onSelectTheme, onClose }) {
  return (
    <div
      className="stats-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="theme-modal-title"
    >
      <div className="stats-modal-card theme-modal-card">
        <div className="stats-header">
          <div className="stats-title-row">
            <Palette className="stats-icon-header" size={22} />
            <h2 id="theme-modal-title" className="stats-title">
              Visual Themes
            </h2>
          </div>
          <button
            type="button"
            className="stats-close-btn"
            onClick={onClose}
            aria-label="Close themes modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="stats-body">
          <p className="theme-modal-intro">
            Choose a visual style. Themes adapt seamlessly to both Light and Dark modes.
          </p>

          <div className="theme-cards-grid">
            {THEMES.map((theme) => {
              const isSelected = activeTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  className={`theme-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectTheme(theme.id)}
                  aria-pressed={isSelected}
                >
                  <div className="theme-card-header">
                    <span className="theme-card-name">{theme.name}</span>
                    {isSelected && (
                      <span className="theme-active-badge">
                        <Check size={13} aria-hidden="true" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>

                  <p className="theme-card-desc">{theme.desc}</p>

                  <div className="theme-card-swatches">
                    {theme.colors.map((c, i) => (
                      <span
                        key={i}
                        className="theme-swatch"
                        style={{ backgroundColor: c }}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

