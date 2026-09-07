import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Share2, Check, X, RefreshCw } from 'lucide-react';

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

/** Draws a centered text that shrinks to fit a max width (and truncates with an ellipsis if still too wide). */
function drawFitText(ctx, text, x, y, maxWidth, size, weight = 700, align = 'center') {
  let s = size;
  ctx.textAlign = align;
  ctx.font = `${weight} ${s}px ${FONT}`;
  while (ctx.measureText(text).width > maxWidth && s > 16) {
    s -= 2;
    ctx.font = `${weight} ${s}px ${FONT}`;
  }
  let t = text;
  if (ctx.measureText(t).width > maxWidth) {
    while (t.length > 1) {
      t = t.slice(0, -1);
      ctx.font = `${weight} ${s}px ${FONT}`;
      if (ctx.measureText(t + '\u2026').width <= maxWidth) {
        t += '\u2026';
        break;
      }
    }
  }
  ctx.fillText(t, x, y);
}

/** Draws a rounded-rectangle path (works everywhere; avoids ctx.roundRect support issues). */
function roundedRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/**
 * Renders the result banner to an offscreen canvas (1200x630) so it can be
 * shared as an image. Mirrors the on-screen banner layout.
 */
export function renderBannerCanvas({ xName, oName, scoreX, scoreO, draws, winnerName, isDraw }) {
  const W = 1200;
  const H = 630;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background gradient (emerald brand)
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#10B981');
  g.addColorStop(1, '#064E3B');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Soft top glow
  const glow = ctx.createRadialGradient(W / 2, -80, 40, W / 2, -80, 520);
  glow.addColorStop(0, 'rgba(255,255,255,0.28)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Confetti dots
  const dots = ['#F59E0B', '#A7F3D0', '#34D399', '#FFFFFF', '#FDE68A'];
  for (let i = 0; i < 42; i++) {
    ctx.fillStyle = dots[i % dots.length];
    ctx.globalAlpha = 0.22 + Math.random() * 0.4;
    ctx.beginPath();
    ctx.arc(Math.random() * W, Math.random() * H, 3 + Math.random() * 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.textBaseline = 'middle';

  // Brand label
  ctx.fillStyle = 'rgba(255,255,255,0.78)';
  ctx.font = `700 28px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('S A M U E L   T I C - T A C - T O E', W / 2, 86);

  // Trophy
  ctx.font = '108px system-ui';
  ctx.fillText('🏆', W / 2, 208);

  // Result title
  const title = isDraw ? "It's a Draw!" : `${winnerName} Wins!`;
  ctx.fillStyle = '#FFFFFF';
  drawFitText(ctx, title, W / 2, 302, W - 120, 62);

  // Scoreline: name (left) · score (centre) · name (right).
  // The score sits in its own pill with hard gaps on both sides so the
  // player names can never overlap it, even when names are long.
  const y = 424;
  const scoreText = `${scoreX} - ${scoreO}`;

  // Fit the score text to a fixed slot, then size the pill around it.
  let scoreSize = 92;
  ctx.textAlign = 'center';
  ctx.font = `800 ${scoreSize}px ${FONT}`;
  while (ctx.measureText(scoreText).width > 220 && scoreSize > 40) {
    scoreSize -= 2;
    ctx.font = `800 ${scoreSize}px ${FONT}`;
  }
  const scoreWidth = ctx.measureText(scoreText).width;
  const pillW = scoreWidth + 80;
  const pillH = scoreSize + 44;
  const pillX = W / 2 - pillW / 2;
  const pillY = y - pillH / 2;

  // Score pill background + subtle border (mirrors the on-screen banner)
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  roundedRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  roundedRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `800 ${scoreSize}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText(scoreText, W / 2, y);

  // Player names occupy fixed zones outside the pill, with a guaranteed gap.
  const gap = 36;
  const leftEnd = pillX - gap;
  const rightStart = pillX + pillW + gap;
  ctx.fillStyle = '#FFFFFF';
  drawFitText(ctx, xName, leftEnd, y, leftEnd - 48, 52, 700, 'right');
  drawFitText(ctx, oName, rightStart, y, W - rightStart - 48, 52, 700, 'left');

  // Draws (if any)
  if (draws > 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.font = `600 30px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(`Draws: ${draws}`, W / 2, 486);
  }

  // Date footer
  const date = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  ctx.fillStyle = 'rgba(255,255,255,0.62)';
  ctx.font = `500 24px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText(date, W / 2, 566);

  return canvas;
}

export default function CelebrationBanner({
  open,
  winnerName,
  isDraw,
  xName,
  oName,
  scoreX,
  scoreO,
  draws,
  onClose,
  onPlayAgain,
}) {
  const [shared, setShared] = useState(false);

  // Confetti when the banner pops
  useEffect(() => {
    if (!open) return;
    try {
      confetti({
        particleCount: 130,
        spread: 95,
        origin: { y: 0.6 },
        colors: ['#10B981', '#059669', '#34D399', '#A7F3D0', '#F59E0B', '#FFFFFF'],
      });
    } catch {
      // ignore
    }
  }, [open]);

  if (!open) return null;

  const loserName = winnerName === xName ? oName : xName;
  const shareText = isDraw
    ? `🤝 ${xName} and ${oName} played a draw (${scoreX}–${scoreO}) in Samuel Tic-Tac-Toe!`
    : `🏆 ${winnerName} beat ${loserName} ${scoreX}–${scoreO} in Samuel Tic-Tac-Toe!`;

  const handleShare = async () => {
    const canvas = renderBannerCanvas({ xName, oName, scoreX, scoreO, draws, winnerName, isDraw });
    try {
      const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
      const file = new File([blob], 'tic-tac-toe-result.png', { type: 'image/png' });

      if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        // Share the actual banner image
        await navigator.share({ files: [file], title: 'Samuel Tic-Tac-Toe', text: shareText });
      } else if (navigator.share) {
        // Fall back to a text share
        await navigator.share({ title: 'Samuel Tic-Tac-Toe', text: shareText });
      } else {
        // Desktop: download the banner image
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = 'tic-tac-toe-result.png';
        a.click();
      }
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    } catch {
      // share cancelled or unavailable — ignore
    }
  };

  return (
    <div className="banner-overlay" role="dialog" aria-modal="true" aria-label="Match result">
      <div className="celebration-banner">
        <button type="button" className="banner-close" onClick={onClose} aria-label="Close banner">
          <X size={18} />
        </button>

        <div className="banner-emoji" aria-hidden="true">🏆</div>
        <h2 className="banner-title">{isDraw ? "It's a Draw!" : `${winnerName} Wins!`}</h2>

        <div className="banner-scoreline">
          <span className="banner-name" title={xName}>{xName}</span>
          <span className="banner-score">{scoreX} – {scoreO}</span>
          <span className="banner-name" title={oName}>{oName}</span>
        </div>

        {draws > 0 && <div className="banner-draws">Draws: {draws}</div>}

        <div className="banner-brand">Samuel Tic-Tac-Toe</div>

        <div className="banner-actions">
          <button type="button" className="btn-primary" onClick={handleShare}>
            {shared ? <Check size={16} /> : <Share2 size={16} />}
            <span>{shared ? 'Shared!' : 'Share Result'}</span>
          </button>
          {onPlayAgain && (
            <button type="button" className="btn-secondary" onClick={onPlayAgain}>
              <RefreshCw size={15} />
              <span>Play Again</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
