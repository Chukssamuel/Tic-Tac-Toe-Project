import React from 'react';
import { X, Palette, Check, Sparkles, RotateCcw } from 'lucide-react';

const THEMES = [
  {
    id: 'classic',
    name: 'Classic Emerald',
    desc: 'Signature clean emerald aesthetic with sharp contrasts',
    colors: ['#059669', '#0D9488', '#F59E0B'],
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
  {
    id: 'forest',
    name: 'Forest',
    desc: 'Deep woodland greens with warm earthy brown accents',
    colors: ['#2F6B3F', '#8B5E3C', '#C9E4CB'],
  },
];

const PIECE_PRESETS = {
  X: ['#059669', '#2563EB', '#DC2626', '#7C3AED', '#EA580C', '#0F172A'],
  O: ['#0D9488', '#0284C7', '#F59E0B', '#DB2777', '#10B981', '#0F172A'],
};

const FALLBACK_COLORS = { X: '#059669', O: '#0D9488' };

function PieceColorRow({ label, playerKey, color, onChange }) {
  const presets = PIECE_PRESETS[playerKey];
  const activeColor = color || FALLBACK_COLORS[playerKey];
  return (
    <div className="piece-color-row">
      <span className={`piece-color-label piece-label-${playerKey.toLowerCase()}`}>
        {label}
      </span>

      <div className="piece-color-presets" role="group" aria-label={`Preset colours for ${label}`}>
        {presets.map((c) => (
          <button
            key={c}
            type="button"
            className={`piece-color-swatch ${color === c ? 'selected' : ''}`}
            style={{ backgroundColor: c }}
            onClick={() => onChange(playerKey, c)}
            aria-label={`Set ${label} colour to ${c}`}
            aria-pressed={color === c}
            title={c}
          />
        ))}
      </div>

      <input
        type="color"
        className="piece-color-input"
        value={activeColor}
        onChange={(e) => onChange(playerKey, e.target.value)}
        aria-label={`Custom ${label} colour`}
        title={`Custom ${label} colour`}
      />

      {color && (
        <button
          type="button"
          className="piece-color-clear"
          onClick={() => onChange(playerKey, null)}
          aria-label={`Reset ${label} to theme colour`}
          title="Use theme colour"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export default function ThemeSelectorModal({
  activeTheme,
  onSelectTheme,
  pieceColors,
  onPieceColorChange,
  onResetPieceColors,
  onClose,
}) {
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
              Customize
            </h2>
          </div>
          <button
            type="button"
            className="stats-close-btn"
            onClick={onClose}
            aria-label="Close customize modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="stats-body">
          {/* Piece Colours */}
          <div className="piece-colors-section">
            <div className="section-box-title">
              <Sparkles size={13} aria-hidden="true" style={{ verticalAlign: '-2px' }} />{' '}
              Piece Colours
            </div>
            <p className="piece-colors-hint">
              Pick your own colours for X and O — they override the active theme. Clear a
              colour to fall back to the theme.
            </p>

            <PieceColorRow
              label="X"
              playerKey="X"
              color={pieceColors.X}
              onChange={onPieceColorChange}
            />
            <PieceColorRow
              label="O"
              playerKey="O"
              color={pieceColors.O}
              onChange={onPieceColorChange}
            />

            {(pieceColors.X || pieceColors.O) && (
              <button
                type="button"
                className="piece-colors-reset"
                onClick={onResetPieceColors}
              >
                <RotateCcw size={13} aria-hidden="true" />
                <span>Reset both to theme colours</span>
              </button>
            )}
          </div>

          {/* Theme Cards */}
          <div className="section-box-title">Visual Themes</div>
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
