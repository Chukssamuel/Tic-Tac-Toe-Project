import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-content">
        <p className="footer-brand">
          Built with <span style={{ color: 'var(--primary)' }}>♥</span> by{' '}
          <span className="footer-brand-name">Chukwuma Samuel</span>
        </p>
        <p className="footer-sub">
          Samuel Tic-Tac-Toe &bull; Modern React &bull; &copy; {currentYear}
        </p>
      </div>
    </footer>
  );
}

